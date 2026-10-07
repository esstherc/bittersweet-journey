# Map revision — 2026-10-07

- All five reading sections omit the duplicate header progress and place line. The lower reading rail remains.
- Projection/source annotations and line explanations live in the notes drawer, not on the maps. Wudang and its context link are removed.
- Map I enlarges the Hubei–Gansu story locations. The close-up omits the Taiwan and South China Sea inset geometry and labels from its rendered paths.
- Maps II–V keep Taiwan in the neutral basemap but remove its red narrative highlight and outline. This is a story-layer selection, not a modification to the underlying geographic dataset.
- Map II includes Germany alongside Britain, France and Russia. Ochre contextual routes are removed.
- Map III adds Hungary, Britain/British Museum and India. The country markers use Natural Earth's label anchors or the existing London/New Delhi regional anchors; the museum label is a London-scale reference, not a surveyed building coordinate.
- Map IV retains the British Museum direction named in the essay; Paris and St Petersburg collection extensions are removed. The frame and arc now fit London–Dunhuang.
- Map V enlarges the two locatable grave references. Jiang's unknown burial place is a separate paper-colored annotation, never a mapped coordinate.

Each scene has its own geographic frame; labels and symbols keep a consistent scale. The generator now includes Germany (`DEU`) and Hungary (`HUN`), using Natural Earth 1:110m Admin 0 Countries and its `LABEL_X`/`LABEL_Y` fields. Provider data: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson (retrieved 2026-10-07).

`tools/test_taoist_maps.cjs` checks the five scenes at desktop and mobile sizes, bilingual reader metadata removal, required added/removed country nodes, and retained projection notes.
