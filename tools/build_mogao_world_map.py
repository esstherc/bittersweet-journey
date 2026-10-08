#!/usr/bin/env python3
"""Build the flat world map of 莫高窟 parts one and four: one map, one projection, one camera (as 道士塔).

usage: build_mogao_world_map.py WIDE_DEM_TIF NE_LAND_GEOJSON NE_LAKES_GEOJSON

WIDE_DEM_TIF is Copernicus DEM GLO-90 averaged to 1/10° over 8–125°E, 10–52°N
(tools/fetch_fish_tail_wide_dem.py, the same file as 鱼尾山屋's flat map); the GeoJSON files are Natural
Earth 1:50m land and lakes. Writes, in site/chapters/mogao-caves:
  world-map-data.js       window.MOGAO_WORLD_MAP: projection, canvas, land and lake paths, relief placement
  assets/world-relief.jpg grey hillshade over Greece to the Hexi Corridor (white = flat), laid over the land
                          with multiply, so it only darkens slopes

Projection: Equal Earth (Šavrič, Patterson & Jenny 2018) on the unit sphere, central meridian 130°E, so
part one (Greece, Gandhara, India, Dunhuang) and part four (Beijing, then across the Pacific to Harvard and
Philadelphia) lie on one unbroken map; the seam runs down the Atlantic at 50°W, where nothing is drawn
across it. site/chapters/mogao-caves/world-map.js implements the same formula.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from shapely.geometry import box, shape
from shapely.ops import transform as shp_transform

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "site/chapters/mogao-caves"
LON0 = 130.0
A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796
M = math.sqrt(3) / 2
CANVAS_WIDTH = 1000.0
RELIEF_PX_PER_UNIT = 6.0


def equal_earth(lam_deg, phi_deg):
    lam = np.radians(np.asarray(lam_deg, dtype=float))
    phi = np.radians(np.asarray(phi_deg, dtype=float))
    theta = np.arcsin(M * np.sin(phi))
    t2 = theta * theta
    t6 = t2 * t2 * t2
    x = lam * np.cos(theta) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
    y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return x, y


X_MAX = float(equal_earth(180, 0)[0])
Y_MAX = float(equal_earth(0, 90)[1])
SCALE = CANVAS_WIDTH / (2 * X_MAX)
HEIGHT = 2 * Y_MAX * SCALE


def wrap(lon):
    return (np.asarray(lon, dtype=float) - LON0 + 540) % 360 - 180


def to_canvas(lon, lat):
    x, y = equal_earth(wrap(lon), lat)
    return (x + X_MAX) * SCALE, (Y_MAX - y) * SCALE


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    dem_path, land_path, lakes_path = map(Path, sys.argv[1:])
    seam = LON0 - 180  # -50

    def pieces(geom):
        """Split at the seam; each piece is projected with its own side's longitudes (no wrap across it)."""
        out = []
        for half, shift in ((box(-180, -90, seam, 90), 360 - LON0), (box(seam, -90, 180, 90), -LON0)):
            part = geom.intersection(half)
            if part.is_empty:
                continue
            projected = shp_transform(lambda lon, lat, z=None, s=shift: tuple(
                np.array(v) for v in ((lambda x, y: ((x + X_MAX) * SCALE, (Y_MAX - y) * SCALE))(*equal_earth(np.asarray(lon) + s, lat)))), part)
            out += list(getattr(projected, "geoms", [projected]))
        return [g for g in out if g.geom_type == "Polygon" and not g.is_empty]

    def path_of(polys, tolerance):
        rings = []
        for poly in polys:
            poly = poly.simplify(tolerance, preserve_topology=True)
            for ring in [poly.exterior, *poly.interiors]:
                coords = list(ring.coords)
                if len(coords) >= 4:
                    rings.append("M" + "L".join(f"{x:.2f},{y:.2f}" for x, y in coords[:-1]) + "Z")
        return "".join(rings)

    land, lakes = [], []
    for feature in json.loads(land_path.read_text(encoding="utf-8"))["features"]:
        geom = shape(feature["geometry"]).buffer(0)
        if geom.bounds[3] < -60:  # Antarctica is not needed for these lines
            continue
        land += pieces(geom)
    for feature in json.loads(lakes_path.read_text(encoding="utf-8"))["features"]:
        geom = shape(feature["geometry"]).buffer(0)
        if geom.area > 0.25:
            lakes += pieces(geom)

    # ---- relief: grey hillshade over the DEM's area, white where flat (multiplied over the land) ----
    with rasterio.open(dem_path) as dem:
        heights = dem.read(1).astype(np.float32)
        t = dem.transform
    west, north = t.c, t.f
    east, south = west + t.a * heights.shape[1], north + t.e * heights.shape[0]
    ring_lon = np.r_[np.linspace(west, east, 60), np.linspace(west, east, 60), np.full(60, west), np.full(60, east)]
    ring_lat = np.r_[np.full(60, south), np.full(60, north), np.linspace(south, north, 60), np.linspace(south, north, 60)]
    rx, ry = to_canvas(ring_lon, ring_lat)
    left, top = float(rx.min()), float(ry.min())
    width_units, height_units = float(rx.max()) - left, float(ry.max()) - top
    wpx, hpx = int(round(width_units * RELIEF_PX_PER_UNIT)), int(round(height_units * RELIEF_PX_PER_UNIT))
    gx, gy = np.meshgrid(left + (np.arange(wpx) + 0.5) / RELIEF_PX_PER_UNIT, top + (np.arange(hpx) + 0.5) / RELIEF_PX_PER_UNIT)
    # inverse Equal Earth by Newton on theta (Šavrič et al.), then lon/lat
    yy = Y_MAX - gy / SCALE
    xx = gx / SCALE - X_MAX
    theta = yy / A1
    for _ in range(8):
        t2 = theta * theta
        t6 = t2 * t2 * t2
        f = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - yy
        fp = A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)
        theta = theta - f / fp
    t2 = theta * theta
    t6 = t2 * t2 * t2
    lam = M * xx * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)) / np.cos(theta)
    lat = np.degrees(np.arcsin(np.clip(np.sin(theta) / M, -1, 1)))
    lon = np.degrees(lam) + LON0
    lon = (lon + 180) % 360 - 180
    fc = (lon - west) / t.a - 0.5
    fr = (lat - north) / t.e - 0.5
    inside = (fc >= 0) & (fc <= heights.shape[1] - 1) & (fr >= 0) & (fr <= heights.shape[0] - 1)
    fc = np.clip(fc, 0, heights.shape[1] - 1.001)
    fr = np.clip(fr, 0, heights.shape[0] - 1.001)
    c0, r0 = fc.astype(int), fr.astype(int)
    dc, dr = fc - c0, fr - r0
    z = (heights[r0, c0] * (1 - dc) * (1 - dr) + heights[r0, c0 + 1] * dc * (1 - dr) +
         heights[r0 + 1, c0] * (1 - dc) * dr + heights[r0 + 1, c0 + 1] * dc * dr)
    z = np.where(inside, np.maximum(z, 0), 0)
    edge = np.minimum.reduce([lon - west, east - lon, lat - south, north - lat])
    z = z * np.clip(edge / 4.0, 0, 1)  # the DEM's own edge fades out, outside every frame

    # one canvas unit is about 6371 km / SCALE at the equator; slopes are exaggerated for a small-scale map
    metres_per_px = 6371000.0 / SCALE / RELIEF_PX_PER_UNIT
    exaggeration = 10.0
    dzdx = np.gradient(z, axis=1) / metres_per_px * exaggeration
    dzdy = np.gradient(z, axis=0) / metres_per_px * exaggeration
    azimuth, altitude = math.radians(315), math.radians(45)
    slope = np.arctan(np.hypot(dzdx, dzdy))
    aspect = np.arctan2(-dzdx, dzdy)
    shade = np.sin(altitude) * np.cos(slope) + np.cos(altitude) * np.sin(slope) * np.cos(azimuth - math.pi / 2 - aspect)
    # flat = white; shadowed slopes darken; high ground a touch darker so the plateaus read
    grey = 255 * np.clip(1.0 + 0.9 * (np.clip(shade, 0, 1) - math.sin(altitude)), 0.45, 1.0) * (1 - 0.1 * np.clip(z / 5000, 0, 1))
    relief_file = OUT_DIR / "assets" / "world-relief.jpg"
    Image.fromarray(np.clip(grey, 0, 255).astype(np.uint8), "L").save(relief_file, quality=82, optimize=True, progressive=True)

    data = {
        "projection": {"type": "equal-earth", "lon0": LON0, "scale": SCALE, "xMax": X_MAX, "yMax": Y_MAX},
        "canvas": {"width": CANVAS_WIDTH, "height": round(HEIGHT, 3)},
        "land": path_of(land, 0.06),
        "lakes": path_of(lakes, 0.06),
        "relief": {"href": "./assets/world-relief.jpg", "x": round(left, 3), "y": round(top, 3),
                   "width": round(width_units, 3), "height": round(height_units, 3)},
        "source": {
            "land": "Natural Earth 1:50m land and lakes (public domain)",
            "relief": "Copernicus DEM GLO-90 averaged to 1/10° (tools/fetch_fish_tail_wide_dem.py)",
            "projection": "Equal Earth, central meridian 130°E (unit sphere)",
        },
    }
    out = OUT_DIR / "world-map-data.js"
    out.write_text("/* 莫高窟 parts one and four: one flat world map (tools/build_mogao_world_map.py). */\n"
                   "window.MOGAO_WORLD_MAP = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
                   encoding="utf-8")
    print(f"canvas {CANVAS_WIDTH:.0f} x {HEIGHT:.1f}; land {len(data['land']) // 1024} KB, lakes {len(data['lakes']) // 1024} KB; "
          f"relief {wpx} x {hpx} px ({relief_file.stat().st_size // 1024} KB)")
    for name, (lo, la) in {"mogao": (94.80417, 40.03722), "philadelphia": (-75.1810, 39.9656)}.items():
        x, y = to_canvas(lo, la)
        print(f"  {name}: {float(x):.4f}, {float(y):.4f}")


if __name__ == "__main__":
    main()
