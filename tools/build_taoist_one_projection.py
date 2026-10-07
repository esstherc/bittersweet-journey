#!/usr/bin/env python3
"""Put every 道士塔 (chapter 5) map in one projection: one map, zoomed to each section's region.

usage: build_taoist_one_projection.py GEOGRAPHY_JS

The China close-up already uses the Ministry of Natural Resources standard map in an Albers equal-area
conic projection (CM 110°E, SP 25°N / 47°N, Krassovsky), placed on the chapter canvas by
tools/build_taoist_world_geography.py. That planar geometry is kept exactly as it is. The world and
Eurasia layers, which that builder drew in plain equirectangular projections, are converted back to
longitude/latitude and re-projected into the same Albers projection and the same canvas transform, so
all layers share one coordinate system.

Natural Earth's own outline of mainland China and Hainan is left out of the land layer: they are drawn
only from the standard map, so two different borders never overlap. (app.js leaves Taiwan and the
eastern islets out of the standard-map outline, so Natural Earth's Taiwan stays in the land layer, as it
was in the earlier world maps.) Land west of 30°W and south of
60°S (outside every section's frame, and across this projection's seam at 70°W) is left out too.
Adds `atlas` (land, highlights, points) to GEOGRAPHY_JS. The China geometry is read from `china`, which is
already in this projection; `world` and `eurasia` stay as this tool's input.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
from pyproj import CRS, Transformer

ALBERS = CRS.from_proj4("+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +ellps=krass +units=m +no_defs")
TO_ALBERS = Transformer.from_crs("EPSG:4326", ALBERS, always_xy=True)

# the equirectangular layers of tools/build_taoist_world_geography.py: (lon/lat bounds, canvas rect)
WORLD = ((-180.0, -90.0, 180.0, 90.0), (34.0, 135.0, 932.0, 515.0))
EURASIA = ((-15.0, 18.0, 140.0, 76.0), (70.0, 145.0, 860.0, 505.0))

# points inside rings that the standard map already draws (mainland China, Hainan)
STANDARD_MAP_ONLY = [(116.4, 39.9), (109.8, 19.2)]


def unproject(x: float, y: float, layer) -> tuple[float, float]:
    (min_lon, min_lat, max_lon, max_lat), (rx, ry, rw, rh) = layer
    return min_lon + (x - rx) / rw * (max_lon - min_lon), max_lat - (y - ry) / rh * (max_lat - min_lat)


def subpaths(d: str) -> list[list[tuple[float, float]]]:
    rings, ring = [], []
    for command, xs, ys in re.findall(r"([MLZ])\s*(-?[\d.]+)?,?(-?[\d.]+)?", d):
        if command == "M":
            if ring:
                rings.append(ring)
            ring = [(float(xs), float(ys))]
        elif command == "L":
            ring.append((float(xs), float(ys)))
        elif command == "Z" and ring:
            rings.append(ring)
            ring = []
    if ring:
        rings.append(ring)
    return rings


def inside(point, ring) -> bool:
    x, y = point
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")
    prefix, payload = text.split("=", 1)
    data = json.loads(payload.strip().rstrip(";"))

    # The canvas transform of the standard map: x = a·E + c, y = -a·N + d (uniform scale, y flipped),
    # recovered from the story points, which carry both canvas and geographic coordinates.
    pts = data["china"]["points"]
    E, N, X, Y = [], [], [], []
    for p in pts.values():
        e, n = TO_ALBERS.transform(p["lon"], p["lat"])
        E.append(e); N.append(n); X.append(p["x"]); Y.append(p["y"])
    E, N, X, Y = map(np.array, (E, N, X, Y))
    A = np.vstack([np.concatenate([E, -N]), np.concatenate([np.ones_like(E), np.zeros_like(E)]),
                   np.concatenate([np.zeros_like(E), np.ones_like(E)])]).T
    (a, c, d), *_ = np.linalg.lstsq(A, np.concatenate([X, Y]), rcond=None)
    residual = float(np.max(np.hypot(a * E + c - X, -a * N + d - Y)))
    print(f"standard-map canvas: scale {a:.6g} px/m, offset ({c:.2f}, {d:.2f}), max residual {residual:.3f} px")
    if residual > 0.05:
        raise SystemExit("the story points do not fit one Albers transform; the standard map has changed")

    def to_canvas(lon: float, lat: float) -> tuple[float, float]:
        e, n = TO_ALBERS.transform(lon, lat)
        return round(a * e + c, 2), round(-a * n + d, 2)

    def reproject(d_path: str, layer, drop_standard: bool = False) -> str:
        out = []
        for ring in subpaths(d_path):
            lonlat = [unproject(x, y, layer) for x, y in ring]
            if any(lon < -30 or lat < -60 for lon, lat in lonlat):
                continue
            if drop_standard and any(inside(p, lonlat) for p in STANDARD_MAP_ONLY):
                continue
            xy = [to_canvas(lon, lat) for lon, lat in lonlat]
            out.append("M" + "L".join(f"{x:g},{y:g}" for x, y in xy) + "Z")
        return "".join(out)

    atlas = {
        "projection": "Albers equal-area conic · CM 110°E · SP 25°N / 47°N · Krassovsky (the standard map's own)",
        "land": reproject(data["world"]["landPath"], WORLD, drop_standard=True),
        "highlights": {name: reproject(d_path, WORLD) for name, d_path in data["world"]["highlights"].items() if name != "china"},
        "points": {},
    }
    for name, p in data["eurasia"]["points"].items():
        x, y = to_canvas(p["lon"], p["lat"])
        atlas["points"][name] = {"x": x, "y": y, "lon": p["lon"], "lat": p["lat"]}
    data["atlas"] = atlas
    data["source"]["atlasProjection"] = atlas["projection"]
    path.write_text(prefix + "= " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print("land", len(atlas["land"]), "highlights", {k: len(v) for k, v in atlas["highlights"].items()})
    print("points", {k: (v["x"], v["y"]) for k, v in atlas["points"].items()})


if __name__ == "__main__":
    main()
