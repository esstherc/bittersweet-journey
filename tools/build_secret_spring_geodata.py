#!/usr/bin/env python3
"""Build compact SVG-ready geography for Mingsha Mountain and Crescent Spring."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from pyproj import Transformer
BOUNDS = {
    "west": 94.62,
    "south": 40.05,
    "east": 94.72,
    "north": 40.13,
}

UTM_BOUNDS = {
    "left": 638011.159,
    "bottom": 4434589.222,
    "right": 646681.159,
    "top": 4443619.222,
}

CANVAS = {
    "left": 145.0,
    "top": 20.0,
    "width": 692.0,
    "height": 720.0,
}

TRANSFORMER = Transformer.from_crs("EPSG:4326", "EPSG:32646", always_xy=True)


def canvas_point(x: float, y: float) -> tuple[float, float]:
    sx = CANVAS["width"] / (UTM_BOUNDS["right"] - UTM_BOUNDS["left"])
    sy = CANVAS["height"] / (UTM_BOUNDS["top"] - UTM_BOUNDS["bottom"])
    scale = min(sx, sy)
    return (
        CANVAS["left"] + (x - UTM_BOUNDS["left"]) * scale,
        CANVAS["top"] + (UTM_BOUNDS["top"] - y) * scale,
    )


def geographic_point(lon: float, lat: float) -> tuple[float, float]:
    return canvas_point(*TRANSFORMER.transform(lon, lat))


def path_from_points(points: list[tuple[float, float]], close: bool = False) -> str:
    if not points:
        return ""
    command = [f"M{points[0][0]:.1f},{points[0][1]:.1f}"]
    command.extend(f"L{x:.1f},{y:.1f}" for x, y in points[1:])
    if close:
        command.append("Z")
    return "".join(command)


def osm_path(element: dict) -> str:
    geometry = element.get("geometry", [])
    points = [geographic_point(item["lon"], item["lat"]) for item in geometry]
    close = bool(points and points[0] == points[-1])
    return path_from_points(points, close)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "usage: build_secret_spring_geodata.py OSM_JSON OUTPUT_JS"
        )

    osm = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    elements = {element["id"]: element for element in osm["elements"]}

    lake = elements[1308452182]
    mingsha_boundary = elements[689578966]
    danghe = [
        element
        for element in osm["elements"]
        if element.get("tags", {}).get("name") == "党河"
    ]

    lake_points = [
        geographic_point(item["lon"], item["lat"])
        for item in lake.get("geometry", [])
    ]
    lake_center = (
        sum(point[0] for point in lake_points) / len(lake_points),
        sum(point[1] for point in lake_points) / len(lake_points),
    )
    peak = geographic_point(94.6749186, 40.083711)

    payload = {
        "projection": "WGS 84 / UTM zone 46N (EPSG:32646)",
        "bounds": BOUNDS,
        "paths": {
            "lake": osm_path(lake),
            "mingshaBoundary": osm_path(mingsha_boundary),
            "danghe": "".join(osm_path(item) for item in danghe),
        },
        "points": {
            "lake": {"x": round(lake_center[0], 1), "y": round(lake_center[1], 1)},
            "peak": {"x": round(peak[0], 1), "y": round(peak[1], 1)},
        },
        "sources": {
            "terrain": "Copernicus DEM GLO-30, tile N40E094, accessed 2026-07-24",
            "features": "OpenStreetMap contributors, Overpass snapshot 2026-07-24",
            "literaryRoute": "Editorial interpretation; the essay does not provide a surveyed route",
        },
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    Path(sys.argv[2]).write_text(
        "/* Generated geographic data. See docs/chapters/secret-spring/GEODATA.md. */\n"
        f"window.SECRET_SPRING_GEOGRAPHY = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
