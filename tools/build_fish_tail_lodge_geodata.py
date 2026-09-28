#!/usr/bin/env python3
"""Build terrains, map features and places for 鱼尾山屋 (chapter 11).

usage: build_fish_tail_lodge_geodata.py WORK_DIR CHAPTER_DIR

WORK_DIR holds:
  glo90_<tile>.tif              Copernicus DEM GLO-90 COG tiles (N28_00_E083_00, N28_00_E084_00,
                                N27_00_E085_00, N28_00_E085_00, N27_00_E086_00, N28_00_E086_00)
  glo90-wide-6arcmin.tif        from tools/fetch_fish_tail_wide_dem.py (Mediterranean to the Pacific)
  ne_50m_rivers_lake_centerlines.geojson, ne_10m_geography_regions_polys.geojson,
  ne_10m_geography_marine_polys.geojson   Natural Earth (public domain)
  fishtail-osm.json             merged Overpass `out geom` responses (see GEODATA.md)
CHAPTER_DIR is site/chapters/fish-tail-lodge. Writes terrain-data.js and geography-data.js.
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
from shapely.geometry import box, shape

# ---------------------------------------------------------------- places (Wikidata P625, retrieved 2026-09-27)

PLACES = [
    # id, zh, en, lat, lon, Wikidata, role
    ("lodge", "鱼尾山屋", "Fish Tail Lodge", 28.20095, 83.96404, "Q111402808", "origin"),
    ("phewa", "费瓦湖", "Phewa Lake", 28.21417, 83.94722, "Q1192928", "local"),
    ("pokhara", "博克拉", "Pokhara", 28.20972, 83.98528, "Q6640", "local"),
    ("machhapuchhre", "鱼尾峰", "Machhapuchhre", 28.49500, 83.94917, "Q1051394", "peak"),
    ("annapurna", "安纳布尔纳 I 峰", "Annapurna I", 28.59580, 83.82000, "Q16466024", "peak"),
    ("kathmandu", "加德满都", "Kathmandu", 27.71000, 85.32000, "Q3037", "local"),
    ("lumbini", "蓝毗尼", "Lumbini", 27.48140, 83.27583, "Q9213", "lumbini"),
    ("bridge", "中尼友谊桥", "Sino-Nepal Friendship Bridge", 27.97344, 85.96383, "Q7524764", "border"),
    ("kodari", "科达里", "Kodari", 27.97350, 85.96280, "Q6425224", "border"),
    ("zhangmu", "樟木", "Zhangmu", 27.99102, 85.98120, "Q3270229", "border"),
    ("parthenon", "巴特农神庙", "Parthenon", 37.97153, 23.72660, "Q10288", "site"),
    ("olympia", "奥林匹亚", "Olympia", 37.63833, 21.63000, "Q38888", "site"),
    ("mycenae", "迈锡尼", "Mycenae", 37.73083, 22.75611, "Q132564", "site"),
    ("knossos", "克里特", "Crete", 35.29796, 25.16316, "Q173527", "site"),
    ("giza", "金字塔", "The Pyramids", 29.97611, 31.13278, "Q12508", "site"),
    ("cairo", "开罗", "Cairo", 30.04444, 31.23583, "Q85", "site"),
    ("luxor", "卢克索", "Luxor", 25.70000, 32.63917, "Q319841", "site"),
    ("sinai", "西奈", "Sinai", 28.53840, 33.97520, "Q377485", "site"),
    ("jerusalem", "耶路撒冷", "Jerusalem", 31.77668, 35.23416, "Q1218", "site"),
    ("baghdad", "巴格达", "Baghdad", 33.31528, 44.36611, "Q1530", "site"),
    ("babylon", "巴比伦", "Babylon", 32.54250, 44.42111, "Q5684", "site"),
    ("persepolis", "波斯", "Persia", 29.93500, 52.89000, "Q129072", "site"),
    ("mohenjo", "摩亨佐-达罗", "Mohenjo-daro", 27.32917, 68.13889, "Q5725", "passed"),
]
# The part of the essay (1-6) where each ancient site is first named.
SITE_SECTION = {"parthenon": 2, "olympia": 2, "mycenae": 2, "knossos": 2, "giza": 2, "cairo": 2, "luxor": 2,
                "sinai": 3, "jerusalem": 3, "baghdad": 3, "babylon": 3, "persepolis": 3, "mohenjo": 3}

# ---------------------------------------------------------------- terrains

TERRAINS = {
    # Part one: Pokhara, Phewa Lake, Machhapuchhre, the Annapurna south face.
    "pokhara": {"bounds": {"west": 83.72, "east": 84.14, "south": 28.10, "north": 28.66}, "grid": (170, 225),
                "tiles": ["N28_00_E083_00", "N28_00_E084_00"]},
    # Parts five and six: Kathmandu along the Araniko Highway to the Bhote Koshi gorge and Zhangmu.
    "border": {"bounds": {"west": 85.24, "east": 86.10, "south": 27.62, "north": 28.08}, "grid": (250, 150),
               "tiles": ["N27_00_E085_00", "N28_00_E085_00", "N27_00_E086_00", "N28_00_E086_00"]},
}
WIDE = {"west": 8.0, "east": 125.0, "south": 10.0, "north": 52.0}
WIDE_GRID = (380, 160)  # 60,800 vertices: stays within 16-bit WebGL indices

WIDE_RIVERS = {
    "Nile": "nile", "El Bahr el Abyad": "nile", "Damietta Branch": "nile", "Rosetta Branch": "nile",
    "Tigris": "tigris", "Dicle": "tigris", "Euphrates": "euphrates", "Firat": "euphrates", "Al Furat": "euphrates",
    "Shatt al Arab": "euphrates", "Jordan": "jordan", "Indus": "indus", "Ganges": "ganges",
    "Huang": "yellow", "Chang Jiang": "yangtze", "Yangtze": "yangtze", "Jinsha": "yangtze", "Tongtian": "yangtze",
}
# Section four: the enclosure the essay names (Natural Earth region names).
BARRIERS = {
    "HIMALAYAS": ("喜马拉雅山", "Himalayas", "range"), "KUNLUN MOUNTAINS": ("昆仑山", "Kunlun", "range"),
    "TIAN SHAN": ("天山", "Tian Shan", "range"), "ALTAY MOUNTAINS": ("阿尔泰山", "Altai", "range"),
    "TAKLIMAKAN DESERT": ("塔克拉玛干沙漠", "Taklimakan Desert", "desert"), "GOBI DESERT": ("戈壁", "Gobi", "desert"),
}
SEAS = {"Yellow Sea": ("黄海", "Yellow Sea"), "East China Sea": ("东海", "East China Sea"),
        "South China Sea": ("南海", "South China Sea")}


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


def local_dem(work: Path, spec: dict) -> np.ndarray:
    b = spec["bounds"]
    sources = [rasterio.open(work / f"glo90_{tile}.tif") for tile in spec["tiles"]]
    pad = 0.01
    mosaic, transform = merge(sources, bounds=(b["west"] - pad, b["south"] - pad, b["east"] + pad, b["north"] + pad))
    data = mosaic[0].astype(np.float32)
    inv = ~transform
    c0, r0 = inv * (b["west"], b["north"])
    c1, r1 = inv * (b["east"], b["south"])
    data = data[round(r0):round(r1), round(c0):round(c1)]
    if (data <= 0).any():
        raise SystemExit(f"DEM voids inside {b}")
    return np.asarray(Image.fromarray(data, mode="F").resize(spec["grid"], Image.BOX), dtype=np.float64)


def wide_dem(work: Path) -> np.ndarray:
    with rasterio.open(work / "glo90-wide-6arcmin.tif") as source:
        data = source.read(1).astype(np.float32)
        b = source.bounds
    got = (round(b.left, 3), round(b.right, 3), round(b.bottom, 3), round(b.top, 3))
    if got != (WIDE["west"], WIDE["east"], WIDE["south"], WIDE["north"]):
        raise SystemExit(f"wide DEM bounds {got} do not match {WIDE}")
    return np.clip(np.asarray(Image.fromarray(data, mode="F").resize(WIDE_GRID, Image.BOX), dtype=np.float64), 0, None)


def rounded(points, digits=4):
    return [[round(x, digits), round(y, digits)] for x, y in points]


def thin(points, keep=80):
    if len(points) <= keep:
        return points
    step = len(points) / keep
    out = [points[int(i * step)] for i in range(keep)]
    return out + [points[-1]]


def inside(b, lon, lat):
    return b["west"] <= lon <= b["east"] and b["south"] <= lat <= b["north"]


def great_circle_km(a, b):
    lat1, lat2 = math.radians(a[0]), math.radians(b[0])
    dlat, dlon = lat2 - lat1, math.radians(b[1] - a[1])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


# ---------------------------------------------------------------- features

def wide_features(work: Path) -> dict:
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

    regions = []
    data = json.loads((work / "ne_10m_geography_regions_polys.geojson").read_text(encoding="utf-8"))
    for feature in data["features"]:
        props = feature["properties"]
        meta = BARRIERS.get(props.get("NAME"))
        if not meta:
            continue
        geom = shape(feature["geometry"]).simplify(0.25, preserve_topology=True)
        polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
        outlines = [rounded(thin(list(p.exterior.coords), 90), 3) for p in polys if p.area > 0.5]
        label = geom.representative_point()
        regions.append({"id": props["NAME"].lower().replace(" ", "-"), "zh": meta[0], "en": meta[1], "kind": meta[2],
                        "label": [round(label.x, 3), round(label.y, 3)], "outlines": outlines,
                        "source": f"Natural Earth ({props.get('WIKIDATAID')})"})

    seas = []
    data = json.loads((work / "ne_10m_geography_marine_polys.geojson").read_text(encoding="utf-8"))
    for feature in data["features"]:
        props = feature["properties"]
        name = props.get("name") or props.get("NAME")
        if name in SEAS:
            geom = shape(feature["geometry"])
            # the South China Sea polygon reaches below the terrain; label only the part inside it
            geom = geom.intersection(box(WIDE["west"], WIDE["south"] + 4, WIDE["east"], WIDE["north"]))
            point = geom.representative_point()
            seas.append({"zh": SEAS[name][0], "en": SEAS[name][1], "label": [round(point.x, 3), round(point.y, 3)]})
    return {"rivers": rivers, "regions": regions, "seas": seas}


def osm_features(work: Path) -> tuple[dict, dict]:
    path = work / "fishtail-osm.json"
    if not path.exists():
        raise SystemExit("fishtail-osm.json missing: run the Overpass fetch first")
    data = json.loads(path.read_text(encoding="utf-8"))
    pokhara_b, border_b = TERRAINS["pokhara"]["bounds"], TERRAINS["border"]["bounds"]
    pokhara = {"lakes": [], "rivers": []}
    border = {"highway": [], "rivers": []}
    for element in data["elements"]:
        tags = element.get("tags", {})
        if element["type"] == "way":
            pts = [(p["lon"], p["lat"]) for p in element.get("geometry", [])]
        elif element["type"] == "relation":
            pts = [(p["lon"], p["lat"]) for m in element.get("members", []) if m.get("role") == "outer"
                   for p in m.get("geometry", [])]
        else:
            continue
        if len(pts) < 2:
            continue
        name = tags.get("name:en") or tags.get("name") or ""
        if tags.get("natural") == "water" and any(inside(pokhara_b, x, y) for x, y in pts) and "Phewa" in name:
            pokhara["lakes"].append({"id": element["id"], "name": name, "points": rounded(thin(pts, 160))})
        elif tags.get("waterway") == "river" and any(inside(pokhara_b, x, y) for x, y in pts):
            pokhara["rivers"].append({"id": element["id"], "name": name, "points": rounded(thin(pts, 60))})
        elif tags.get("waterway") == "river" and any(inside(border_b, x, y) for x, y in pts):
            border["rivers"].append({"id": element["id"], "name": name, "points": rounded(thin(pts, 60))})
        elif tags.get("highway") in ("trunk", "primary") and any(inside(border_b, x, y) for x, y in pts):
            # All trunk and primary roads go into the routing graph; between Kathmandu and Kodari the only
            # through road is the Araniko Highway (NH34), so the shortest path follows it.
            border["highway"].append({"id": element["id"], "name": name, "ref": tags.get("ref", ""), "points": rounded(pts, 5)})
    return pokhara, border, {k: {"osm_base": v.get("osm_base")} for k, v in data.get("queries", {}).items()}


def route_highway(ways: list[dict], start: tuple[float, float], end: tuple[float, float]) -> list[list[float]]:
    """Shortest path through the highway ways (a graph of shared vertices) from near `start` to near `end`."""
    import heapq
    key = lambda p: (round(p[0], 5), round(p[1], 5))
    graph: dict = {}
    def dist(a, b):
        return math.hypot((a[0] - b[0]) * math.cos(math.radians(28)), a[1] - b[1])
    for way in ways:
        pts = [key(p) for p in way["points"]]
        for a, b in zip(pts, pts[1:]):
            graph.setdefault(a, []).append((b, dist(a, b)))
            graph.setdefault(b, []).append((a, dist(a, b)))
    # join loose ends: vertices closer than ~50 m are treated as connected (dual carriageways, missing splits)
    nodes = list(graph)
    grid: dict = {}
    for n in nodes:
        grid.setdefault((round(n[0] / 0.002), round(n[1] / 0.002)), []).append(n)
    for n in nodes:
        gx, gy = round(n[0] / 0.002), round(n[1] / 0.002)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for m in grid.get((gx + dx, gy + dy), []):
                    if m != n and dist(n, m) < 0.0005:
                        graph[n].append((m, dist(n, m)))
    source = min(nodes, key=lambda n: dist(n, start))
    target = min(nodes, key=lambda n: dist(n, end))
    best, previous, queue = {source: 0.0}, {}, [(0.0, source)]
    while queue:
        d, node = heapq.heappop(queue)
        if node == target:
            break
        if d > best.get(node, 1e9):
            continue
        for nxt, w in graph[node]:
            if d + w < best.get(nxt, 1e9):
                best[nxt], previous[nxt] = d + w, node
                heapq.heappush(queue, (d + w, nxt))
    if target not in previous and target != source:
        raise SystemExit("highway: no connected path from Kathmandu to the bridge")
    path = [target]
    while path[-1] != source:
        path.append(previous[path[-1]])
    return [list(p) for p in reversed(path)]


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    work, chapter = Path(sys.argv[1]), Path(sys.argv[2])

    terrains = {}
    for key, spec in TERRAINS.items():
        real = local_dem(work, spec)
        terrains[key] = encode(real, spec["bounds"], "Copernicus DEM GLO-90")
        print(f"{key}: {spec['grid'][0]}x{spec['grid'][1]}, cell {terrains[key]['cellSizeMetres']}, real {terrains[key]['realRangeMetres']} m")
    wide = wide_dem(work)
    terrains["wide"] = encode(wide, WIDE, "Copernicus DEM GLO-90, internal overview averaged to 1/10 degree, then to this grid")
    print(f"wide: {WIDE_GRID}, cell {terrains['wide']['cellSizeMetres']}, real {terrains['wide']['realRangeMetres']} m")
    (chapter / "terrain-data.js").write_text(
        "/* Generated by tools/build_fish_tail_lodge_geodata.py from Copernicus DEM GLO-90. */\n"
        f"window.FISHTAIL_TERRAIN = {json.dumps(terrains, separators=(',', ':'))};\n", encoding="utf-8")

    lodge = (PLACES[0][3], PLACES[0][4])
    places = []
    for pid, zh, en, lat, lon, qid, role in PLACES:
        places.append({"id": pid, "zh": zh, "en": en, "lat": lat, "lon": lon, "wikidata": qid, "role": role,
                       "section": SITE_SECTION.get(pid), "distanceKm": round(great_circle_km(lodge, (lat, lon)))})

    # DEM elevations at places the essay gives a height for (compared in the notes)
    elevations = {}
    for key, pid in (("border", "bridge"), ("border", "zhangmu"), ("pokhara", "machhapuchhre"), ("pokhara", "lodge")):
        spec = TERRAINS[key]
        p = next(x for x in places if x["id"] == pid)
        with rasterio.open(work / f"glo90_{spec['tiles'][0] if pid != 'zhangmu' else 'N27_00_E085_00'}.tif") as s:
            r, c = s.index(p["lon"], p["lat"])
            window = s.read(1, window=((r - 2, r + 3), (c - 2, c + 3)))
            elevations[pid] = {"point": round(float(s.read(1, window=((r, r + 1), (c, c + 1)))[0, 0])),
                               "max5x5": round(float(window.max()))}
    pokhara, border, osm_queries = osm_features(work)
    bridge = next(p for p in places if p["id"] == "bridge")
    kathmandu = next(p for p in places if p["id"] == "kathmandu")
    highway = route_highway(border["highway"], (kathmandu["lon"], kathmandu["lat"]), (bridge["lon"], bridge["lat"]))
    highway_km = sum(great_circle_km((a[1], a[0]), (b[1], b[0])) for a, b in zip(highway, highway[1:]))
    highway = rounded(thin(highway, 400))

    geography = {
        "source": {
            "places": "Wikidata P625, retrieved 2026-09-27",
            "osm": "© OpenStreetMap contributors, ODbL 1.0, via Overpass API", "osmQueries": osm_queries,
            "naturalEarth": "Natural Earth 1:50m rivers, 1:10m geography regions and marine areas (public domain)",
            "dem": "Copernicus DEM GLO-90",
            "demTiles": {t: sha(work / f"glo90_{t}.tif") for spec in TERRAINS.values() for t in spec["tiles"]},
        },
        "places": places,
        "elevations": elevations,
        "pokhara": {"lakes": pokhara["lakes"], "rivers": pokhara["rivers"]},
        "border": {"highway": highway, "highwayKm": round(highway_km), "rivers": border["rivers"]},
        "wide": wide_features(work),
    }
    (chapter / "geography-data.js").write_text(
        "/* Generated by tools/build_fish_tail_lodge_geodata.py. WGS 84 lon/lat; the page projects them. */\n"
        f"window.FISHTAIL_GEOGRAPHY = {json.dumps(geography, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8")
    w = geography["wide"]
    print(f"places {len(places)}, elevations {elevations}")
    print(f"pokhara lakes {len(pokhara['lakes'])} rivers {len(pokhara['rivers'])}; border highway ways {len(border['highway'])} "
          f"-> {len(highway)} pts, {highway_km:.0f} km, rivers {len(border['rivers'])}")
    print(f"wide rivers {sorted(w['rivers'])}, regions {[r['id'] for r in w['regions']]}, seas {[s['en'] for s in w['seas']]}")


if __name__ == "__main__":
    main()
