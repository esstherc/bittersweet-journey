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
      "data-solid-label": "连线",
      "data-solid": "连线表示本篇叙述的地点关系，不是实测路线。蒋孝琬随斯坦因由喀什前往敦煌，三人在莫高窟相遇；文物流散图仅保留原文提及的大英博物馆方向。",
      "data-unknown-label": "空白",
      "data-unknown": "蒋孝琬的墓址没有可核验的坐标；地图上的“?”不是任意一点，而是地图无法回答的问题。",
      "data-china-label": "投影",
      "data-china": "全章只有一张地图、一种投影：自然资源部标准地图服务底图所用的正轴等积割圆锥投影（中央经线 110°E，标准纬线 25°N／47°N）。五节之间只是把镜头移到不同区域；地名与符号在任何缩放下保持同样大小。",
      "data-world-label": "中国以外",
      "data-world": "其他国家取自 Natural Earth，换算到同一投影后与标准地图对齐。圆锥投影以 110°E 为中心，离中央经线越远越倾斜，所以欧洲看起来向左上偏斜。",
      "notes-source-1": "中国：自然资源部标准地图服务（自助制图拓扑底图），各节共用同一轮廓",
      "notes-source-2": "其他国家：Natural Earth 1:110m Admin 0 Countries，重新投影",
      "notes-source-3": "投影：Albers 正轴等积割圆锥，中央经线 110°E，标准纬线 25°N／47°N，克拉索夫斯基椭球",
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
      "data-solid-label": "Connections",
      "data-solid": "Connections show narrative relationships, not surveyed routes. Jiang accompanied Stein from Kashgar to Dunhuang, where the three met at Mogao. The dispersal map retains only the British Museum destination named in the essay.",
      "data-unknown-label": "Gap",
      "data-unknown": "Jiang Xiaowan’s burial place has no verifiable coordinate; the “?” is not an arbitrary point but a question the map cannot answer.",
      "data-china-label": "Projection",
      "data-china": "The chapter has one map in one projection: the Albers equal-area conic of the Ministry of Natural Resources standard-map base (central meridian 110°E, standard parallels 25°N / 47°N). Each section only moves the camera to a different region; place names and symbols keep the same size at every zoom.",
      "data-world-label": "Beyond China",
      "data-world": "Other countries come from Natural Earth, re-projected into the same projection and aligned with the standard map. A conic projection centred on 110°E leans more the farther it reaches from that meridian, which is why Europe appears tilted.",
      "notes-source-1": "China: Ministry of Natural Resources standard-map service (self-service mapping topology base), the same outline in every section",
      "notes-source-2": "Other countries: Natural Earth 1:110m Admin 0 Countries, re-projected",
      "notes-source-3": "Projection: Albers equal-area conic, central meridian 110°E, standard parallels 25°N / 47°N, Krassovsky ellipsoid",
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


  function svgNode(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  // ---------- one map, one projection ----------
  // Every layer sits on one canvas in the standard map's own projection (Albers equal-area conic,
  // CM 110°E, SP 25°N / 47°N; tools/build_taoist_one_projection.py). Each section moves a single
  // camera to its region; symbols and labels are pinned to map points and keep their screen size.
  const atlas = geography.atlas;
  const points = atlas.points;
  const svg = document.querySelector(".story-map");
  const camera = svg.querySelector(".atlas-camera");
  const levelNames = ["one", "two", "three", "four", "five"];
  const pins = [];

  function setPath(selector, value) {
    document.querySelector(selector)?.setAttribute("d", value);
  }

  function pin(selector, point) {
    const node = typeof selector === "string" ? svg.querySelector(selector) : selector;
    if (node) pins.push({ node, x: point.x, y: point.y });
  }

  // a gentle arc bowed towards north, its height in proportion to its length
  function routePath(start, end, bend = 0.16) {
    const deltaX = end.x - start.x;
    const lift = Math.hypot(deltaX, end.y - start.y) * bend;
    const controlY = Math.min(start.y, end.y) - lift;
    return [
      `M${start.x},${start.y}`,
      `C${start.x + deltaX * 0.34},${controlY}`,
      `${start.x + deltaX * 0.68},${controlY}`,
      `${end.x},${end.y}`
    ].join(" ");
  }

  // Taiwan and the eastern islets are left out of the standard-map outline here
  const mainlandDetail = path => path.match(/M[^M]+/g).filter(ring => {
    const values = ring.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const ringPoints = [];
    for (let i = 0; i < values.length; i += 2) ringPoints.push([values[i], values[i + 1]]);
    return !ringPoints.every(([x, y]) => (x > 620 && y > 510) || (x > 700 && y > 478));
  }).join("");

  function addCountry(level, name, zh, en, point) {
    const layer = svg.querySelector(`.geo-level-${level}`);
    const shape = svgNode("path", { class: `country-highlight ${name}`, d: atlas.highlights[name] });
    layer.querySelector(".country-highlight").before(shape);
    const marker = svgNode("g", { class: "geo-node power-node", id: `node-${name}-${level}` });
    marker.append(svgNode("circle", { class: "power-dot", r: 4 }));
    [["cn", zh], ["en", en]].forEach(([language, title]) => {
      const text = svgNode("text", { x: 10, y: -12, class: `geo-place label-${language}` });
      text.textContent = title;
      marker.append(text);
    });
    layer.append(marker);
    pin(marker, point);
  }

  function buildAtlas() {
    const chinaOutline = mainlandDetail(geography.china.outlinePath);
    setPath("#atlas-land", atlas.land);
    setPath("#china-outline", chinaOutline);
    setPath("#china-provinces", mainlandDetail(geography.china.provincePath));
    ["two", "three"].forEach((level) => setPath(`#eurasia-china-${level}`, chinaOutline));
    ["four", "five"].forEach((level) => setPath(`#world-china-${level}`, chinaOutline));
    ["britain", "france", "russia"].forEach((country) => setPath(`#eurasia-${country}-two`, atlas.highlights[country]));
    setPath("#world-britain-four", atlas.highlights.britain);
    setPath("#world-afghanistan-five", atlas.highlights.afghanistan);

    // I · the stupa: Wang Yuanlu's road from Hubei to Dunhuang
    ["hubei", "gansu"].forEach((province) => {
      setPath(`#china-${province}`, geography.china.highlights[province]);
      [`#label-${province}`, `#label-${province}-en`].forEach((selector) => {
        const label = svg.querySelector(selector);
        label?.setAttribute("x", 0);
        label?.setAttribute("y", 0);
        pin(label, geography.china.centers[province]);
      });
    });
    pin("#node-macheng", points.macheng);
    pin("#node-jiuquan", points.jiuquan);
    pin("#node-dunhuang-biography", points.dunhuang);
    setPath("#route-macheng-jiuquan", routePath(points.macheng, points.jiuquan, 0.3));
    setPath("#route-jiuquan-dunhuang", routePath(points.jiuquan, points.dunhuang, 0.3));

    // II · the opening: the powers in Europe, Kashgar to Dunhuang
    pin("#node-kashgar-two", points.kashgar);
    pin("#node-dunhuang-two", points.dunhuang);
    pin("#node-beijing-two", points.beijing);
    pin("#node-london-two", points.london);
    pin("#node-paris-two", points.paris);
    pin("#node-petersburg-two", points.saintPetersburg);
    setPath("#route-kashgar-dunhuang-two", routePath(points.kashgar, points.dunhuang));
    addCountry("two", "germany", "德国", "Germany", points.germany);

    // III · three men meet at Mogao
    pin("#node-kashgar-three", points.kashgar);
    pin("#meeting-at-mogao", points.mogao);
    setPath("#route-kashgar-dunhuang-three", routePath(points.kashgar, points.mogao));
    addCountry("three", "hungary", "匈牙利", "Hungary", points.hungary);
    addCountry("three", "britain", "英国 · 大英博物馆", "UK · British Museum", points.london);
    addCountry("three", "india", "印度", "India", points.newDelhi);

    // IV · twenty-nine crates leave for London
    pin("#node-kashgar-four", points.kashgar);
    pin("#node-dunhuang-four", points.dunhuang);
    pin("#node-london-four", points.london);
    setPath("#route-kashgar-dunhuang-four", routePath(points.kashgar, points.dunhuang));
    setPath("#route-dunhuang-london-four", routePath(points.dunhuang, points.london, 0.12));

    // V · three graves
    pin("#grave-dunhuang-five", points.dunhuang);
    pin("#grave-kabul-five", points.kabul);
    setPath("#route-dunhuang-kabul-five", routePath(points.dunhuang, points.kabul));

    // label positions around their symbols (guideline L-1)
    const offsets = {
      "#node-london-two": [-12, -24, "end"], "#node-paris-two": [-12, 30, "end"],
      "#node-germany-two": [12, 8, "start"], "#node-britain-three": [10, -48, "start"],
      "#node-hungary-three": [12, 24, "start"], "#node-london-four": [-18, -34, "end"],
      "#node-kashgar-three": [-10, -60, "end"]
    };
    Object.entries(offsets).forEach(([selector, [x, y, anchor]]) => svg.querySelectorAll(`${selector} text`).forEach((node) => {
      node.setAttribute("x", x);
      node.setAttribute("y", y);
      node.setAttribute("text-anchor", anchor);
    }));
    const labelLines = (selector, zh, en) => {
      [["cn", zh], ["en", en]].forEach(([language, lines]) => {
        const text = svg.querySelector(`${selector} .geo-place.label-${language}`) || svg.querySelector(`${selector} .label-${language}`);
        text.replaceChildren(...lines.map((line, index) => {
          const span = svgNode("tspan", { x: text.getAttribute("x"), dy: index ? "1.2em" : 0 });
          span.textContent = line;
          return span;
        }));
      });
    };
    labelLines("#node-britain-three", ["英国", "大英博物馆"], ["UK", "British Museum"]);
    labelLines("#node-london-four", ["伦敦", "大英博物馆"], ["London", "British Museum"]);
    labelLines("#node-kashgar-three", ["喀什"], ["Kashgar"]);
    labelLines("#meeting-at-mogao", ["莫高窟"], ["Mogao Caves"]);
    labelLines("#grave-dunhuang-five", ["敦煌", "王圆箓塔"], ["Dunhuang", "Wang’s stupa"]);
    labelLines("#grave-kabul-five", ["喀布尔", "斯坦因墓"], ["Kabul", "Stein’s grave"]);
    labelLines(".unknown-coordinate", ["蒋孝琬", "墓址未详"], ["Jiang Xiaowan", "Burial place unknown"]);

    const unknown = svg.querySelector(".unknown-coordinate");
    unknown.removeAttribute("transform");
    unknown.prepend(svgNode("rect", { class: "unknown-note-paper" }));
  }

  // The part of the canvas the panel shows: the SVG is letterboxed, and the map runs to its edges.
  function visibleArea() {
    const box = svg.getBoundingClientRect();
    const scale = Math.min(box.width / 1000, box.height / 760) || 1;
    const width = box.width / scale;
    const height = box.height / scale;
    return { x: 500 - width / 2, y: 380 - height / 2, width, height, scale, narrow: box.width < 600 };
  }

  // The crate record and the unknown-grave note are not places: they sit in the panel's lower corners,
  // clear of the land they would otherwise seem to mark.
  // On a small panel they grow less than the pins, so they do not cover the map.
  function placeOverlays() {
    const area = visibleArea();
    const inset = 24 / area.scale;
    const grow = Math.min(pinScale, 1.6);
    svg.querySelector(".overlay-four").setAttribute(
      "transform",
      `translate(${area.x + inset} ${area.y + area.height - inset}) scale(${grow}) translate(-70 -614)`
    );
    svg.querySelector(".overlay-five").setAttribute(
      "transform",
      `translate(${area.x + area.width - inset - 100 * grow} ${area.y + area.height - inset - 84 * grow}) scale(${grow})`
    );
  }

  // A place label on the panel's edge can move to the other side of its symbol (right ↔ left).
  function setSide(node, flipped) {
    node.querySelectorAll(":scope > text").forEach((text) => {
      if (text.dataset.x === undefined) {
        text.dataset.x = text.getAttribute("x") || 0;
        text.dataset.anchor = text.getAttribute("text-anchor") || "start";
      }
      const x = flipped ? -text.dataset.x : Number(text.dataset.x);
      const anchor = flipped ? { start: "end", end: "start" }[text.dataset.anchor] || "middle" : text.dataset.anchor;
      text.setAttribute("x", x);
      text.setAttribute("text-anchor", anchor);
      text.querySelectorAll("tspan[x]").forEach((span) => span.setAttribute("x", x));
    });
    node.classList.toggle("is-flipped", flipped);
  }

  // Each section's region is fitted to what it shows: its pinned places with their labels (which keep
  // their screen size) and its routes (which scale with the map). The largest zoom that keeps all of
  // them inside the panel wins, centred. When the labels are too wide for the panel at any zoom, the
  // places alone are fitted and a label that would leave the panel moves to the other side.
  function frameView(name) {
    const area = visibleArea();
    const pad = (area.narrow ? 12 : 64) / area.scale;
    const box = { x: area.x + pad, y: area.y + pad, width: area.width - 2 * pad, height: area.height - 2 * pad };
    const layer = svg.querySelector(`.geo-level-${name}`);
    const layerPins = pins.filter(({ node }) => layer.contains(node));
    const flippable = layerPins.filter(({ node }) => node.matches(".geo-node, .grave-node"));
    flippable.forEach(({ node }) => setSide(node, false));
    layer.querySelectorAll(".is-crowded").forEach((node) => node.classList.remove("is-crowded"));

    const routes = [];
    layer.querySelectorAll(".biography-route, .northwest-link, .departure-route, .grave-connection").forEach((route) => {
      const b = route.getBBox();
      routes.push({ x: b.x, y: b.y, left: 0, right: 0, top: 0, bottom: 0 });
      routes.push({ x: b.x + b.width, y: b.y + b.height, left: 0, right: 0, top: 0, bottom: 0 });
    });
    const measure = (withLabels) => layerPins.map(({ node, x, y }) => {
      if (!withLabels) return { x, y, left: 0, right: 0, top: 0, bottom: 0 };
      const b = node.getBBox();
      return { x, y, left: b.x * pinScale, right: (b.x + b.width) * pinScale, top: b.y * pinScale, bottom: (b.y + b.height) * pinScale };
    }).concat(routes);
    const extent = (items, k) => ({
      minX: Math.min(...items.map((item) => item.x * k + item.left)),
      maxX: Math.max(...items.map((item) => item.x * k + item.right)),
      minY: Math.min(...items.map((item) => item.y * k + item.top)),
      maxY: Math.max(...items.map((item) => item.y * k + item.bottom))
    });
    const fits = (items, k, room = box) => {
      const e = extent(items, k);
      return e.maxX - e.minX <= room.width && e.maxY - e.minY <= room.height;
    };
    const largestZoom = (items, room = box) => {
      let low = 0.02;
      let high = 2.6;
      if (fits(items, high, room)) return high;
      if (!fits(items, low, room)) return 0;
      for (let step = 0; step < 32; step += 1) {
        const middle = (low + high) / 2;
        if (fits(items, middle, room)) low = middle;
        else high = middle;
      }
      return low;
    };
    const viewFor = (items, k) => {
      const e = extent(items, k);
      return { k, cx: (e.minX + e.maxX) / 2 / k, cy: (e.minY + e.maxY) / 2 / k, sx: box.x + box.width / 2, sy: box.y + box.height / 2 };
    };

    let items = measure(true);
    let k = largestZoom(items);
    if (k) return viewFor(items, k);

    // too wide: fit the places with room for labels at the sides, then flip the labels that spill over
    const side = Math.min(box.width * 0.22, 120 / area.scale);
    const places = measure(false);
    k = largestZoom(places, { width: box.width - 2 * side, height: box.height - 2 * side });
    const view = viewFor(places, k);
    const toScreen = (x) => box.x + box.width / 2 + (x - view.cx) * k;
    flippable.forEach(({ node, x }) => {
      const b = node.getBBox();
      const left = toScreen(x) + b.x * pinScale;
      const right = toScreen(x) + (b.x + b.width) * pinScale;
      if (right > box.x + box.width || left < box.x) setSide(node, true);
    });
    items = measure(true);
    const better = largestZoom(items);
    return better ? viewFor(items, better) : view;
  }

  // Visual hierarchy (guideline H-2): where labels still collide, the country markers and the province
  // names give way: first to the other side of their symbol, then by hiding their text (dots remain).
  function resolveCrowding(name) {
    const layer = svg.querySelector(`.geo-level-${name}`);
    const shown = (text) => getComputedStyle(text).display !== "none" && !text.closest(".is-crowded");
    const rects = (root) => [...(root.matches("text") ? [root] : root.querySelectorAll("text"))].filter(shown).map((text) => text.getBoundingClientRect());
    const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    const crowded = (unit) => {
      const own = rects(unit);
      const others = [...layer.querySelectorAll("text")].filter((text) => shown(text) && !unit.contains(text) && text !== unit).map((text) => text.getBoundingClientRect());
      return own.some((a) => others.some((b) => hit(a, b)));
    };
    // province names first, then the country markers added last (Germany, Hungary, India…)
    [...layer.querySelectorAll(".power-node, .province-label")].reverse().forEach((unit) => {
      if (!crowded(unit)) return;
      if (unit.matches(".geo-node")) {
        const flipped = unit.classList.contains("is-flipped");
        setSide(unit, !flipped);
        if (!crowded(unit)) return;
        setSide(unit, flipped);
      }
      unit.classList.add("is-crowded");
    });
  }

  function drawView(view) {
    camera.setAttribute(
      "transform",
      `translate(${view.sx - view.cx * view.k} ${view.sy - view.cy * view.k}) scale(${view.k})`
    );
    const inverse = pinScale / view.k;
    pins.forEach(({ node, x, y }) => node.setAttribute("transform", `translate(${x} ${y}) scale(${inverse})`));
    svg.style.setProperty("--zoom", view.k);
  }

  let currentView = null;
  let flight = 0;
  // Pins are sized in screen pixels: one map unit is one CSS pixel whatever the panel's size.
  let pinScale = 1;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Flies the camera: the zoom changes on a log scale, so a far zoom-out and a near zoom-in feel alike.
  function moveCamera(name, animate = true) {
    const target = frameView(name);
    pinScale = Math.max(1, 1 / visibleArea().scale);
    placeOverlays();
    cancelAnimationFrame(flight);
    if (!currentView || !animate || reducedMotion.matches) {
      currentView = target;
      drawView(target);
      resolveCrowding(name);
      return;
    }
    const start = currentView;
    const begin = performance.now();
    const duration = 1400;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const lerp = (a, b, t) => a + (b - a) * t;
    const step = (now) => {
      const t = ease(Math.min((now - begin) / duration, 1));
      currentView = {
        k: Math.exp(lerp(Math.log(start.k), Math.log(target.k), t)),
        cx: lerp(start.cx, target.cx, t),
        cy: lerp(start.cy, target.cy, t),
        sx: lerp(start.sx, target.sx, t),
        sy: lerp(start.sy, target.sy, t)
      };
      drawView(currentView);
      if (t < 1) flight = requestAnimationFrame(step);
      else resolveCrowding(name);
    };
    flight = requestAnimationFrame(step);
  }

  const currentLevel = () => levelNames[Number(body.dataset.readingLevel || 1) - 1] || "one";

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

  function fitUnknownNote() {
    const note=document.querySelector('.unknown-coordinate');
    const boxes=[...note.querySelectorAll('circle,text')]
      .filter(node=>getComputedStyle(node).display!=='none')
      .map(node=>node.getBBox());
    const left=Math.min(...boxes.map(b=>b.x)),top=Math.min(...boxes.map(b=>b.y));
    const right=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height));
    const paper=note.querySelector('.unknown-note-paper');
    Object.entries({x:left-4,y:top-4,width:right-left+8,height:bottom-top+8}).forEach(([key,value])=>paper.setAttribute(key,value));
  }
  const scheduleNote=()=>requestAnimationFrame(fitUnknownNote);
  function onSection(index) {
    body.dataset.readingLevel = String(index + 1);
    moveCamera(currentLevel());
    scheduleNote();
  }

  buildAtlas();
  buildCrates();
  moveCamera(currentLevel(), false);
  new ResizeObserver(() => {
    moveCamera(currentLevel(), false);
    scheduleNote();
  }).observe(svg);
  new MutationObserver(scheduleNote).observe(document.querySelector('.unknown-coordinate'),{subtree:true,attributes:true,attributeFilter:['style']});
  document.fonts?.ready.then(scheduleNote);

  ChapterShell.init({
    id: "taoist-tower",
    showReaderLocation: false,
    showReaderProgress: false,
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender: () => {
      moveCamera(currentLevel(), false);
      scheduleNote();
    },
    onSection
  });
})();
