# Land, Made Visible

A bilingual literary atlas for Yu Qiuyu's *A Bittersweet Journey Through Culture*. Nine selected essays connect the supplied Chinese and English texts to landscapes, rivers, routes and cultural memory. Documentation is English; the website supports Simplified Chinese and English.

## Run locally

The site is static: no package installation or production build is required. Run `python -m http.server 8000` from the repository root, then visit `http://localhost:8000/`. The root index redirects to site/index.html. A local server is recommended for browser navigation transitions; local-file previews remain available where browser security permits them.

## Experience

- With no reading trace, atlas entry opens the My Hometown introduction. An old intro-viewed flag does not suppress it. Started/completed chapters count as traces; language, audio and camera preferences do not. Reset returns to the introduction.
- The physical atlas supports dragging and pinch/scroll zoom. Chapter points retain their geographic coordinates. A mounted Chinese poet accompanies lantern exploration through a brown-darkened landscape.
- Chapter paintings are prepared and decoded before the book animation. Reading entry and atlas returns use fades. Curtains have one subtitle line.
- Section/paragraph-driven maps omit precise distance labels and scale bars. Original prose and source notes retain their evidence. Ruled paper appears only behind reading content.
- Completion illuminates the vicinity and sends a square pictorial seal into My Seals. Nine completions illuminate the whole atlas and unlock the five-scene credits and footer replay. Individual chapters have no credits button.
- Phones and small touch tablets require landscape. Portrait shows a localized rotation gate; rotating restores the same page. Compact landscape places map and independently scrolling text side by side. Desktop windows are not orientation-locked.

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
| source/ | Supplied EPUB originals; read only |
| content/ | Parsed corpus and alignment |
| site/ | Static website and packaged map assets |
| site/chapters/_shared/ | Shared reader shell/template |
| tools/ | Corpus/geodata builders and checks |
| docs/ | Design, geographic provenance and chapter guides |
| work/ | Source downloads and working caches |

The Chinese edition contains 26 essays and the English selection 20. Twenty essays and 109 sections are aligned; paragraph correspondence requires chapter-specific handling because translations merge and split passages.

## GitHub Pages

Publish the repository root from the intended branch; its index redirects into site/. Preserve both existing .nojekyll files, including the one in site/ when packaging that folder alone. Shared resources use an underscore-prefixed directory. Keep relative URLs for repository subpaths. Do not publish docs/ as the application.

Run `node tools/check_site_paths.cjs` before deployment and refresh resource hashes after changes. Local edits do not publish automatically; use the project's normal commit/push workflow.

## Validation and maintenance

Set PLAYWRIGHT_MODULE to an installed Playwright package if needed. Relevant checks include test_atlas_intro.cjs, test_atlas_intro_browser.cjs, test_page_transition.cjs, test_book_turn.cjs, test_atlas_credits.cjs, test_mobile_landscape.cjs and test_mogao_dem.cjs under tools/.

DEM builders require Python scientific/geospatial dependencies. Packaged terrain needs no DEM download while reading. Run the relevant extension tool after rebuilding a core DEM: Fish Tail Lodge, Secret Spring and Mogao retain original core elevations while extending real surrounding terrain.

Start with [mobile layout](docs/mobile-landscape.md), [map guidance](docs/map-guidance.md), [reader layout](docs/chapter-layout-guideline.md), [book transitions](docs/book-frontispiece.md), [credits](docs/atlas-credits.md) and the chapter README/GEODATA pairs.

Attribution: original author Yu Qiuyu; English translation by the CN Times Books team; story map by Yanbing Chen and Eugenie Huang. Sources include Natural Earth, OpenStreetMap, Copernicus DEM, WorldClim, Wikidata and the referenced standard-map dataset. The atlas interprets literature rather than providing navigation or survey guidance.

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
