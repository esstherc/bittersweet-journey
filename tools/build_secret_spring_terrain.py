#!/usr/bin/env python3
"""Quantize an ESRI ASCII elevation grid for the offline WebGL terrain."""

from __future__ import annotations

import base64
import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_secret_spring_terrain.py INPUT_ASC OUTPUT_JS")

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    lines = source.read_text(encoding="utf-8").splitlines()
    header = {}
    for line in lines[:6]:
        key, value = line.split(maxsplit=1)
        header[key.lower()] = float(value)

    columns = int(header["ncols"])
    rows = int(header["nrows"])
    nodata = header["nodata_value"]
    values = [
        float(value)
        for line in lines[6:]
        for value in line.split()
    ]
    if len(values) != columns * rows:
        raise ValueError(f"expected {columns * rows} values, got {len(values)}")

    valid = [value for value in values if value != nodata]
    minimum = min(valid)
    maximum = max(valid)
    quantized = bytearray()
    mask = bytearray()
    for value in values:
        is_valid = value != nodata
        mask.append(255 if is_valid else 0)
        effective = value if is_valid else minimum
        normalized = (effective - minimum) / (maximum - minimum)
        quantized.append(round(normalized * 255))

    payload = {
        "columns": columns,
        "rows": rows,
        "cellSizeMetres": header["cellsize"],
        "minimumMetres": round(minimum, 3),
        "maximumMetres": round(maximum, 3),
        "heights": base64.b64encode(quantized).decode("ascii"),
        "mask": base64.b64encode(mask).decode("ascii"),
        "source": "Copernicus DEM GLO-30, resampled to 90 m for browser terrain",
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    destination.write_text(
        "/* Quantized offline terrain generated from Copernicus DEM GLO-30. */\n"
        f"window.SECRET_SPRING_TERRAIN = {encoded};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
