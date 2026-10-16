# The Villa from Behind

Chapter 10 lives at site/chapters/mountain-resort/index.html. The atlas ID is chengde while folder/storage use mountain-resort. revealId adapts chapter returns; credits resolve the painting from the actual URL.

Five original sections cover the exterior historical response, northern encircling hills, temples/1793 embassy, the 1861 closure, and Wang Guowei's 1927 memory. The Qing/1703/1793/1861/1927 timeline follows the same reading state.

Sections I/V use the flat standard-map canvas: Beijing-Gubeikou-Chengde-Mulan, then Chengde/Summer Palace. Sections II-IV use GLO-30 terrain at 117.80-118.08 E, 40.91-41.10 N, approximately 24 by 21 km and threefold vertical exaggeration. The real hills express the chair-back metaphor; the earlier decorative chair silhouette is superseded.

OSM supplies palace walls, lakes, Wulie River, temples and Lizheng Gate (relation 8008565). Wanshu Garden uses approximate yurt node 8659379119 because it lacks an OSM outline. OSM walls enclose about 540 ha versus UNESCO's 611.2 ha heritage area: different definitions, both explained in notes.

The Great Wall uses 1,451 OSM ways merged into 538 lines over 114.8-119.8 E, 39.4-42.2 N. Battlements appear on the northern side every 7 px. Flat relief extends to 114.8-119.8 E, 39.0-42.8 N, sampled at 1/240 degree and rendered 2160 px wide. Province context uses quiet solid lines, not background dashes.

Current UI omits precise distance labels, scales and redundant location/counter rows. Curtains have one subtitle. Mobile requires landscape with parallel map/text and independently scrolling prose. See [sources](GEODATA.md).

## Maintenance commands

Prepare inputs/dependencies described by the tools. Earlier conversion stages are retained for reference.

```bash
python3 tools/build_mountain_resort_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/mountain-resort/chapter-data.js
```

```bash
python tools/build_mountain_resort_geodata.py WORK
  python tools/build_mountain_resort_flat_map.py WORK
```
