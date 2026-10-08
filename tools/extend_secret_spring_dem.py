"""Extend section two with GLO-90, preserving every original core sample.

Run after build_secret_spring_3d.py; requires numpy and GDAL.
"""
import extend_fish_tail_dem as dem

if __name__ == '__main__':
    dem.FILE = dem.ROOT / 'site/chapters/secret-spring/terrain-data.js'
    dem.GLOBAL = 'SECRET_SPRING_TERRAIN'
    dem.MAX_VERTICES = 200000
    dem.SPECS = {
        'regional': ({'west': 92.0, 'east': 99.0, 'south': 37.0, 'north': 43.0}, 60, 60),
    }
    dem.main()
