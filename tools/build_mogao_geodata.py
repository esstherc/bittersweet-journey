#!/usr/bin/env python3
"""Build terrains, map features, places and the cave table for 莫高窟 (chapter 6).

usage: build_mogao_geodata.py WORK_DIR CHAPTER_DIR

WORK_DIR holds:
  glo90_N39_00_E094_00.tif, glo90_N40_00_E094_00.tif   Copernicus DEM GLO-90 COG tiles (local terrain)
  glo30_N40_00_E094_00.tif      Copernicus DEM GLO-30 COG tile (the cliff close-up)
  glo90-wide-6arcmin.tif        from tools/fetch_fish_tail_wide_dem.py (8-125E, 10-52N), cropped here
  ne_50m_rivers_lake_centerlines.geojson, ne_110m_land.geojson   Natural Earth (public domain)
  mogao-osm.json                Overpass `out geom` responses: cliffs, named rivers (see GEODATA.md)
CHAPTER_DIR is site/chapters/mogao-caves. Writes terrain-data.js and geography-data.js.
Needs numpy, rasterio, Pillow and shapely. Coordinates stay WGS 84; the browser projects them.
"""

from __future__ import annotations

import base64
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.merge import merge
from shapely.geometry import shape

# ---------------------------------------------------------------- places (Wikidata P625, retrieved 2026-09-27)

PLACES = [
    # id, zh, en, lat, lon, source, role
    ("mogao", "莫高窟", "Mogao Caves", 40.03722, 94.80417, "Q43286", "origin"),
    ("dunhuang", "敦煌", "Dunhuang", 40.14111, 94.66389, "Q319114", "town"),
    ("mingsha", "鸣沙山", "Echoing Sand Hill", 40.084, 94.675, "OSM node 9204864657", "local"),
    ("gandhara", "犍陀罗", "Gandhara", 33.75600, 72.82910, "Q213651", "civilization"),
    ("beijing", "北京", "Beijing", 39.90403, 116.40753, "Q956", "world"),
    ("harvard", "哈佛大学", "Harvard University", 42.37409, -71.11436, "Q809600", "world"),
    ("philadelphia", "费城艺术博物馆", "Philadelphia Museum of Art", 39.96583, -75.18139, "Q510324", "world"),
]
# Region names placed where the essay names a civilisation without a place (representative label points).
REGIONS = [
    ("india", "印度", "India", 22.5, 79.0),
    ("greece", "希腊", "Greece", 39.3, 22.0),
    ("western-regions", "西域", "Western Regions", 41.0, 76.0),  # English edition only (section one); placed west, clear of Dunhuang
]

# ---------------------------------------------------------------- the caves (for the schematic cliff face)
# Cave numbers and periods as published by the Dunhuang Academy on 数字敦煌 (e-dunhuang.com, cave list,
# retrieved 2026-09-28), plus the three Northern Liang caves named in Whitfield, Whitfield & Agnew,
# Cave Temples of Mogao at Dunhuang (2015), p. 55. `step` is the essay's own sequence in section three.
STEPS = {
    "zh": ["十六国", "魏晋南北朝", "隋", "唐", "安史之乱后", "宋", "元", "明清"],
    "en": ["Sixteen Kingdoms", "Wei, Jin, Northern & Southern", "Sui", "Tang", "After the An Lushan rebellion", "Song", "Yuan", "Ming & Qing"],
}
PERIODS = {  # Academy period -> (en, essay step)
    "北凉": ("Northern Liang", 0), "北魏": ("Northern Wei", 1), "西魏": ("Western Wei", 1), "北周": ("Northern Zhou", 1),
    "隋": ("Sui", 2), "初唐": ("Early Tang", 3), "盛唐": ("High Tang", 3), "中唐": ("Middle Tang", 4),
    "晚唐": ("Late Tang", 4), "五代": ("Five Dynasties", 5), "元": ("Yuan", 6),
}
E_DUNHUANG = "数字敦煌 (Dunhuang Academy)"
WHITFIELD = "Whitfield, Whitfield & Agnew 2015, p. 55"
CAVES = [
    (268, "北凉", WHITFIELD, None), (272, "北凉", WHITFIELD, None), (275, "北凉", WHITFIELD, None),
    (254, "北魏", E_DUNHUANG, None), (257, "北魏", E_DUNHUANG, None),
    (249, "西魏", E_DUNHUANG, None), (285, "西魏", E_DUNHUANG, None), (301, "北周", E_DUNHUANG, None),
    (302, "隋", E_DUNHUANG, None), (303, "隋", E_DUNHUANG, None), (390, "隋", E_DUNHUANG, None),
    (420, "隋", E_DUNHUANG, ("飞天手持琵琶、箜篌", "flying apsaras holding pipa and harp")),
    (57, "初唐", E_DUNHUANG, None), (220, "初唐", E_DUNHUANG, ("西方净土变", "Western Paradise")),
    (321, "初唐", E_DUNHUANG, None), (322, "初唐", E_DUNHUANG, None),
    (323, "初唐", E_DUNHUANG, ("1924 年部分壁画被华尔纳剥走", "murals partly removed by Warner, 1924")),
    (329, "初唐", E_DUNHUANG, ("1924 年部分壁画被华尔纳剥走", "murals partly removed by Warner, 1924")),
    (23, "盛唐", E_DUNHUANG, None), (66, "盛唐", E_DUNHUANG, None), (103, "盛唐", E_DUNHUANG, None),
    (172, "盛唐", E_DUNHUANG, None), (194, "盛唐", E_DUNHUANG, None), (217, "盛唐", E_DUNHUANG, None),
    (320, "盛唐", E_DUNHUANG, ("1924 年部分壁画被华尔纳剥走", "murals partly removed by Warner, 1924")),
    (112, "中唐", E_DUNHUANG, ("反弹琵琶", "the dancer playing the pipa behind her back")),
    (12, "晚唐", E_DUNHUANG, None), (17, "晚唐", E_DUNHUANG, ("藏经洞，见《道士塔》", "the Library Cave: see The Taoist Priest’s Tower")),
    (107, "晚唐", E_DUNHUANG, None),
    (61, "五代", E_DUNHUANG, ("五台山图", "the Mount Wutai mural")),
    (3, "元", E_DUNHUANG, ("十一面千手千眼观音", "eleven-headed, thousand-armed Guanyin")),
]

# ---------------------------------------------------------------- terrains

LOCAL = {"bounds": {"west": 94.55, "east": 94.99, "south": 39.88, "north": 40.19}, "grid": (240, 220),
         "tiles": ["glo90_N39_00_E094_00", "glo90_N40_00_E094_00"]}
CLIFF = {"bounds": {"west": 94.780, "east": 94.830, "south": 40.015, "north": 40.060}, "tiles": ["glo30_N40_00_E094_00"]}
WIDE_SOURCE = {"west": 8.0, "east": 125.0, "south": 10.0, "north": 52.0}
WIDE = {"west": 15.0, "east": 105.0, "south": 18.0, "north": 48.0}
WIDE_GRID = (400, 160)  # 64,000 vertices: stays within 16-bit WebGL indices
WIDE_RIVERS = {"Indus": "indus", "Ganges": "ganges"}
VILLAGERS_KM = 15  # the essay: "从大约十五公里外的地方跑来"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def metres_per_degree(lat: float) -> tuple[float, float]:
    return 111_320 * math.cos(math.radians(lat)), 110_574


def encode(real: np.ndarray, bounds: dict, source: str) -> dict:
    """Heights as whole metres above the lowest cell (uint16), row 0 = north."""
    columns, rows = real.shape[1], real.shape[0]
    base = float(real.min())
    mx, my = metres_per_degree((bounds["south"] + bounds["north"]) / 2)
    return {
        "bounds": bounds, "columns": columns, "rows": rows,
        "cellSizeMetres": {"x": round((bounds["east"] - bounds["west"]) * mx / (columns - 1), 1),
                           "y": round((bounds["north"] - bounds["south"]) * my / (rows - 1), 1)},
        "baseMetres": round(base),
        "heightUnit": "metre above baseMetres, little-endian uint16, row 0 = north",
        "realRangeMetres": [round(base), round(float(real.max()))],
        "heights": base64.b64encode(np.round(real - round(base)).astype("<u2").tobytes()).decode("ascii"),
        "source": source,
    }


def crop(work: Path, spec: dict, grid: tuple[int, int] | None) -> np.ndarray:
    """Merge at native resolution, crop exactly, then area-average to `grid` (or keep native cells)."""
    b = spec["bounds"]
    sources = [rasterio.open(work / f"{tile}.tif") for tile in spec["tiles"]]
    pad = 0.01
    mosaic, transform = merge(sources, bounds=(b["west"] - pad, b["south"] - pad, b["east"] + pad, b["north"] + pad))
    data = mosaic[0].astype(np.float32)
    inv = ~transform
    c0, r0 = inv * (b["west"], b["north"])
    c1, r1 = inv * (b["east"], b["south"])
    data = data[round(r0):round(r1), round(c0):round(c1)]
    if (data <= 0).any():
        raise SystemExit(f"DEM voids inside {b}")
    if grid is None:
        return data.astype(np.float64)
    return np.asarray(Image.fromarray(data, mode="F").resize(grid, Image.BOX), dtype=np.float64)


def wide_dem(work: Path) -> np.ndarray:
    with rasterio.open(work / "glo90-wide-6arcmin.tif") as source:
        data = source.read(1).astype(np.float32)
        b = source.bounds
        got = (round(b.left, 3), round(b.right, 3), round(b.bottom, 3), round(b.top, 3))
        if got != tuple(WIDE_SOURCE[k] for k in ("west", "east", "south", "north")):
            raise SystemExit(f"wide DEM bounds {got} do not match {WIDE_SOURCE}")
        inv = ~source.transform
    c0, r0 = inv * (WIDE["west"], WIDE["north"])
    c1, r1 = inv * (WIDE["east"], WIDE["south"])
    data = data[round(r0):round(r1), round(c0):round(c1)]
    return np.clip(np.asarray(Image.fromarray(data, mode="F").resize(WIDE_GRID, Image.BOX), dtype=np.float64), 0, None)


def rounded(points, digits=4):
    return [[round(x, digits), round(y, digits)] for x, y in points]


def thin(points, keep=80):
    if len(points) <= keep:
        return points
    step = len(points) / keep
    return [points[int(i * step)] for i in range(keep)] + [points[-1]]


def inside(b, lon, lat):
    return b["west"] <= lon <= b["east"] and b["south"] <= lat <= b["north"]


def great_circle_km(a, b):
    lat1, lat2 = math.radians(a[0]), math.radians(b[0])
    dlat, dlon = lat2 - lat1, math.radians(b[1] - a[1])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


def wide_rivers(work: Path) -> dict:
    rivers = {}
    data = json.loads((work / "ne_50m_rivers_lake_centerlines.geojson").read_text(encoding="utf-8"))
    for feature in data["features"]:
        key = WIDE_RIVERS.get(feature["properties"].get("name"))
        if not key:
            continue
        g = feature["geometry"]
        for part in ([g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]):
            pts = [(x, y) for x, y in part if inside(WIDE, x, y)]
            if len(pts) > 1:
                rivers.setdefault(key, []).append(rounded(thin(pts, 60), 3))
    return rivers


def world_land(work: Path) -> list:
    """Natural Earth 1:110m land as rings of [lon, lat] (globe view)."""
    data = json.loads((work / "ne_110m_land.geojson").read_text(encoding="utf-8"))
    rings = []
    for feature in data["features"]:
        geom = shape(feature["geometry"]).simplify(0.4, preserve_topology=True)
        for poly in ([geom] if geom.geom_type == "Polygon" else list(geom.geoms)):
            if poly.area > 1.5:
                rings.append(rounded(list(poly.exterior.coords), 2))
    return rings


def osm_features(work: Path) -> tuple[list, dict, dict]:
    path = work / "mogao-osm.json"
    if not path.exists():
        raise SystemExit("mogao-osm.json missing: run the Overpass fetch first")
    data = json.loads(path.read_text(encoding="utf-8"))
    cliffs, rivers = [], {}
    for element in data["elements"]:
        tags = element.get("tags", {})
        pts = [(p["lon"], p["lat"]) for p in element.get("geometry", [])]
        if element["type"] != "way" or len(pts) < 2:
            continue
        if tags.get("natural") == "cliff":
            cliffs.append({"id": element["id"], "points": rounded(pts, 5)})
        elif tags.get("waterway") in ("river", "stream") and tags.get("name"):
            name = tags.get("name")
            rivers.setdefault(name, []).append({"id": element["id"], "name:en": tags.get("name:en", ""),
                                                "points": rounded(thin(pts, 120), 5)})
    return cliffs, rivers, data.get("queries", {})


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    work, chapter = Path(sys.argv[1]), Path(sys.argv[2])

    local = crop(work, LOCAL, LOCAL["grid"])
    cliff = crop(work, CLIFF, None)
    if cliff.shape[0] * cliff.shape[1] > 65_000:
        raise SystemExit(f"cliff grid {cliff.shape} is over the 16-bit index limit")
    wide = wide_dem(work)
    terrains = {
        "wide": encode(wide, WIDE, "Copernicus DEM GLO-90, internal overview averaged to 1/10 degree, then to this grid"),
        "local": encode(local, LOCAL["bounds"], "Copernicus DEM GLO-90"),
        "cliff": encode(cliff, CLIFF["bounds"], "Copernicus DEM GLO-30"),
    }
    for key, t in terrains.items():
        print(f"{key}: {t['columns']}x{t['rows']}, cell {t['cellSizeMetres']}, real {t['realRangeMetres']} m")
    (chapter / "terrain-data.js").write_text(
        "/* Generated by tools/build_mogao_geodata.py from Copernicus DEM GLO-90 / GLO-30. */\n"
        f"window.MOGAO_TERRAIN = {json.dumps(terrains, separators=(',', ':'))};\n", encoding="utf-8")

    mogao = (PLACES[0][3], PLACES[0][4])
    places = [{"id": pid, "zh": zh, "en": en, "lat": lat, "lon": lon, "source": src, "role": role,
               "distanceKm": round(great_circle_km(mogao, (lat, lon)))}
              for pid, zh, en, lat, lon, src, role in PLACES]
    cliffs, rivers, osm_queries = osm_features(work)
    caves = [{"number": n, "period": p, "periodEn": PERIODS[p][0], "step": PERIODS[p][1], "source": src,
              **({"note": {"zh": note[0], "en": note[1]}} if note else {})}
             for n, p, src, note in CAVES]
    geography = {
        "source": {
            "places": "Wikidata P625, retrieved 2026-09-27 (鸣沙山: OpenStreetMap)",
            "osm": "© OpenStreetMap contributors, ODbL 1.0, via Overpass API", "osmQueries": osm_queries,
            "naturalEarth": "Natural Earth 1:50m rivers, 1:110m land (public domain)",
            "dem": "Copernicus DEM GLO-90 and GLO-30",
            "demTiles": {t: sha(work / f"{t}.tif") for t in LOCAL["tiles"] + CLIFF["tiles"]},
            "caves": f"{E_DUNHUANG}, retrieved 2026-09-28; {WHITFIELD}",
        },
        "places": places,
        "regions": [{"id": rid, "zh": zh, "en": en, "lat": lat, "lon": lon} for rid, zh, en, lat, lon in REGIONS],
        "villagersKm": VILLAGERS_KM,
        "local": {"cliffs": cliffs, "rivers": rivers},
        "wide": {"rivers": wide_rivers(work)},
        "world": {"land": world_land(work)},
        "caves": {"steps": STEPS, "list": caves},
    }
    (chapter / "geography-data.js").write_text(
        "/* Generated by tools/build_mogao_geodata.py. WGS 84 lon/lat; the page projects them. */\n"
        f"window.MOGAO_GEOGRAPHY = {json.dumps(geography, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8")
    print(f"places {len(places)}, caves {len(caves)}, cliffs {len(cliffs)}, rivers {sorted(rivers)}, "
          f"wide rivers {sorted(geography['wide']['rivers'])}, land rings {len(geography['world']['land'])}")
    for p in places:
        print(f"  {p['id']}: {p['distanceKm']} km from Mogao")


if __name__ == "__main__":
    main()
