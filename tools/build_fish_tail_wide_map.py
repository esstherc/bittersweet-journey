#!/usr/bin/env python3
"""Build the flat wide map of 鱼尾山屋 parts 2-4: one projection, one canvas, zoomed per section (as 道士塔).

usage: build_fish_tail_wide_map.py WIDE_DEM_TIF NE_LAND_GEOJSON NE_LAKES_GEOJSON CHAPTER_DIR [NEPAL_DEM_TIF]

WIDE_DEM_TIF comes from tools/fetch_fish_tail_wide_dem.py (Copernicus DEM GLO-90, 1/10°); the GeoJSON files
are Natural Earth 1:50m land and lakes. Writes, in CHAPTER_DIR:
  wide-map-data.js         window.FISHTAIL_WIDE_MAP: projection, canvas transform, coastline and lake paths
  assets/wide-relief.jpg   shaded relief with sea and land tints, in the same projection and canvas
  assets/wide-relief-nepal.png   with NEPAL_DEM_TIF (fetch_fish_tail_wide_dem.py OUT 79 90 24 32 60): a sharper
                           overlay for Nepal and the Himalayan front, its edges faded into the main relief

Projection: spherical Albers equal-area conic, central meridian 66.5°E, standard parallels 20°N / 45°N,
origin latitude 30°N (R = 6371 km) - centred on the essay's span from the Mediterranean to the Pacific.
site/chapters/fish-tail-lodge/wide-map.js implements the same formula, so labels land where the relief is.
No borders are drawn: the chapter's notes say so.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import transform as shp_transform

R = 6371.0
LON0, LAT0, LAT1, LAT2 = 66.5, 30.0, 20.0, 45.0
# the area drawn: wider than any section's frame, so the land runs to the panel edges
WEST, EAST, SOUTH, NORTH = -12.0, 140.0, -2.0, 60.0
CANVAS_WIDTH = 1000.0     # map units across the drawn area
RELIEF_PX_PER_UNIT = 3.0  # relief image pixels per map unit
# the sharper overlay for Nepal (part four's close-up): lon/lat box inside its DEM, pixels per map unit
DETAIL_BOX = (80.0, 89.0, 25.0, 31.0)
DETAIL_PX_PER_UNIT = 9.0

n = (math.sin(math.radians(LAT1)) + math.sin(math.radians(LAT2))) / 2
C = math.cos(math.radians(LAT1)) ** 2 + 2 * n * math.sin(math.radians(LAT1))
RHO0 = R * math.sqrt(C - 2 * n * math.sin(math.radians(LAT0))) / n


def albers(lon, lat):
    lon = np.asarray(lon, dtype=float)
    lat = np.asarray(lat, dtype=float)
    rho = R * np.sqrt(C - 2 * n * np.sin(np.radians(lat))) / n
    theta = n * np.radians(lon - LON0)
    return rho * np.sin(theta), RHO0 - rho * np.cos(theta)


def inverse(x, y):
    rho = np.hypot(x, RHO0 - y)
    theta = np.arctan2(x, RHO0 - y)
    lat = np.degrees(np.arcsin(np.clip((C - (rho * n / R) ** 2) / (2 * n), -1, 1)))
    return LON0 + np.degrees(theta) / n, lat


def main() -> None:
    if len(sys.argv) not in (5, 6):
        raise SystemExit(__doc__)
    dem_path, land_path, lakes_path, out_dir = map(Path, sys.argv[1:5])
    detail_dem = Path(sys.argv[5]) if len(sys.argv) == 6 else None

    # canvas: the projected outline of the drawn area, scaled to CANVAS_WIDTH, y down
    edge_lon = np.concatenate([np.linspace(WEST, EAST, 200), np.full(100, EAST), np.linspace(EAST, WEST, 200), np.full(100, WEST)])
    edge_lat = np.concatenate([np.full(200, SOUTH), np.linspace(SOUTH, NORTH, 100), np.full(200, NORTH), np.linspace(NORTH, SOUTH, 100)])
    ex, ey = albers(edge_lon, edge_lat)
    min_x, max_x, min_y, max_y = ex.min(), ex.max(), ey.min(), ey.max()
    scale = CANVAS_WIDTH / (max_x - min_x)  # map units per km
    height = (max_y - min_y) * scale

    def to_canvas(lon, lat):
        x, y = albers(lon, lat)
        return (x - min_x) * scale, (max_y - y) * scale

    def project_geom(geom):
        return shp_transform(lambda lon, lat, z=None: to_canvas(lon, lat), geom)

    def polygons(geom):
        if geom.is_empty:
            return []
        return list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom] if geom.geom_type == "Polygon" else \
            [g for g in getattr(geom, "geoms", []) if g.geom_type == "Polygon"]

    def path_of(polys, tolerance=0.08):
        out = []
        for poly in polys:
            poly = poly.simplify(tolerance, preserve_topology=True)
            for ring in [poly.exterior, *poly.interiors]:
                coords = list(ring.coords)
                if len(coords) < 4:
                    continue
                out.append("M" + "L".join(f"{x:.2f},{y:.2f}" for x, y in coords[:-1]) + "Z")
        return "".join(out)

    # land is clipped far outside the drawn area, so no clip edge can pass for a coastline
    area = box(WEST - 40, SOUTH - 30, EAST + 40, min(NORTH + 25, 89))
    land = []
    for feature in json.loads(land_path.read_text(encoding="utf-8"))["features"]:
        clipped = shape(feature["geometry"]).buffer(0).intersection(area)
        land += polygons(project_geom(clipped))
    lakes = []
    for feature in json.loads(lakes_path.read_text(encoding="utf-8"))["features"]:
        geom = shape(feature["geometry"]).buffer(0)
        # the big lakes only: Caspian, Aral, Balkhash, Baikal, Victoria's neighbours are outside the area
        if geom.intersects(area) and geom.area > 0.25:
            lakes += polygons(project_geom(geom.intersection(area)))

    # ---- relief images: hypsometric tint x hillshade ----
    def relief(dem_file, left, top, width_units, height_units, px_per_unit, exaggeration, fade_degrees):
        """Tinted, shaded relief for a canvas rectangle; returns RGB floats and the pixels' lon/lat."""
        width_px = int(round(width_units * px_per_unit))
        height_px = int(round(height_units * px_per_unit))
        gx, gy = np.meshgrid(left + (np.arange(width_px) + 0.5) / px_per_unit, top + (np.arange(height_px) + 0.5) / px_per_unit)
        lon, lat = inverse(gx / scale + min_x, max_y - gy / scale)
        with rasterio.open(dem_file) as dem:
            heights = dem.read(1).astype(np.float32)
            t = dem.transform
        fc = (lon - t.c) / t.a - 0.5
        fr = (lat - t.f) / t.e - 0.5
        inside = (fc >= 0) & (fc <= heights.shape[1] - 1) & (fr >= 0) & (fr <= heights.shape[0] - 1)
        fc = np.clip(fc, 0, heights.shape[1] - 1.001)
        fr = np.clip(fr, 0, heights.shape[0] - 1.001)
        c0, r0 = fc.astype(int), fr.astype(int)
        dc, dr = fc - c0, fr - r0
        z = (heights[r0, c0] * (1 - dc) * (1 - dr) + heights[r0, c0 + 1] * dc * (1 - dr) +
             heights[r0 + 1, c0] * (1 - dc) * dr + heights[r0 + 1, c0 + 1] * dc * dr)
        z = np.where(inside, np.maximum(z, 0), 0)
        # a DEM ends at its own bounds: its relief fades out inside them, so no edge shows
        if fade_degrees:
            west, north = t.c, t.f
            east, south = west + t.a * heights.shape[1], north + t.e * heights.shape[0]
            edge = np.minimum.reduce([lon - west, east - lon, lat - south, north - lat])
            z = z * np.clip(edge / fade_degrees, 0, 1)

        # hillshade: light from the north-west, slopes in metres per metre
        metres_per_px = 1000.0 / (scale * px_per_unit)
        dzdx = np.gradient(z, axis=1) / metres_per_px * exaggeration
        dzdy = np.gradient(z, axis=0) / metres_per_px * exaggeration
        azimuth, altitude = math.radians(315), math.radians(45)
        slope = np.arctan(np.hypot(dzdx, dzdy))
        aspect = np.arctan2(-dzdx, dzdy)
        shade = np.sin(altitude) * np.cos(slope) + np.cos(altitude) * np.sin(slope) * np.cos(azimuth - math.pi / 2 - aspect)
        # flat ground is 1.0 wherever it is, inside the DEM or not; slopes lighten or darken from there
        shade = np.clip(1.0 + 0.55 * (np.clip(shade, 0, 1) - math.sin(altitude)), 0.55, 1.12)

        # light tints (same rule as the 3D terrains: dark-blue rivers and red lines must stay readable)
        stops = [(0, (214, 222, 196)), (500, (222, 224, 199)), (1500, (229, 220, 196)), (3000, (232, 222, 203)),
                 (4500, (238, 233, 223)), (5500, (246, 245, 241))]
        tint = np.zeros(z.shape + (3,), dtype=np.float32)
        for channel in range(3):
            tint[..., channel] = np.interp(z, [s[0] for s in stops], [s[1][channel] for s in stops])
        return np.clip(tint * shade[..., None], 0, 255), lon, lat

    # the whole map, 11 km relief (its DEM's relief fades out over 4 degrees, outside every frame)
    rgb, _, _ = relief(dem_path, 0, 0, CANVAS_WIDTH, height, RELIEF_PX_PER_UNIT, 6.0, 4.0)
    width_px, height_px = rgb.shape[1], rgb.shape[0]

    # land mask from the coastline (the DEM's sea is 0 but so are some lowlands)
    mask = Image.new("L", (width_px, height_px), 0)
    draw = ImageDraw.Draw(mask)
    for poly in land:
        draw.polygon([(x * RELIEF_PX_PER_UNIT, y * RELIEF_PX_PER_UNIT) for x, y in poly.exterior.coords], fill=255)
        for hole in poly.interiors:
            draw.polygon([(x * RELIEF_PX_PER_UNIT, y * RELIEF_PX_PER_UNIT) for x, y in hole.coords], fill=0)
    for poly in lakes:
        draw.polygon([(x * RELIEF_PX_PER_UNIT, y * RELIEF_PX_PER_UNIT) for x, y in poly.exterior.coords], fill=0)
    mask = np.asarray(mask.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32)[..., None] / 255
    sea = np.array([223, 230, 231], dtype=np.float32)
    image = Image.fromarray((rgb * mask + sea * (1 - mask)).astype(np.uint8))
    relief_file = out_dir / "assets" / "wide-relief.jpg"
    image.save(relief_file, quality=84, optimize=True, progressive=True)

    # Nepal and the Himalayan front, sharper (about 1.8 km), for part four's close-up: an overlay whose
    # edges fade into the main relief. Gentler exaggeration, since finer cells give steeper slopes.
    detail = None
    if detail_dem:
        d_west, d_east, d_south, d_north = DETAIL_BOX
        ring_lon = np.concatenate([np.linspace(d_west, d_east, 40), np.linspace(d_west, d_east, 40), np.full(40, d_west), np.full(40, d_east)])
        ring_lat = np.concatenate([np.full(40, d_south), np.full(40, d_north), np.linspace(d_south, d_north, 40), np.linspace(d_south, d_north, 40)])
        dx, dy = to_canvas(ring_lon, ring_lat)
        left, top = float(np.min(dx)), float(np.min(dy))
        width_units, height_units = float(np.max(dx)) - left, float(np.max(dy)) - top
        drgb, dlon, dlat = relief(detail_dem, left, top, width_units, height_units, DETAIL_PX_PER_UNIT, 2.4, 0)
        edge = np.minimum.reduce([dlon - d_west, d_east - dlon, dlat - d_south, d_north - dlat])
        alpha = np.clip(edge / 0.8, 0, 1)[..., None] * 255
        detail_file = out_dir / "assets" / "wide-relief-nepal.png"
        Image.fromarray(np.concatenate([drgb, alpha], axis=2).astype(np.uint8), "RGBA").save(detail_file, optimize=True)
        detail = {"href": "./assets/wide-relief-nepal.png", "x": round(left, 3), "y": round(top, 3),
                  "width": round(width_units, 3), "height": round(height_units, 3)}
        print(f"detail {drgb.shape[1]} x {drgb.shape[0]} px ({detail_file.stat().st_size // 1024} KB)")

    data = {
        "projection": {"type": "albers", "lon0": LON0, "lat0": LAT0, "lat1": LAT1, "lat2": LAT2, "radiusKm": R},
        "canvas": {"minX": round(min_x, 4), "maxY": round(max_y, 4), "unitsPerKm": scale, "width": CANVAS_WIDTH, "height": round(height, 3)},
        "relief": {"href": "./assets/wide-relief.jpg", "width": CANVAS_WIDTH, "height": round(height, 3)},
        "detail": detail,
        "land": path_of(land),
        "lakes": path_of(lakes),
        "source": {
            "coastline": "Natural Earth 1:50m land and lakes (public domain)",
            "relief": "Copernicus DEM GLO-90, averaged to 1/10° (Nepal overlay 1/60°) by tools/fetch_fish_tail_wide_dem.py",
            "projection": "Albers equal-area conic (sphere), CM 66.5°E, SP 20°N / 45°N, origin 30°N"
        }
    }
    (out_dir / "wide-map-data.js").write_text(
        "/* 鱼尾山屋 parts 2-4: the flat wide map (tools/build_fish_tail_wide_map.py). */\n"
        "window.FISHTAIL_WIDE_MAP = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"canvas {CANVAS_WIDTH:.0f} x {height:.1f} units, relief {width_px} x {height_px} px "
          f"({relief_file.stat().st_size // 1024} KB), land {len(data['land']) // 1024} KB, lakes {len(data['lakes']) // 1024} KB")


if __name__ == "__main__":
    main()
