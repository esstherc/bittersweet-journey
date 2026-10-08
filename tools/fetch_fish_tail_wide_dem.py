#!/usr/bin/env python3
"""Fetch a coarse Copernicus DEM GLO-90 mosaic from the Mediterranean to the Pacific, for 鱼尾山屋 parts 2-4.

usage: fetch_fish_tail_wide_dem.py OUTPUT_TIF [WEST EAST SOUTH NORTH PER_DEGREE]

With the optional arguments it fetches another box at another resolution (the flat map's sharper Nepal
tile uses 79 90 24 32 60, about 1.8 km).

Reads only the smallest internal overview (1/4 resolution, ~360 m) of each 1° COG tile over HTTP,
averages it to 1/10° (~11 km) and writes one small GeoTIFF. Ocean tiles do not exist in the
bucket and are filled with 0. Needs rasterio (with GDAL /vsicurl/) and numpy; about 4,400 tiles, most over land.
"""

from __future__ import annotations

import sys
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.transform import from_origin

# WKT rather than an EPSG code: a stray PROJ database (e.g. from PostGIS) can break EPSG lookups.
WGS84 = CRS.from_wkt('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],'
                     'PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AXIS["Latitude",NORTH],AXIS["Longitude",EAST]]')

WEST, EAST, SOUTH, NORTH = 8.0, 125.0, 10.0, 52.0
PER_DEGREE = 10  # output cells per degree (1/10° ≈ 11 km)
URL = "/vsicurl/https://copernicus-dem-90m.s3.amazonaws.com/Copernicus_DSM_COG_30_{tile}_DEM/Copernicus_DSM_COG_30_{tile}_DEM.tif"


def tile_name(lon: int, lat: int) -> str:
    return f"{'N' if lat >= 0 else 'S'}{abs(lat):02d}_00_{'E' if lon >= 0 else 'W'}{abs(lon):03d}_00"


def fetch(lon: int, lat: int) -> tuple[int, int, np.ndarray | None]:
    for attempt in range(3):
        try:
            with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
                with rasterio.open(URL.format(tile=tile_name(lon, lat)), overview_level=1) as source:
                    data = source.read(1).astype(np.float32)
            rows, cols = data.shape
            # tiles above 50° are narrower; here all are square. Average down to PER_DEGREE.
            block_r, block_c = rows // PER_DEGREE, cols // PER_DEGREE
            data = data[: block_r * PER_DEGREE, : block_c * PER_DEGREE]
            coarse = data.reshape(PER_DEGREE, block_r, PER_DEGREE, block_c).mean(axis=(1, 3))
            return lon, lat, np.clip(coarse, 0, None)
        except rasterio.errors.RasterioIOError as error:
            if "404" in str(error) or "No such file" in str(error) or "not recognized" in str(error):
                return lon, lat, None
            if attempt == 2:
                raise
    return lon, lat, None


def main() -> None:
    global WEST, EAST, SOUTH, NORTH, PER_DEGREE
    if len(sys.argv) not in (2, 7):
        raise SystemExit(__doc__)
    if len(sys.argv) == 7:
        WEST, EAST, SOUTH, NORTH = map(float, sys.argv[2:6])
        PER_DEGREE = int(sys.argv[6])
    lons = range(int(np.floor(WEST)), int(np.ceil(EAST)))
    lats = range(int(np.floor(SOUTH)), int(np.ceil(NORTH)))
    width = len(lons) * PER_DEGREE
    height = len(lats) * PER_DEGREE
    mosaic = np.zeros((height, width), dtype=np.float32)
    jobs = [(lon, lat) for lon in lons for lat in lats]
    missing = 0
    with ThreadPoolExecutor(max_workers=12) as pool:
        for done, (lon, lat, block) in enumerate(pool.map(lambda job: fetch(*job), jobs), 1):
            if block is None:
                missing += 1
            else:
                row = (lats[-1] - lat) * PER_DEGREE
                col = (lon - lons[0]) * PER_DEGREE
                mosaic[row:row + PER_DEGREE, col:col + PER_DEGREE] = block
            if done % 50 == 0:
                print(f"{done}/{len(jobs)} tiles", flush=True)
    # crop to the exact bounds
    left, top = lons[0], lats[-1] + 1
    c0, c1 = round((WEST - left) * PER_DEGREE), round((EAST - left) * PER_DEGREE)
    r0, r1 = round((top - NORTH) * PER_DEGREE), round((top - SOUTH) * PER_DEGREE)
    mosaic = mosaic[r0:r1, c0:c1]
    np.save(sys.argv[1] + ".npy", mosaic)  # keep the fetched data even if writing the GeoTIFF fails
    transform = from_origin(WEST, NORTH, 1 / PER_DEGREE, 1 / PER_DEGREE)
    with rasterio.open(sys.argv[1], "w", driver="GTiff", width=mosaic.shape[1], height=mosaic.shape[0], count=1,
                       dtype="float32", crs=WGS84, transform=transform, compress="deflate") as out:
        out.write(mosaic, 1)
        out.update_tags(source=f"Copernicus DEM GLO-90, overview level 1, averaged to 1/{PER_DEGREE} degree",
                        missing_tiles_filled_with_zero=str(missing))
    print(f"wrote {sys.argv[1]} {mosaic.shape}, {len(jobs)} tiles, {missing} missing (ocean), range {mosaic.min():.0f}-{mosaic.max():.0f} m")


if __name__ == "__main__":
    main()
