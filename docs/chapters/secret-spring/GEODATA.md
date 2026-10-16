# Secret Spring geographic provenance

## Current terrain

| Mesh | Core extent east/north | Core grid | Actual elevation | Exaggeration |
|---|---|---|---|---|
| Mingsha, I/III/IV | 94.62-94.72 / 40.05-40.13 degrees | 180 by 150, about 48 by 59 m | 1,132-1,579 m | 2.2 |
| Dunhuang-Yulin, II | 94.35-96.15 / 39.55-40.55 degrees | 280 by 210, about 550 by 530 m | 1,030-4,413 m | 2.6 |

The regional extension covers 92-99 E, 37-43 N with 400 by 330 vertices. Original heights remain exact; outer sampling gets coarser. Longitude/latitude arrays describe the nonuniform grid. Model bounds, baseline and core colors preserve camera/label placement. Regional edge fading is disabled.

Run build_secret_spring_3d.py with its required Copernicus tiles, followed by extend_secret_spring_dem.py. Extension needs numpy/GDAL and public DEM access initially; resampled tiles are cached in system temp. Readers use packaged terrain-data.js. Earlier UTM 46N processing and the 96 by 100 browser grid are source history, superseded by the current meshes.

## Sources

Local relief: Copernicus GLO-30 N40E094, retrieved 2026-07-24. Regional context: GLO-90. OSM/Overpass supplies Crescent Spring water way 1308452182, Mingsha scenic extent way 689578966, Dang River ways and Mingsha node 9204864657. Snapshot water shapes are not permanent surveyed shorelines.

| Anchor | Reference |
|---|---|
| Dunhuang | Wikidata P625 Q319114 |
| Mogao | Wikidata P625 Q43286 |
| Yulin | Wikidata P625 Q751622 |
| Mingsha | OSM node 9204864657; 40.0837 N, 94.6749 E |
| Crescent Spring | Center of OSM way 1308452182; 40.0874 N, 94.6695 E |

Current great-circle checks: Dunhuang-Crescent Spring 6.0 km, Crescent Spring-Mogao 12.7 km, Mogao-Yulin 96.4 km. Earlier illustrative references gave 6.6/12.3/95.9 km. These are provenance checks rather than road mileage or visible map annotations. Original OSM canvas geometry is converted to WGS 84 with the same UTM 46N transform.

The essay supplies no verifiable climbing coordinates or complete route. Footprints illustrate reading progress within real terrain. This literary map does not replace surveying, navigation or visitor-safety information.
