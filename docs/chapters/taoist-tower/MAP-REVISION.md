# Map revision — 2026-10-07

- All five reading sections omit the duplicate header progress and place line. The lower reading rail remains.
- Projection/source annotations and line explanations live in the notes drawer, not on the maps. Wudang and its context link are removed.
- Map I enlarges the Hubei–Gansu story locations. The close-up omits the Taiwan and South China Sea inset geometry and labels from its rendered paths.
- Maps II–V keep Taiwan in the neutral basemap but remove its red narrative highlight and outline. This is a story-layer selection, not a modification to the underlying geographic dataset.
- Map II includes Germany alongside Britain, France and Russia. Ochre contextual routes are removed.
- Map III adds Hungary, Britain/British Museum and India. The country markers use Natural Earth's label anchors or the existing London/New Delhi regional anchors; the museum label is a London-scale reference, not a surveyed building coordinate.
- Map IV retains the British Museum direction named in the essay; Paris and St Petersburg collection extensions are removed. The frame and arc now fit London–Dunhuang.
- Map V enlarges the two locatable grave references. Jiang's unknown burial place is a separate paper-colored annotation, never a mapped coordinate.

## One map, one projection

The five scenes are now one map in one projection — the standard map's own Albers equal-area conic (CM 110°E, SP 25°N / 47°N, Krassovsky) — and each section moves one camera (`.atlas-camera`) to its region, with an eased flight between sections (zoom on a log scale; instant under reduced motion). The earlier equirectangular world and Eurasia layers are re-projected by `tools/build_taoist_one_projection.py` into `geography-data.js` → `atlas`; the China standard-map geometry is unchanged. Labels and symbols are pinned to map points and counter-scaled, so they keep a consistent size. The crate record and Jiang's unknown-grave note sit in the panel's lower corners rather than on the map. The generator now includes Germany (`DEU`) and Hungary (`HUN`), using Natural Earth 1:110m Admin 0 Countries and its `LABEL_X`/`LABEL_Y` fields. Provider data: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson (retrieved 2026-10-07).

`tools/test_taoist_maps.cjs` checks the five scenes at desktop and mobile sizes, bilingual reader metadata removal, required added/removed country nodes, and retained projection notes.
