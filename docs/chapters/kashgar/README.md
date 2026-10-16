# Kashgar in the Western Regions

Chapter 09 retains five original sections, 57 Chinese paragraphs and 55 English paragraphs. Sixteen semantic anchors drive map focus; the fifth-section landscape/music anchors do not split the source paragraph. Language switching explicitly handles mergers rather than matching indices blindly.

Longest-matched place names become text buttons. Text selection highlights geometry; map selection lists passages and permits return to the previous reading position. Temporary inspection returns to follow-reading after sufficient scroll, a new anchor or closing the card. Unverified locations retain textual indexing without invented coordinates.

The chapter keeps its own reader/geographic logic inside the common layout. Titles are Toynbee's next life, Where civilizations met, The centre of the centre, Two consulates and The white banner. The rail uses 01-05 and retains return-to-reading. All places and zoom/home controls are removed; dragging/pinching remain. Exact map scales are hidden.

The title leaf uses the Pamir painting plus optional GPU atmosphere with a static image beneath. Only one localized subtitle appears. English all-capital section openings display in sentence case; source text stays unchanged. Shared completion returns automatically and collects the square peak/banner seal, without an extra atlas watermark.

Relief: assets/region-relief.jpg, GLO-90 averaged to 1/30 degree over 70-100 E, 31-46 N and resampled to Mercator row spacing. It fades at city scale. Natural Earth polygons supply clickable geometry/label anchors rather than invented terrain. Seven unresolved references retain explanatory cards.

Static HTML includes complete bilingual fallback text. Enhancements are prepared before replacing it. Builders must preserve UTF-8 and resource hashes. Mobile requires landscape, with map left and independently scrolling text right. Parameters: ?lang=zh|en, ?open=1&section=N.

See [geographic sources](GEODATA.md) and [opening atmosphere](OPENING-MOTION.md).

## Maintenance commands

Prepare inputs/dependencies described by the tools. Earlier conversion stages are retained for reference.

```sh
python3 tools/build_kashgar_chapter.py
python3 tools/build_kashgar_geodata.py
python3 tools/verify_kashgar.py
node --check site/chapters/kashgar/app.js
```

```sh
python3 tools/fetch_fish_tail_wide_dem.py WORK/kashgar-dem.tif 70 100 31 46 30
  python3 tools/build_kashgar_relief.py WORK/kashgar-dem.tif
```
