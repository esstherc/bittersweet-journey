# 《沙原隐泉》双语阅读地图

这是“山河显影”的第二个可阅读章节。页面使用真实的鸣沙山地形和月牙泉轮廓，并把连续散文按原文顺序组织成四个交互“路标”：

- 01 脚印
- 02 山脊
- 03 下坡
- 04 隐泉

这些路标只用于控制地图显影与阅读节奏，不是原文编号分节。中文与英文分别按照语义边界切分，未假定段落一一对应。

页面使用共享的章节外壳（`site/chapters/_shared/`）：标题栏、开卷幕布、阅读区、路标进度条、底栏和完成画面都由外壳提供；本章只保留三维地形、故事图层与地图注记。版式规则见 [chapter-layout-guideline.md](../../chapter-layout-guideline.md)（§5.6 记录了本章的迁移决定）。

## 核心交互

- 开卷后先进入脚印视角：镜头贴近由 DEM 生成的三维沙山，虚线脚印沿坡向上。
- 读到山脊时，镜头拉远到敦煌—鸣沙山/月牙泉—莫高窟—榆林窟区域视图，回应原文中的石窟联想。
- 局部视图保留文学脚印、月牙泉和地物轮廓，不再叠加二维 hillshade 与等高线。
- 读到下坡时，泉水加深显影，三维镜头向月牙泉下潜。
- 读到隐泉时，镜头在泉边低空停驻。
- 完成本章返回总地图，敦煌节点永久留下沙山与月牙泉的微型地貌记忆。
- 底栏的“地图说明与数据来源”按钮展开说明面板：三维、脚印与区域的读法，投影、地形、地物来源，以及文学路径的准确性边界。
- 地图左下角的小字标注当前镜头状态（如“贴近沙脊”）。
- URL 参数：`?lang=zh|en`、`?open=1&section=1…4`、`?notes=1`。

## 重新生成数据

```bash
python3 tools/build_secret_spring_chapter.py \
  content/bilingual-corpus.json \
  site/chapters/secret-spring/chapter-data.js
```

地理数据构建脚本需要预先准备 Overpass JSON：

```bash
python3 tools/build_secret_spring_geodata.py \
  /path/to/mingsha-osm.json \
  site/chapters/secret-spring/geography-data.js
```

浏览器三维高程数据由重采样后的 ESRI ASCII Grid 生成：

```bash
python3 tools/build_secret_spring_terrain.py \
  /path/to/mingsha-dem-90.asc \
  site/chapters/secret-spring/terrain-data.js
```

完整来源与处理方法见 [GEODATA.md](./GEODATA.md)。

## 2026-10 地图改版

- **两块真实 DEM 地形**（`tools/build_secret_spring_3d.py`）：
  - 鸣沙山一带：GLO-30，约 50 米网格；第一、三、四节。
  - 敦煌至榆林窟：GLO-90，约 530 米网格；第二节，取代原来的抽象区域图。
  - 两块都是经纬度网格，所有地名、路线、指北针与比例尺都由真实坐标投影到三维地形上，随镜头移动。
- **指北针与比例尺**：
  - 指北针显示镜头朝向，一般三维地图的惯例；斜视时直接投影的北向会误导。
  - 比例尺取画面中央附近的距离，自动取整数（50 m 至 50 km）。
- **移除**：
  - 文章顶端的路标说明；
  - 各节的地点行与 `01 / 04` 进度（外壳选项 `showReaderLocation: false`、`showReaderProgress: false`）；
  - 地图左下角的镜头说明；
  - 第二节的经纬度与双语并列。地图文字只显示当前语言。
- **图标**：
  - 鸣沙山：双峰沙丘；
  - 月牙泉：水滴与涟漪；
  - 莫高窟、榆林窟：窟龛；
  - 都画在纸色圆底上，在沙地和水面上都清楚。
- **标签**：
  - 依 `docs/map-guidance.md` 的字号表与 #1–#5 位置、L-3 归属规则放置；
  - 第二节的月牙泉为焦点，群聚时以引线移开；
  - 文字光晕用圆角接合（`stroke-linejoin: round`），转角不再有锯齿。
- **重新生成**：`python tools/build_secret_spring_3d.py WORK site/chapters/secret-spring`。
  - `WORK` 需要五个 Copernicus 图块（见脚本开头）。
  - 脚本从原 OSM 画布坐标（`build_secret_spring_geodata.py` 的输出）换算回经纬度，所以要先用那支脚本重建 `geography-data.js`。
- **2026-10 微调**：地图标签缩小一级（见 `docs/map-guidance.md` T-5）；恢复第一版的镜头缓慢摆动，眼点绕目标左右来回数度，标签、指北针与比例尺同步移动；减少动态效果设定下不摆动。
- **第一节镜头沿脚印上山**：镜头随阅读进度沿叙事路径前进，位于脚印后上方、朝坡上看；脚印随进度逐步出现，读到节末时接近山顶。
