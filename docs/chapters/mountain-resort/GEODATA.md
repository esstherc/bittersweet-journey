# Geography and accuracy

## Geographic anchors

The map uses WGS 84 coordinates for the Mountain Resort and six outlying temples. The site center and property area follow UNESCO:

- Mountain Resort center: approximately 40.9875° N, 117.9375° E
- UNESCO Mountain Resort property: 611.2 ha
- Map extent: 117.910–117.975° E, 40.975–41.030° N

Temple anchors are retained in `site/chapters/mountain-resort/geography-data.js`. They are projected together so their relative direction and distance are preserved.

## Regional historical-geography layer

The opening map adds a second projection extent for the spatial axis:

- Beijing: 39.9042° N, 116.4074° E
- Gubeikou: approximately 40.690° N, 117.157° E
- Chengde Mountain Resort: 40.9875° N, 117.9375° E
- Mulan Hunting Grounds: represented as a regional range, not a single exact point
- Summer Palace: 39°59′49″ N, 116°16′4.9″ E, following UNESCO

The Chengde–Summer Palace distance shown in the final movement is approximately 179 km great-circle. Its dashed connector represents memory across two cities, not physical adjacency.

The line from Beijing through Gubeikou and Chengde toward Mulan expresses the historical northern-inspection axis. It is not a reconstructed turn-by-turn imperial road. The Great Wall line is likewise diagrammatic.

## Real-map layers (2026-10-08)

| Layer | Source | Notes |
|---|---|---|
| Terrain, sections 2–4 | Copernicus DEM GLO-30, 117.80–118.08°E, 40.91–41.10°N, 240 × 215 cells (~98 m) | 304–1,262 m; heights exaggerated 3× |
| Resort wall | OpenStreetMap relation 8008566 | encloses ~540 ha (UNESCO property: 611.2 ha) |
| Lakes, Wulie River | OpenStreetMap natural=water, waterway | lakes clipped to the wall |
| Outlying temples | OpenStreetMap place_of_worship footprints | ten temples drawn, six labelled |
| Lizheng Gate | OpenStreetMap relation 8008565 | section four |
| Wanshu Garden | OpenStreetMap node 8659379119 (蒙古包) | approximate: the garden has no outline in OSM |
| Chair-back label | highest DEM cell within ~1.5 km outside the north and west walls | a label anchor, not a named summit |
| Relief, sections 1 and 5 | Copernicus DEM GLO-90 at 1/240° (~350 m), 114.8–119.8°E, 39.0–42.8°N | warped into the standard map's Albers projection |
| Great Wall, sections 1 and 5 | OpenStreetMap ways named 长城 (historic=citywalls / barrier=city_wall), 114.8–119.8°E, 39.4–42.2°N | 1,451 ways merged into 538 lines; drawn with battlements on the north side |

## Diagrammatic elements

The following are explicitly interpretive rather than surveyed:

- the placement of the hill, plain and lake zone labels (no zone boundaries are drawn);
- the links between the resort and temples;
- the exact spot of the 1793 audience within Wanshu Garden.
- the northern-inspection connector;
- the interior position of the Wanshu Garden event marker.

The broad internal arrangement follows the Chengde Cultural Heritage Bureau description: hills in the west and northwest, lakes in the southeast, and a plain in the north.

## Sources

- [UNESCO World Heritage property](https://whc.unesco.org/en/list/703/)
- [UNESCO maps and coordinates](https://whc.unesco.org/en/list/703/maps/)
- [Chengde Cultural Heritage Bureau introduction](https://wwj.chengde.gov.cn/art/2018/11/8/art_962_753975.html)
- [UNESCO periodic reporting data](https://whc.unesco.org/document/217137)
- [UNESCO Summer Palace coordinates](https://whc.unesco.org/en/list/880/maps/)
- [Chengde official Mulan regional range](https://shj.chengde.gov.cn/art/2013/7/10/art_820_108214.html)

This chapter is a literary reading map and is not intended for surveying, navigation or site management.
