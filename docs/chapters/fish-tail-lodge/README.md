# 《鱼尾山屋》双语阅读地图

**状态：已完成（2026-09-27）。** 页面在 `site/chapters/fish-tail-lodge/`，章节 id `fish-tail-lodge`，第 11 章，英文题名 *Fish Tail Lodge*。地理数据与准确性见同目录 `GEODATA.md`。

## 内容与切分

原文 `content/bilingual-corpus.json` 第 11 章：作者“说明”加**六个编号小节**，直接按原文小节切分，不需要编辑性分段或阅读说明。英文版合并了几处段落，但六节切分与中文一致。

| 节 | 标签（中／英） | 中文段 | 英文段 | 地图 |
|---|---|---|---|---|
| 说明 | 说明／Author’s note | 4 | 4 | 不切换地图 |
| 一 | 一 · 鱼尾山屋／I · Fish Tail Lodge | 8 | 7 | 博克拉 3D 地形 |
| 二 | 二 · 思维高度／II · A height of thought | 13 | 13 | 大范围地形：希腊、克里特、埃及 |
| 三 | 三 · 出埃及／III · Out of Egypt | 16 | 16 | 大范围地形：加上西奈到印度河 |
| 四 | 四 · 未曾中断／IV · Unbroken | 30 | 30 | 大范围地形东移：天然屏障；读到最后转回尼泊尔、去蓝毗尼 |
| 五 | 五 · 世纪最后一天／V · The century’s last day | 24 | 21 | 加德满都—边境 3D 地形，车队沿公路前进 |
| 六 | 六 · 国门／VI · The gate | 12 | 12 | 峡谷里的中尼友谊桥、白石大门、樟木 |

英文各节开头的全大写（如 “I ARRIVED AT A PLACE CALLED POKHARA”）在 `app.js` 的 `formatParagraph` 里改为句首大写，说明段同样处理。

## 作者“说明”（外壳新功能）

`_shared/chapter-shell.js` 新增可选的前言区块：章节数据有 `preface` 时，在第一节之前渲染 `<aside class="reader-preface">`，标题取外壳文案 `preface-title`（说明／Author’s note），段落同样经过 `formatParagraph`。前言不是一节，不出现在节次导轨上。原文的“说明：”标题行由构建脚本去掉；“本书P167-178”保留原文。

## 地图

- **地形引擎**：本章自带 `terrain-3d.js`（不与阳关雪共享），三块地形：
  - 博克拉：83.72–84.14°E、28.10–28.66°N，170 × 225 格，约 250 米一格。
  - 边境：85.24–86.10°E、27.62–28.08°N，250 × 150 格，约 340 米一格。
  - 大范围：8–125°E、10–52°N，380 × 160 格，约 29 公里一格。
- **配色**：浅色底，让河流（深蓝）和引导线（血红虚线）清楚可见。
- **第一节随原文的时间推进**：傍晚转暗，夜里屋子亮起一点灯火，清晨峰顶先染红（`mood()` 依本节阅读进度）。
- **第二、三节**：遗址只标点，从“此刻所在”的鱼尾山屋拉虚线，数字为大圆距离；只有本节新出现的遗址标距离。手机宽度下，前一节的遗址只留点，挤在一起的标签会让位。
- **北方朝上**：除第一节（从南向北望雪峰）外都是北方朝上，指北针随镜头旋转。
- **河流名称**：
  - 大范围地形上标出尼罗河、底格里斯河、幼发拉底河、约旦河、印度河、恒河、黄河、长江，第五、六节标出波特科西河。
  - 名称沿河从中段向两端找第一个不挡字的位置，找不到就不标。
- **第二、三节**：大范围地形的陆地调淡（`uWash` 0.38），海面保持原色。
- **字号**：地图上的文字（地名、注记、区域、河流、海、说明文字、指北针）是初版的两倍。
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
2. **大范围 DEM**：`python tools/fetch_fish_tail_wide_dem.py WORK/glo90-wide-6arcmin.tif`，读取 COG 缩图层，4,914 块，海洋缺块补 0。
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
  - 首页光点、预览、揭题页、完成后的印记、收据与文字印都已走过一遍。
