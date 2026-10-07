#!/usr/bin/env python3
"""Build the georeferenced terrains and map features for 沙原隐泉 (chapter 7).

usage: build_secret_spring_3d.py WORK_DIR CHAPTER_DIR

Two terrains on plain longitude/latitude grids (row 0 = north), so the page can project any WGS 84
point onto the 3D surface and keep labels, the north arrow and the scale bar with the camera:
  local     Mingsha Mountain and Crescent Spring (sections one, three, four), Copernicus GLO-30
  regional  Dunhuang to the Yulin Caves (section two), Copernicus GLO-90

WORK_DIR holds glo30_N40_00_E094_00.tif and glo90_N39_00_E094_00.tif, glo90_N40_00_E094_00.tif,
glo90_N39_00_E095_00.tif, glo90_N40_00_E095_00.tif (Copernicus DEM COG tiles).

The OpenStreetMap features (Mingsha boundary, Dang River, Crescent Spring) are read from the existing
geography-data.js, where tools/build_secret_spring_geodata.py stored them in SVG canvas units, and are
converted back to longitude/latitude with the same UTM 46N canvas transform.
Writes terrain-data.js and geography-data.js. Needs numpy, rasterio, Pillow and pyproj.
"""

from __future__ import annotations

import base64
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from pyproj import Transformer
from rasterio.merge import merge

# the canvas transform used by tools/build_secret_spring_geodata.py
UTM_BOUNDS = {"left": 638011.159, "bottom": 4434589.222, "right": 646681.159, "top": 4443619.222}
CANVAS = {"left": 145.0, "top": 20.0, "width": 692.0, "height": 720.0}
TO_LONLAT = Transformer.from_crs("EPSG:32646", "EPSG:4326", always_xy=True)

TERRAINS = {
    "local": {"bounds": {"west": 94.62, "east": 94.72, "south": 40.05, "north": 40.13}, "grid": (180, 150),
              "tiles": ["glo30_N40_00_E094_00"], "source": "Copernicus DEM GLO-30, tile N40E094"},
    "regional": {"bounds": {"west": 94.35, "east": 96.15, "south": 39.55, "north": 40.55}, "grid": (280, 210),
                 "tiles": ["glo90_N39_00_E094_00", "glo90_N40_00_E094_00", "glo90_N39_00_E095_00", "glo90_N40_00_E095_00"],
                 "source": "Copernicus DEM GLO-90, tiles N39-40 E094-095"},
}

# The editorial footprint route, as first drawn in canvas units on the old fixed map (index.html, 2026-08).
ROUTE_CANVAS = "M280 690C314 650 294 612 347 580C390 554 380 516 427 492C459 476 474 451 506 431"

# Places (Wikidata P625 / OpenStreetMap). The peak and spring come from the OSM features below.
PLACES = {
    "dunhuang": {"zh": "敦煌", "en": "Dunhuang", "lon": 94.66389, "lat": 40.14111, "source": "Wikidata Q319114"},
    "mogao": {"zh": "莫高窟", "en": "Mogao Caves", "lon": 94.80417, "lat": 40.03722, "source": "Wikidata Q43286"},
    "yulin": {"zh": "榆林窟", "en": "Yulin Caves", "lon": 95.93614, "lat": 40.05915, "source": "Wikidata Q751622"},
    "peak": {"zh": "鸣沙山", "en": "Mingsha Mountain", "lon": 94.6749186, "lat": 40.083711, "source": "OpenStreetMap"},
}


def canvas_to_lonlat(x: float, y: float) -> tuple[float, float]:
    sx = CANVAS["width"] / (UTM_BOUNDS["right"] - UTM_BOUNDS["left"])
    sy = CANVAS["height"] / (UTM_BOUNDS["top"] - UTM_BOUNDS["bottom"])
    scale = min(sx, sy)
    easting = UTM_BOUNDS["left"] + (x - CANVAS["left"]) / scale
    northing = UTM_BOUNDS["top"] - (y - CANVAS["top"]) / scale
    lon, lat = TO_LONLAT.transform(easting, northing)
    return round(lon, 5), round(lat, 5)


def path_parts(d: str) -> list[list[tuple[float, float]]]:
    """An M/L path (as written by the geodata builder) as lists of lon/lat points, one per subpath."""
    parts = []
    for command, xs, ys in re.findall(r"([ML])([-\d.]+),([-\d.]+)", d):
        if command == "M":
            parts.append([])
        parts[-1].append(canvas_to_lonlat(float(xs), float(ys)))
    return [part for part in parts if len(part) > 1]


def bezier_route(d: str, steps: int = 12) -> list[tuple[float, float]]:
    """The editorial footprint route (an M + C path in canvas units) sampled into lon/lat points."""
    numbers = [float(n) for n in re.findall(r"-?[\d.]+", d)]
    x0, y0 = numbers[0], numbers[1]
    points = [canvas_to_lonlat(x0, y0)]
    rest = numbers[2:]
    for i in range(0, len(rest), 6):
        x1, y1, x2, y2, x3, y3 = rest[i:i + 6]
        for s in range(1, steps + 1):
            t = s / steps
            a, b, c, e = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
            points.append(canvas_to_lonlat(a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3))
        x0, y0 = x3, y3
    return points


def terrain(work: Path, spec: dict) -> dict:
    b = spec["bounds"]
    sources = [rasterio.open(work / f"{tile}.tif") for tile in spec["tiles"]]
    # merge whole tiles at native resolution, then crop exactly (merging to bounds leaves a zero edge)
    mosaic, transform = merge(sources)
    data = mosaic[0].astype(np.float32)
    inv = ~transform
    c0, r0 = inv * (b["west"], b["north"])
    c1, r1 = inv * (b["east"], b["south"])
    data = data[round(r0):round(r1), round(c0):round(c1)]
    if (data <= 0).any():
        raise SystemExit(f"DEM voids inside {b}")
    grid = np.asarray(Image.fromarray(data, mode="F").resize(spec["grid"], Image.BOX), dtype=np.float64)
    columns, rows = spec["grid"]
    lat = (b["south"] + b["north"]) / 2
    base = float(grid.min())
    return {
        "bounds": b, "columns": columns, "rows": rows,
        "cellSizeMetres": {"x": round((b["east"] - b["west"]) * 111_320 * math.cos(math.radians(lat)) / (columns - 1), 1),
                           "y": round((b["north"] - b["south"]) * 110_574 / (rows - 1), 1)},
        "baseMetres": round(base),
        "realRangeMetres": [round(base), round(float(grid.max()))],
        "heightUnit": "metre above baseMetres, little-endian uint16, row 0 = north",
        "heights": base64.b64encode(np.round(grid - round(base)).astype("<u2").tobytes()).decode("ascii"),
        "source": spec["source"],
    }


def great_circle_km(a: dict, b: dict) -> float:
    lat1, lat2 = math.radians(a["lat"]), math.radians(b["lat"])
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(math.radians(b["lon"] - a["lon"]) / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    work, chapter = Path(sys.argv[1]), Path(sys.argv[2])
    old = json.loads(re.search(r"=\s*(\{.*\})\s*;", (chapter / "geography-data.js").read_text(encoding="utf-8"), re.S).group(1))
    if "paths" not in old:
        raise SystemExit("geography-data.js is already georeferenced; rebuild it from the OSM snapshot first")

    terrains = {key: terrain(work, spec) for key, spec in TERRAINS.items()}
    for key, t in terrains.items():
        print(f"{key}: {t['columns']}x{t['rows']}, cell {t['cellSizeMetres']}, real {t['realRangeMetres']} m")
    (chapter / "terrain-data.js").write_text(
        "/* Generated by tools/build_secret_spring_3d.py from Copernicus DEM. Row 0 = north; lon/lat grid. */\n"
        f"window.SECRET_SPRING_TERRAIN = {json.dumps(terrains, separators=(',', ':'))};\n", encoding="utf-8")

    lake = path_parts(old["paths"]["lake"])
    lake_points = [p for part in lake for p in part]
    spring = {"zh": "月牙泉", "en": "Crescent Spring", "source": "OpenStreetMap way 1308452182",
              "lon": round(sum(p[0] for p in lake_points) / len(lake_points), 5),
              "lat": round(sum(p[1] for p in lake_points) / len(lake_points), 5)}
    places = {**PLACES, "spring": spring}
    distances = {
        "dunhuang-spring": round(great_circle_km(places["dunhuang"], spring), 1),
        "spring-mogao": round(great_circle_km(spring, places["mogao"]), 1),
        "mogao-yulin": round(great_circle_km(places["mogao"], places["yulin"]), 1),
    }
    geography = {
        "projection": "WGS 84 longitude/latitude; each terrain is drawn on a plain lon/lat grid",
        "terrains": {key: spec["bounds"] for key, spec in TERRAINS.items()},
        "places": places,
        "distancesKm": distances,
        "features": {
            "mingshaBoundary": path_parts(old["paths"]["mingshaBoundary"]),
            "danghe": path_parts(old["paths"]["danghe"]),
            "lake": lake,
            "route": bezier_route(ROUTE_CANVAS),
        },
        "sources": {
            **old["sources"],
            "regionalTerrain": "Copernicus DEM GLO-90, tiles N39-40 E094-095, accessed 2026-10-07",
            "places": "Wikidata P625 (Dunhuang Q319114, Mogao Q43286, Yulin Q751622), retrieved 2026-09-27",
        },
    }
    (chapter / "geography-data.js").write_text(
        "/* Generated by tools/build_secret_spring_3d.py. WGS 84 lon/lat; the page projects them onto the terrain. */\n"
        f"window.SECRET_SPRING_GEOGRAPHY = {json.dumps(geography, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8")
    print("spring", spring["lon"], spring["lat"], "distances", distances)
    print("features", {k: sum(len(p) for p in v) if v and isinstance(v[0], list) else len(v) for k, v in geography["features"].items()})


if __name__ == "__main__":
    main()
