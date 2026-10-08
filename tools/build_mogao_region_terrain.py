#!/usr/bin/env python3
"""Add the "region" terrain to 莫高窟's terrain-data.js: the land around the villagers' fifteen kilometres.

usage: build_mogao_region_terrain.py [CHAPTER_DIR]

Section four draws a 15 km circle around the caves. The "local" terrain (about 37 x 34 km, 157 m cells)
is barely wider than that circle, so its edges showed around it. This terrain is about 136 x 130 km
(GLO-90 averaged to about 550 m cells), so the camera framing the circle sits well inside it and the
terrain runs past every edge of the panel. It reads the four Copernicus DEM GLO-90 tiles it needs over
HTTP (no download step) and replaces only MOGAO_TERRAIN.region, leaving the other terrains as built by
tools/build_mogao_geodata.py. CHAPTER_DIR defaults to site/chapters/mogao-caves.
"""

from __future__ import annotations

import base64
import json
import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.merge import merge
from rasterio.transform import from_bounds
from rasterio.warp import reproject

ROOT = Path(__file__).resolve().parents[1]
BOUNDS = {"west": 94.0, "east": 95.6, "south": 39.45, "north": 40.62}
GRID = (250, 230)  # columns, rows: 57,500 vertices, within 16-bit WebGL indices
TILES = ["N39_00_E094_00", "N39_00_E095_00", "N40_00_E094_00", "N40_00_E095_00"]
URL = "/vsicurl/https://copernicus-dem-90m.s3.amazonaws.com/Copernicus_DSM_COG_30_{tile}_DEM/Copernicus_DSM_COG_30_{tile}_DEM.tif"


def main() -> None:
    chapter = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "site/chapters/mogao-caves"
    columns, rows = GRID
    b = BOUNDS
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
        sources = [rasterio.open(URL.format(tile=tile)) for tile in TILES]
        # merge at native resolution with a margin, then average onto the exact grid (merge alone can round
        # a row short)
        pad = 0.02
        mosaic, transform = merge(sources, bounds=(b["west"] - pad, b["south"] - pad, b["east"] + pad, b["north"] + pad))
        crs = sources[0].crs
        for source in sources:
            source.close()
    real = np.zeros((rows, columns), dtype=np.float32)
    reproject(mosaic[0].astype(np.float32), real, src_transform=transform, src_crs=crs,
              dst_transform=from_bounds(b["west"], b["south"], b["east"], b["north"], columns, rows), dst_crs=crs,
              resampling=Resampling.average)
    if (real < 100).any():
        raise SystemExit(f"unexpected mosaic {real.shape} or voids")

    lat_mid = (b["south"] + b["north"]) / 2
    mx, my = 111_320 * math.cos(math.radians(lat_mid)), 110_574
    base = float(real.min())
    region = {
        "bounds": b, "columns": columns, "rows": rows,
        "cellSizeMetres": {"x": round((b["east"] - b["west"]) * mx / (columns - 1), 1),
                           "y": round((b["north"] - b["south"]) * my / (rows - 1), 1)},
        "baseMetres": round(base),
        "heightUnit": "metre above baseMetres, little-endian uint16, row 0 = north",
        "realRangeMetres": [round(base), round(float(real.max()))],
        "heights": base64.b64encode(np.round(real - round(base)).astype("<u2").tobytes()).decode("ascii"),
        "source": "Copernicus DEM GLO-90, averaged to this grid (tools/build_mogao_region_terrain.py)",
    }

    path = chapter / "terrain-data.js"
    text = path.read_text(encoding="utf-8")
    head, payload = text.split("=", 1)
    terrains = json.loads(payload.strip().rstrip(";"))
    terrains["region"] = region
    path.write_text(head + "= " + json.dumps(terrains, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"region: {columns}x{rows}, cell {region['cellSizeMetres']}, real {region['realRangeMetres']} m")


if __name__ == "__main__":
    main()
