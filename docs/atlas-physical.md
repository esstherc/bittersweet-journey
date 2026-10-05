# Physical reading atlas

The homepage is now a north-up, pannable physical atlas. Coastlines, rivers, lakes and landform regions replace the empty backdrop. Administrative boundaries are omitted. Existing story locations, completion seals and chapter navigation remain the foreground.

## Geography and drawing

- [Natural Earth physical vectors](https://www.naturalearthdata.com/downloads/10m-physical-vectors/): 1:50m land, 1:10m rivers, lakes and physical regions. These datasets are [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Downloads use the project's `natural-earth-vector` GeoJSON distribution; retrieval date is stored in `ATLAS_PHYSICAL.source`.
- Land is a physical land polygon, not a union of administrative outlines. The build clips to 45–155°E and 5–65°N, leaving a buffer around the navigable story region.
- Mountain hachures follow slope gradients in the repository's existing `FISHTAIL_TERRAIN.wide` Copernicus DEM GLO-90 derivative. Its 380 × 160 grid covers 8–125°E, 10–52°N at approximately 29 km per cell. Contours are extracted at 1,000 m intervals with marching squares. These marks describe regional terrain, not individual summits; no terrain is synthesized outside coverage.
- [Existing DEM provenance and limitations](chapters/fish-tail-lodge/GEODATA.md) still apply. Copernicus DEM © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018; distributed by the European Union/ESA.
- Geographic regions are real Natural Earth polygons rendered as a light wash. Labels use an interior horizontal cross-section of the source polygon, with small vertical offsets for collision avoidance. Region polygons are generalized extents, not precise mountain boundaries.
- Projection: spherical Albers, standard parallels 25°/47°, central meridian 105°, affine registration to six existing homepage anchors. Maximum registration residual: **0.125 map units**. River paths already on the homepage remain intact; newly projected layers align with those paths.
- Chapter markers use fixed WGS84 coordinates from the existing chapter geodata builders, projected with the same Albers transform as the terrain. Zoom and pan never displace a marker relative to the map. Nearby Dunhuang chapters remain geographically clustered; their clickable labels fan out with fine leader lines. Coordinates are regional reading anchors, not site-survey precision.

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
- `site/scripts/atlas.js`: existing chapter UI and label layout, plus camera integration and geographically anchored label leaders.
- `site/styles/atlas-physical.css`, `site/assets/atlas-paper.svg`: hand-drawn atlas styling and fine paper grain.
- `tools/test_atlas_camera.cjs`: Playwright browser regression and screenshots written to the OS temporary directory. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not available by normal Node resolution.

Build: `node tools/build_atlas_geography.cjs`.

Browser checks: `node tools/test_atlas_camera.cjs`.

This change follows the user's September 28 request for natural-landscape washes and hand-drawn relief. For the homepage it supersedes the older prohibition on region washes and the phone's horizontal-scroll-only behavior in `map-guidance.md`; chapter maps are unaffected.

## Homepage UI consistency

The only view-return control is All / 全图. Map notes open in a closable drawer from the footer button beside the text citation, matching chapter pages. Gesture and reading instructions share the existing CTA callout. Every unread chapter uses one core, one glow and one animated pulse; chapter 09 now pulses, while the extra shapes on 05 and 07 are removed. Completed chapters retain still dots and seals.

Chapter previews use rectangular thought bubbles with 16 px corners in the original warm paper and muted vermilion palette. Placement candidates start 76 px away from the point so the three tail circles have visible gaps. Circles fade in from the story point toward the card: 90 ms per circle, starting 45 ms apart (180 ms total). The card and its button remain immediately available, without placement transitions. Reduced motion shows every circle immediately; the mouse-leave grace period still permits moving into the button.

On a completed chapter's `revealed` return, its seal lifts from the corresponding map point and travels to the masthead collector in 950 ms, followed by a brief arrival highlight. All eight completion paths use this shared animation, including Kashgar's automatic return. It waits for the page curtain and camera, decodes the seal first, and fits the overview if the source point is outside the remembered viewport. Refreshing does not repeat the ceremony. Reduced motion skips the flight while keeping collection state and an accessible announcement. Resizing or leaving the page cancels and cleans up the moving image. The compact collector remains visible on phones.

## Lantern exploration

Hover/touch light removes 68% of the local coffee veil; completed chapter centers remove it fully, keeping temporary exploration distinct from saved progress. On the first completed return, the new circle starts dark and expands from its chapter point over 1100 ms. Only after that reveal does the map seal press into place over 460 ms, followed by the collection flight. Existing completed circles stay lit; reload does not replay the sequence. Reduced motion immediately applies the final light and collection state. The Kashgar terrain watermark and its lazy loader have been removed.

`atlas-journey.js` adds a 75%-opaque coffee-brown canvas veil above the geographic SVG and a decorative SVG horse carrying a Chinese poet with a straw hat, gray-blue robe and book bag. The paper map remains faintly visible under the veil, with a feathered cursor/touch light (170 px radius on desktop, 125 px on phones), plus permanent chapter circles. The header, fixed title, CTA and controls use a brown palette with warm readable text. Keyboard focus supplies a light at the focused chapter, and a map focus supplies one at the viewport center.

Permanent light reads the existing `bittersweet-journey:<chapter>:complete` keys, including the `chengde` / `mountain-resort` alias. Its 76 map-unit radius follows the chapter marker through camera changes; it is a symbolic exploration buffer, not a measured historical travel area. Visiting alone does not unlock it. Reload, existing saves and storage events preserve it; resetting reading progress removes it. Fog is visual only and never captures map, touch or keyboard input.

The rider wanders slowly on the map when idle and follows recent pointer input at a gentle pace. Activating a chapter hides the preview, runs the rider to its marker in 550–1600 ms, then uses the existing page transition. First touch still previews; second touch or its action enters. Repeated activation during the run is ignored. Reduced motion skips wandering and the arrival delay. Camera transforms apply to world positions while the rider keeps a constant on-screen size. Drawing is suspended in hidden pages; page leave cancels an unfinished trip. If the enhancement cannot load, a timed fallback restores the ordinary readable map.

Browser checks: `node tools/test_atlas_journey.cjs` covers darkness pixels, pointer/touch/keyboard light, movement, persisted buffers, zoom alignment, reset and arrival-before-navigation.

`atlas-ending.js` waits for all eight available readings and the final seal flight before illuminating the whole map and showing an accessible congratulations dialog with eight seals. A persisted chapter-set signature prevents repeat ceremonies and retains illumination. Resetting progress restores exploration. Unpublished placeholders do not count toward completion.

## Book transitions

Native View Transitions shrink the actual outgoing page into the right side of an open book, turn the page, then expand the incoming chapter to fill the viewport. The 1800 ms sequence includes warm paper edges, a cloth-colored cover, spine shading and a cast shadow. Entry and exit are opaque zooms without separate fades or lighting changes; the masthead scales with the page. The left page is blank warm paper. Mobile uses 1450 ms; reduced motion skips the turn. The book is enlarged 1.5 times and uses one language-independent paper SVG. Only atlas-to-chapter navigation turns the book; entering the reading, returning to the atlas and history traversal use a short 280 ms fade. The reusable book artwork lives in `site/assets/transition-book.svg`. Perspective belongs on the animated leaf, and its backface must remain visible to avoid blank cross-document snapshots in Chromium. File previews and browsers without cross-document transitions use same-document snapshots with a preloaded destination iframe; browsers without snapshot support use an opacity fade. Cached-page restoration preserves the pending entry marker. This is a planar 3D leaf, not a deforming corner curl. `tools/test_book_turn.cjs` checks entry-only animation, fades on reading and return, both language settings, enlarged scale, mobile timing and reduced motion, and captures intermediate frames for inspection.
