# Journey end credits

The existing all-selected-chapters finale now opens a full-screen, coffee-colored credit roll after the final seal collection and map illumination. Its existing persisted signature prevents automatic replay. The atlas footer offers replay only after all chapters are complete; individual chapters have no credits entry. URL parameters cannot bypass completion. The atlas exploration callout is hidden after completion and restored when progress is reset.

The sequence shows nine selected seals, all 26 essays in Chinese-edition order, book and map credits, geographic sources, and an invitation to continue reading. `site/data/book-contents.js` contains titles only, drawn from `content/chapter-alignment.json`, sorted by `zh_file`. Twenty have titles from the 2015 English selection; six retain their Chinese titles rather than inventing published translations. The English Mogao title corrects the edition's “Mogai” typo, as the chapter itself does.

Edition references: the supplied 2014 Chinese EPUB and 2015 CN Times Books English EPUB. Attribution supplied by the project owner: English translation by the CN Times Books team; story map by Yanbing Chen and Eugenie Huang.

Geographic providers follow the existing chapter GEODATA documents and atlas documentation. Credits link to Natural Earth, OpenStreetMap's attribution/license, Copernicus DEM, WorldClim, Wikidata and the Ministry of Natural Resources standard-map service. Chapter-specific source panels retain finer provenance.

The native scroll surface advances at 60 CSS pixels/second after a 3.6-second opening hold. Wheel, touch, pointer or keyboard input pauses it. The play control resumes from the current scroll position; hidden pages, closing, navigation and reduced-motion changes stop it. Reduced-motion users start with ordinary manual scrolling. Escape and the fixed return control close the native modal and restore focus.

Validation: `node tools/test_atlas_credits.cjs` checks both languages, desktop/mobile layouts, 26 titles and nine highlights, pause/replay, reduced motion, completion-only access and no chapter links, all-chapter and final-seal gating, replay persistence and horizontal overflow.

Each title carries its 01?26 Chinese-edition sequence number. The six essays absent from the English edition have an explicit note in both languages.
