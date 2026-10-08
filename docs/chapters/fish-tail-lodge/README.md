# 《鱼尾山屋》双语阅读地图

**状态：已完成（2026-09-27）。** 页面在 `site/chapters/fish-tail-lodge/`，章节 id `fish-tail-lodge`，第 11 章，英文题名 *Fish Tail Lodge*。地理数据与准确性见同目录 `GEODATA.md`。

## 内容与切分

原文 `content/bilingual-corpus.json` 第 11 章：作者“说明”加**六个编号小节**，直接按原文小节切分，不需要编辑性分段或阅读说明。英文版合并了几处段落，但六节切分与中文一致。

| 节 | 标签（中／英） | 中文段 | 英文段 | 地图 |
|---|---|---|---|---|
| 说明 | 说明／Author’s note | 4 | 4 | 不切换地图 |
| 一 | 一 · 鱼尾山屋／I · Fish Tail Lodge | 8 | 7 | 博克拉 3D 地形 |
| 二 | 二 · 思维高度／II · A height of thought | 13 | 13 | 平面地图：希腊、克里特、埃及 |
| 三 | 三 · 出埃及／III · Out of Egypt | 16 | 16 | 平面地图：西奈到印度河 |
| 四 | 四 · 未曾中断／IV · Unbroken | 30 | 30 | 平面地图东移：天然屏障；读到最后转回尼泊尔、去蓝毗尼 |
| 五 | 五 · 世纪最后一天／V · The century’s last day | 24 | 21 | 加德满都—边境 3D 地形，脚印沿公路虚线随阅读前进 |
| 六 | 六 · 国门／VI · The gate | 12 | 12 | 峡谷里的中尼友谊桥、白石大门、樟木 |

节次标签就是阅读区每节的标题（原文只有编号，标题为本章所加）；外壳的 `reader-progress`（“03 / 06”）与 `reader-location` 不显示（`showReaderProgress: false`、`showReaderLocation: false`）。

英文各节开头的全大写（如 “I ARRIVED AT A PLACE CALLED POKHARA”）在 `app.js` 的 `formatParagraph` 里改为句首大写，说明段同样处理。

## 作者“说明”（外壳新功能）

`_shared/chapter-shell.js` 新增可选的前言区块：章节数据有 `preface` 时，在第一节之前渲染 `<aside class="reader-preface">`，标题取外壳文案 `preface-title`（说明／Author’s note），段落同样经过 `formatParagraph`。前言不是一节，不出现在节次导轨上。原文的“说明：”标题行由构建脚本去掉；“本书P167-178”保留原文。

## 地图

- **地形引擎**：本章自带 `terrain-3d.js`（不与阳关雪共享），第一、五、六节用两块 3D 地形：
  - 博克拉：83.72–84.14°E、28.10–28.66°N，170 × 225 格，约 250 米一格。
  - 边境：85.24–86.10°E、27.62–28.08°N，250 × 150 格，约 340 米一格。
- **第二至四节：一张平面地图**（2026-10-07，仿道士塔）：跨国的大范围改为同一种投影的一张平面地图（`wide-map.js`），镜头随节次与正文焦点移动——希腊与埃及、西奈到印度河、亚洲的天然屏障，最后回到尼泊尔。
  - 投影：正轴等积割圆锥（球体），中央经线 66.5°E，标准纬线 20°N／45°N，原点 30°N；`wide-map.js` 与构建脚本用同一公式，标签由 app.js 以屏幕像素绘制，缩放时字号不变。
  - 底图：Natural Earth 1:50m 海岸线与湖泊；晕渲来自 GLO-90 平均到 1/10°（约 11 km），尼泊尔与喜马拉雅前缘另有 1/60°（约 1.8 km）的清晰叠图，边缘淡入；不画国界。
  - 原来的 3D 大范围地形（380 × 160 格，约 29 km）仍在 `terrain-data.js`，只是不再显示。
- **配色**：浅色底，让河流（深蓝）和引导线（血红虚线）清楚可见。
- **第一节随原文的时间推进**：傍晚转暗，夜里屋子亮起一点灯火，清晨峰顶先染红（`mood()` 依本节阅读进度）。
- **第二、三节**：遗址只标点，从“此刻所在”的鱼尾山屋拉虚线，数字为大圆距离；只有本节新出现的遗址标距离。手机宽度下，前一节的遗址只留点，挤在一起的标签会让位。
- **北方朝上**：除第一节（从南向北望雪峰）外都是北方朝上，指北针随镜头旋转。
- **河流名称**：
  - 大范围地形上标出尼罗河、底格里斯河、幼发拉底河、约旦河、印度河、恒河、黄河、长江，第五、六节标出波特科西河。
  - 名称沿河从中段向两端找第一个不挡字的位置，找不到就不标。
- **字号**（2026-10-07，依沙原隐泉）：地名 24 px（英文 22 px）、注记 17 px、河名与水域 18 px、山系与海 20 px；手机（≤540 px）地名 20／18 px、其余 15–17 px。字的光晕 4 px，圆角接合。
- **第五、六节的公路**：仿沙原隐泉的登山路线，全程淡色点线，读过的部分每 14 px 一枚左右交替的脚印；第六节全程走完。不再画实线与车队圆点。
- **标签**：
  - 位置偏移依实际字号计算，依候选位置和重叠代价放置，避开其他地点的点、地图说明文字与指北针。
  - 放不下时先省注记、再省地名，只留点。
  - 鱼尾山屋与友谊桥始终显示，会横向挪回画面内。
- 示意、差异、来源都写在说明面板（Map notes），不写在地图上。

## 印记与文案

- **印记**：`assets/seal-fish-tail-lodge.svg`，鱼尾峰双峰、亮窗小屋、一道朝霞弧。文字后备“归”只存在 `atlas.js` 的资料里。
- **揭题页**：第 11 章 · 鱼尾山屋 · “在世界屋脊下，整理一路的古文明。” · 论点“离开之后，才读懂了它。” · 按钮“推门看雪峰”。
- **完成语**：“离开之后，才读懂了它。”／*I did not comprehend it until I was separated from it.*（出自原文第六节“我在离别之后才读懂了它”，英文取自英译本同一句）
- **总图**：
  - 线索：雪峰下的一间小屋／*A lodge beneath the snow peaks*。
  - 预览：“走遍古文明的遗址之后，为什么要在喜马拉雅山脚下回望中国？”
  - 进入：推门看雪峰／回到鱼尾山屋。

## 总图（首页）

`site/data/real-geography.js` 没有博克拉，仓库里也没有生成这些屏幕坐标的脚本。用它的七个已投影地点拟合出同一个 Albers 等积圆锥投影（加一个仿射变换，最大残差 1.8 px），算出博克拉在总图上的位置是 (351.5, 496.8)，在画面之内，不需要偏移。改动如下：

- **`site/index.html`**：光点与 `fish-tail-lodge-memory` 印记直接写在这个坐标上，并有注释说明来源。
- **`site/scripts/atlas.js`**：`STORIES["fish-tail-lodge"]`、`point-fish-tail-lodge-aria`，以及 `renderProgress` 切换 `fish-tail-lodge-complete`。
- **`site/styles/atlas.css`**：完成前后的线索切换，以及印记的淡入和盖印动画。
- **`site/scripts/site-header.js`、`site/scripts/page-transition.js`**：白名单加上 `fish-tail-lodge`。

## 时间线

不做。原文只说“二十世纪最后一年”“二十世纪最后一天”，千禧之旅的日程出自《千年一叹》，不据别书补日期。

## 重新构建

1. **章节文字**：`python tools/build_fish_tail_lodge_chapter.py`，从语料生成 `chapter-data.js`。
2. **大范围 DEM**：`python tools/fetch_fish_tail_wide_dem.py WORK/glo90-wide-6arcmin.tif`，读取 COG 缩图层，4,914 块，海洋缺块补 0。尼泊尔叠图：`python tools/fetch_fish_tail_wide_dem.py WORK/glo90-nepal-1arcmin.tif 79 90 24 32 60`（88 块）。
   平面地图：`python tools/build_fish_tail_wide_map.py WORK/glo90-wide-6arcmin.tif ne_50m_land.geojson ne_50m_lakes.geojson site/chapters/fish-tail-lodge WORK/glo90-nepal-1arcmin.tif`，生成 `wide-map-data.js`、`assets/wide-relief.jpg`、`assets/wide-relief-nepal.png`（Natural Earth GeoJSON 取自 nvkelso/natural-earth-vector）。
3. **地形与地理**：`python tools/build_fish_tail_lodge_geodata.py WORK site/chapters/fish-tail-lodge`，生成 `terrain-data.js` 和 `geography-data.js`。`WORK` 需要以下文件，名称见脚本开头：
   - 局部 GLO-90 图块
   - Natural Earth GeoJSON
   - `fishtail-osm.json`
4. **资源版本号**：`python tools/version_chapter_assets.py`。在 Windows 上需以 UTF-8 读写文件，否则会遇到 cp1252 解码错误。

## 验证

- **jsdom**：39 项检查全部通过，覆盖：
  - 六节与前言
  - 段数、英文句首
  - 双语文案与说明面板
  - 键盘与 URL 参数
  - 无 WebGL 时的退路
  - 完成状态的写入
- **真实 Edge（headless，SwiftShader WebGL）**：
  - 六节在 1440／800／390 px 下的中英文都已截图检查，并检查了第一节夜里与清晨、第四节转往蓝毗尼、第五节车队行进中。
  - 标签没有出界或重叠，没有脚本错误。
  - 首页光点、预览、揭题页、完成后的印记、收据与圖章都已走过一遍。
