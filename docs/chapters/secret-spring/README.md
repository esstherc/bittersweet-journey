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
