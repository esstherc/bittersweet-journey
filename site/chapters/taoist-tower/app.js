(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.TAOIST_TOWER_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // The five sections are the essay's own numbered sections.
  const sections = {
    zh: [
      { label: "一 · 塔", location: "莫高窟门外 · 大泉河" },
      { label: "二 · 门", location: "藏经洞 · 1900年6月22日" },
      { label: "三 · 三个人", location: "敦煌 · 莫高窟" },
      { label: "四 · 二十九箱", location: "敦煌至世界 · 叙事路径" },
      { label: "五 · 三座墓", location: "敦煌 · 喀布尔 · 未知地点" }
    ],
    en: [
      { label: "I · The stupa", location: "Outside Mogao · Daquan River" },
      { label: "II · The opening", location: "Library Cave · 22 June 1900" },
      { label: "III · Three men", location: "Dunhuang · Mogao Caves" },
      { label: "IV · Twenty-nine crates", location: "Dunhuang to the world · Narrative route" },
      { label: "V · Three graves", location: "Dunhuang · Kabul · Unknown" }
    ]
  };

  // On-map caption (M-5): what the current map view shows.
  const captions = {
    zh: [
      "人物地理 · 从湖北到河西走廊",
      "1900 · 西北考古与全球权力背景",
      "一条可定位的行程，一场发生在洞窟里的相遇",
      "二十九箱离开敦煌",
      "两处可定位的墓，一处地理空白"
    ],
    en: [
      "Biography map · From Hubei to the Hexi Corridor",
      "1900 · Northwest archaeology and global power",
      "A locatable journey; a meeting inside the cave",
      "Twenty-nine crates leave Dunhuang",
      "Two locatable graves; one geographic absence"
    ]
  };

  const copy = {
    zh: {
      "map-aria": "藏经洞与文物流散文学地图",
      "map-teaser": "洞门开，经卷散",
      thesis: "洞门打开，经卷离开敦煌，流散世界。",
      open: "打开档案",
      "rail-caption": "阅读档案",
      "rail-aria": "阅读档案",
      "section-aria": "档案 {n}",
      "notes-keyboard": "↑ ↓ ← → 切换档案 · L 切换语言 · Esc 关闭本面板",
      "data-solid-label": "实线",
      "data-solid": "红色实线表示本篇明确叙述的地点关系。",
      "data-dashed-label": "虚线",
      "data-dashed": "赭色虚线表示法、俄收藏等补充背景，不表示同一条运输路线。",
      "data-wudang-label": "武当山",
      "data-wudang": "仅作为湖北道教文化背景，不是王圆箓的已知行迹。",
      "data-unknown-label": "空白",
      "data-unknown": "蒋孝琬的墓址没有可核验的坐标；地图上的“?”不是任意一点，而是地图无法回答的问题。",
      "data-china-label": "中国近景",
      "data-china": "采用自然资源部标准地图服务的投影底图；故事地点按同一正轴等积割圆锥投影定位（中央经线 110°E，标准纬线 25°N／47°N）。",
      "data-world-label": "世界与欧亚",
      "data-world": "使用 Natural Earth 等距圆柱投影；其中的中国高亮采用 1:10m 的 China point-of-view 版本，以匹配世界底图。",
      "notes-source-1": "中国近景：自然资源部标准地图服务（自助制图拓扑底图）",
      "notes-source-2": "世界与欧亚底图：Natural Earth 1:110m Admin 0 Countries",
      "notes-source-3": "世界视图中的中国高亮：Natural Earth 1:10m Admin 0 Countries",
      "data-disclaimer": "文学阅读地图：连线表达文章的叙事流向，不代表精确运输路线，也不替代测绘或导航信息。本章不把经卷设计成可收集物；主要视觉隐喻是“离开后的空白”。",
      "complete-line": "洞窟仍在敦煌，经卷散落世界。"
    },
    en: {
      "map-aria": "A literary map of the Library Cave and the dispersal of its artifacts",
      "map-teaser": "The door opens; the scrolls scatter",
      thesis: "A cave door opens. The manuscripts leave Dunhuang and scatter across the world.",
      open: "Enter the archive",
      "rail-caption": "Reading the Archive",
      "rail-aria": "Reading the Archive",
      "section-aria": "Record {n}",
      "notes-keyboard": "↑ ↓ ← → switch files · L language · Esc closes this panel",
      "data-solid-label": "Solid",
      "data-solid": "Solid red lines mark relationships stated in the essay.",
      "data-dashed-label": "Dashed",
      "data-dashed": "Ochre dashes add later French and Russian collection context; they do not describe a single transport route.",
      "data-wudang-label": "Wudang",
      "data-wudang": "Shown only as Hubei Taoist context, not a documented journey by Wang.",
      "data-unknown-label": "Gap",
      "data-unknown": "Jiang Xiaowan’s burial place has no verifiable coordinate; the “?” is not an arbitrary point but a question the map cannot answer.",
      "data-china-label": "China close-up",
      "data-china": "Uses the projected base from the Ministry of Natural Resources standard-map service; story locations use the same Albers equal-area conic projection (central meridian 110°E, standard parallels 25°N / 47°N).",
      "data-world-label": "World & Eurasia",
      "data-world": "Natural Earth in an equirectangular projection; the China highlight uses the 1:10m China point-of-view version to match the world base.",
      "notes-source-1": "China close-up: Ministry of Natural Resources standard-map service (self-service mapping topology base)",
      "notes-source-2": "World and Eurasia base: Natural Earth 1:110m Admin 0 Countries",
      "notes-source-3": "China highlight in world views: Natural Earth 1:10m Admin 0 Countries",
      "data-disclaimer": "A literary reading map: connections show the essay’s narrative flow, not exact transport routes, and do not replace survey or navigation information. The chapter does not treat the manuscripts as collectibles; its main image is the blank left behind.",
      "complete-line": "The manuscripts are scattered across the globe."
    }
  };

  // The English EPUB sets each section opening in capitals; show them in sentence case.
  const englishOpenings = new Map([
    ["A RIVER FLOWS ", "A river flows "],
    ["ON JUNE 22, 1900 (", "On June 22, 1900 ("],
    ["THIS OUTCOME ", "This outcome "],
    ["AUREL STEIN ", "Aurel Stein "],
    ["ON OCTOBER 26, 1943, ", "On October 26, 1943, "]
  ]);

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    for (const [opening, replacement] of englishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  const body = document.body;
  const caption = document.querySelector(".map-caption");

  function svgNode(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function setPath(selector, value) {
    document.querySelector(selector)?.setAttribute("d", value);
  }

  function setTransform(selector, point) {
    document.querySelector(selector)?.setAttribute(
      "transform",
      `translate(${point.x} ${point.y})`
    );
  }

  function routePath(start, end, lift = 0) {
    const deltaX = end.x - start.x;
    const controlY = Math.min(start.y, end.y) - lift;
    return [
      `M${start.x},${start.y}`,
      `C${start.x + deltaX * 0.34},${controlY}`,
      `${start.x + deltaX * 0.68},${controlY}`,
      `${end.x},${end.y}`
    ].join(" ");
  }

  function applyGeography() {
    setPath("#world-land", geography.world.landPath);
    setPath("#china-outline", geography.china.outlinePath);
    setPath("#china-provinces", geography.china.provincePath);
    ["hubei", "gansu", "xinjiang"].forEach((province) => {
      setPath(`#china-${province}`, geography.china.highlights[province]);
      const center = geography.china.centers[province];
      const label = document.querySelector(`#label-${province}`);
      const englishLabel = document.querySelector(`#label-${province}-en`);
      [label, englishLabel].forEach((node, index) => {
        node?.setAttribute("x", center.x);
        node?.setAttribute("y", center.y + index * 17);
      });
    });
    ["xizang", "taiwan"].forEach((territory) => {
      const center = geography.china.labels[territory];
      const label = document.querySelector(`#label-${territory}`);
      const englishLabel = document.querySelector(`#label-${territory}-en`);
      [label, englishLabel].forEach((node, index) => {
        node?.setAttribute("x", center.x);
        node?.setAttribute("y", center.y + index * 17);
      });
    });

    const chinaPoints = geography.china.points;
    setTransform("#node-macheng", chinaPoints.macheng);
    setTransform("#node-jiuquan", chinaPoints.jiuquan);
    setTransform("#node-dunhuang-biography", chinaPoints.dunhuang);
    setTransform("#node-wudang", chinaPoints.wudang);
    setPath(
      "#route-macheng-jiuquan",
      routePath(chinaPoints.macheng, chinaPoints.jiuquan, 54)
    );
    setPath(
      "#route-jiuquan-dunhuang",
      routePath(chinaPoints.jiuquan, chinaPoints.dunhuang, 24)
    );
    setPath(
      "#context-macheng-wudang",
      routePath(chinaPoints.macheng, chinaPoints.wudang, 14)
    );

    ["two", "three"].forEach((level) => {
      setPath(`#eurasia-land-${level}`, geography.eurasia.landPath);
      setPath(`#eurasia-china-${level}`, geography.eurasia.highlights.china);
    });
    ["britain", "france", "russia"].forEach((country) => {
      setPath(
        `#eurasia-${country}-two`,
        geography.eurasia.highlights[country]
      );
    });

    const eurasiaPoints = geography.eurasia.points;
    setTransform("#node-kashgar-two", eurasiaPoints.kashgar);
    setTransform("#node-dunhuang-two", eurasiaPoints.dunhuang);
    setTransform("#node-beijing-two", eurasiaPoints.beijing);
    setTransform("#node-london-two", eurasiaPoints.london);
    setTransform("#node-paris-two", eurasiaPoints.paris);
    setTransform("#node-petersburg-two", eurasiaPoints.saintPetersburg);
    setPath(
      "#route-kashgar-dunhuang-two",
      routePath(eurasiaPoints.kashgar, eurasiaPoints.dunhuang, 28)
    );
    setPath(
      "#route-britain-northwest",
      routePath(eurasiaPoints.london, eurasiaPoints.dunhuang, 92)
    );
    setPath(
      "#route-france-northwest",
      routePath(eurasiaPoints.paris, eurasiaPoints.dunhuang, 67)
    );
    setPath(
      "#route-russia-northwest",
      routePath(eurasiaPoints.saintPetersburg, eurasiaPoints.dunhuang, 42)
    );

    setTransform("#node-kashgar-three", eurasiaPoints.kashgar);
    setTransform("#meeting-at-mogao", eurasiaPoints.mogao);
    setPath(
      "#route-kashgar-dunhuang-three",
      routePath(eurasiaPoints.kashgar, eurasiaPoints.mogao, 35)
    );

    ["china", "britain", "france", "russia"].forEach((country) => {
      setPath(
        `#world-${country}-four`,
        geography.world.highlights[country]
      );
    });
    setPath("#world-china-five", geography.world.highlights.china);
    setPath(
      "#world-afghanistan-five",
      geography.world.highlights.afghanistan
    );

    const worldPoints = geography.world.points;
    setTransform("#node-kashgar-four", worldPoints.kashgar);
    setTransform("#node-dunhuang-four", worldPoints.dunhuang);
    setTransform("#node-london-four", worldPoints.london);
    setTransform("#node-paris-four", worldPoints.paris);
    setTransform("#node-petersburg-four", worldPoints.saintPetersburg);
    setPath(
      "#route-kashgar-dunhuang-four",
      routePath(worldPoints.kashgar, worldPoints.dunhuang, 10)
    );
    setPath(
      "#route-dunhuang-london-four",
      routePath(worldPoints.dunhuang, worldPoints.london, 120)
    );
    setPath(
      "#route-dunhuang-paris-four",
      routePath(worldPoints.dunhuang, worldPoints.paris, 76)
    );
    setPath(
      "#route-dunhuang-petersburg-four",
      routePath(worldPoints.dunhuang, worldPoints.saintPetersburg, 45)
    );

    setTransform("#grave-dunhuang-five", worldPoints.dunhuang);
    setTransform("#grave-kabul-five", worldPoints.kabul);
    setPath(
      "#route-dunhuang-kabul-five",
      routePath(worldPoints.dunhuang, worldPoints.kabul, 35)
    );
  }

  // Section IV: twenty-nine crates, built as SVG so each can arrive with its own delay.
  function buildCrates() {
    document.querySelectorAll(".crate-stack").forEach((stack) => {
      stack.replaceChildren();
      for (let index = 0; index < 29; index += 1) {
        const column = index % 6;
        const row = Math.floor(index / 6);
        const x = -88 + column * 31;
        const y = -53 + row * 24;
        const group = svgNode("g", { class: "crate-unit" });
        group.style.setProperty("--crate-delay", `${index * 28}ms`);
        const crate = svgNode("rect", {
          class: "crate",
          x,
          y,
          width: 25,
          height: 17
        });
        const cross = svgNode("path", {
          class: "crate-cross",
          d: `M${x},${y}L${x + 25},${y + 17}M${x + 25},${y}L${x},${y + 17}`
        });
        group.append(crate, cross);
        stack.appendChild(group);
      }
    });
  }

  let language = body.dataset.language || "zh";

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    caption.textContent = captions[language][state.active];
  }

  function onSection(index) {
    body.dataset.readingLevel = String(index + 1);
    caption.textContent = captions[language][index];
  }

  applyGeography();
  buildCrates();

  ChapterShell.init({
    id: "taoist-tower",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender,
    onSection
  });
})();
