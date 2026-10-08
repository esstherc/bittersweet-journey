#!/usr/bin/env python3
"""Build the real-map data for 山庄背影 (chapter 10).

usage: build_mountain_resort_geodata.py WORK_DIR [CHAPTER_DIR]

Writes, in CHAPTER_DIR (default site/chapters/mountain-resort):
  terrain-data.js    window.MOUNTAIN_RESORT_TERRAIN: Copernicus DEM GLO-30 around the resort (sections 2-4)
  features-data.js   window.MOUNTAIN_RESORT_FEATURES: OpenStreetMap features on that terrain - the resort wall,
                     its lakes, the Wulie River, the outlying temples' footprints, Lizheng Gate and the other
                     anchors named below - all as WGS 84 longitude/latitude

WORK_DIR caches the Overpass responses (osm-*.json; delete one to fetch it again), since the public Overpass
servers often time out. The DEM tiles are read over HTTP. Needs numpy, rasterio and shapely.
"""

from __future__ import annotations

import base64
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.merge import merge
from rasterio.transform import from_bounds
from rasterio.warp import reproject
from shapely.geometry import LineString, Polygon, box, mapping
from shapely.ops import linemerge, unary_union

ROOT = Path(__file__).resolve().parents[1]

# 3D terrain: the resort, the hills behind it and the outlying temples, with land well past every panel edge.
BOUNDS = {"west": 117.80, "east": 118.08, "south": 40.91, "north": 41.10}
GRID = (240, 215)  # columns, rows: 51,600 vertices, within 16-bit WebGL indices
DEM_TILES = ["N40_00_E117_00", "N41_00_E117_00", "N40_00_E118_00", "N41_00_E118_00"]
DEM_URL = "/vsicurl/https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_{tile}_DEM/Copernicus_DSM_COG_10_{tile}_DEM.tif"

OVERPASS = ["https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"]
BBOX = f"{BOUNDS['south']},{BOUNDS['west']},{BOUNDS['north']},{BOUNDS['east']}"
QUERIES = {
    "resort": "relation(8008566);out geom;",
    "water": '(way["natural"="water"](40.975,117.918,41.012,117.958);relation["natural"="water"](40.975,117.918,41.012,117.958););out geom;',
    "rivers": f'way["waterway"~"^(river|stream)$"]({BBOX});out geom;',
    "temples": 'way["amenity"="place_of_worship"](40.985,117.905,41.02,117.965);out geom;',
    "anchors": "(relation(8008565);node(8659379119);node(8659443317);node(8659381218);node(6586987473);node(4935418276););out center tags;",
}

# The six outlying temples the chapter names (ids match geography-data.js), by their OSM names; the other
# temples of the Outlying Temples group are drawn too, unlabelled.
TEMPLES = {"putuo": "普陀宗乘之庙", "xumi": "须弥福寿", "puning": "普宁寺", "puyou": "普佑寺", "anyuan": "安远庙", "pule": "普乐寺"}
OTHER_TEMPLES = {"puren": "溥仁寺", "pushan": "溥善寺", "shuxiang": "殊像寺", "guangyuan": "广缘寺"}
# OSM anchors: Lizheng Gate (the main gate), the yurts in Wanshu Garden, Yongyou Temple and its pagoda (the
# garden's north edge), the Rehe spring and Qingchui Peak.
ANCHORS = {"gate": 8008565, "wanshu": 8659379119, "yongyou": 8659443317, "pagoda": 8659381218, "spring": 6586987473,
           "qingchui": 4935418276}


def overpass(work: Path, name: str) -> list:
    cache = work / f"osm-{name}.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))["elements"]
    query = "[out:json][timeout:90];" + QUERIES[name]
    for attempt in range(4):
        for url in OVERPASS:
            try:
                request = urllib.request.Request(url, data=urllib.parse.urlencode({"data": query}).encode(),
                                                 headers={"User-Agent": "bittersweet-journey (literary map)"})
                data = json.load(urllib.request.urlopen(request, timeout=120))
                data["query"] = QUERIES[name]
                data["fetched"] = time.strftime("%Y-%m-%d")
                cache.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
                print(f"  {name}: {len(data['elements'])} elements from {url.split('/')[2]}")
                return data["elements"]
            except Exception as error:  # the public servers time out often
                print(f"  {name}: {url.split('/')[2]} failed ({error})")
        time.sleep(10)
    raise SystemExit(f"Overpass query '{name}' failed on every server")


def rings_from_members(members: list, role: str = "outer") -> list[list[tuple[float, float]]]:
    """Join a multipolygon's member ways of one role into closed rings."""
    parts = [[(p["lon"], p["lat"]) for p in m["geometry"]] for m in members if m.get("role", "outer") == role and m.get("geometry")]
    merged = linemerge([LineString(p) for p in parts if len(p) > 1])
    lines = list(getattr(merged, "geoms", [merged]))
    return [list(line.coords) for line in lines if line.is_ring or line.coords[0] == line.coords[-1]]


def polygon_of(element) -> Polygon | None:
    if element["type"] == "way":
        coords = [(p["lon"], p["lat"]) for p in element.get("geometry", [])]
        return Polygon(coords).buffer(0) if len(coords) >= 4 and coords[0] == coords[-1] else None
    outers = rings_from_members(element.get("members", []), "outer")
    inners = rings_from_members(element.get("members", []), "inner")
    if not outers:
        return None
    shapes = [Polygon(ring).buffer(0) for ring in outers]
    shape = unary_union(shapes)
    for ring in inners:
        shape = shape.difference(Polygon(ring).buffer(0))
    return shape


def rings(shape, tolerance=0.00003, digits=5) -> list:
    out = []
    for poly in getattr(shape, "geoms", [shape]):
        if poly.is_empty or poly.geom_type != "Polygon":
            continue
        poly = poly.simplify(tolerance, preserve_topology=True)
        for ring in [poly.exterior, *poly.interiors]:
            out.append([[round(x, digits), round(y, digits)] for x, y in ring.coords])
    return out


def dem() -> dict:
    b = BOUNDS
    columns, rows = GRID
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
        sources = [rasterio.open(DEM_URL.format(tile=tile)) for tile in DEM_TILES]
        pad = 0.01
        mosaic, transform = merge(sources, bounds=(b["west"] - pad, b["south"] - pad, b["east"] + pad, b["north"] + pad))
        crs = sources[0].crs
        for source in sources:
            source.close()
    real = np.zeros((rows, columns), dtype=np.float32)
    reproject(mosaic[0].astype(np.float32), real, src_transform=transform, src_crs=crs,
              dst_transform=from_bounds(b["west"], b["south"], b["east"], b["north"], columns, rows), dst_crs=crs,
              resampling=Resampling.average)
    if (real < 100).any():
        raise SystemExit("DEM has voids inside the bounds")
    lat_mid = (b["south"] + b["north"]) / 2
    mx, my = 111_320 * math.cos(math.radians(lat_mid)), 110_574
    base = round(float(real.min()))
    return {
        "bounds": b, "columns": columns, "rows": rows,
        "cellSizeMetres": {"x": round((b["east"] - b["west"]) * mx / (columns - 1), 1),
                           "y": round((b["north"] - b["south"]) * my / (rows - 1), 1)},
        "baseMetres": base,
        "heightUnit": "metre above baseMetres, little-endian uint16, row 0 = north",
        "realRangeMetres": [base, round(float(real.max()))],
        "heights": base64.b64encode(np.round(real - base).astype("<u2").tobytes()).decode("ascii"),
        "source": "Copernicus DEM GLO-30 (© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, "
                  "provided under COPERNICUS by the European Union and ESA), averaged to this grid",
    }, real


def main() -> None:
    if len(sys.argv) not in (2, 3):
        raise SystemExit(__doc__)
    work = Path(sys.argv[1])
    chapter = Path(sys.argv[2]) if len(sys.argv) == 3 else ROOT / "site/chapters/mountain-resort"
    work.mkdir(parents=True, exist_ok=True)

    terrain, real = dem()
    print(f"terrain {terrain['columns']}x{terrain['rows']}, cell {terrain['cellSizeMetres']}, real {terrain['realRangeMetres']} m")

    osm = {name: overpass(work, name) for name in QUERIES}
    area = box(BOUNDS["west"], BOUNDS["south"], BOUNDS["east"], BOUNDS["north"])

    resort = polygon_of(osm["resort"][0])
    lakes, river_area = [], []
    for element in osm["water"]:
        shape = polygon_of(element)
        if shape is None or shape.is_empty:
            continue
        if element.get("tags", {}).get("water") == "river" or element["id"] == 8006825:
            river_area.append(shape.intersection(area))
        elif shape.intersects(resort):
            lakes.append(shape.intersection(resort.buffer(0.0005)))
    rivers = {}
    for element in osm["rivers"]:
        name = element.get("tags", {}).get("name")
        coords = [(p["lon"], p["lat"]) for p in element.get("geometry", [])]
        if name and len(coords) > 1:
            rivers.setdefault(name, []).append(LineString(coords))
    rivers = {name: [[[round(x, 5), round(y, 5)] for x, y in line.simplify(0.0001).coords]
                     for line in getattr(linemerge(lines), "geoms", [linemerge(lines)])]
              for name, lines in rivers.items()}
    temples = {}
    for element in osm["temples"]:
        name = element.get("tags", {}).get("name", "")
        temple_id = next((tid for tid, osm_name in {**TEMPLES, **OTHER_TEMPLES}.items() if name.startswith(osm_name)), None)
        shape = polygon_of(element)
        if not temple_id or not shape or shape.is_empty:
            continue  # halls inside a temple, and the town's own temples
        temples[temple_id] = {"name": name, "osm": element["id"], "labelled": temple_id in TEMPLES, "rings": rings(shape),
                              "centre": [round(shape.centroid.x, 5), round(shape.centroid.y, 5)]}
    missing = [tid for tid in TEMPLES if tid not in temples]
    if missing:
        print(f"  temples without an OSM footprint: {missing}")
    anchors = {}
    for key, osm_id in ANCHORS.items():
        element = next((e for e in osm["anchors"] if e["id"] == osm_id), None)
        if element is None:
            raise SystemExit(f"anchor {key} ({osm_id}) missing")
        c = element.get("center") or element
        anchors[key] = {"lon": round(c["lon"], 5), "lat": round(c["lat"], 5), "osm": f"{element['type']}/{osm_id}",
                        "name": element.get("tags", {}).get("name", "")}

    # Label anchors from the DEM (not named summits): the "chair back" is the highest ground within about 1.5 km
    # outside the resort's north and west walls; the hills zone is the highest ground inside the wall.
    import shapely
    b = BOUNDS
    rows, columns = real.shape
    lats = b["north"] - (np.arange(rows) + 0.5) / rows * (b["north"] - b["south"])
    lons = b["west"] + (np.arange(columns) + 0.5) / columns * (b["east"] - b["west"])
    glon, glat = np.meshgrid(lons, lats)
    centre = resort.centroid
    inside = shapely.contains_xy(resort, glon, glat)
    near = shapely.contains_xy(resort.buffer(0.015), glon, glat) & ~inside & ((glat > centre.y) | (glon < centre.x))

    def highest(mask):
        r, c = np.unravel_index(np.argmax(np.where(mask, real, -1)), real.shape)
        return {"lon": round(float(lons[c]), 5), "lat": round(float(lats[r]), 5), "elevation": round(float(real[r, c]))}
    ridge = highest(near)
    hills = highest(inside)
    lake_union = unary_union(lakes)
    lake_centre = {"lon": round(lake_union.centroid.x, 5), "lat": round(lake_union.centroid.y, 5)}

    features = {
        "resort": rings(resort),
        "lakes": [ring for lake in lakes for ring in rings(lake, 0.00002)],
        "riverArea": [ring for shape in river_area for ring in rings(shape, 0.00005)],
        "rivers": rivers,
        "temples": temples,
        "anchors": anchors,
        "ridge": ridge,
        "hills": hills,
        "lakeCentre": lake_centre,
        "resortAreaHa": round(resort.area * 111_320 * math.cos(math.radians(41)) * 110_574 / 10_000, 1),
        "source": {
            "osm": "© OpenStreetMap contributors, ODbL 1.0, via the Overpass API",
            "fetched": {name: json.loads((work / f"osm-{name}.json").read_text(encoding="utf-8")).get("fetched") for name in QUERIES},
            "resort": "relation 8008566 (避暑山庄)",
            "gate": "relation 8008565 (丽正门)",
            "wanshu": "node 8659379119 (蒙古包, the yurts in Wanshu Garden); the garden's own extent is not mapped in OSM",
            "ridge": "highest DEM cell within about 1.5 km outside the resort's north and west walls: a label anchor, not a named summit",
            "hills": "highest DEM cell inside the resort wall: a label anchor",
        },
    }
    (chapter / "terrain-data.js").write_text(
        "/* Generated by tools/build_mountain_resort_geodata.py from Copernicus DEM GLO-30. */\n"
        f"window.MOUNTAIN_RESORT_TERRAIN = {json.dumps(terrain, separators=(',', ':'))};\n", encoding="utf-8")
    (chapter / "features-data.js").write_text(
        "/* Generated by tools/build_mountain_resort_geodata.py from OpenStreetMap (ODbL). */\n"
        f"window.MOUNTAIN_RESORT_FEATURES = {json.dumps(features, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8")
    print(f"resort {features['resortAreaHa']} ha, lakes {len(features['lakes'])} rings, river area {len(features['riverArea'])} rings, "
          f"rivers {list(rivers)}, temples {sorted(temples)}, ridge {ridge}, hills {hills}, lakes at {lake_centre}")


if __name__ == "__main__":
    main()
