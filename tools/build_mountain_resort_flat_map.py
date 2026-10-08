#!/usr/bin/env python3
"""Build the flat map of 山庄背影 sections 1 and 5 (as 阳关雪 and 道士塔's first maps).

usage: build_mountain_resort_flat_map.py WORK_DIR

Reads the standard map of China from site/chapters/taoist-tower/geography-data.js (Albers equal-area conic,
CM 110°E, SP 25°N / 47°N, Krassovsky, on 道士塔's canvas), Copernicus DEM GLO-90 over 114.8–119.8°E,
39.0–42.8°N (20 tiles read over HTTP, averaged to 1/240° ≈ 350 m) and the Great Wall from OpenStreetMap.
WORK_DIR caches the DEM grid and the Overpass response (delete a file to fetch it again). Writes, in
site/chapters/mountain-resort:
  flat-map-data.js          window.MOUNTAIN_RESORT_FLAT_MAP: projection, the standard-map outline and provinces,
                            where the relief image sits (it is warped into the canvas, so a plain rectangle) and
                            the Great Wall as longitude/latitude lines
  assets/region-relief.jpg  grey hillshade of the Yan Mountains from Beijing to Mulan (white = flat), laid over
                            the map with multiply
flat-map.js implements the same Albers formula, so labels and the wall land on the map.
"""

from __future__ import annotations

import json
import math
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from pyproj import CRS, Transformer
from rasterio.enums import Resampling
from rasterio.merge import merge
from rasterio.transform import from_bounds
from rasterio.warp import reproject
from shapely.geometry import LineString
from shapely.ops import linemerge

ROOT = Path(__file__).resolve().parents[1]
TAOIST = ROOT / "site/chapters/taoist-tower/geography-data.js"
OUT_DIR = ROOT / "site/chapters/mountain-resort"
PROJ4 = "+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +ellps=krass +units=m +no_defs"
TO_ALBERS = Transformer.from_crs("EPSG:4326", CRS.from_proj4(PROJ4), always_xy=True)

DEM_BOUNDS = (114.8, 39.0, 119.8, 42.8)  # west, south, east, north: well past both sections' frames
PER_DEGREE = 240  # about 350 m: finer than a screen pixel at the sections' zoom (about 300-400 m)
DEM_URL = "/vsicurl/https://copernicus-dem-90m.s3.amazonaws.com/Copernicus_DSM_COG_30_{tile}_DEM/Copernicus_DSM_COG_30_{tile}_DEM.tif"
RELIEF_WIDTH = 2160  # output pixels across the warped relief

OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
WALL_QUERY = ('(way["historic"="citywalls"](39.4,114.8,42.2,119.8);way["barrier"="city_wall"](39.4,114.8,42.2,119.8);'
              'way["name"~"长城"]["barrier"](39.4,114.8,42.2,119.8);way["wikidata"="Q12501"](39.4,114.8,42.2,119.8););out tags geom;')


def load(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    return json.loads(text[text.index("=") + 1:].strip().rstrip(";"))


def region_dem(work: Path) -> np.ndarray:
    cache = work / f"region-dem-{PER_DEGREE}.npy"
    if cache.exists():
        return np.load(cache)
    west, south, east, north = DEM_BOUNDS
    tiles = [f"N{lat:02d}_00_E{lon:03d}_00" for lat in range(int(south), int(math.ceil(north)))
             for lon in range(int(west), int(math.ceil(east)))]
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
        sources = []
        for tile in tiles:
            try:
                sources.append(rasterio.open(DEM_URL.format(tile=tile)))
            except rasterio.errors.RasterioIOError:
                print(f"  no tile {tile} (sea)")
        mosaic, transform = merge(sources, bounds=(west - 0.01, south - 0.01, east + 0.01, north + 0.01), nodata=0)
        crs = sources[0].crs
        for source in sources:
            source.close()
    cols, rows = int((east - west) * PER_DEGREE), int((north - south) * PER_DEGREE)
    z = np.zeros((rows, cols), dtype=np.float32)
    reproject(mosaic[0].astype(np.float32), z, src_transform=transform, src_crs=crs,
              dst_transform=from_bounds(west, south, east, north, cols, rows), dst_crs=crs, resampling=Resampling.average)
    np.save(cache, z)
    return z


def great_wall(work: Path) -> list:
    cache = work / "osm-greatwall.json"
    if not cache.exists():
        for attempt in range(4):
            for url in OVERPASS:
                try:
                    request = urllib.request.Request(url, data=urllib.parse.urlencode({"data": "[out:json][timeout:150];" + WALL_QUERY}).encode(),
                                                     headers={"User-Agent": "bittersweet-journey (literary map)"})
                    data = json.load(urllib.request.urlopen(request, timeout=180))
                    data["query"], data["fetched"] = WALL_QUERY, time.strftime("%Y-%m-%d")
                    cache.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
                    break
                except Exception as error:  # the public servers time out often
                    print(f"  wall: {url.split('/')[2]} failed ({error})")
            if cache.exists():
                break
            time.sleep(10)
        else:
            raise SystemExit("Overpass query for the Great Wall failed on every server")
    data = json.loads(cache.read_text(encoding="utf-8"))
    # the Great Wall only: ways named 长城 (or a 墙体 section of it); city and fortress walls are left out
    lines = [LineString([(p["lon"], p["lat"]) for p in e["geometry"]]) for e in data["elements"]
             if len(e.get("geometry", [])) > 1 and ("长城" in e.get("tags", {}).get("name", "") or "墙体" in e.get("tags", {}).get("name", ""))]
    merged = linemerge(lines)
    parts = [line.simplify(0.0012) for line in getattr(merged, "geoms", [merged])]
    parts = [p for p in parts if p.length > 0.004]  # drop fragments shorter than about 400 m
    print(f"great wall: {len(lines)} ways -> {len(parts)} lines, {sum(len(p.coords) for p in parts)} points ({data.get('fetched')})")
    return [[[round(x, 4), round(y, 4)] for x, y in p.coords] for p in parts], data.get("fetched")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    work = Path(sys.argv[1])
    work.mkdir(parents=True, exist_ok=True)
    taoist = load(TAOIST)

    # 道士塔's canvas transform, recovered from its story points (as tools/build_taoist_one_projection.py)
    pts = taoist["china"]["points"].values()
    E, N, X, Y = map(np.array, zip(*[(*TO_ALBERS.transform(p["lon"], p["lat"]), p["x"], p["y"]) for p in pts]))
    A = np.vstack([np.concatenate([E, -N]), np.r_[np.ones_like(E), np.zeros_like(E)], np.r_[np.zeros_like(E), np.ones_like(E)]]).T
    (a, c, d), *_ = np.linalg.lstsq(A, np.concatenate([X, Y]), rcond=None)

    def canvas(lon, lat):
        e, n = TO_ALBERS.transform(lon, lat)
        return a * np.asarray(e) + c, -a * np.asarray(n) + d

    # ---- relief: hillshade on the DEM's own lon/lat grid ----
    z = region_dem(work)
    west, south, east, north = DEM_BOUNDS
    rows, cols = z.shape
    lat_mid = (south + north) / 2
    cell_x = (east - west) / cols * 111_320 * math.cos(math.radians(lat_mid))
    cell_y = (north - south) / rows * 110_574
    exaggeration = 2.4
    dzdy, dzdx = np.gradient(z, cell_y, cell_x)
    dzdx, dzdy = dzdx * exaggeration, -dzdy * exaggeration  # rows run south
    azimuth, altitude = math.radians(315), math.radians(45)
    slope = np.arctan(np.hypot(dzdx, dzdy))
    aspect = np.arctan2(-dzdx, dzdy)
    shade = np.sin(altitude) * np.cos(slope) + np.cos(altitude) * np.sin(slope) * np.cos(azimuth - math.pi / 2 - aspect)
    grey = 255 * np.clip(1.0 + 0.9 * (np.clip(shade, 0, 1) - math.sin(altitude)), 0.42, 1.0)
    # the image fades to white at its own edges, so no edge shows on the map
    edge = np.minimum.reduce(np.meshgrid(np.minimum(np.arange(cols), cols - 1 - np.arange(cols)) / cols,
                                         np.minimum(np.arange(rows), rows - 1 - np.arange(rows)) / rows))
    grey = (255 - (255 - grey) * np.clip(edge / 0.08, 0, 1)).astype(np.float32)

    # warp into the canvas: each output pixel is a canvas point, inverted to lon/lat and sampled (exact, no fit)
    from_albers = Transformer.from_crs(CRS.from_proj4(PROJ4), "EPSG:4326", always_xy=True)
    ring_lon = np.r_[np.linspace(west, east, 60), np.linspace(west, east, 60), np.full(60, west), np.full(60, east)]
    ring_lat = np.r_[np.full(60, south), np.full(60, north), np.linspace(south, north, 60), np.linspace(south, north, 60)]
    rx, ry = canvas(ring_lon, ring_lat)
    left, top, right, bottom = float(rx.min()), float(ry.min()), float(rx.max()), float(ry.max())
    out_w = RELIEF_WIDTH
    out_h = int(round(out_w * (bottom - top) / (right - left)))
    ox, oy = np.meshgrid(left + (np.arange(out_w) + 0.5) / out_w * (right - left), top + (np.arange(out_h) + 0.5) / out_h * (bottom - top))
    lon, lat = from_albers.transform((ox - c) / a, -(oy - d) / a)
    fc = (np.asarray(lon) - west) / (east - west) * cols - 0.5
    fr = (north - np.asarray(lat)) / (north - south) * rows - 0.5
    inside = (fc >= 0) & (fc <= cols - 1) & (fr >= 0) & (fr <= rows - 1)
    fc, fr = np.clip(fc, 0, cols - 1.001), np.clip(fr, 0, rows - 1.001)
    c0, r0 = fc.astype(int), fr.astype(int)
    dc, dr = fc - c0, fr - r0
    warped = (grey[r0, c0] * (1 - dc) * (1 - dr) + grey[r0, c0 + 1] * dc * (1 - dr) +
              grey[r0 + 1, c0] * (1 - dc) * dr + grey[r0 + 1, c0 + 1] * dc * dr)
    warped = np.where(inside, warped, 255)
    relief_file = OUT_DIR / "assets" / "region-relief.jpg"
    Image.fromarray(warped.astype(np.uint8), "L").save(relief_file, quality=80, optimize=True, progressive=True)
    print(f"relief {cols} x {rows} cells -> {out_w} x {out_h} px ({relief_file.stat().st_size // 1024} KB), warped exactly into the canvas")

    wall, fetched = great_wall(work)
    data = {
        "projection": {"proj4": PROJ4, "lon0": 110, "lat0": 0, "lat1": 25, "lat2": 47, "a": a, "c": c, "d": d},
        "china": {"outlinePath": taoist["china"]["outlinePath"], "provincePath": taoist["china"]["provincePath"]},
        "relief": {"href": "./assets/region-relief.jpg", "x": round(left, 4), "y": round(top, 4),
                   "width": round(right - left, 4), "height": round(bottom - top, 4)},
        "greatWall": wall,
        "source": {
            "china": "Ministry of Natural Resources standard-map service, via site/chapters/taoist-tower/geography-data.js",
            "relief": f"Copernicus DEM GLO-90 averaged to 1/{PER_DEGREE}° (about 350 m)",
            "greatWall": f"© OpenStreetMap contributors, ODbL 1.0: ways named 长城 (historic=citywalls / barrier=city_wall), fetched {fetched}",
            "projection": "Albers equal-area conic, CM 110°E, SP 25°N / 47°N, Krassovsky (the standard map's own)",
        },
    }
    out = OUT_DIR / "flat-map-data.js"
    out.write_text("/* 山庄背影 sections 1 and 5: one flat map (tools/build_mountain_resort_flat_map.py). */\n"
                   "window.MOUNTAIN_RESORT_FLAT_MAP = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
                   encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
