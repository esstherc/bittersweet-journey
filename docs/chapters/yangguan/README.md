# 《阳关雪》双语阅读地图

入口：`site/chapters/yangguan/index.html`（第八章，id `yangguan`，英文题名 *Snow on the Southern Pass*）。总图上的 08 号光点已可进入。

## 结构

篇幅与结构最接近《沙原隐泉》（单篇、无编号分节、单一真实地点），所以使用共享章节外壳（`site/chapters/_shared/`），并接入站点共用的揭题页、表头与换页过场（`site/scripts/chapter-opening.js`、`site-header.js`、`page-transition.js`）。本章只自带：两块三维地形（第一段的大范围地形、第三至五段的阳关局部地形）、地形上的地物标注、指北针、第二段的区域图、飘雪层与图像印记。

## 阅读节奏

原文没有分节。五个段落只用于交互节奏，阅读区顶部注明“五个段落用于交互节奏，不是原文编号分节。”每一段的切点都落在中英文同一句上；英文版把中文第 4、5 段合为一段，所以英文从第二段起索引少一。`tools/build_yangguan_chapter.py` 用每段的开头句校验切点，语料若有变动会直接报错。

| # | 标签 | 中文段 | 英文段 | 地图 |
|---|---|---|---|---|
| 一 | 诗与远方 · Poems and distant places | 1–6 | 1–5 | 从阳关到苏州的大范围地形，俯视、北方朝上；白帝城、黄鹤楼、寒山寺按真实坐标标出，虚线连到原点阳关；长江、黄河；指北针 |
| 二 | 雪漠孤行 · Alone in the snow | 7–12 | 6–11 | 敦煌县城—阳关区域图（DEM 晕渲），直线约 56.6 km；读到“天竟晴了”雪停 |
| 三 | 荒原坟冢 · Mounds on the wasteland | 13–17 | 12–16 | 低空镜头，雪在低处化出沙底；镜头从路的起点后上方望向阳关，脚印（左右交替的椭圆，仿沙原隐泉）随阅读一步步向前，坟堆逐渐显出 |
| 四 | 阳关古址 · The ruins of Yangguan | 18–22 | 17–21 | 抵达烽燧点：绿洲、汉代烽燧线、阿尔金山；风卷残雪 |
| 五 | 西出阳关 · West of Yangguan | 23–31 | 22–30 | 向西望，王维两句浮在天空；读到末句“怕还要下雪”时雪又落下 |

## 印记

本章印记是图像，不是文字（仿西域喀什）：`site/chapters/yangguan/assets/seal-yangguan.svg`，半坍的烽燧土墩立于坡上，苇草迎风飘出，雪落，地如冻浪。用在阅读区末尾、完成画面、总图回执、文字印面板，以及总图上的阳关光点旁。

共享外壳新增 `.seal-image`（`chapter-shell.css`），总图 `atlas.js` 的 `STORIES` 条目新增 `seal` 字段：有 `seal` 的章节显示图像，没有的继续显示文字。现有的 水／泉／空／影 以后改成图章时，只需各画一张 SVG、加上 `seal` 字段，并把章节页的 `.seal` 换成 `.seal-image`。

## 文案

- 揭题页：第 08 章 · 阳关雪 · “冲着一首诗，去寻一座关。” · 踏雪出发
- 完成语：风雪掩关，唐音犹在纸上。／ Snow covers the pass; its verses remain on the page.
- 总图线索：雪中寻一座关／A pass sought through snow；预览：一座早已坍弛的土墩，为什么仍值得冒雪去寻？
- 地图上的王维诗句：中文用原文，英文用本书英译本的译法（与正文一致），不另译。

## 总图

阳关距敦煌仅 57 公里，在全国总图上与沙原隐泉的光点只差几个像素，点击会落到沙原隐泉上。因此阳关光点按真实方位（西南）偏移绘制，和道士塔的做法相同（`atlas.js` 的 `DISPLAY_OFFSETS`）。手机版总图的裁切也放宽了，让西域喀什到山庄背影的六个光点都在屏幕内（之前西域喀什在手机上落在屏幕外）。

## 构建与验证

```sh
python3 tools/build_yangguan_chapter.py content/bilingual-corpus.json site/chapters/yangguan/chapter-data.js
python3 tools/fetch_yangguan_wide_dem.py work/yangguan/glo90-wide-2arcmin.tif   # 约 400 张瓦片的缩图层，只需一次
python3 tools/build_yangguan_geodata.py work/yangguan work/yangguan/yangguan-osm.json site/chapters/yangguan
python3 tools/version_chapter_assets.py
node --check site/chapters/yangguan/app.js site/chapters/yangguan/terrain-3d.js
```

地理构建需要 `numpy`、`rasterio`、`Pillow`，以及 `work/yangguan/` 下的 DEM 瓦片、大范围 DEM、`ne_50m_rivers.geojson` 与 Overpass 结果，见 [GEODATA.md](./GEODATA.md)。章节浏览本身离线运行，不请求在线地图。

在 Windows 上，`version_chapter_assets.py` 默认以系统编码读写文件会失败；需以 UTF-8 读写并保留各文件原有换行。

URL 参数：`?lang=zh|en`、`?open=1&section=1…5`、`?notes=1`。不支持 WebGL 时，地图改为显示区域图（`body.webgl-fallback`）。

## 已知边界

- 坟堆与脚印（叙事路径）是文学示意，不是测绘坟场或作者的实测路线。地图上不加“示意／非实测”字样，这些说明集中在说明面板。
- 地形改用浅色底（浅沙色、淡雪影），让深蓝的河流与血红的虚线、脚印保持清楚。
- 雪的覆盖、融化与飘落依原文叙述，不是气象资料。
- 第一段的大范围地形约 8 公里一格，只用于表达三地与阳关的相对位置，看不出阳关本地的地物；第三段起换回细网格地形。英文名沿用本书英译本（寒山寺 = Cold Mountain Temple）。
- 渭城不在这次行程内，未上图。
