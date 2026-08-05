# Bittersweet Journey / 《文化苦旅》双语交互地图

## 目录

```text
bittersweet journey/
├── index.html                     # 项目入口，转入中国故事总地图
├── source/                        # 中英文 EPUB 原始语料（只读）
├── content/                       # 解析、对齐后的双语内容数据
├── site/                          # 浏览器直接运行的网页
│   ├── index.html                 # 中国故事总地图
│   ├── assets/                    # 全站共享视觉资源
│   ├── data/                      # 地图运行数据
│   ├── scripts/                   # 总地图脚本
│   ├── styles/                    # 总地图样式
│   └── chapters/
│       ├── dujiangyan/            # 《都江堰》章节页面及专属资源
│       ├── secret-spring/         # 《沙原隐泉》章节页面及专属资源
│       └── taoist-tower/          # 《道士塔》章节页面及档案地图
├── tools/                         # 语料解析与章节数据构建脚本
├── docs/                          # 内容、制图说明与预览图
└── work/                          # 脚本生成的临时缓存，不纳入版本管理
```

## 当前成果

- 中文版正文共 26 篇。
- 英文版为 20 篇选译。
- 已完成 20 篇、109 个分节的中英对齐。
- 对齐粒度为篇章级和分节级；段落与句子尚未做一一对齐。
- 已完成《都江堰》《沙原隐泉》《道士塔》三个可阅读章节。
- 首版建议从都江堰、道士塔、莫高窟、沙原隐泉、阳关雪、西域喀什、山庄背影七篇开始。

## 重新生成数据

解析脚本会读取 `source/` 中的两本 EPUB，按需重新创建
`work/extracted/` 缓存，并重新生成 `content/` 中的数据。运行：

```bash
python3 tools/analyze_epubs.py
```

重新生成《都江堰》浏览器数据：

```bash
python3 tools/build_dujiangyan_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/dujiangyan/chapter-data.js
```

重新生成《沙原隐泉》浏览器数据：

```bash
python3 tools/build_secret_spring_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/secret-spring/chapter-data.js
```

重新生成《道士塔》浏览器数据：

```bash
python3 tools/build_taoist_tower_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/taoist-tower/chapter-data.js
```

《道士塔》的世界与欧亚地理数据来自 Natural Earth。中国近景使用自然资源部
标准地图服务公开的自助制图拓扑底图。先将官方 TopoJSON 中的“中国”和
“省级政区（分省设色）”图层以 `ogr2ogr` 转为 GeoJSON，再运行：

```bash
python3 tools/build_taoist_world_geography.py \
  countries.geojson \
  countries-china-pov.geojson \
  china-standard-outline.geojson \
  china-standard-provinces.geojson \
  site/chapters/taoist-tower/geography-data.js
```

中国近景保留标准地图服务提供的平面几何；文章地点采用与其一致的正轴等积割
圆锥投影（中央经线 110°E、标准纬线 25°N／47°N）定位。标准地图经编辑后
用于公开发布时，应按自然资源部标准地图服务说明履行地图审核要求。

直接双击根目录的 `index.html` 即可进入地图；也可以在根目录运行
`python3 -m http.server 8000` 后访问 `http://localhost:8000/`。
