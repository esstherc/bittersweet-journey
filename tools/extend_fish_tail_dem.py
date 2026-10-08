"""Extend the two local DEMs with real Copernicus GLO-90 context.

Run after build_fish_tail_lodge_geodata.py. Requires numpy and GDAL.
Original central samples stay bit-for-bit intact; sparse outer rows/columns
keep each WebGL mesh below 65,536 vertices. Download cache lives in OS temp.
"""
import base64
import json
import math
from pathlib import Path
import tempfile
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from osgeo import gdal

gdal.UseExceptions()
gdal.SetConfigOption('GDAL_DISABLE_READDIR_ON_OPEN', 'EMPTY_DIR')
gdal.SetConfigOption('CPL_VSIL_CURL_ALLOWED_EXTENSIONS', '.tif')
gdal.SetConfigOption('GDAL_HTTP_TIMEOUT', '60')
gdal.SetConfigOption('GDAL_HTTP_MAX_RETRY', '2')
ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'site/chapters/fish-tail-lodge/terrain-data.js'
GLOBAL = 'FISHTAIL_TERRAIN'
MAX_VERTICES = 65536
CACHE = Path(tempfile.gettempdir()) / 'fishtail-dem-context'
CACHE.mkdir(exist_ok=True)
SPECS = {
    'pokhara': ({'west': 81.0, 'east': 87.0, 'south': 26.0, 'north': 31.0}, 40, 14),
    'border': ({'west': 82.0, 'east': 89.0, 'south': 25.0, 'north': 31.0}, 20, 30),
}


def tile(coords):
    lon, lat = coords
    cache = CACHE / f'{lon}-{lat}.npy'
    if cache.exists():
        return coords, np.load(cache)
    name = f'Copernicus_DSM_COG_30_N{lat:02d}_00_E{lon:03d}_00_DEM'
    url = f'https://copernicus-dem-90m.s3.amazonaws.com/{name}/{name}.tif'
    with gdal.Open('/vsicurl/' + url) as src:
        values = src.ReadAsArray(buf_xsize=512, buf_ysize=512,
                                 resample_alg=gdal.GRIORA_Bilinear).astype(np.float32)
    if not np.isfinite(values).all() or values.min() < -1000:
        raise ValueError(f'Invalid DEM context: {name}')
    np.save(cache, values)
    print(f'Cached {name}', flush=True)
    return coords, values


def main():
    text = FILE.read_text(encoding='utf-8')
    data = json.loads(text.split('window.' + GLOBAL, 1)[1].split('=', 1)[1].strip().rstrip(';'))
    jobs = set()
    for b, _, _ in SPECS.values():
        jobs.update((x, y) for x in range(math.floor(b['west']), math.ceil(b['east']))
                    for y in range(math.floor(b['south']), math.ceil(b['north'])))
    with ThreadPoolExecutor(max_workers=4) as pool:
        tiles = dict(pool.map(tile, sorted(jobs)))
    for name, (bounds, pad_x, pad_y) in SPECS.items():
        src = data[name]
        if 'modelBounds' in src:
            core = src['coreGrid']
            previous = np.frombuffer(base64.b64decode(src['heights']), dtype='<u2').reshape(src['rows'], src['columns'])
            original = previous[core['rowOffset']:core['rowOffset']+core['rows'], core['columnOffset']:core['columnOffset']+core['columns']].astype(np.int32) + src['baseMetres']
            src = {**src, 'bounds': src['modelBounds'], 'columns': core['columns'], 'rows': core['rows'],
                   'baseMetres': src['modelBaseMetres'],
                   'heights': base64.b64encode((original-src['modelBaseMetres']).astype('<u2').tobytes()).decode('ascii')}
        b = src['bounds']
        # Concentrate context samples near the detailed core, relaxing toward the horizon.
        tx = np.linspace(0, 1, pad_x+1)[1:] ** 2
        ty = np.linspace(0, 1, pad_y+1)[1:] ** 2
        xs = np.concatenate([b['west']-(b['west']-bounds['west'])*tx[::-1],
                             np.linspace(b['west'], b['east'], src['columns']),
                             b['east']+(bounds['east']-b['east'])*tx])
        ys = np.concatenate([b['north']+(bounds['north']-b['north'])*ty[::-1],
                             np.linspace(b['north'], b['south'], src['rows']),
                             b['south']-(b['south']-bounds['south'])*ty])
        heights = np.empty((len(ys), len(xs)), dtype=np.float64)
        for r, lat in enumerate(ys):
            for c, lon in enumerate(xs):
                tx, ty = math.floor(min(lon, bounds['east']-1e-8)), math.floor(min(lat, bounds['north']-1e-8))
                raster = tiles[tx, ty]
                fx = np.clip((lon-tx)*512-.5, 0, 511)
                fy = np.clip((ty+1-lat)*512-.5, 0, 511)
                x0, y0 = int(fx), int(fy)
                x1, y1 = min(511,x0+1), min(511,y0+1)
                heights[r,c] = ((1-(fy-y0))*((1-(fx-x0))*raster[y0,x0]+(fx-x0)*raster[y0,x1])
                                 +(fy-y0)*((1-(fx-x0))*raster[y1,x0]+(fx-x0)*raster[y1,x1]))
        original = np.frombuffer(base64.b64decode(src['heights']), dtype='<u2').reshape(src['rows'], src['columns']) + src['baseMetres']
        heights[pad_y:pad_y+src['rows'], pad_x:pad_x+src['columns']] = original
        base = int(np.floor(heights.min()))
        encoded = np.rint(heights-base).astype('<u2')
        assert len(xs)*len(ys) <= MAX_VERTICES
        assert np.array_equal(encoded[pad_y:pad_y+src['rows'], pad_x:pad_x+src['columns']]+base, original)
        data[name] = {**src, 'bounds': bounds, 'modelBounds': b, 'modelBaseMetres': src['baseMetres'],
                      'coreRangeMetres': src.get('coreRangeMetres', [int(original.min()), int(original.max())]),
                      'columns': len(xs), 'rows': len(ys), 'longitudeSamples': xs.tolist(), 'latitudeSamples': ys.tolist(),
                      'baseMetres': base, 'heights': base64.b64encode(encoded.tobytes()).decode('ascii'),
                      'realRangeMetres': [int(np.rint(heights.min())), int(np.rint(heights.max()))],
                      'contextSource': 'Copernicus DEM GLO-90, 512x512 resampled COG context, retrieved 2026-10-08',
                      'coreGrid': {'columns':src['columns'], 'rows':src['rows'], 'columnOffset':pad_x, 'rowOffset':pad_y}}
        print(f'{name}: {len(xs)} x {len(ys)}, original samples preserved', flush=True)
    FILE.write_text('/* Offline Copernicus DEM; context extended with tools/extend_fish_tail_dem.py. */\nwindow.'+GLOBAL+' = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n', encoding='utf-8')


if __name__ == '__main__':
    main()
