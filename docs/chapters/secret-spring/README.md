# 《沙原隐泉》双语阅读地图

这是“山河显影”的第二个可阅读章节。页面使用真实的鸣沙山地形和月牙泉轮廓，并把连续散文组织成四个交互“路标”：

- 02 山脊
- 01 脚印
- 03 下坡
- 04 隐泉

这些路标只用于控制地图显影与阅读节奏，不是原文编号分节。中文与英文分别按照语义边界切分，未假定段落一一对应。

## 核心交互

- 开卷后首先进入山脊视角，镜头拉远到敦煌—鸣沙山/月牙泉—莫高窟—榆林窟区域视图，回应原文中的石窟联想。
- 阅读顺序为 `02 → 01 → 03 → 04`，随后回到脚印视角，以低空斜视镜头掠过由 DEM 生成的三维沙山。
- 局部视图保留文学脚印、月牙泉和地物轮廓，不再叠加二维 hillshade 与等高线。
- 阅读下坡段落后，泉水加深显影。
- 第三、第四路标让三维镜头向月牙泉下潜并在泉边低空停驻。
- 完成本章返回总地图，敦煌节点永久留下沙山与月牙泉的微型地貌记忆。
- 地图数据面板采用正文级字号，说明投影、地形、地物来源与文学路径的准确性边界。

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
