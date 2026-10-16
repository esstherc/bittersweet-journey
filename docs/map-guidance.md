# Map guidance

Updated 2026-10-15. These rules govern geographic content; chapter-layout-guideline.md governs the reading shell. Recent explicit requirements below supersede historical migration proposals.

## Current experience

The atlas uses a hand-drawn ancient-map treatment grounded in physical geography, with draggable/pinch-zoomable geographic coordinates. Mountain ranges, lakes, rivers and coastlines take priority over administration. A brown exploration veil, cursor light and a mounted Chinese poet support discovery. Titles and the integrated callout remain readable. Completed chapters illuminate a buffer, stamp the map and send a square pictorial seal to collection. All nine completions illuminate the whole map and unlock credits.

Phones require landscape. Portrait touch interaction is blocked by a localized rotation dialog; compact landscape places map and scrolling prose side by side. Chapter curtains have one subtitle. Precise distance labels and scale bars are hidden on chapter maps. Ruled paper stays behind text rather than maps. See mobile-landscape.md and atlas-physical.md.

## 1. Geographic evidence (D)

- D-1: Plot the essay's named places/actions. Do not import complete itineraries or collection histories from other books/chapters. Link related context through notes.
- D-2: Use sourced coordinates, including Wikidata QID/P625 or OSM node/way ID and retrieval date.
- D-3: A named region receives a region label, not a fabricated event point. Explicitly identify representative references such as Persepolis for Persia.
- D-4: When prose and geography differ, retain the prose, map the geography and explain the discrepancy in notes: Phewa Lake versus river wording, published versus DEM elevation, fifteen kilometers versus fifteen miles.
- D-5: Different editions can require different paragraph-to-stage maps. Explain additions/omissions in notes.
- D-6: Prefer physical geography; omit administrative borders unless a documented standard-map context is required by the chapter.
- D-7: Put interpretive/not-surveyed qualifications in source notes. A non-geographic diagram such as the cave facade must still be identified as schematic.
- D-8: Distances in evidence notes are great-circle measurements, not road mileage. Current chapter maps do not display exact distance numbers or scales. Original distance statements in literary text remain untouched.
- D-9: Distinguish published elevation and DEM sampling; do not rewrite the prose to match a grid.
- D-10: Timelines use only supported dates/period names, never invented dates for undated sections.

## 2. Views and cameras (V)

- V-1: Use real Copernicus GLO-90 or GLO-30 terrain where the scene requires 3D relief. Disclose vertical exaggeration.
- V-2: Regional views face north and fit the relevant coordinates. Oblique local views are justified by the text, such as looking toward peaks or along a cliff/gorge.
- V-3: Terrain compasses follow projected/camera north and the active language. Projection-dependent world compasses use north at the focal location.
- V-4: Switch by section or by paragraph where the essay changes scene. The shared reading anchor is 40 percent down the scroll region; language tables remain independent.
- V-5: Night, dawn, snow and moonlight follow the prose, not invented meteorological data.
- V-6: Extend real DEM coverage beyond the visible frame. Preserve detailed core samples, model coordinates, elevation baseline and color ramp. Do not use visible edge fading to conceal inadequate coverage. Fish Tail Lodge, Secret Spring and Mogao have dedicated extension tools.
- V-7: Mobile landscape retains legible map scale with touch dragging/pinching. Portrait requires rotation; do not simulate orientation by rotating the whole DOM/canvas.

## 3. Symbols and surface (S)

Shared colors: seal #9d3d31, ink #20251f, soft ink #5b5d53, waterways near #3f5d6c. Focal points use seal-red with a paper outline; ordinary points use quiet ink/paper. Passing/secondary sites remain distinguishable without losing their coordinates. Literary walking paths use alternating footprints. Relationship curves and dashed lines show direction/context rather than surveyed routes. Rivers remain blue; terrain is pale enough to preserve labels and connectors.

- S-1: Keep chapter map bases light so blue rivers and blood-red lines remain legible.
- S-2: Quiet terrain further when many connections/places compete; preserve water/land distinction.
- S-3: Give map text a paper halo with rounded joins; dark scenes may reverse text/halo colors. Use approximately 4-5 px halos and paint-order: stroke.
- S-4: Background geometry must express useful geography. Ruled patterns are confined to reading content. Crop decorative grid/legacy captions from map views.
- S-5: Use a continuous 2D world projection for cross-continental relationships. My Hometown's reading globe is an explicit exception: local WebGL globe with a flat fallback and static reduced-motion state.

## 4. Typography (T)

Sizes below are displayed CSS pixels, not blindly scaled SVG units. min-type.js supplies a 13.5 px floor and does not replace hierarchy. Chinese uses the specified Songti/STSong/CJK serif stack; English uses Caudex; UI uses Ysabeau with the Chinese serif fallback.

| Tier | Role | Chinese / English | Compact reference | Style |
|---|---|---|---|---|
| T1 | Focal place | 32 / 29 | 28 / 25 | 600, seal-red |
| T2 | Place/town | 32 / 29 | 28 / 25 | 400, ink |
| T3 | Region/range/desert/sea | 30 / 30 | 26 / 26 | Category color; English italic where established |
| T4 | River/lake | 24 / 24 | 24 / 24 | Water blue |
| T5 | Place annotation | 22 / 22 | 20 / 20 | Soft ink; no exact distance labels |
| T6 | Legacy on-map caption | Retired | Retired | Move explanations to notes |
| T7 | Panels/legends | 14-16 | At least 13.5 | 400-600 |
| T8 | Compass letter | 18 SVG units | At least 13.5 displayed | 600, seal-red |

T-1: Never render map text below 13.5 px. T-2: Use weight/color rather than shrinking focal hierarchy. T-3: Wrap long prose/poetry instead of shrinking it below the floor. T-4: Omit secondary notes/names before sacrificing legibility. T-5: Existing terrain chapters deliberately use the smaller established level: places 24/22, notes 17, water/quotes 18; narrow references 20/18 with other labels near 15. Yangguan's regional flat map retains its documented original units. These are exceptions to the reference table, still subject to the minimum.

## 5. Label placement (L)

L-1: Keep a label near its symbol, usually a 0.25 em gap and at most 0.5 em. L-2: Treat name/note as one aligned movable box. L-3: The nearest label to each point must belong to that point. A candidate must be at least 0.25 em closer to its own symbol than competing symbols, and must not undercut an already labeled neighbor's association.

| Priority | Candidate | Placement relative to point (x,y), radius r, gap g=0.25em |
|---|---|---|
| 1 | Upper right | Left x+r+g, bottom y-0.1em |
| 2 | Lower right, then upper left | Left x+r+g/top y+0.1em, or right x-r-g/bottom y-0.1em |
| 3 | Lower left | Right x-r-g, top y+0.1em |
| 4 | Above | Centered, bottom y-r-g |
| 5 | Below | Centered, top y+r+g |

L-4/L-5: Choose the first clear candidate, retaining 6 px panel margins and avoiding all registered points/labels/chrome. L-6: If none works, use hierarchy rather than arbitrary long-distance displacement; where the atlas deliberately separates clustered titles, attach a blood-red leading line to the fixed point. L-7: Reserve compasses, timelines and diagrams first. L-8: Place river/road labels from the middle toward either end, about 8 px above the line; omit when no clear location exists. L-9: Center region labels at representative points without extra symbols. L-10: Register every point radius plus 2 px before labels.

## 6. Collision hierarchy (H)

| Priority | Content | When crowded |
|---|---|---|
| H0 | Fixed map controls/diagrams | Reserve and retain |
| H1 | Focal site | Retain; choose minimum-overlap candidate and clamp into view |
| H2 | Current named places | Remove note, then name; retain point |
| H3 | Region names | Hide |
| H4 | Previously mentioned background sites | Remove note/name; retain point |
| H5 | Water names | Hide |
| H6 | Secondary annotations | Hide |

H-1: Register fixed elements/points, then place labels by priority. H-2: Place the more crowded side first within a tier. H-3: Collision handling hides labels, not actual geographic points.

## 7. Readability (A)

A-1: Aim for 4.5:1 normal text and 3:1 large text contrast against actual background pixels. A-2: Adjust terrain/surface or halo before changing the authored text color. A-3: Keep inactive controls readable; avoid fading useful text into the background. A-4: Show only the active language. Original source/proper names in credits remain identifiable.

## 8. Pictorial seals (K)

K-1: Each chapter uses an authored square SVG with simple literary imagery, a double border and monochrome cinnabar near #944b39. Titles/descriptions identify it as symbolic, not geographic geometry. Do not expose old single-character fallback marks as the current design. K-2: Reuse one canonical seal at the atlas/receipt, collection, reader ending, completion and credits. K-3: Check recognition around 40/44/52 px as well as enlarged previews.

## 9. Atlas (M)

M-1/M-2: Anchor points with the same geographic projection used by atlas-camera.js; pan/zoom may move the view, never the underlying coordinates. Separate nearby labels with leading lines rather than inventing display coordinates. M-3: Keep the title and integrated exploration callout fixed/readable while exploring. M-4: Use only one full-view return control. M-5: Put map notes beside the footer citation. M-6: Maintain readable touch labels and independent foreground symbols at every zoom. Completion lighting/collection follow the existing journey state; the all-complete callout hides and credits become available only after nine selections.

## 10. Review

Check evidence/coordinates, language-specific reading stages, bounds at desktop and compact landscape, touch orientation gate, readable labels/halos, collisions/leading lines, no visible DEM edge, no precise distance/scale clutter, source notes, shared seals, reduced motion and keyboard focus. Record actual checks rather than treating older screenshots as evidence for new code.
