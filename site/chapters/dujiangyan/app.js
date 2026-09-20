(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  if (!data || !window.ChapterShell) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  const sections = {
    zh: [
      { label: "一 · 岷江", location: "都江堰" },
      { label: "二 · 江声", location: "鱼嘴" },
      { label: "三 · 水理", location: "李冰" },
      { label: "四 · 青城山", location: "伏龙观" }
    ],
    en: [
      { label: "I · Min River", location: "Dujiangyan" },
      { label: "II · The roar", location: "Yuzui" },
      { label: "III · Water logic", location: "Li Bing" },
      { label: "IV · Qingcheng", location: "Fulong" }
    ]
  };

  // Chapter copy. Shared strings (site title, bar, drawer headings, finish…) come from the shell.
  const copy = {
    zh: {
      "map-teaser": "水在这里被分开",
      thesis: "水，被读出来的形状",
      open: "开卷",
      "map-aria": "都江堰文学地图",
      "map-svg-title": "都江堰文学地图",
      "map-svg-desc": "随着阅读章节推进，岷江、鱼嘴、飞沙堰、宝瓶口与青城山逐层显影。",
      "map-quote": "拜水都江堰，问道青城山",
      "complete-line": "岷江的水，正在回到中国。",
      "notes-map":
        "这是一幅文学阅读地图：岷江、鱼嘴、飞沙堰、宝瓶口与青城山随阅读逐层显影。区域图保持都江堰与成都的真实相对方位；水利工程核心区使用真实坐标的局部放大图。不显示国界、省界或普通道路。",
      "notes-data":
        "都江堰区域采用 WGS84 / UTM 48N 投影。地形晕渲与区域水系使用相同的 UTM 48N 范围和画布位置，西部山地保留较高对比度，向成都平原渐隐。原始河流经过裁剪和 Douglas–Peucker 抽稀，只保留叙事需要的水系层级。",
      "notes-source-1": "水系与地点：OpenStreetMap contributors，经 Overpass API 获取（WGS84）。",
      "notes-source-2": "都江堰、鱼嘴、飞沙堰、宝瓶口的空间关系：同时参考 UNESCO 世界遗产资料。",
      "notes-source-3": "地形：Copernicus DEM GLO-90，用于生成多向 hillshade，并提取 200 米等高线。",
      "notes-source-4": "数据生成于 2026-07-24；页面离线运行，阅读时不会请求在线地图服务。",
      "notes-disclaimer": "地图用于文学阅读与地理关系解释，不替代工程图、行政地图或导航地图。"
    },
    en: {
      "map-teaser": "Where water divides",
      thesis: "The shape of water, read into view",
      open: "Begin",
      "map-aria": "A literary map of Dujiangyan",
      "map-svg-title": "A literary map of Dujiangyan",
      "map-svg-desc":
        "As the reading advances, the Min River, Yuzui, Feishayan, Baopingkou and Mount Qingcheng appear layer by layer.",
      "map-quote": "Pay homage to the water; seek the Way in Qingcheng",
      "complete-line": "The Min River is returning to the map.",
      "notes-map":
        "This is a literary reading map: the Min River, Yuzui, Feishayan, Baopingkou and Mount Qingcheng appear layer by layer as you read. The regional view keeps the true relative bearing of Dujiangyan and Chengdu; the waterworks inset uses real coordinates at a larger scale. National and provincial borders and ordinary roads are not shown.",
      "notes-data":
        "The Dujiangyan region uses the WGS 84 / UTM zone 48N projection. Hillshade and regional waterways share the same UTM 48N extent and canvas position; the western mountains keep higher contrast and fade toward the Chengdu Plain. Source rivers were clipped and simplified (Douglas–Peucker), keeping only the waterway hierarchy the narrative needs.",
      "notes-source-1": "Waterways and places: OpenStreetMap contributors, retrieved via the Overpass API (WGS 84).",
      "notes-source-2":
        "Spatial relationships of Dujiangyan, Yuzui, Feishayan and Baopingkou: also checked against UNESCO World Heritage documentation.",
      "notes-source-3": "Terrain: Copernicus DEM GLO-90, used for multi-directional hillshade and 200 m contours.",
      "notes-source-4":
        "Data generated 2026-07-24; the page runs offline and does not call online map services while you read.",
      "notes-disclaimer":
        "This map serves literary reading and the explanation of geographic relationships. It does not replace engineering drawings, administrative maps or navigation maps."
    }
  };

  const readableEnglishOpenings = new Map([
    ["IMAGINE AN ANCESTOR", "Imagine an ancestor"],
    ["BEFORE GOING TO DUJIANGYAN", "Before going to Dujiangyan"],
    ["ALL OF THIS", "All of this"],
    ["I SAW A BRIDGE", "I saw a bridge"]
  ]);

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    for (const [opening, replacement] of readableEnglishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  function applyRealGeography() {
    const geography = window.REAL_GEOGRAPHY?.local;
    if (!geography) return;

    const pathBindings = {
      "#terrain-contours-low": geography.terrain.low,
      "#terrain-contours-high": geography.terrain.high,
      "#local-min-shadow": geography.paths.minjiang,
      "#local-min-main": geography.paths.minjiang,
      "#local-outer-shadow": geography.paths.outer,
      "#local-outer-main": geography.paths.outer,
      "#local-inner-shadow": geography.paths.inner,
      "#local-inner-main": geography.paths.inner,
      "#local-primary-canals": geography.paths.primary,
      "#local-secondary-canals": geography.paths.secondary,
      "#core-waterways": geography.core.path
    };
    Object.entries(pathBindings).forEach(([selector, path]) => {
      document.querySelector(selector).setAttribute("d", path);
    });

    const site = geography.points.dujiangyan;
    const qingcheng = geography.points.qingcheng;
    const chengdu = geography.points.chengdu;
    document.querySelector("#dujiangyan-site").setAttribute(
      "transform",
      `translate(${site.x} ${site.y})`
    );
    document.querySelector("#qingcheng-point").setAttribute(
      "transform",
      `translate(${qingcheng.x} ${qingcheng.y})`
    );
    document.querySelector("#engineering-leader").setAttribute(
      "d",
      `M${site.x + 14},${site.y - 3}C${site.x + 120},${site.y - 54} 560,178 650,178`
    );

    Object.entries(geography.core.points).forEach(([name, position]) => {
      document.querySelector(`#core-${name}`).setAttribute(
        "transform",
        `translate(${position.x} ${position.y})`
      );
    });

    document.querySelector("#chengdu-mark").setAttribute("cx", chengdu.x);
    document.querySelector("#chengdu-mark").setAttribute("cy", chengdu.y);
    ["cn", "en"].forEach((language) => {
      const label = document.querySelector(`#chengdu-plain-label-${language}`);
      label.setAttribute("x", chengdu.x + 13);
      label.setAttribute("y", chengdu.y + 10);
    });

    document.querySelector("#plain-wash").setAttribute(
      "d",
      `M${site.x + 18},${site.y + 22}C470,245 728,314 912,485C1001,568 932,703 746,718C561,721 410,617 350,463C323,393 310,293 ${site.x + 18},${site.y + 22}Z`
    );
    document.querySelector("#field-plane").setAttribute(
      "d",
      "M405 324C552 289 740 357 866 483C924 542 876 642 735 665C579 690 460 600 412 479C390 423 384 362 405 324Z"
    );

    const labelPositions = {
      "minjiang-label-cn": [365, 142],
      "minjiang-label-en": [365, 142],
      "outer-label": [445, 498],
      "outer-label-en": [445, 498],
      "inner-label": [610, 355],
      "inner-label-en": [610, 355]
    };
    Object.entries(labelPositions).forEach(([id, [x, y]]) => {
      const label = document.querySelector(`#${id}`);
      label.setAttribute("x", x);
      label.setAttribute("y", y);
    });
  }

  const revealLayers = [...document.querySelectorAll(".reveal-layer")];

  function setMap(index) {
    const level = index + 1;
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= level);
    });
  }

  applyRealGeography();

  const shell = window.ChapterShell.init({
    id: "dujiangyan",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onSection: setMap
  });

  document.querySelectorAll("[data-section-target]").forEach((point) => {
    point.addEventListener("click", () => shell.goToSection(Number(point.dataset.sectionTarget)));
  });
})();
