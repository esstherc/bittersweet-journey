# Fish Tail Lodge geographic provenance

Generated geography-data.js and terrain-data.js primarily come from build_fish_tail_lodge_geodata.py. Wikidata P625 snapshot: 2026-09-27. Open geographic reference claims are not survey certification. Notes explain differences between the prose, published elevations and DEM samples.

## Nepal

| Place | Record | Coordinate |
|---|---|---|
| Fish Tail Lodge | Q111402808 | 28.20095 N, 83.96404 E |
| Phewa Lake | Q1192928 | 28.21417 N, 83.94722 E |
| Pokhara | Q6640 | 28.20972 N, 83.98528 E |
| Machhapuchhre | Q1051394 | 28.49500 N, 83.94917 E |
| Annapurna I | Q16466024 | 28.59580 N, 83.82000 E |
| Kathmandu | Q3037 | 27.71 N, 85.32 E |
| Lumbini | Q9213 | 27.48140 N, 83.27583 E |
| Friendship Bridge | Q7524764 | 27.97344 N, 85.96383 E |
| Kodari | Q6425224 | 27.97350 N, 85.96280 E |
| Dram | Q3270229 | 27.99102 N, 85.98120 E |

Phewa is a lake although the prose calls it a clear snowmelt river. Lumbini lies about 105 km from the lodge directly; the prose's six-hundred-kilometer round trip is road mileage. Bridge elevation is 1,900 m in prose, about 1,730 m at the DEM reference and 1,898 m nearby. Dram is 2,600 m in prose versus 2,226 m at its reference (nearby maximum 2,352 m). Published peaks: Machhapuchhre 6,993 m and Annapurna I 8,091 m; grid averaging lowers summits. Machhapuchhre's DEM point is 6,452 m, nearby maximum 6,632 m. Lodge reference: 800 m, nearby maximum 919 m. Original prose stays unchanged.

## Ancient civilization references

| Site | Record | Coordinate |
|---|---|---|
| Parthenon | Q10288 | 37.97153 N, 23.72660 E |
| Olympia | Q38888 | 37.63833 N, 21.63000 E |
| Mycenae | Q132564 | 37.73083 N, 22.75611 E |
| Knossos / Crete | Q173527 | 35.29796 N, 25.16316 E |
| Giza pyramids | Q12508 | 29.97611 N, 31.13278 E |
| Cairo | Q85 | 30.04444 N, 31.23583 E |
| Luxor Temple | Q319841 | 25.70000 N, 32.63917 E |
| Sinai | Q377485 | 28.53840 N, 33.97520 E |
| Jerusalem | Q1218 | 31.77668 N, 35.23416 E |
| Baghdad | Q1530 | 33.31528 N, 44.36611 E |
| Babylon | Q5684 | 32.54250 N, 44.42111 E |
| Persepolis / Persia | Q129072 | 29.93500 N, 52.89000 E |
| Mohenjo-daro | Q5725 | 27.32917 N, 68.13889 E |

Olympia's town reference is about 1 km from the sanctuary, below the original wide DEM resolution. Persia uses Persepolis as a declared representative reference. The essay does not enumerate the full travel itinerary; relationship lines are not reconstructed routes.

## Copernicus GLO-90

| Terrain | Original core east/north | Grid | Actual range | Display exaggeration |
|---|---|---|---|---|
| Pokhara | 83.72-84.14 / 28.10-28.66 degrees | 170 by 225 | 527-7,881 m | 1.25 |
| Border | 85.24-86.10 / 27.62-28.08 degrees | 250 by 150 | 558-5,938 m | 1.6 |
| Legacy wide 3D | 8-125 / 10-52 degrees | 380 by 160 | 0-6,054 m | 30 |
| Flat relief | 8-125 / 10-52 degrees | 1,170 by 420 | 0-6,381 m | Hillshade 6 |
| Nepal overlay | 79-90 / 24-32 degrees | 660 by 480 | 3-8,145 m | Hillshade 2.4 |

Real context extends Pokhara to 81-87 / 26-31 degrees (250 by 253) and border to 82-89 / 25-31 degrees (290 by 210). Original core heights remain exact; outer longitude/latitude arrays are nonuniform. Original model/elevation frames are retained. Local edge fading is disabled. The extension tool requires numpy/GDAL and a system-temp tile cache.

The wide fetcher reads 4,914 COG overview tiles; 657 missing ocean tiles are filled at zero. Heights encode little-endian uint16 metres above baseMetres in base64. The flat map uses spherical Albers; local 3D longitude is scaled by core latitude cosine.

## Water, barriers and roads

Natural Earth 1:50m supplies Nile, Tigris, Euphrates, Jordan, Indus, Ganges, Yellow and Yangtze rivers. Its 1:10m regions supply Himalayan/Kunlun/Tianshan/Altai ranges, Taklamakan/Gobi and seas, simplified at 0.25 degree. South China Sea labels use the portion north of 14 N. National borders are omitted.

OSM/Overpass snapshot 2026-09-27: 114 Pokhara water lines and 198 border water lines, including Bhote Koshi. A graph of trunk/primary roads snaps endpoints below 0.0005 degree; Dijkstra routing from Kathmandu to Friendship Bridge yields 401 vertices and about 112 km of today's Araniko Highway/NH34. Reading footprints follow this modern reference, not a surveyed historical motorcade track.

Cultural figures and textual allusions without geographic action are not plotted. Exact distances are provenance evidence, not current map labels. This atlas does not supply navigation, survey or border-entry guidance.
