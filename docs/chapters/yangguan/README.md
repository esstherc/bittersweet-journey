# Snow on the Southern Pass

Chapter 08 uses five editorial interaction beats, not original numbered sections. The builder validates each opening sentence across languages; an English paragraph merger shifts later indices.

| Beat | Chinese / English paragraph indices | Scene |
|---|---|---|
| I: Poems and distant places | 1-6 / 1-5 | Flat China map: Yangguan and three poetic sites |
| II: Alone in the snow | 7-12 / 6-11 | Same projection zooms to Dunhuang/Yangguan; snow stops with the text |
| III: Mounds on the wasteland | 13-17 / 12-16 | Low 3D camera, reading footprints and literary mounds |
| IV: The ruins of Yangguan | 18-22 / 17-21 | Beacon, modern oasis, Han wall and Altyn range |
| V: West of Yangguan | 23-31 / 22-30 | Westward view, Wang Wei verses and returning snow |

Sections I-II use flat-map.js with the Taoist standard-map ellipsoidal Albers geometry: 110 E meridian, 25/47 N parallels, Krasovsky ellipsoid. Regional relief is fitted by an affine transform, approximately 2 px error across 1,000 px. Sections III-V retain the detailed local DEM. Earlier wide-3D and separate regional implementations are superseded.

Footprints and 70 deterministically placed mound symbols are literary interpretations, not surveyed tracks/burial sites. Snow follows narrative, not meteorology. These limits belong in notes rather than map clutter. Wang Wei's English verses follow the supplied translation.

The curtain has one subtitle; header/footer, notes, completion and square ruined-beacon seal match the site. Exact distance labels, scales and redundant location/counter rows are omitted. Labels keep paper halos and drop notes before names when crowded. Atlas points stay geographically anchored; blood-red leading lines separate crowded labels.

Mobile requires landscape with map/text side by side. Parameters: ?lang=zh|en, ?open=1&section=N, ?notes=1. The no-WebGL fallback retains the regional view. See [sources](GEODATA.md).

## Maintenance commands

Prepare inputs/dependencies described by each tool. Commands for superseded source-conversion stages remain as historical references.

```sh
python3 tools/build_yangguan_chapter.py content/bilingual-corpus.json site/chapters/yangguan/chapter-data.js
python3 tools/fetch_yangguan_wide_dem.py work/yangguan/glo90-wide-2arcmin.tif
python3 tools/build_yangguan_geodata.py work/yangguan work/yangguan/yangguan-osm.json site/chapters/yangguan
python3 tools/version_chapter_assets.py
node --check site/chapters/yangguan/app.js site/chapters/yangguan/terrain-3d.js
```
