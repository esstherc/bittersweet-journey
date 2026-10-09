"""Extend Mogao section two with real GLO-90 context; preserve its core DEM.

Run after build_mogao_geodata.py. Requires numpy and GDAL.
"""
import extend_fish_tail_dem as dem

if __name__ == '__main__':
    dem.FILE = dem.ROOT / 'site/chapters/mogao-caves/terrain-data.js'
    dem.GLOBAL = 'MOGAO_TERRAIN'
    dem.MAX_VERTICES = 200000
    dem.SPECS = {
        'local': ({'west': 93.0, 'east': 97.0, 'south': 38.0, 'north': 42.0}, 80, 80),
    }
    dem.main()
