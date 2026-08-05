#!/usr/bin/env python3
"""Build projected SVG geography for the Taoist Tower chapter.

Input data:
- Natural Earth 1:110m Admin 0 Countries
- Natural Earth 1:10m Admin 0 Countries, China point-of-view edition
- China standard-map outline and province GeoJSON exported from the public
  standard-map TopoJSON supplied by the Ministry of Natural Resources

The China close-up keeps the official standard-map planar geometry. Story
locations are placed with the matching Albers equal-area conic projection.
World and Eurasia views continue to use an equirectangular projection.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Callable, Iterable

from pyproj import CRS, Transformer


WORLD_BOUNDS = (-180.0, -90.0, 180.0, 90.0)
WORLD_RECT = (34.0, 135.0, 932.0, 515.0)
CHINA_RECT = (90.0, 185.0, 820.0, 440.0)
EURASIA_BOUNDS = (-15.0, 18.0, 140.0, 76.0)
EURASIA_RECT = (70.0, 145.0, 860.0, 505.0)

CHINA_STANDARD_CRS = CRS.from_proj4(
    "+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 "
    "+ellps=krass +units=m +no_defs"
)
WGS84_TO_CHINA_STANDARD = Transformer.from_crs(
    "EPSG:4326",
    CHINA_STANDARD_CRS,
    always_xy=True,
)

POINTS = {
    "mogao": {"lon": 94.809, "lat": 40.043},
    "dunhuang": {"lon": 94.662, "lat": 40.142},
    "kashgar": {"lon": 75.9898, "lat": 39.4704},
    "jiuquan": {"lon": 98.494, "lat": 39.733},
    "macheng": {"lon": 115.008, "lat": 31.172},
    "wudang": {"lon": 111.0, "lat": 32.4},
    "beijing": {"lon": 116.4074, "lat": 39.9042},
    "london": {"lon": -0.1276, "lat": 51.5072},
    "paris": {"lon": 2.3522, "lat": 48.8566},
    "saintPetersburg": {"lon": 30.3351, "lat": 59.9343},
    "kabul": {"lon": 69.2075, "lat": 34.5553},
    "newDelhi": {"lon": 77.209, "lat": 28.6139},
}

COUNTRY_CODES = {
    "china": "CHN",
    "britain": "GBR",
    "france": "FRA",
    "russia": "RUS",
    "afghanistan": "AFG",
    "india": "IND",
}

STANDARD_PROVINCES = {
    "gansu": "甘肃省",
    "xinjiang": "新疆维吾尔自治区",
    "hubei": "湖北省",
}


def project(
    lon: float,
    lat: float,
    bounds: tuple[float, float, float, float],
    rect: tuple[float, float, float, float],
) -> tuple[float, float]:
    min_lon, min_lat, max_lon, max_lat = bounds
    x, y, width, height = rect
    projected_x = x + ((lon - min_lon) / (max_lon - min_lon)) * width
    projected_y = y + ((max_lat - lat) / (max_lat - min_lat)) * height
    return round(projected_x, 2), round(projected_y, 2)


def rings(geometry: dict[str, Any]) -> Iterable[list[list[float]]]:
    if geometry["type"] == "Polygon":
        yield from geometry["coordinates"]
    elif geometry["type"] == "MultiPolygon":
        for polygon in geometry["coordinates"]:
            yield from polygon


def ring_path(
    ring: list[list[float]],
    projector: Callable[[float, float], tuple[float, float]],
    split_antimeridian: bool = False,
) -> str:
    parts: list[str] = []
    previous_x: float | None = None
    for source_x, source_y, *_ in ring:
        x, y = projector(float(source_x), float(source_y))
        command = (
            "M"
            if previous_x is None
            or (split_antimeridian and abs(source_x - previous_x) > 180)
            else "L"
        )
        parts.append(f"{command}{x:g},{y:g}")
        previous_x = source_x
    if parts:
        parts.append("Z")
    return "".join(parts)


def geometry_path(
    geometry: dict[str, Any],
    projector: Callable[[float, float], tuple[float, float]],
    split_antimeridian: bool = False,
) -> str:
    return "".join(
        ring_path(ring, projector, split_antimeridian)
        for ring in rings(geometry)
    )


def geographic_path(
    geometry: dict[str, Any],
    bounds: tuple[float, float, float, float],
    rect: tuple[float, float, float, float],
) -> str:
    return geometry_path(
        geometry,
        lambda lon, lat: project(lon, lat, bounds, rect),
        split_antimeridian=True,
    )


def feature_intersects(
    geometry: dict[str, Any],
    bounds: tuple[float, float, float, float],
) -> bool:
    min_lon, min_lat, max_lon, max_lat = bounds
    return any(
        min_lon <= lon <= max_lon and min_lat <= lat <= max_lat
        for ring in rings(geometry)
        for lon, lat, *_ in ring
    )


def projected_points(
    bounds: tuple[float, float, float, float],
    rect: tuple[float, float, float, float],
) -> dict[str, dict[str, float]]:
    return {
        name: {
            "x": project(point["lon"], point["lat"], bounds, rect)[0],
            "y": project(point["lon"], point["lat"], bounds, rect)[1],
            **point,
        }
        for name, point in POINTS.items()
    }


def geometry_bounds(
    geometries: Iterable[dict[str, Any]],
) -> tuple[float, float, float, float]:
    coordinates = [
        (float(source_x), float(source_y))
        for geometry in geometries
        for ring in rings(geometry)
        for source_x, source_y, *_ in ring
    ]
    xs, ys = zip(*coordinates)
    return min(xs), min(ys), max(xs), max(ys)


def planar_fitter(
    bounds: tuple[float, float, float, float],
    rect: tuple[float, float, float, float],
) -> Callable[[float, float], tuple[float, float]]:
    min_x, min_y, max_x, max_y = bounds
    rect_x, rect_y, rect_width, rect_height = rect
    source_width = max_x - min_x
    source_height = max_y - min_y
    scale = min(rect_width / source_width, rect_height / source_height)
    offset_x = rect_x + (rect_width - source_width * scale) / 2
    offset_y = rect_y + (rect_height - source_height * scale) / 2

    def fit(source_x: float, source_y: float) -> tuple[float, float]:
        return (
            round(offset_x + (source_x - min_x) * scale, 2),
            round(offset_y + (max_y - source_y) * scale, 2),
        )

    return fit


def standard_point(
    lon: float,
    lat: float,
    fit: Callable[[float, float], tuple[float, float]],
) -> tuple[float, float]:
    source_x, source_y = WGS84_TO_CHINA_STANDARD.transform(lon, lat)
    return fit(source_x, source_y)


def standard_points(
    fit: Callable[[float, float], tuple[float, float]],
) -> dict[str, dict[str, float]]:
    return {
        name: {
            "x": standard_point(point["lon"], point["lat"], fit)[0],
            "y": standard_point(point["lon"], point["lat"], fit)[1],
            **point,
        }
        for name, point in POINTS.items()
    }


def main() -> None:
    if len(sys.argv) != 6:
        raise SystemExit(
            "usage: build_taoist_world_geography.py COUNTRIES_GEOJSON "
            "CHINA_POV_GEOJSON STANDARD_OUTLINE_GEOJSON "
            "STANDARD_PROVINCES_GEOJSON OUTPUT_JS"
        )

    countries_path = Path(sys.argv[1])
    china_pov_path = Path(sys.argv[2])
    standard_outline_path = Path(sys.argv[3])
    standard_provinces_path = Path(sys.argv[4])
    destination = Path(sys.argv[5])

    countries = json.loads(countries_path.read_text(encoding="utf-8"))["features"]
    china_pov_features = json.loads(
        china_pov_path.read_text(encoding="utf-8")
    )["features"]
    standard_outline_features = json.loads(
        standard_outline_path.read_text(encoding="utf-8")
    )["features"]
    standard_province_features = json.loads(
        standard_provinces_path.read_text(encoding="utf-8")
    )["features"]

    country_by_code = {
        feature["properties"].get("ADM0_A3")
        or feature["properties"].get("ISO_A3"): feature
        for feature in countries
    }
    china_pov = next(
        feature
        for feature in china_pov_features
        if (
            feature["properties"].get("ADM0_A3")
            or feature["properties"].get("ISO_A3")
        )
        == "CHN"
    )

    world_land = "".join(
        geographic_path(feature["geometry"], WORLD_BOUNDS, WORLD_RECT)
        for feature in countries
    )
    eurasia_land = "".join(
        geographic_path(feature["geometry"], EURASIA_BOUNDS, EURASIA_RECT)
        for feature in countries
        if feature_intersects(feature["geometry"], EURASIA_BOUNDS)
    )

    world_highlights = {
        name: geographic_path(
            (
                china_pov["geometry"]
                if name == "china"
                else country_by_code[code]["geometry"]
            ),
            WORLD_BOUNDS,
            WORLD_RECT,
        )
        for name, code in COUNTRY_CODES.items()
    }
    eurasia_highlights = {
        name: geographic_path(
            (
                china_pov["geometry"]
                if name == "china"
                else country_by_code[code]["geometry"]
            ),
            EURASIA_BOUNDS,
            EURASIA_RECT,
        )
        for name, code in COUNTRY_CODES.items()
    }

    standard_outline = standard_outline_features[0]["geometry"]
    standard_provinces = {
        feature["properties"]["name"]: feature
        for feature in standard_province_features
    }
    standard_bounds = geometry_bounds(
        [feature["geometry"] for feature in standard_province_features]
    )
    fit_standard = planar_fitter(standard_bounds, CHINA_RECT)
    china_outline = geometry_path(standard_outline, fit_standard)
    china_all = "".join(
        geometry_path(feature["geometry"], fit_standard)
        for feature in standard_province_features
    )
    province_paths = {
        key: geometry_path(
            standard_provinces[name]["geometry"],
            fit_standard,
        )
        for key, name in STANDARD_PROVINCES.items()
    }
    province_centers = {
        key: {
            "x": fit_standard(
                float(standard_provinces[name]["properties"]["x"]),
                float(standard_provinces[name]["properties"]["y"]),
            )[0],
            "y": fit_standard(
                float(standard_provinces[name]["properties"]["x"]),
                float(standard_provinces[name]["properties"]["y"]),
            )[1],
        }
        for key, name in STANDARD_PROVINCES.items()
    }

    def official_label_center(name: str) -> dict[str, float]:
        feature = standard_provinces[name]
        x, y = fit_standard(
            float(feature["properties"]["x"]),
            float(feature["properties"]["y"]),
        )
        return {"x": x, "y": y}

    payload = {
        "source": {
            "countries": "Natural Earth 1:110m Admin 0 Countries",
            "chinaWorldHighlight": (
                "Natural Earth 1:10m Admin 0 Countries · China point of view"
            ),
            "chinaStandardMap": (
                "Ministry of Natural Resources standard-map public topology"
            ),
            "worldProjection": "Equirectangular",
            "chinaProjection": (
                "Albers equal-area conic · CM 110°E · SP 25°N / 47°N"
            ),
        },
        "world": {
            "landPath": world_land,
            "highlights": world_highlights,
            "points": projected_points(WORLD_BOUNDS, WORLD_RECT),
        },
        "china": {
            "outlinePath": china_outline,
            "provincePath": china_all,
            "highlights": province_paths,
            "centers": province_centers,
            "labels": {
                "xizang": official_label_center("西藏自治区"),
                "taiwan": official_label_center("台湾省"),
            },
            "points": standard_points(fit_standard),
        },
        "eurasia": {
            "landPath": eurasia_land,
            "highlights": eurasia_highlights,
            "points": projected_points(EURASIA_BOUNDS, EURASIA_RECT),
        },
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "/* China close-up: Ministry of Natural Resources standard-map "
        "projection. World views: Natural Earth. */\n"
        f"window.TAOIST_TOWER_GEOGRAPHY = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
