#!/usr/bin/env python3
"""Build the flat map for 阳关雪 parts one and two, as in 道士塔's first map: one map, one projection.

usage: build_yangguan_flat_map.py

Reads site/chapters/taoist-tower/geography-data.js (the Ministry of Natural Resources standard map of
China, already in Albers equal-area conic, CM 110°E, SP 25°N / 47°N, Krassovsky, on 道士塔's canvas) and
site/chapters/yangguan/geography-data.js (the pass, Dunhuang, the poetic sites, the rivers and the
regional roads, Han wall line and relief image), and writes site/chapters/yangguan/flat-map-data.js:
  projection   the Albers parameters and the canvas transform (x = a·E + c, y = -a·N + d), which
               flat-map.js implements, so labels land on the map
  china        the standard-map outline, provinces and the Gansu highlight (unchanged geometry)
  regional     roads and the Han wall projected; the relief image placed by an affine matrix, since
               its own small equirectangular frame (93.85–94.85°E, 39.70–40.30°N) is turned about 9°
               in this conic projection (the fit residual is printed: about 2 px of the 1,000 px image)
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from pyproj import CRS, Transformer

ROOT = Path(__file__).resolve().parents[1]
TAOIST = ROOT / "site/chapters/taoist-tower/geography-data.js"
YANGGUAN = ROOT / "site/chapters/yangguan/geography-data.js"
OUT = ROOT / "site/chapters/yangguan/flat-map-data.js"

PROJ4 = "+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +ellps=krass +units=m +no_defs"
TO_ALBERS = Transformer.from_crs("EPSG:4326", CRS.from_proj4(PROJ4), always_xy=True)
# the regional view of tools/build_yangguan_geodata.py (equirectangular on its own small frame)
REGION = {"west": 93.85, "east": 94.85, "south": 39.70, "north": 40.30}


def load(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    payload = text[text.index("=") + 1:].strip().rstrip(";")
    return json.loads(payload)


def main() -> None:
    taoist = load(TAOIST)
    yangguan = load(YANGGUAN)

    # 道士塔's canvas transform, recovered from its story points (as tools/build_taoist_one_projection.py)
    pts = taoist["china"]["points"].values()
    E, N, X, Y = map(np.array, zip(*[(*TO_ALBERS.transform(p["lon"], p["lat"]), p["x"], p["y"]) for p in pts]))
    A = np.vstack([np.concatenate([E, -N]), np.r_[np.ones_like(E), np.zeros_like(E)], np.r_[np.zeros_like(E), np.ones_like(E)]]).T
    (a, c, d), *_ = np.linalg.lstsq(A, np.concatenate([X, Y]), rcond=None)
    residual = float(np.max(np.hypot(a * E + c - X, -a * N + d - Y)))
    print(f"canvas: {a:.6g} units/m, offset ({c:.2f}, {d:.2f}), residual {residual:.3f}")

    def canvas(lon, lat):
        e, n = TO_ALBERS.transform(lon, lat)
        return a * np.asarray(e) + c, -a * np.asarray(n) + d

    def path(points, close=False):
        xy = [canvas(lon, lat) for lon, lat in points]
        return "M" + "L".join(f"{x:.3f},{y:.3f}" for x, y in xy) + ("Z" if close else "")

    # the regional SVG paths, back to lon/lat
    vb = yangguan["regional"]["viewBox"]
    width, height = vb[2], vb[3]
    to_lonlat = lambda x, y: (REGION["west"] + x / width * (REGION["east"] - REGION["west"]),
                              REGION["north"] - y / height * (REGION["north"] - REGION["south"]))

    def reproject(d_path):
        nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d_path)]
        return path([to_lonlat(nums[i], nums[i + 1]) for i in range(0, len(nums), 2)])

    # affine for the relief image: image (x, y) -> canvas, fitted on a 9 x 9 grid
    gx, gy = np.meshgrid(np.linspace(0, width, 9), np.linspace(0, height, 9))
    lon, lat = to_lonlat(gx.ravel(), gy.ravel())
    cx, cy = canvas(lon, lat)
    M = np.column_stack([gx.ravel(), gy.ravel(), np.ones(gx.size)])
    (ma, mc, me), *_ = np.linalg.lstsq(M, cx, rcond=None)
    (mb, md, mf), *_ = np.linalg.lstsq(M, cy, rcond=None)
    fit = np.hypot(M @ [ma, mc, me] - cx, M @ [mb, md, mf] - cy).max()
    image_px = fit / np.hypot(ma, mb)  # residual in image pixels
    print(f"relief image affine: max residual {fit:.5f} canvas units = {image_px:.2f} image px, "
          f"rotation {np.degrees(np.arctan2(mb, ma)):.2f}°")

    # Gansu's label point on 道士塔's map, back to lon/lat, so app.js can place it with the camera
    centre = taoist["china"]["centers"]["gansu"]
    from_albers = Transformer.from_crs(CRS.from_proj4(PROJ4), "EPSG:4326", always_xy=True)
    glon, glat = from_albers.transform((centre["x"] - c) / a, -(centre["y"] - d) / a)
    gansu_label = [round(glon, 4), round(glat, 4)]
    data = {
        "projection": {"proj4": PROJ4, "ellipsoid": "krass", "lon0": 110, "lat0": 0, "lat1": 25, "lat2": 47,
                       "a": a, "c": c, "d": d},
        "china": {
            "outlinePath": taoist["china"]["outlinePath"],
            "provincePath": taoist["china"]["provincePath"],
            "gansu": taoist["china"]["highlights"]["gansu"],
            "gansuLabel": gansu_label,
        },
        "regional": {
            "image": yangguan["regional"]["image"],
            "imageSize": [width, height],
            "matrix": [round(v, 9) for v in (ma, mb, mc, md, me, mf)],
            "roads": [reproject(p) for p in yangguan["regional"]["roads"]],
            "wall": [reproject(p) for p in yangguan["regional"]["wall"]],
        },
        "source": {
            "china": "Ministry of Natural Resources standard-map service, via site/chapters/taoist-tower/geography-data.js",
            "projection": "Albers equal-area conic, CM 110°E, SP 25°N / 47°N, Krassovsky (the standard map's own)",
        },
    }
    OUT.write_text("/* 阳关雪 parts one and two: one flat map (tools/build_yangguan_flat_map.py). */\n"
                   "window.YANGGUAN_FLAT_MAP = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
                   encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
    # reference points for checking flat-map.js's own projection
    for name, (lo, la) in {"pass": (94.05904, 39.92725), "hanshan": (120.564806, 31.312389)}.items():
        x, y = canvas(lo, la)
        print(f"  {name}: {float(x):.4f}, {float(y):.4f}")


if __name__ == "__main__":
    main()
