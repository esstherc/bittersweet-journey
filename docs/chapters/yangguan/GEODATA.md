# Yangguan geographic provenance

Snapshot: 2026-09-27. Tools: fetch_yangguan_wide_dem.py, build_yangguan_geodata.py and build_yangguan_flat_map.py. WGS 84 anchors are projected consistently with their map.

## Anchors

| Place | Record | Coordinate | Great-circle check from Yangguan |
|---|---|---|---|
| Yangguan beacon | Q909541 | 39.92725 N, 94.05904 E | Origin |
| Dunhuang | Existing regional reference | 40.142 N, 94.662 E | 56.6 km |
| White Emperor City | Q803709 | 31.0435 N, 109.5705 E | 1,713 km; bearing 120.4 degrees |
| Yellow Crane Tower | Q462372 | 30.5469 N, 114.2969 E | 2,106 km; bearing 113.4 degrees |
| Cold Mountain Temple | Q1146619 | 31.3124 N, 120.5648 E | 2,568 km; bearing 103.6 degrees |

The beacon DEM point is a small high point around 1,306 m, consistent with the essay's distant ruined mound. It is not a reconstruction of ancient pass boundaries. Distances remain provenance checks, not visible map labels.

## DEM

Local GLO-90: N39E093, N39E094, N40E093, N40E094. SHA-256 prefixes remain in geography-data.js. Attribution: DLR e.V. 2010-2014 and Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the EU/ESA.

Detailed extent: 93.72-94.40 E, 39.36-40.04 N, approximately 58 by 75 km. Native mosaics are cropped/averaged to 180 by 230, about 325 by 328 m; actual elevations 1,091-3,936 m. Display exaggeration is 8, with heights above 1,600 m compressed by 0.3. The Altyn label uses the highest interior reference cell, about 2,901 m, not a named peak.

Regional relief covers 93.85-94.85 E, 39.70-40.30 N and joins the Taoist standard-map geometry. Current projection: ellipsoidal Albers, 110 E meridian, 25/47 N parallels, Krasovsky ellipsoid. JS/pyproj sample coordinates agreed to four decimals. The relief fitting rotates the source about nine degrees.

Legacy wide DEM: 92.5-122.5 E, 28.5-42 N; 340 by 187, about 8 km cells, 0-5,540 m, exaggeration 22. COG overviews are averaged to 1/30 degree; ten of 434 tiles are absent ocean, filled zero. This source mesh remains historical data; current sections I-II use the flat map.

## OSM

ODbL 1.0, OpenStreetMap contributors. Four Overpass queries have timestamps in source.osmQueries. Named/historic features cover 39.7-40.1 N, 93.8-94.4 E; roads 39.80-40.20 N, 93.95-94.75 E; oasis 39.85-39.98 N, 93.98-94.15 E.

The snapshot includes 27 Han-wall segments, modern G215/S303/S314 roads, the modern forestry area, 166 green-land polygons, 36 water features and seven waterways. Modern roads are not ancient routes; the oasis is not a reconstructed Han/Tang agricultural extent. Natural Earth rivers supply regional orientation.

## Literary elements

A smooth approach from the Dunhuang direction, alternating footprints and seeded mounds illustrate the prose. The essay provides no verifiable track or named burial field. Snow is literary atmosphere. Weicheng is outside this itinerary and not plotted. This map does not replace surveying, navigation, conservation or visitor-safety guidance.
