#!/usr/bin/env python3
"""Build the shaded relief under 西域喀什's map (chapter 09).

usage: build_kashgar_relief.py DEM_TIF

DEM_TIF is Copernicus DEM GLO-90 averaged to 1/30° (about 3 km) over 70–100°E, 31–46°N:
  python tools/fetch_fish_tail_wide_dem.py WORK/kashgar-dem.tif 70 100 31 46 30
Writes site/chapters/kashgar/assets/region-relief.jpg: a grey hillshade (white = flat), resampled into the
map's own Web Mercator rows, so app.js places it by its two corners (RELIEF in app.js) and multiplies it over
the land. It replaces the generalised Natural Earth mountain and desert shapes as the picture of the terrain.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site/chapters/kashgar/assets/region-relief.jpg"
WIDTH = 2400  # output pixels across 70–100°E


def mercator_y(lat):
    return np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    with rasterio.open(sys.argv[1]) as dem:
        z = dem.read(1).astype(np.float32)
        t = dem.transform
    west, north = t.c, t.f
    east, south = west + t.a * z.shape[1], north + t.e * z.shape[0]
    rows, cols = z.shape

    # hillshade on the DEM's own lon/lat grid
    lat_mid = (south + north) / 2
    cell_x = (east - west) / cols * 111_320 * math.cos(math.radians(lat_mid))
    cell_y = (north - south) / rows * 110_574
    exaggeration = 3.0
    dzdy, dzdx = np.gradient(z, cell_y, cell_x)
    dzdx, dzdy = dzdx * exaggeration, -dzdy * exaggeration  # rows run south
    azimuth, altitude = math.radians(315), math.radians(45)
    slope = np.arctan(np.hypot(dzdx, dzdy))
    aspect = np.arctan2(-dzdx, dzdy)
    shade = np.sin(altitude) * np.cos(slope) + np.cos(altitude) * np.sin(slope) * np.cos(azimuth - math.pi / 2 - aspect)
    # flat = white; slopes darken; the high plateaus a touch darker so Pamir, Kunlun and Tian Shan read as massifs
    grey = 255 * np.clip(1.0 + 0.95 * (np.clip(shade, 0, 1) - math.sin(altitude)), 0.42, 1.0) * (1 - 0.12 * np.clip(z / 5500, 0, 1))
    edge = np.minimum.reduce(np.meshgrid(np.minimum(np.arange(cols), cols - 1 - np.arange(cols)) / cols,
                                         np.minimum(np.arange(rows), rows - 1 - np.arange(rows)) / rows))
    grey = 255 - (255 - grey) * np.clip(edge / 0.05, 0, 1)  # fade to white at the image's own edges

    # resample into Mercator rows: equal steps in Mercator y from north to south
    y_top, y_bottom = mercator_y(north), mercator_y(south)
    height = int(round(WIDTH * (y_top - y_bottom) / math.radians(east - west)))
    ys = y_top - (np.arange(height) + 0.5) / height * (y_top - y_bottom)
    lats = np.degrees(2 * np.arctan(np.exp(ys)) - np.pi / 2)
    fr = np.clip((north - lats) / (north - south) * rows - 0.5, 0, rows - 1.001)
    fc = np.clip((np.arange(WIDTH) + 0.5) / WIDTH * cols - 0.5, 0, cols - 1.001)
    r0, c0 = fr.astype(int)[:, None], fc.astype(int)[None, :]
    dr, dc = (fr - fr.astype(int))[:, None], (fc - fc.astype(int))[None, :]
    out = (grey[r0, c0] * (1 - dc) * (1 - dr) + grey[r0, c0 + 1] * dc * (1 - dr) +
           grey[r0 + 1, c0] * (1 - dc) * dr + grey[r0 + 1, c0 + 1] * dc * dr)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "L").save(OUT, quality=80, optimize=True, progressive=True)
    print(f"relief {WIDTH} x {height} px ({OUT.stat().st_size // 1024} KB), {west}–{east}°E, {south}–{north}°N")


if __name__ == "__main__":
    main()
