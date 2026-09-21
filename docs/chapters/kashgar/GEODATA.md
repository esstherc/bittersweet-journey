# 西域喀什：地理数据与准确性

## 数据管线

WGS 84 源数据 → Shapely 裁剪／简化 → GeoJSON FeatureCollection → 浏览器 Web Mercator 投影。

`site/chapters/kashgar/data/geography.geojson` 是可下载的完整数据；`geography-data.js` 包含相同 FeatureCollection 和双语地点表，供直接打开 HTML 时离线加载。验证脚本检查两者完全一致。

数据获取日期：2026-09-18。当前共 546 个要素，25 个已定位地点／地理对象，另有 7 个未定位称谓。所有几何要素有 source、source_id 和 license；原始文件 SHA-256 保存在 `data/source-manifest.json`。

## 来源

### Natural Earth — public domain

从项目发布仓库下载以下 GeoJSON：

`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/`

- `ne_110m_land.geojson`
- `ne_10m_rivers_lake_centerlines.geojson`
- `ne_10m_lakes.geojson`
- `ne_10m_geography_regions_polys.geojson`
- `ne_10m_populated_places.geojson`

说明：[Natural Earth physical vectors](https://www.naturalearthdata.com/downloads/10m-physical-vectors/)。

非叙事主体地物裁剪至 63–111°E、28–49°N；陆地裁剪至 -12–119°E、10–66°N，支持原文对莱茵河、约旦河的跨区域比较。选中的原文地物保留全几何。简化容差为 0.005 度，保持拓扑。

天山、昆仑山、帕米尔、塔克拉玛干和塔里木盆地均使用来源多边形，不手绘轮廓。Natural Earth 地理区多边形为概化范围，不能当作精密地貌边界。河流使用 LineString / MultiLineString。标签锚点由 geometry.representative_point() 计算，仅用于放置名称。

疏勒关联到喀什、龟兹关联到库车、长安关联到西安，是原文语境中的名称关系；不声称现代城市点或范围等于历史城址。

### OpenStreetMap — ODbL 1.0

[© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。

经 Overpass 获取 75.94–76.05°E、39.43–39.51°N 的 293 个道路及水系要素。保留 way 对象链接和原始顶点。获取查询存于 `work/kashgar/city.overpass`，响应为 `city-osm.json`：

```text
[out:json][timeout:60];
(
 way["highway"~"^(primary|secondary|tertiary|trunk)$"](39.43,75.94,39.51,76.05);
 way["waterway"~"^(river|canal)$"](39.43,75.94,39.51,76.05);
 way["natural"="water"](39.43,75.94,39.51,76.05);
);
out geom;
```

现代道路不代表 1881 年街道，不据此绘制骑兵巡行路线。

### Wikidata — CC0

从官方 `wbgetentities` API 获取 P625 坐标声明，响应为 `work/kashgar/wikidata.json`。不使用手填猜测坐标。

| 对象 | 源记录 | 表达 |
| --- | --- | --- |
| 丹丹乌里克 | [Q1159394](https://www.wikidata.org/wiki/Q1159394) | 遗址资料定位点 |
| 米兰遗址 | [Q1192991](https://www.wikidata.org/wiki/Q1192991) | 遗址资料定位点 |
| 高昌 | [Q877381](https://www.wikidata.org/wiki/Q877381) | 遗址资料定位点 |
| 交河 | [Q1330939](https://www.wikidata.org/wiki/Q1330939) | 遗址资料定位点 |
| 乔戈里峰 | [Q43512](https://www.wikidata.org/wiki/Q43512) | 峰顶坐标 |
| 慕士塔格峰 | [Q630579](https://www.wikidata.org/wiki/Q630579) | 英文版 Mountain 的对应，不替代中文版冰川 |
| 罗布泊 | [Q319412](https://www.wikidata.org/wiki/Q319412) | 区域参考点，不是湖岸线 |
| 楼兰 | [Q1057551](https://www.wikidata.org/wiki/Q1057551) | 源记录坐标，不代表古国边界 |

这些记录是开放地理参考数据，不等于测绘认证。坐标精度元数据保留在要素属性中。

## 暂未定位

- 尼雅：Wikidata 与可检索遗址资料坐标存在差异；未将现代尼雅镇或无关搜索结果落点。
- 奥依塔克冰川、慕士塔格冰川：未取得可与具体冰川对应的边界。
- 红其拉甫：中文写口岸，英文写山口；已取得山口坐标，未把两者直接等同。
- 亚克艾日克烽火台：缺少可靠坐标。
- 英、俄领事馆：找到现代酒店相关记录，但不足以核实历史建筑的精确落点，暂不绘制。

这些条目保留文字双向索引和说明，无虚构坐标。无位置卡不会移动地图到一个假定地点。
