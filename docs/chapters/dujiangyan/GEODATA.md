# Dujiangyan geographic provenance

Packaged assets support reading without map-tile requests.

| Layer | Source | Processing |
|---|---|---|
| National rivers | Natural Earth 1:10m Rivers and Lake Centerlines, WGS 84 | China-focused Albers equal-area projection |
| Local waterways/places | OpenStreetMap contributors through Overpass, WGS 84 | WGS 84 / UTM zone 48N; clipping and Douglas-Peucker simplification |
| Engineering relationships | UNESCO heritage documentation | Cross-check of diversion, weir and channel locations |
| Terrain | Copernicus DEM GLO-90 | Multidirectional hillshade and 200 m contours |

Terrain and waterways share the same UTM 48N extent. Western mountains retain contrast while the plain is quieter. The enlarged engineering inset preserves geographic relationships. Administrative borders and unrelated roads are omitted. Ruled texture belongs to the reading panel. This map does not replace an engineering, administrative or navigation map.
