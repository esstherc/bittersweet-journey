# Kashgar geographic provenance

Pipeline: WGS 84, Shapely clipping/simplification, GeoJSON FeatureCollection, browser Web Mercator. data/geography.geojson is downloadable; geography-data.js embeds the same collection/place table for local loading. Verification checks equality. The 2026-09-18 snapshot contains 546 features, 25 located features/places and seven unresolved references. Features retain source/source_id/license; source-manifest.json retains original SHA-256 hashes.

## Natural Earth

Public-domain layers: ne_110m_land, ne_10m_rivers_lake_centerlines, ne_10m_lakes, ne_10m_geography_regions_polys and ne_10m_populated_places. Source: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson.

Context is clipped to 63-111 E, 28-49 N; land extends from 12 W to 119 E and 10-66 N for Rhine/Jordan comparisons. Selected literary features retain full geometry. Simplification tolerance is 0.005 degree with topology preserved. Tianshan, Kunlun, Pamir, Taklamakan and Tarim Basin polygons are generalized source geography, not precise landform boundaries. Representative points place labels only. Shule/Kashgar, Qiuci/Kuqa and Chang'an/Xi'an are contextual name associations rather than claims that modern city points reproduce ancient limits.

## OpenStreetMap

ODbL 1.0, OpenStreetMap contributors. The Overpass snapshot covers 75.94-76.05 E, 39.43-39.51 N: 293 roads/water features, including primary/secondary/tertiary/trunk roads, rivers, canals and water polygons. Original way links/vertices remain. Queries and responses are cached in work/kashgar/. Modern roads do not reconstruct 1881 streets or cavalry routes.

## Wikidata

P625 coordinates were obtained through wbgetentities with precision metadata retained. CC0 reference claims are not survey certification.

| Feature | Record | Meaning |
|---|---|---|
| Dandan Oilik | Q1159394 | Site reference point |
| Miran | Q1192991 | Site reference point |
| Gaochang | Q877381 | Site reference point |
| Jiaohe | Q1330939 | Site reference point |
| K2 | Q43512 | Summit |
| Muztagh Ata | Q630579 | Mountain in the English edition, not a substitute glacier |
| Lop Nur | Q319412 | Regional reference, not shoreline |
| Loulan | Q1057551 | Reference coordinate, not ancient-state boundary |

## Unresolved geography

Niya has conflicting site coordinates. Oytag/Muztagh Ata glacier boundaries remain unverified. Khunjerab's Chinese border-port reference is not silently equated with the English mountain pass. Yakeairike beacon and historical British/Russian consulate buildings lack adequate precise evidence. Text links remain available; unresolved selections do not move to guessed points.
