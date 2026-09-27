#!/usr/bin/env python3
"""Build the terrain grid, map features and regional relief for 阳关雪.

usage: build_yangguan_geodata.py DEM_DIR OSM_JSON CHAPTER_DIR

DEM_DIR     folder holding Copernicus DEM GLO-90 COG tiles named glo90_N39_00_E093_00.tif etc.
            (https://copernicus-dem-90m.s3.amazonaws.com/Copernicus_DSM_COG_30_<tile>_DEM/...),
            glo90-wide-2arcmin.tif from tools/fetch_yangguan_wide_dem.py (part one, Yangguan to Suzhou)
            and ne_50m_rivers.geojson (Natural Earth 1:50m rivers and lake centerlines)
OSM_JSON    merged Overpass `out geom` responses (see docs/chapters/yangguan/GEODATA.md)
CHAPTER_DIR site/chapters/yangguan

Writes terrain-data.js, geography-data.js and assets/regional-relief.jpg.
Needs numpy, rasterio and Pillow. Coordinates stay WGS 84; the browser projects them.
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
from rasterio.merge import merge
from rasterio.enums import Resampling
from PIL import Image

# ---------------------------------------------------------------- fixed inputs

# 阳关: Wikidata Q909541, P625 (retrieved 2026-09-27). The DEM shows a local knoll at this point.
PASS = {"lon": 94.05904, "lat": 39.92725, "source": "Wikidata Q909541 P625"}
# 敦煌城区: same coordinate as docs/chapters/secret-spring/GEODATA.md.
DUNHUANG = {"lon": 94.662, "lat": 40.142, "source": "docs/chapters/secret-spring/GEODATA.md"}

# Poetic sites named at the start of the essay (Wikidata P625, retrieved 2026-09-27). They lie
# 1,700–2,400 km away, far outside the terrain, so the page shows each one as a direction marker
# at the terrain edge along its true bearing from the pass, with the great-circle distance.
FAR_SITES = [
    {"id": "baidicheng", "zh": "白帝城", "en": "White Emperor City", "lon": 109.570541, "lat": 31.043490, "source": "Wikidata Q803709"},
    {"id": "yellow-crane", "zh": "黄鹤楼", "en": "Yellow Crane Tower", "lon": 114.296944, "lat": 30.546944, "source": "Wikidata Q462372"},
    {"id": "hanshan", "zh": "寒山寺", "en": "Cold Mountain Temple", "lon": 120.564806, "lat": 31.312389, "source": "Wikidata Q1146619"},
]

# Part one: a coarse terrain from the pass to Suzhou so the three sites sit at their real places.
WIDE = {"west": 92.5, "east": 122.5, "south": 28.5, "north": 42.0}
WIDE_COLUMNS, WIDE_ROWS = 340, 187  # 63,580 vertices: stays within 16-bit WebGL indices
WIDE_RIVERS = {"Chang Jiang": "yangtze", "Yangtze": "yangtze", "Jinsha": "yangtze", "Huang": "yellow"}

# 3D terrain: the plain around the pass, the wall line to the east, the dune belt and the
# northern foothills of the Altun range to the south.
LOCAL = {"west": 93.72, "east": 94.40, "south": 39.36, "north": 40.04}
COLUMNS, ROWS = 180, 230
# Display only: heights above 1,600 m are compressed so the plain's relief stays readable
# next to the mountains. Recorded in the output and in the notes drawer.
COMPRESS_ABOVE, COMPRESS_FACTOR = 1600.0, 0.3

# Regional view: Dunhuang to Yangguan.
REGION = {"west": 93.85, "east": 94.85, "south": 39.70, "north": 40.30}
REGION_WIDTH = 1000

TILES = ["N39_00_E093_00", "N39_00_E094_00", "N40_00_E093_00", "N40_00_E094_00"]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_dem(dem_dir: Path, bounds: dict, width: int, height: int) -> np.ndarray:
    """Mosaic at native resolution, crop exactly, then area-average to the output grid."""
    sources = [rasterio.open(dem_dir / f"glo90_{tile}.tif") for tile in TILES]
    pad = 0.01
    mosaic, transform = merge(
        sources,
        bounds=(bounds["west"] - pad, bounds["south"] - pad, bounds["east"] + pad, bounds["north"] + pad),
    )
    data = mosaic[0].astype(np.float64)
    inverse = ~transform
    col0, row0 = inverse * (bounds["west"], bounds["north"])
    col1, row1 = inverse * (bounds["east"], bounds["south"])
    data = data[round(row0):round(row1), round(col0):round(col1)]
    if (data <= 0).any():
        raise SystemExit("DEM mosaic has voids inside the requested bounds")
    image = Image.fromarray(data.astype(np.float32), mode="F").resize((width, height), Image.BOX)
    return np.asarray(image, dtype=np.float64)


def compress(heights: np.ndarray) -> np.ndarray:
    over = np.clip(heights - COMPRESS_ABOVE, 0, None)
    return np.minimum(heights, COMPRESS_ABOVE) + over * COMPRESS_FACTOR


def metres_per_degree(lat: float) -> tuple[float, float]:
    return 111_320 * math.cos(math.radians(lat)), 110_574


def rounded(points):
    return [[round(lon, 5), round(lat, 5)] for lon, lat in points]


def inside(bounds: dict, lon: float, lat: float, pad: float = 0.0) -> bool:
    return (bounds["west"] - pad <= lon <= bounds["east"] + pad
            and bounds["south"] - pad <= lat <= bounds["north"] + pad)


# ---------------------------------------------------------------- features

def load_osm(path: Path) -> tuple[list[dict], dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return data["elements"], data.get("queries", {})


def way_points(element: dict) -> list[tuple[float, float]]:
    return [(p["lon"], p["lat"]) for p in element.get("geometry", [])]


def build_features(elements: list[dict]) -> dict:
    walls, roads, green, water, streams = [], [], [], [], []
    for element in elements:
        if element["type"] != "way":
            continue
        tags = element.get("tags", {})
        points = way_points(element)
        if len(points) < 2:
            continue
        if tags.get("historic") == "citywalls" and ("长城" in tags.get("name", "") or "Great Wall" in tags.get("name", "")):
            walls.append({"id": element["id"], "points": rounded(points)})
        elif tags.get("ref", "").find("S303") >= 0 or tags.get("name") in ("敦煌-阳关镇", "阳关镇-二墩"):
            roads.append({"id": element["id"], "ref": tags.get("ref", ""), "name": tags.get("name", ""), "points": rounded(points)})
        elif tags.get("landuse") in ("orchard", "farmland", "forest") or tags.get("natural") == "wood":
            # the oasis around the pass: 国营敦煌阳关林场 plus orchards and fields
            green.append({"id": element["id"], "points": rounded(points)})
        elif tags.get("natural") in ("water", "wetland"):
            water.append({"id": element["id"], "points": rounded(points)})
        elif tags.get("waterway") in ("river", "stream", "ditch", "canal"):
            streams.append({"id": element["id"], "points": rounded(points)})
    for group in (walls, roads, green, water, streams):
        group.sort(key=lambda item: item["id"])
    return {"wall": walls, "road": roads, "green": green, "water": water, "streams": streams}


def narrative_route() -> list[list[float]]:
    """A literary path from the east (toward Dunhuang) to the pass. Not a surveyed route."""
    start = (94.27, 39.975)  # inside the solid part of the terrain, toward Dunhuang
    c1 = (94.21, 39.950)
    c2 = (94.13, 39.910)
    end = (PASS["lon"] + 0.006, PASS["lat"] - 0.002)
    points = []
    for step in range(41):
        t = step / 40
        u = 1 - t
        lon = u**3 * start[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t**3 * end[0]
        lat = u**3 * start[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t**3 * end[1]
        points.append((lon, lat))
    return rounded(points)


def mound_field(route: list[list[float]]) -> list[list[float]]:
    """Literary burial mounds scattered around the middle of the route (deterministic)."""
    rng = np.random.default_rng(1908)
    mounds = []
    for index in range(70):
        t = 0.22 + 0.5 * (index / 69)
        base = route[int(t * (len(route) - 1))]
        lon = base[0] + rng.normal(0, 0.022)
        lat = base[1] + rng.normal(0, 0.012)
        mounds.append([round(lon, 5), round(lat, 5), round(float(t), 3)])
    return mounds


# ---------------------------------------------------------------- outputs

def hillshade(z: np.ndarray, dx: float, dy: float) -> np.ndarray:
    gy, gx = np.gradient(z, dy, dx)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    shade = np.zeros_like(z)
    for azimuth, weight in ((315, 0.55), (270, 0.25), (0, 0.2)):
        az, alt = math.radians(azimuth), math.radians(40)
        shade += weight * (math.sin(alt) * np.cos(slope) + math.cos(alt) * np.sin(slope) * np.cos(az - aspect))
    return np.clip(shade, 0, 1)


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    dem_dir, osm_path, chapter_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    (chapter_dir / "assets").mkdir(parents=True, exist_ok=True)

    # 3D terrain grid
    real = read_dem(dem_dir, LOCAL, COLUMNS, ROWS)
    display = compress(real)
    base = float(display.min())
    decimetres = np.round((display - base) * 10).astype(np.uint16)
    mid_lat = (LOCAL["south"] + LOCAL["north"]) / 2
    mx, my = metres_per_degree(mid_lat)
    cell_x = (LOCAL["east"] - LOCAL["west"]) * mx / (COLUMNS - 1)
    cell_y = (LOCAL["north"] - LOCAL["south"]) * my / (ROWS - 1)
    # label anchor for the Altun foothills: highest cell away from the faded mesh edges
    margin_c, margin_r = round(COLUMNS * 0.1), round(ROWS * 0.1)
    inner = real[margin_r:ROWS - margin_r, margin_c:COLUMNS - margin_c]
    inner_index = np.unravel_index(np.argmax(inner), inner.shape)
    peak_index = (inner_index[0] + margin_r, inner_index[1] + margin_c)
    peak = {
        "lon": round(float(LOCAL["west"] + peak_index[1] / (COLUMNS - 1) * (LOCAL["east"] - LOCAL["west"])), 4),
        "lat": round(float(LOCAL["north"] - peak_index[0] / (ROWS - 1) * (LOCAL["north"] - LOCAL["south"])), 4),
        "elevation": round(float(real[peak_index])),
        "note": "highest DEM cell inside the inner 80% of the terrain view; a label anchor, not a named summit",
    }
    pass_row = round((LOCAL["north"] - PASS["lat"]) / (LOCAL["north"] - LOCAL["south"]) * (ROWS - 1))
    pass_col = round((PASS["lon"] - LOCAL["west"]) / (LOCAL["east"] - LOCAL["west"]) * (COLUMNS - 1))

    terrain = {
        "bounds": LOCAL,
        "columns": COLUMNS,
        "rows": ROWS,
        "cellSizeMetres": {"x": round(cell_x, 1), "y": round(cell_y, 1)},
        "baseMetres": round(base, 1),
        "heightUnit": "decimetre above baseMetres, little-endian uint16, row 0 = north",
        "compression": {"aboveMetres": COMPRESS_ABOVE, "factor": COMPRESS_FACTOR},
        "realRangeMetres": [round(float(real.min())), round(float(real.max()))],
        "heights": base64.b64encode(decimetres.astype("<u2").tobytes()).decode("ascii"),
        "source": "Copernicus DEM GLO-90 (© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA)",
    }
    wide_terrain, wide_rivers = build_wide(dem_dir)
    (chapter_dir / "terrain-data.js").write_text(
        "/* Generated by tools/build_yangguan_geodata.py from Copernicus DEM GLO-90. */\n"
        f"window.YANGGUAN_TERRAIN = {json.dumps(terrain, separators=(',', ':'))};\n"
        "/* Part one: coarse terrain from the pass to Suzhou. */\n"
        f"window.YANGGUAN_TERRAIN_WIDE = {json.dumps(wide_terrain, separators=(',', ':'))};\n",
        encoding="utf-8",
    )

    # Features
    elements, queries = load_osm(osm_path)
    features = build_features(elements)
    route = narrative_route()
    mounds = mound_field(route)
    local_wall = [w for w in features["wall"] if any(inside(LOCAL, lon, lat) for lon, lat in w["points"])]
    near = lambda item: any(inside(LOCAL, lon, lat) for lon, lat in item["points"])
    oasis = {key: [item for item in features[key] if near(item)] for key in ("green", "water", "streams")}

    # Regional relief image + projected vectors (equirectangular, x scaled by cos(latitude))
    rmx, rmy = metres_per_degree((REGION["south"] + REGION["north"]) / 2)
    aspect = (REGION["east"] - REGION["west"]) * rmx / ((REGION["north"] - REGION["south"]) * rmy)
    region_height = round(REGION_WIDTH / aspect)
    rz = read_dem(dem_dir, REGION, REGION_WIDTH, region_height)
    shade = hillshade(rz, (REGION["east"] - REGION["west"]) * rmx / REGION_WIDTH,
                      (REGION["north"] - REGION["south"]) * rmy / region_height)
    tone = np.clip(128 + shade * 132 - (rz - rz.min()) / (rz.max() - rz.min()) * 25, 0, 255).astype(np.uint8)
    Image.fromarray(tone, mode="L").save(chapter_dir / "assets" / "regional-relief.jpg", quality=78, optimize=True)

    def project(lon: float, lat: float) -> list[float]:
        x = (lon - REGION["west"]) / (REGION["east"] - REGION["west"]) * REGION_WIDTH
        y = (REGION["north"] - lat) / (REGION["north"] - REGION["south"]) * region_height
        return [round(x, 1), round(y, 1)]

    def path(points) -> str:
        coords = [project(lon, lat) for lon, lat in points]
        return "M" + "L".join(f"{x},{y}" for x, y in coords)

    regional_roads = [f for f in features["road"] if any(inside(REGION, lon, lat) for lon, lat in f["points"])]
    distance_km = great_circle_km(PASS, DUNHUANG)

    geography = {
        "source": {
            "pass": PASS["source"],
            "farSites": {site["id"]: site["source"] for site in FAR_SITES},
            "dunhuang": DUNHUANG["source"],
            "osm": "© OpenStreetMap contributors, ODbL 1.0, via Overpass API",
            "osmQueries": {name: {"osm_base": q.get("osm_base")} for name, q in queries.items()},
            "dem": "Copernicus DEM GLO-90",
            "rivers": "Natural Earth 1:50m rivers and lake centerlines (public domain)",
            "demTiles": {tile: sha256(dem_dir / f"glo90_{tile}.tif")[:16] for tile in TILES},
        },
        "points": {"pass": PASS, "dunhuang": DUNHUANG, "peak": peak},
        "local": {
            "wall": local_wall,
            "green": oasis["green"],
            "water": oasis["water"],
            "streams": oasis["streams"],
            "route": route,
            "mounds": mounds,
            "passCell": [pass_col, pass_row],
            "farSites": far_sites(),
            "rivers": wide_rivers,
        },
        "regional": {
            "viewBox": [0, 0, REGION_WIDTH, region_height],
            "image": "./assets/regional-relief.jpg",
            "pass": project(PASS["lon"], PASS["lat"]),
            "dunhuang": project(DUNHUANG["lon"], DUNHUANG["lat"]),
            "roads": [path(f["points"]) for f in regional_roads],
            "wall": [path(w["points"]) for w in features["wall"]],
            "distanceKm": round(distance_km, 1),
        },
    }
    (chapter_dir / "geography-data.js").write_text(
        "/* Generated by tools/build_yangguan_geodata.py. WGS 84 lon/lat; the page projects them. */\n"
        f"window.YANGGUAN_GEOGRAPHY = {json.dumps(geography, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    print(f"terrain {COLUMNS}x{ROWS}, cell {cell_x:.0f} x {cell_y:.0f} m, real {real.min():.0f}-{real.max():.0f} m, "
          f"pass cell {pass_col},{pass_row} = {real[pass_row, pass_col]:.0f} m, peak {peak}")
    print(f"wide terrain {WIDE_COLUMNS}x{WIDE_ROWS}, cell {wide_terrain['cellSizeMetres']}, real {wide_terrain['realRangeMetres']} m, "
          f"rivers yangtze/yellow {len(wide_rivers['yangtze'])}/{len(wide_rivers['yellow'])} parts")
    print(f"walls {len(local_wall)}/{len(features['wall'])}, roads {len(regional_roads)}, "
          f"oasis green/water/streams {len(oasis['green'])}/{len(oasis['water'])}/{len(oasis['streams'])}, "
          f"mounds {len(mounds)}, regional {REGION_WIDTH}x{region_height}, Dunhuang–Yangguan {distance_km:.1f} km")


def initial_bearing(a: dict, b: dict) -> float:
    lat1, lat2 = math.radians(a["lat"]), math.radians(b["lat"])
    dlon = math.radians(b["lon"] - a["lon"])
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def far_sites() -> list[dict]:
    sites = []
    for site in FAR_SITES:
        bearing = initial_bearing(PASS, site)
        sites.append({**site, "bearing": round(bearing, 1), "distanceKm": round(great_circle_km(PASS, site))})
    return sites


def build_wide(dem_dir: Path) -> tuple[dict, dict]:
    with rasterio.open(dem_dir / "glo90-wide-2arcmin.tif") as source:
        mosaic = source.read(1).astype(np.float32)
        b = source.bounds
    got = (round(b.left, 3), round(b.right, 3), round(b.bottom, 3), round(b.top, 3))
    if got != (WIDE["west"], WIDE["east"], WIDE["south"], WIDE["north"]):
        raise SystemExit(f"wide DEM bounds {got} do not match {WIDE}")
    real = np.asarray(Image.fromarray(mosaic, mode="F").resize((WIDE_COLUMNS, WIDE_ROWS), Image.BOX), dtype=np.float64)
    real = np.clip(real, 0, None)
    decimetres = np.round(real * 10).astype(np.uint16)
    mx, my = metres_per_degree((WIDE["south"] + WIDE["north"]) / 2)
    terrain = {
        "bounds": WIDE,
        "columns": WIDE_COLUMNS,
        "rows": WIDE_ROWS,
        "cellSizeMetres": {
            "x": round((WIDE["east"] - WIDE["west"]) * mx / (WIDE_COLUMNS - 1), 1),
            "y": round((WIDE["north"] - WIDE["south"]) * my / (WIDE_ROWS - 1), 1),
        },
        "baseMetres": 0,
        "heightUnit": "decimetre above sea level, little-endian uint16, row 0 = north; 0 = sea or missing tile",
        "realRangeMetres": [round(float(real.min())), round(float(real.max()))],
        "heights": base64.b64encode(decimetres.astype("<u2").tobytes()).decode("ascii"),
        "source": "Copernicus DEM GLO-90, internal overview averaged to 1/30 degree, then to this grid",
    }

    rivers = {"yangtze": [], "yellow": []}
    data = json.loads((dem_dir / "ne_50m_rivers.geojson").read_text(encoding="utf-8"))
    for feature in data["features"]:
        props, geometry = feature["properties"], feature["geometry"]
        key = WIDE_RIVERS.get(props.get("name"))
        if not key or props.get("featurecla") != "River":
            continue
        parts = [geometry["coordinates"]] if geometry["type"] == "LineString" else geometry["coordinates"]
        for part in parts:
            points = [(lon, lat) for lon, lat in part if inside(WIDE, lon, lat)]
            if len(points) > 1:
                step = max(1, len(points) // 60)
                rivers[key].append(rounded(points[::step] + [points[-1]]))
    return terrain, rivers


def great_circle_km(a: dict, b: dict) -> float:
    lat1, lat2 = math.radians(a["lat"]), math.radians(b["lat"])
    dlat, dlon = lat2 - lat1, math.radians(b["lon"] - a["lon"])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


if __name__ == "__main__":
    main()
