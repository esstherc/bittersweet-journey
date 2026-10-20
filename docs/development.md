# Development notes

Technical information moved out of the reader-facing README.

## Run locally

The site is static: no package installation or production build is required. From the repository root, run `python -m http.server 8000` and visit `http://localhost:8000/`. The root index redirects to `site/index.html`. A local server is recommended for browser navigation transitions.

## Experience behavior

- With no reading trace, atlas entry opens the *My Hometown* introduction. Started and completed chapters count as traces; language, audio, camera, and an old intro-viewed flag do not. Reset returns to the introduction.
- The atlas supports dragging and pinch or scroll zoom. Chapter points retain their geographic coordinates. Lantern exploration reveals a darkened landscape.
- Chapter paintings are prepared before the book animation. Reading entry and atlas returns use fades.
- Chapter maps respond to reading sections or paragraphs. Source notes retain the geographic evidence.
- Finishing a chapter illuminates its vicinity and collects a seal. Nine completed chapters illuminate the atlas and unlock the ending.
- Phones and small touch tablets require landscape orientation. Desktop windows are not orientation-locked.

## Chapters

| Book number | Chapter | Folder | Atlas ID |
|---|---|---|---|
| 03 | My Hometown | my-hometown | my-hometown |
| 04 | Dujiangyan Irrigation System | dujiangyan | dujiangyan |
| 05 | The Taoist Priest's Tower | taoist-tower | taoist-tower |
| 06 | Mogao Caves | mogao-caves | mogao-caves |
| 07 | A Secret Spring in the Sand | secret-spring | secret-spring |
| 08 | Snow on the Southern Pass | yangguan | yangguan |
| 09 | Kashgar in the Western Regions | kashgar | kashgar |
| 10 | The Villa from Behind | mountain-resort | chengde |
| 11 | Fish Tail Lodge | fish-tail-lodge | fish-tail-lodge |

Book numbers differ from the nine-seal total. Credits resolve paintings from each chapter URL, including chengde/mountain-resort.

## Repository

| Path | Purpose |
|---|---|
| `source/` | Supplied EPUB originals; read only |
| `content/` | Parsed corpus and alignment |
| `site/` | Static website and packaged map assets |
| `site/chapters/_shared/` | Shared reader shell and template |
| `tools/` | Corpus and geodata builders and checks |
| `docs/` | Design, geographic provenance, and chapter guides |
| `work/` | Source downloads and working caches |

The Chinese edition contains 26 essays and the English selection 20. Twenty essays and 109 sections are aligned; paragraph correspondence requires chapter-specific handling because translations merge and split passages.

## GitHub Pages

Publish the repository root from the intended branch; its index redirects into `site/`. Preserve both existing `.nojekyll` files, including the one in `site/` when packaging that folder alone. Shared resources use an underscore-prefixed directory. Keep relative URLs for repository subpaths.

Run `node tools/check_site_paths.cjs` before deployment and refresh resource hashes after changes. Local edits do not publish automatically; use the project's normal commit and push workflow.

## Validation and maintenance

Set `PLAYWRIGHT_MODULE` to an installed Playwright package if needed. Relevant checks under `tools/` include `test_atlas_intro.cjs`, `test_atlas_intro_browser.cjs`, `test_page_transition.cjs`, `test_book_turn.cjs`, `test_atlas_credits.cjs`, `test_mobile_landscape.cjs`, and `test_mogao_dem.cjs`.

DEM builders require Python scientific and geospatial dependencies. Packaged terrain needs no DEM download while reading. Run the relevant extension tool after rebuilding a core DEM: Fish Tail Lodge, Secret Spring, and Mogao retain original core elevations while extending real surrounding terrain.

Start with [mobile layout](mobile-landscape.md), [map guidance](map-guidance.md), [reader layout](chapter-layout-guideline.md), [book transitions](book-frontispiece.md), [credits](atlas-credits.md), and the chapter README/GEODATA pairs.

Attribution: original author Yu Qiuyu; English translation by the CN Times Books team; story map by Yanbing Chen and Eugenie Huang. Sources include Natural Earth, OpenStreetMap, Copernicus DEM, WorldClim, Wikidata, and the referenced standard-map dataset. The atlas interprets literature rather than providing navigation or survey guidance.

## Existing maintenance commands

Prepare the inputs and dependencies described by each tool before running.

```bash
python3 tools/analyze_epubs.py
```

```bash
python3 tools/build_dujiangyan_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/dujiangyan/chapter-data.js
```

```bash
python3 tools/build_secret_spring_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/secret-spring/chapter-data.js
```

```bash
python3 tools/build_taoist_tower_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/taoist-tower/chapter-data.js
```

```bash
python3 tools/build_taoist_world_geography.py \
  countries.geojson \
  countries-china-pov.geojson \
  china-standard-outline.geojson \
  china-standard-provinces.geojson \
  site/chapters/taoist-tower/geography-data.js
```
