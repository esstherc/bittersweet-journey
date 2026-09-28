# Physical reading atlas

The homepage is now a north-up, pannable physical atlas. Coastlines, rivers, lakes and landform regions replace the empty backdrop. Administrative boundaries are omitted. Existing story locations, completion seals and chapter navigation remain the foreground.

## Geography and drawing

- [Natural Earth physical vectors](https://www.naturalearthdata.com/downloads/10m-physical-vectors/): 1:50m land, 1:10m rivers, lakes and physical regions. These datasets are [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Downloads use the project's `natural-earth-vector` GeoJSON distribution; retrieval date is stored in `ATLAS_PHYSICAL.source`.
- Land is a physical land polygon, not a union of administrative outlines. The build clips to 45–155°E and 5–65°N, leaving a buffer around the navigable story region.
- Mountain hachures follow slope gradients in the repository's existing `FISHTAIL_TERRAIN.wide` Copernicus DEM GLO-90 derivative. Its 380 × 160 grid covers 8–125°E, 10–52°N at approximately 29 km per cell. Contours are extracted at 1,000 m intervals with marching squares. These marks describe regional terrain, not individual summits; no terrain is synthesized outside coverage.
- [Existing DEM provenance and limitations](chapters/fish-tail-lodge/GEODATA.md) still apply. Copernicus DEM © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018; distributed by the European Union/ESA.
- Geographic regions are real Natural Earth polygons rendered as a light wash. Labels use an interior horizontal cross-section of the source polygon, with small vertical offsets for collision avoidance. Region polygons are generalized extents, not precise mountain boundaries.
- Projection: spherical Albers, standard parallels 25°/47°, central meridian 105°, affine registration to six existing homepage anchors. Maximum registration residual: **0.125 map units**. River paths already on the homepage remain intact; newly projected layers align with those paths.
- Chapter offsets around Dunhuang shrink with zoom and have leader lines to the existing geographic anchors. The nearby cave/tower anchors still represent Dunhuang at this regional scale; the map does not claim site-survey precision.

## Camera and information levels

The SVG `viewBox` is the shared camera, so land, water, names and chapter points stay in the same coordinate system. There is no external map SDK, runtime map service, API key or tile subscription.

- Desktop initial framing uses at least 700 map units of width, adjusted for viewport aspect ratio, instead of the former fixed 944 × 590 extent. At 1440 × 900 the chapter geography is visibly larger while all available chapter points remain in view.
- Phones start with a 440-unit wide view, allowing horizontal exploration without shrinking text. **All / 全图** fits every chapter into view.
- Zoom limits: 0.65–6×. Below 1.65×: major landforms and water. At 1.65×: regional rivers, lakes, contours and names. At 3.2×: remaining source watercourses and additional local reference names. This is a regional atlas, not street-level mapping.
- All projected geometry is shipped in one static file; zoom changes visibility rather than making network requests. Initial source data is about 2.1 MB uncompressed. Only one hierarchy of labels is shown at a time, with chapter labels taking precedence over physical labels.
- Screen-sized text, dots and seals; desktop chapter clues 22 px and phone clues 16 px, geography 14–16 px. Names avoid chapter text, title, controls and the open source note.
- Mouse drag, wheel zoom anchored at the pointer, touch pan/pinch, zoom controls, arrow keys, +/− and Home. Dragging a chapter point suppresses the click. The existing first-tap preview behavior remains.
- Camera state is stored in sessionStorage and restored on a chapter round trip or reload. Malformed/disabled storage falls back safely. Camera gestures are immediate, including with reduced motion enabled.
- The introductory heading and CTA are fixed below the masthead on desktop and mobile, including while exploring or after completion. The mobile map reserves the measured intro height; label placement avoids the fixed text.

## Files and reproduction

- `tools/build_atlas_geography.cjs`: download/cache and generate `site/data/atlas-physical.js`. Raw source files are cached under the OS temporary directory, not checked into the repository. Node's built-in modules are sufficient.
- `site/scripts/atlas-camera.js`: physical layers, camera, touch/pointer handling, level selection, physical-label placement and bilingual controls.
- `site/scripts/atlas.js`: existing chapter UI and label layout, plus camera integration and chapter offset leaders.
- `site/styles/atlas-physical.css`, `site/assets/atlas-paper.svg`: hand-drawn atlas styling and fine paper grain.
- `tools/test_atlas_camera.cjs`: Playwright browser regression and screenshots written to the OS temporary directory. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not available by normal Node resolution.

Build: `node tools/build_atlas_geography.cjs`.

Browser checks: `node tools/test_atlas_camera.cjs`.

This change follows the user's September 28 request for natural-landscape washes and hand-drawn relief. For the homepage it supersedes the older prohibition on region washes and the phone's horizontal-scroll-only behavior in `map-guidance.md`; chapter maps are unaffected.

## Homepage UI consistency

The only view-return control is All / 全图. Map notes open in a closable drawer from the footer button beside the text citation, matching chapter pages. Gesture and reading instructions share the existing CTA callout. Every unread chapter uses one core, one glow and one animated pulse; chapter 09 now pulses, while the extra shapes on 05 and 07 are removed. Completed chapters retain still dots and seals.

Chapter previews use rounded thought bubbles in the original warm paper and muted vermilion palette. The three tail circles fade in from the story point toward the card: 90 ms per circle, starting 45 ms apart (180 ms total). The card and its button remain immediately available, without placement transitions. Reduced motion shows every circle immediately; the mouse-leave grace period still permits moving into the button.

On a completed chapter's `revealed` return, its seal lifts from the corresponding map point and travels to the masthead collector in 950 ms, followed by a brief arrival highlight. All eight completion paths use this shared animation, including Kashgar's explicit return link. It waits for the page curtain and camera, decodes the seal first, and fits the overview if the source point is outside the remembered viewport. Refreshing does not repeat the ceremony. Reduced motion skips the flight while keeping collection state and an accessible announcement. Resizing or leaving the page cancels and cleans up the moving image. The compact collector remains visible on phones.
