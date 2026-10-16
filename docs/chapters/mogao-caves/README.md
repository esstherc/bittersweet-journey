# Mogao Caves

Chapter 06 retains four original numbered sections without a preface. The published Mogai Caves heading is corrected for display. The English edition follows an earlier text, adding ten opening paragraphs in section I and further passages in IV. Language-specific stage tables drive maps; paragraph indices are not interchangeable.

| Section | Chinese / English paragraphs | Scene |
|---|---|---|
| I: Where the caves came from | 5 / 15 | Flat Equal Earth world map; India/Gandhara and Greek influence toward Dunhuang |
| II: A thousand years alive | 11 / 11 | Dunhuang 3D terrain, dusk and moonlight |
| III: Cave by cave | 18 / 18 | GLO-30 cliff, chronological facade diagram, dynasty axis |
| IV: Drifting far away | 16 / 21 | Russian soldiers, American collectors, villagers, Beijing and world relationships |

The reading anchor lies 40 percent down the scroll area. World curves show relationships, not surveyed transport routes. The facade's 31 cave examples are grouped chronologically, not by surveyed positions. Library Cave dispersal links to the Taoist chapter rather than repeating that story.

The second map's DEM extends to 93-97 E, 38-42 N with a 400 by 380 nonuniform mesh. All 52,800 original central samples and the camera/elevation frame are preserved. Real context fills the viewport with local edge fading disabled. The other three DEM datasets remain unchanged. Run extend_mogao_local_dem.py after rebuilding core terrain. WebGL 1 row strips keep indices within 16-bit limits.

World assets use Equal Earth centered at 130 E so Greece/America share one continuous view. The villagers' circle uses the separate 250 by 230 regional mesh. Precise distance labels, redundant captions/location/counter rows are omitted. The seal uses cliffs, eaves and arches, replacing the unreadable flying figure. Mobile requires landscape with map left and scrolling text right.

See [provenance](GEODATA.md). Validation includes tools/test_mogao_dem.cjs.

The cave facade responds to its own panel width rather than the device viewport. Narrow panels show two rows of niches and a separate current-dynasty label; wider panels keep three rows and the full timeline. Captions are HTML paragraphs below the SVG so cave lists and descriptions wrap naturally. A ResizeObserver redraws after the actual panel becomes visible or changes size. The diagram stays within the map and can scroll vertically on unusually short screens. Validation: tools/test_mogao_cliff.cjs covers both languages, all narrative dynasty stages, desktop and two compact landscape sizes.
