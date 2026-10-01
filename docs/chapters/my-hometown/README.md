# 《我的山河》开场与阅读地图

第 03 章是全图入口，不绑定一个故乡坐标。总图的“03 · 全图入口”进入章节；第一次进入时呈现五步互动：点亮黄河、拖动视野找长江、放大、打开降水图层、点章节光点。每步都有按钮替代操作，键盘和触屏均可完成。可以跳过；之后直接进入正文，地图中的“重看开场”可再次打开。`?tour=1` 强制重看，`?open=1&section=3` 直接预览正文。

开场的居中视觉、逐幕文案和动效节奏见 [交互开场分镜](OPENING-STORYBOARD.md)。

五节中英文正文来自现有语料，保留原文分节。更新正文数据：

```bash
python3 tools/build_my_hometown_chapter.py content/bilingual-corpus.json site/chapters/my-hometown/chapter-data.js
```

黄河、长江路径复用 `site/data/real-geography.js` 的 Natural Earth 全国河流几何。地形色块、长城线、约 400 毫米年降水量线均为文学示意，不是测绘或逐年降水等值线。地图说明面板会向读者标明这一区别；长城和降水分界分别绘制。

正文使用共享 `ChapterShell`：滚动或点节次切换五节，语言切换保留节次，完成后回总图增加“河”字印记。总图的文字印和进度共用 `bittersweet-journey:my-hometown:complete`。
