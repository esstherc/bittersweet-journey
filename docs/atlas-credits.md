# Journey end credits

The existing all-selected-chapters finale now opens a full-screen, coffee-colored credit roll after the final seal collection and map illumination. Its existing persisted signature prevents automatic replay. The atlas footer offers replay only after all chapters are complete; individual chapters have no credits entry. URL parameters cannot bypass completion. The atlas exploration callout is hidden after completion and restored when progress is reset.

The sequence shows nine selected seals, all 26 essays in Chinese-edition order, book and map credits, geographic sources, and an invitation to continue reading. `site/data/book-contents.js` contains titles only, drawn from `content/chapter-alignment.json`, sorted by `zh_file`. Twenty have titles from the 2015 English selection; six retain their Chinese titles rather than inventing published translations. The English Mogao title corrects the edition's “Mogai” typo, as the chapter itself does.

Edition references: the supplied 2014 Chinese EPUB and 2015 CN Times Books English EPUB. Attribution supplied by the project owner: English translation by the CN Times Books team; story map by Yanbing Chen and Eugenie Huang.

Geographic providers follow the existing chapter GEODATA documents and atlas documentation. Credits link to Natural Earth, OpenStreetMap's attribution/license, Copernicus DEM, WorldClim, Wikidata and the Ministry of Natural Resources standard-map service. Chapter-specific source panels retain finer provenance.

The five scenes form a continuous lantern journey:

1. The final chapter light spreads across a snapshot of the completed atlas, followed by a square seal press.
2. The map becomes the left page of an open book. The atlas's existing mounted poet (straw hat, blue-grey robe, horse and luggage) rides out of the page into the landscape, carrying a lantern. The same SVG is cloned from the atlas at runtime instead of maintaining a second character design.
3. All 26 numbered titles pass by. Each selected chapter receives its square seal, lights a roadside lantern, and brings its chapter curtain artwork into the sky. Two image layers crossfade after loading; the illustration stays at full opacity with a localized dark veil behind the text. My Hometown uses the drawn landscape because its opening has no raster curtain. Chapters absent from the English edition retain their explicit note.
4. The author, translator team, map authors and geographic data providers roll over the continuing journey, with a stone bridge appearing in the river landscape.
5. The traveller reaches a wayside inn, the lantern appears at the door, and all nine seals remain in a travel book, with return and replay actions.

The landscape is an original local SVG in `credits-landscape.js`, with mountains, dunes, river, road, bridge and inn. Parallax follows scroll position. The native scroll surface fits its full travel distance to about 65 seconds after a 4.2-second opening hold; screen and font sizes determine the distance. The masthead matches the atlas: a wordmark, circular play/pause and music icons, and a return link. Space toggles play/pause. Speed and skip controls have been removed. Wheel, touch, pointer and navigation-key input pause playback. The play control resumes from the current scroll position. Sound follows the existing global audio preference, with seal, dune-wind and bell cues; the opening seal cue aligns with its press after the light reveal. Closing stops credit voices; hidden pages, closing, navigation and reduced-motion changes stop playback. Reduced-motion users start with ordinary manual scrolling and static artwork. Escape and the fixed return control close the native modal and restore focus.

Five-scene review: the original order and content remain in place. The revised implementation corrects the character mismatch, makes the book-to-road departure explicit, restores visible chapter paintings, adds a distinct bridge setting for the attribution scene, and retains the inn's hanging lantern and square-seal travel book. This follows the five-scene narrative with the atlas's established horse rider instead of the initially proposed camel.

Validation: `node tools/test_atlas_credits.cjs` checks both languages, desktop/mobile layouts, 26 titles and nine highlights, pause/replay, reduced motion, completion-only access and no chapter links, all-chapter and final-seal gating, replay persistence and horizontal overflow.

Each title carries its 01–26 Chinese-edition sequence number. The six essays absent from the English edition have an explicit note in both languages.
