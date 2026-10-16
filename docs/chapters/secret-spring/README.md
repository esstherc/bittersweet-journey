# A Secret Spring in the Sand

Chapter 07 organizes the uninterrupted essay into Footprints, Ridge, Downhill and Hidden spring. These are editorial interaction waypoints, not original numbered sections. Each language follows its semantic boundaries, without assuming paragraph-by-paragraph correspondence.

The first camera climbs real dunes along an interpretive footprint path. The second pulls back across Dunhuang, Crescent Spring, Mogao and Yulin. The third descends toward water; the fourth stays near the spring. OSM landforms/water retain their geometry; footprints are not a surveyed author route. Notes and provenance sit beside the footer citation.

Regional terrain extends to 92-99 E, 37-43 N using GLO-90 context. The original 280 by 210 samples remain exact inside a 400 by 330 nonuniform mesh. Original camera/label coordinates, elevation baseline and core colors remain stable. Real terrain replaces regional edge fading. Run tools/extend_secret_spring_dem.py after rebuilding the core.

The shared shell provides the single-subtitle curtain, rail, notes and completion. Location lines, counters, camera captions, exact distance labels and scales are omitted. The square dune/crescent seal is reused throughout collection. Mobile requires landscape with side-by-side map/text; reduced motion removes sway.

The current terrain builder is tools/build_secret_spring_3d.py; earlier source conversion commands below remain reference stages. Parameters: ?lang=zh|en, ?open=1&section=1..4, ?notes=1. See [GEODATA.md](GEODATA.md).

## Maintenance commands

Prepare inputs/dependencies described by the tools. Earlier conversion stages are retained for reference.

```bash
python3 tools/build_secret_spring_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/secret-spring/chapter-data.js
```

```bash
python3 tools/build_secret_spring_geodata.py \
  /path/to/mingsha-osm.json \
  site/chapters/secret-spring/geography-data.js
```

```bash
python3 tools/build_secret_spring_terrain.py \
  /path/to/mingsha-dem-90.asc \
  site/chapters/secret-spring/terrain-data.js
```
