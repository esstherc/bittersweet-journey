# 山庄背影 / The Villa from Behind

第 10 章互动阅读页，以“罗圈椅背”为持续空间意象。原文五个编号章节保持不变，滚动状态依次为：

1. 门外：对清代的历史情绪
2. 椅背：北岭、山庄与康熙
3. 万树：外庙、乾隆与 1793 年英国使团
4. 闭门：咸丰、辛酉政变与 1861 年山庄再度关闭
5. 背影：1927 年王国维与湖面倒影

页面入口：`site/chapters/mountain-resort/index.html`

数据脚本由 `tools/build_mountain_resort_chapter.py` 从 `content/bilingual-corpus.json` 的第 10 章生成。不要直接编辑 `chapter-data.js`。

## 视觉与交互

- 左侧地图以西北山岭包围山庄，形成“罗圈椅背”构图。
- 第一节先展示北京—古北口—承德—木兰围场的北巡轴线，第二节以交叉淡化和缩放进入山庄尺度。
- 外庙点位按 WGS 84 经纬度投影。
- 第三节以独立事件卡把 1793 年英国使团落到万树园，并明确其园内位置为示意。
- 第五节把王国维事件放回北京颐和园，以约 179 km 的跨城记忆线连接作者所在的承德湖面。
- 原文五节驱动地图显影、时间轴和闭门/倒影状态。
- 中英文均使用常规字形，不使用斜体。
- 正文字号 17–19px（随窗口宽度），地图说明抽屉正文 14px。
- 页面框架（标题栏、开卷幕布、右侧阅读栏、时间线、底栏、说明抽屉、完成页）来自 `site/chapters/_shared/`，本章自己只保留地图、地图说明文字和 `--accent`。
- 时间线（清代 · 1703 · 1793 · 1861 · 1927）位于地图下方，与右侧“原文章节”进度条同一基线，二者由同一个当前节次驱动。
- 预览参数：`?open=1&section=N` 跳过幕布，`?notes=1` 打开地图说明抽屉，`?lang=zh|en` 指定语言。
- 首页仍把本章称为 `chengde`（`?revealed=chengde`），本章目录与本地存储键为 `mountain-resort`；`app.js` 中的 `revealId` 负责这层对应。

## 重建文本数据

```bash
python3 tools/build_mountain_resort_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/mountain-resort/chapter-data.js
```
