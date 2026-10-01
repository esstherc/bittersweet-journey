(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.REAL_GEOGRAPHY?.global;
  if (!data || !geography || !window.ChapterShell) return;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const params = new URLSearchParams(location.search);
  const journey = $(".journey");
  const tourMap = $('[data-map="tour"]');
  const readerMap = $('[data-map="reader"]');
  const rainToggle = $(".rain-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTRO_KEY = "bittersweet-journey:my-hometown:intro-seen";
  let step = 0;
  let language = "en";
  let bookTransitioning = false;
  let sequenceTimers = [];
  const sceneSteps = { question: 0, books: 1, lines: 2, yellow: 3, "yellow-stories": 4, yangtze: 5 };

  const sections = {
    zh: [
      { label: "一 · 山河之子", location: "从故乡走向山河" },
      { label: "二 · 生存的底色", location: "海 · 沙漠 · 高原" },
      { label: "三 · 三条天地之线", location: "黄河 · 长江 · 降水" },
      { label: "四 · 界线两侧", location: "农耕与游牧" },
      { label: "五 · 向海而望", location: "山河与海洋" }
    ],
    en: [
      { label: "I · Child of the Land", location: "From home to the land" },
      { label: "II · A Place to Live", location: "Sea · Desert · Plateau" },
      { label: "III · Three Great Lines", location: "Rivers · Rainfall" },
      { label: "IV · Across the Line", location: "Farming and herding" },
      { label: "V · Toward the Sea", location: "Land and ocean" }
    ]
  };

  const copy = {
    zh: {
      "map-teaser": "沿三条线，走进山河。",
      thesis: "从地形与降水开始，让一张地图在你手中显影。",
      open: "开始阅读",
      "map-aria": "黄河、长江和降水分界的文学地理图",
      "map-svg-title": "我的山河 · 三条天地之线",
      "map-svg-desc": "黄河和长江使用真实河道数据；降水分界是概念示意。",
      "rail-caption": "原文章节",
      "notes-map": "开场依次练习点选河流、拖动、放大、切换图层和打开章节。正文可滚动阅读，也可点下方节次切换；地图上的线与第 3 节相连。",
      "notes-data": "黄河与长江来自现有全国地图的 Natural Earth 河流数据，采用中国范围 Albers 等积投影。地形色块、长城与约 400 毫米年降水量线为文学示意；没有把长城画成降水边界。",
      "notes-source-1": "文本：余秋雨《文化苦旅》中文版《我的山河》，及现有英文选译。",
      "notes-source-2": "河流：Natural Earth 1:10m rivers，见全站地理数据说明。",
      "notes-source-3": "降水分界：依据原文主题绘制的概念性带状示意，非逐年观测等值线。",
      "notes-source-4": "地图交互与雨量底色：本站原创视觉表达。",
      "notes-disclaimer": "400 毫米是概略的多年平均年降水量界线，位置随资料、年代与表达尺度而变化；农业与游牧也不由单一数值绝对决定。此图用于文学阅读，不用于测绘或行政判断。",
      "complete-line": "三条线留下了山河的底色。"
    },
    en: {
      "map-teaser": "Follow three lines into the land.",
      thesis: "Begin with terrain and rainfall; reveal the map with your own hands.",
      open: "Begin reading",
      "map-aria": "A literary map of the two rivers and the rainfall transition",
      "map-svg-title": "My Hometown · Three lines across the land",
      "map-svg-desc": "The two rivers use mapped geometry; the rainfall transition is conceptual.",
      "rail-caption": "Original sections",
      "notes-map": "The opening introduces selecting a river, dragging, zooming, switching a layer and opening a chapter. Scroll the text or choose a section below. Selecting a line on the map takes you to section three.",
      "notes-data": "The Yellow and Yangtze river paths reuse the atlas's Natural Earth data in a China Albers equal-area projection. Terrain washes, the Great Wall and the roughly 400 mm rainfall transition are literary diagrams.",
      "notes-source-1": "Text: Yu Qiuyu, My Hometown, and the supplied English translation.",
      "notes-source-2": "Rivers: Natural Earth 1:10m rivers; see the atlas geography notes.",
      "notes-source-3": "Rainfall transition: conceptual band based on the chapter, not an observed annual contour.",
      "notes-source-4": "Map interactions and rainfall wash: original site design.",
      "notes-disclaimer": "The 400 mm annual rainfall threshold is approximate. Its location and meaning change with data and time. Farming and herding do not follow a single absolute line. This literary map is not for survey or administrative use.",
      "complete-line": "Three lines leave their trace upon the land."
    }
  };

  const openingCopy = {
    zh: {
      linesQuote: "在严严实实的封闭结构中，中华文化拥有三条最大的天地之线，那也可以说是中华文化的基本经纬。",
      linesSecond: "按照重要程度排列，第一条线是黄河；第二条线是长江；",
      linesThird: "第三条线比较复杂，在前两条的北方，是四百毫米降雨量的分界线，也就是区分农耕文明和游牧文明的天地之线。",
      yellowIndex: "第一条线 · 黄河",
      yellowQuote: "“……黄河，我几乎从源头一步步走到了入海口。现在的入海口是山东东营……”",
      yellowStoriesIndex: "沿黄河 · 行走与寻根",
      yellowBirth: "“正是在黄河流域，我找到了黄帝轩辕氏的出生地。”",
      yellowThinkers: "“我用最多时间，在黄河流域寻找先秦诸子的足迹，并把他们与同龄的印度、希腊、波斯的哲人们进行对比。”",
      yangtzeIndex: "第二条线 · 长江",
      migration: "“由于气候变化，从那个寒冷的西晋时期开始，中华文化随着仓皇的人群一起向南方迁移，向长江迁移。”",
      yangtzeQuote: "“自宋代之后，中国的文化、经济中心已从黄河流域转到了长江流域。中心难免人多，因此又有不少人南行。到近代，南方气象渐成，一批推进历史的人物便从珠江边站起。”",
      enter: "阅读原文"
    },
    en: {
      linesQuote: "In its firmly enclosed structure, Chinese culture possesses three major lines—the essential latitude and longitude of its culture.",
      linesSecond: "The first is the Yellow River; the second is the Yangtze River.",
      linesThird: "The third lies north of both: the boundary of 400 millimetres of rainfall, dividing agricultural and nomadic civilizations.",
      yellowIndex: "THE FIRST LINE · YELLOW RIVER",
      yellowQuote: "“I nearly walked from the Yellow River’s source to its estuary, step by step. Its current estuary is in Dongying, Shandong.”",
      yellowStoriesIndex: "ALONG THE YELLOW RIVER",
      yellowBirth: "“In the Yellow River basin, I found the birthplace of the Yellow Emperor.”",
      yellowThinkers: "“I spent the greatest amount of time tracing the pre-Qin scholars, comparing them with their contemporaries in India, Greece and Persia.”",
      yangtzeIndex: "THE SECOND LINE · YANGTZE",
      migration: "“From the cold Western Jin onward, Chinese culture moved south with frightened crowds—to the Yangtze.”",
      yangtzeQuote: "“Since the Song dynasty, China’s cultural and economic centre has moved from the Yellow River to the Yangtze. By modern times, figures advancing history rose from the Pearl River.”",
      enter: "Read the chapter"
    }
  };

  const smallCopy = {
    zh: { rain: "降水图层", home: "全图", replay: "重看开场 ↗", coord: "中国 · 文学地理示意", yellow: "黄河", yangtze: "长江", coach: "继续阅读，地图会随段落展开。点正文里的地名，可以在地图上找到它。", dismiss: "知道了", caption: ["地形，是故事的第一层底色。", "从四面观察这片土地。", "黄河与长江构成两条水线。", "雨量分界与长城在部分地段接近。", "两侧的相遇与交融。", "把目光转向海洋。"] },
    en: { rain: "Rainfall layer", home: "Overview", replay: "Replay opening ↗", coord: "China · literary geography", yellow: "Yellow River", yangtze: "Yangtze", coach: "Keep reading. The map will unfold with each section. Select a place in the text to find it on the map.", dismiss: "Got it", caption: ["Terrain is the first layer of the story.", "See the land from its edges.", "Two great rivers cross the map.", "The rainfall transition and wall approach in places.", "The two sides meet and blend.", "Look toward the ocean."] }
  };

  $$('[data-river="yellow"]').forEach((path) => path.setAttribute("d", geography.major.yellow));
  $$('[data-river="yangtze"]').forEach((path) => path.setAttribute("d", geography.major.yangtze));

  function mountAtlasBasemap() {
    const atlas = window.ATLAS_PHYSICAL;
    const root = $(".atlas-prologue-physical");
    if (!atlas || !root) return;
    const ns = "http://www.w3.org/2000/svg";
    const make = (tag, attrs, parent = root) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([name, value]) => node.setAttribute(name, value));
      parent.append(node);
      return node;
    };
    make("rect", { x: -500, y: -500, width: 2500, height: 2000, class: "prologue-atlas-sea" });
    make("path", { d: atlas.land, class: "prologue-atlas-land", "fill-rule": "evenodd" });
    const regions = make("g", { class: "prologue-atlas-regions", filter: "url(#prologue-wash)" });
    atlas.regions.forEach((feature) => {
      make("path", { d: feature.d, class: `prologue-atlas-region region-${feature.kind}` }, regions);
      if (feature.kind === "desert") make("path", { d: feature.d, fill: "url(#prologue-sand)", opacity: ".55" }, regions);
    });
    const relief = make("g", { class: "prologue-atlas-relief" });
    atlas.hachures.forEach((d, index) => make("path", { d, class: `prologue-atlas-hachure weight-${index}` }, relief));
    atlas.contours.forEach((feature) => make("path", { d: feature.d, class: "prologue-atlas-contour" }, relief));
    const water = make("g", { class: "prologue-atlas-water" });
    atlas.rivers.forEach((feature) => make("path", { d: feature.d, class: "prologue-atlas-stream" }, water));
    atlas.lakes.forEach((feature) => make("path", { d: feature.d, class: "prologue-atlas-lake" }, water));

    const majorRivers = {
      yellow: geography.major.yellow,
      yangtze: geography.major.yangtze
    };
    Object.entries(majorRivers).forEach(([river, pathData]) => {
      const riverRoot = $(`[data-tour-river="${river}"]`);
      if (!riverRoot) return;
      riverRoot.replaceChildren();
      make("path", { d: pathData, class: "prologue-river-segment" }, riverRoot);
    });
    const yellowLabel = $(".prologue-yellow-label");
    const yangtzeLabel = $(".prologue-yangtze-label");
    if (yellowLabel) { yellowLabel.setAttribute("x", geography.labels.yellow.x); yellowLabel.setAttribute("y", geography.labels.yellow.y); }
    if (yangtzeLabel) { yangtzeLabel.setAttribute("x", geography.labels.yangtze.x); yangtzeLabel.setAttribute("y", geography.labels.yangtze.y); }
  }
  mountAtlasBasemap();

  function readSeen() { try { return localStorage.getItem(INTRO_KEY) === "true"; } catch { return false; } }
  function markSeen() { try { localStorage.setItem(INTRO_KEY, "true"); } catch {} }

  const camera = new WeakMap();
  const cameraFrames = new WeakMap();
  const overview = () => ({ x: 120, y: 65, w: 960, h: 608 });
  function getCamera(svg) {
    if (!camera.has(svg)) camera.set(svg, overview());
    return camera.get(svg);
  }
  function setCamera(svg) {
    const c = getCamera(svg);
    c.w = Math.max(480, Math.min(1200, c.w));
    c.h = c.w * 760 / 1200;
    c.x = Math.max(0, Math.min(1200 - c.w, c.x));
    c.y = Math.max(0, Math.min(760 - c.h, c.y));
    svg.setAttribute("viewBox", `${c.x} ${c.y} ${c.w} ${c.h}`);
  }
  function zoom(svg, direction) {
    const c = getCamera(svg);
    const nextW = Math.max(480, Math.min(1200, c.w * (direction === "in" ? 0.72 : 1 / 0.72)));
    const ratio = nextW / c.w;
    c.x += c.w * (1 - ratio) / 2;
    c.y += c.h * (1 - ratio) / 2;
    c.w = nextW;
    setCamera(svg);
  }
  function home(svg) { camera.set(svg, overview()); setCamera(svg); }

  function moveCamera(svg, target) {
    const oldFrame = cameraFrames.get(svg);
    if (oldFrame) cancelAnimationFrame(oldFrame);
    if (reduced) { camera.set(svg, { ...target }); setCamera(svg); return; }
    const from = { ...getCamera(svg) };
    const start = performance.now();
    const duration = 900;
    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      camera.set(svg, {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
        w: from.w + (target.w - from.w) * eased,
        h: from.h + (target.h - from.h) * eased
      });
      setCamera(svg);
      if (progress < 1) cameraFrames.set(svg, requestAnimationFrame(frame));
      else cameraFrames.delete(svg);
    }
    cameraFrames.set(svg, requestAnimationFrame(frame));
  }

  function makeDraggable(svg, onDragged) {
    let start = null;
    svg.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const oldFrame = cameraFrames.get(svg);
      if (oldFrame) cancelAnimationFrame(oldFrame);
      cameraFrames.delete(svg);
      const c = getCamera(svg);
      start = { px: event.clientX, py: event.clientY, x: c.x, y: c.y, moved: false };
      svg.setPointerCapture(event.pointerId);
    });
    svg.addEventListener("pointermove", (event) => {
      if (!start) return;
      const c = getCamera(svg);
      const rect = svg.getBoundingClientRect();
      const dx = event.clientX - start.px;
      const dy = event.clientY - start.py;
      if (Math.hypot(dx, dy) > 20) start.moved = true;
      c.x = start.x - dx * c.w / rect.width;
      c.y = start.y - dy * c.h / rect.height;
      setCamera(svg);
    });
    const end = () => {
      if (start?.moved) onDragged?.();
      start = null;
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("wheel", (event) => {
      event.preventDefault();
      zoom(svg, event.deltaY < 0 ? "in" : "out");
    }, { passive: false });
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value;
  }

  function renderOpening() {
    const text = openingCopy[language];
    const labels = smallCopy[language];
    journey.dataset.step = String(step);
    $$(".opening-scene").forEach((scene, index) => {
      const active = index === step;
      scene.setAttribute("aria-hidden", String(!active));
      scene.toggleAttribute("inert", !active);
    });
    $$(".journey-progress i").forEach((item, index) => item.classList.toggle("is-done", index <= step));
    $("[data-skip-tour]").textContent = "Skip prologue ↗";
    $(".journey-map-coordinate").textContent = labels.coord;
    setText("[data-lines-quote]", text.linesQuote);
    setText("[data-lines-second]", text.linesSecond);
    setText("[data-lines-third]", text.linesThird);
    setText("[data-yellow-index]", text.yellowIndex);
    setText("[data-yellow-quote]", text.yellowQuote);
    setText("[data-yellow-stories-index]", text.yellowStoriesIndex);
    setText("[data-yellow-birth]", text.yellowBirth);
    setText("[data-yellow-thinkers]", text.yellowThinkers);
    setText("[data-yangtze-index]", text.yangtzeIndex);
    setText("[data-migration-quote]", text.migration);
    setText("[data-yangtze-quote]", text.yangtzeQuote);
    setText("[data-enter-copy]", text.enter);
    $$('[data-atlas-en]').forEach((element) => { element.textContent = element.dataset[language === "zh" ? "atlasZh" : "atlasEn"]; });
    $$(".journey .rain-label, .hometown-map .rain-label").forEach(el => el.textContent = language === "en" ? "≈ 400 mm" : "约 400 mm");
    $$(".journey .yellow-label, .hometown-map .yellow-label").forEach(el => el.textContent = labels.yellow);
    $$(".journey .yangtze-label, .hometown-map .yangtze-label").forEach(el => el.textContent = labels.yangtze);
  }

  function clearSequenceTimers() {
    sequenceTimers.forEach(window.clearTimeout);
    sequenceTimers = [];
    journey.classList.remove("scene-departing");
  }

  function scheduleAutoAdvance() {
    clearSequenceTimers();
    const sequence = {
      [sceneSteps.lines]: { next: sceneSteps.yellow, hold: reduced ? 1400 : 6500 },
      [sceneSteps.yellow]: { next: sceneSteps["yellow-stories"], hold: reduced ? 1800 : 6000 },
      [sceneSteps["yellow-stories"]]: { next: sceneSteps.yangtze, hold: reduced ? 2200 : 8500 }
    }[step];
    if (!sequence) return;
    const fade = reduced ? 0 : 900;
    sequenceTimers.push(window.setTimeout(() => journey.classList.add("scene-departing"), Math.max(0, sequence.hold - fade)));
    sequenceTimers.push(window.setTimeout(() => advance(sequence.next), sequence.hold));
  }

  function revealRiver(river) {
    const path = $(`[data-tour-river="${river}"] .prologue-river-segment`);
    if (!path) return;
    path.getAnimations().forEach((animation) => animation.cancel());
    const startOpacity = river === "yellow" ? 0.18 : 0.3;
    const startWidth = river === "yellow" ? 2.2 : 1.4;
    const finish = () => {
      path.style.opacity = "1";
      path.style.strokeWidth = "3.4px";
    };
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
    path.style.opacity = String(startOpacity);
    path.style.strokeWidth = `${startWidth}px`;
    if (reduced) { finish(); return; }
    void path.getBoundingClientRect();
    const animation = path.animate([
      { opacity: startOpacity, strokeWidth: `${startWidth}px` },
      { opacity: 1, strokeWidth: "3.4px" }
    ], { duration: 1600, easing: "cubic-bezier(.2,.72,.18,1)", fill: "forwards" });
    animation.addEventListener("finish", () => { finish(); animation.cancel(); }, { once: true });
  }

  function advance(next) {
    if (step >= next) return;
    clearSequenceTimers();
    step = next;
    const riverToReveal = next === sceneSteps.yellow
      ? "yellow"
      : next === sceneSteps.yangtze ? "yangtze" : "";
    renderOpening();
    if (!reduced) {
      journey.classList.remove("step-arriving");
      void journey.offsetWidth;
      journey.classList.add("step-arriving");
    }
    if (riverToReveal) {
      if (riverToReveal === "yangtze") {
        const yellow = $('[data-tour-river="yellow"] .prologue-river-segment');
        if (yellow) { yellow.style.opacity = ".32"; yellow.style.strokeWidth = "1.8px"; }
      }
      const reveal = () => revealRiver(riverToReveal);
      if (reduced) reveal();
      else requestAnimationFrame(() => requestAnimationFrame(reveal));
    }
    scheduleAutoAdvance();
  }

  function playBookTransition(button, nextLanguage) {
    if (bookTransitioning) return;
    bookTransitioning = true;
    journey.classList.add("book-transitioning");

    if (reduced) {
      shell.changeLanguage(nextLanguage);
      advance(sceneSteps.lines);
      bookTransitioning = false;
      journey.classList.remove("book-transitioning");
      return;
    }

    const scene = $(".scene-books");
    const cover = button.querySelector(".book-cover");
    const rect = cover.getBoundingClientRect();
    scene.classList.add("is-choosing");
    $$("[data-book-language]").forEach((choice) => {
      choice.disabled = true;
      choice.classList.toggle("is-chosen", choice === button);
      choice.classList.toggle("is-dismissed", choice !== button);
    });

    const portal = document.createElement("div");
    portal.className = `book-portal book-portal-${nextLanguage}`;
    portal.setAttribute("aria-hidden", "true");
    Object.assign(portal.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
    const targetHeight = Math.min(462, window.innerHeight * 0.62, window.innerWidth * 0.75 * 238 / 170);
    portal.style.setProperty("--portal-target-h", `${targetHeight}px`);
    portal.style.setProperty("--portal-target-w", `${targetHeight * 170 / 238}px`);

    const paper = document.createElement("span");
    paper.className = "book-portal-paper";
    const pages = document.createElement("span");
    pages.className = "book-portal-pages";
    const leafOne = document.createElement("span");
    leafOne.className = "book-portal-leaf leaf-one";
    const leafTwo = document.createElement("span");
    leafTwo.className = "book-portal-leaf leaf-two";
    const portalCover = cover.cloneNode(true);
    portalCover.classList.add("book-portal-cover");
    portal.append(paper, pages, leafOne, leafTwo, portalCover);
    journey.append(portal);

    requestAnimationFrame(() => portal.classList.add("is-centering"));
    window.setTimeout(() => portal.classList.add("is-flipping"), 760);
    window.setTimeout(() => portal.classList.add("is-filling"), 1650);
    window.setTimeout(() => {
      shell.changeLanguage(nextLanguage);
      advance(sceneSteps.lines);
      portal.classList.add("is-leaving");
    }, 2450);
    window.setTimeout(() => {
      portal.remove();
      bookTransitioning = false;
      journey.classList.remove("book-transitioning");
    }, 3200);
  }

  function enterReader({ skipped = false } = {}) {
    clearSequenceTimers();
    markSeen();
    journey.hidden = true;
    journey.setAttribute("inert", "");
    shell.openBook({ immediate: true });
    if (!skipped) {
      $(".reader-coach").hidden = false;
      window.setTimeout(() => { $(".reader-coach").hidden = true; }, 9000);
    }
  }

  const shell = window.ChapterShell.init({
    id: "my-hometown", number: 3, data, sections, copy,
    onRender(nextLanguage, state) {
      language = nextLanguage;
      renderOpening();
      updateReaderMap(state.active);
      const labels = smallCopy[language];
      $("[data-rain-toggle]").textContent = labels.rain;
      $("[data-map-home]").textContent = labels.home;
      $("[data-replay-tour]").textContent = labels.replay;
      $("[data-reader-coach]").textContent = labels.coach;
      $("[data-dismiss-coach]").textContent = labels.dismiss;
    },
    onSection(index) { updateReaderMap(index); }
  });

  // The prologue opens in English unless the URL explicitly requests a language.
  if (!params.has("lang") && (!readSeen() || params.get("tour") === "1")) shell.changeLanguage("en");

  function updateReaderMap(index) {
    const chapterSection = Math.max(0, Math.min(5, index));
    readerMap.dataset.section = String(chapterSection);
    const labels = smallCopy[language];
    $("[data-map-caption]").textContent = labels.caption[chapterSection];
    if (chapterSection >= 2) readerMap.classList.add("rivers-visible");
    else readerMap.classList.remove("rivers-visible");
    if (chapterSection >= 3) readerMap.classList.add("wall-visible");
    else readerMap.classList.remove("wall-visible");
  }

  makeDraggable(readerMap);
  $$('[data-next]').forEach(button => button.addEventListener("click", () => {
    const next = sceneSteps[button.dataset.next];
    if (Number.isFinite(next)) advance(next);
  }));
  $$('[data-book-language]').forEach(button => button.addEventListener("click", () => {
    const nextLanguage = button.dataset.bookLanguage;
    if (nextLanguage === "en" || nextLanguage === "zh") playBookTransition(button, nextLanguage);
  }));
  $("[data-enter-reader]").addEventListener("click", () => enterReader());
  $("[data-skip-tour]").addEventListener("click", () => enterReader({ skipped: true }));
  $("[data-dismiss-coach]").addEventListener("click", () => { $(".reader-coach").hidden = true; });
  $(".section-buttons").addEventListener("click", () => { $(".reader-coach").hidden = true; });
  $(".map-zoom-in").addEventListener("click", () => zoom(readerMap, "in"));
  $(".map-zoom-out").addEventListener("click", () => zoom(readerMap, "out"));
  $("[data-map-home]").addEventListener("click", () => home(readerMap));
  rainToggle.addEventListener("click", () => {
    const on = !readerMap.classList.contains("rain-on");
    readerMap.classList.toggle("rain-on", on);
    rainToggle.setAttribute("aria-pressed", String(on));
  });
  $("[data-replay-tour]").addEventListener("click", () => {
    const url = new URL(location.href);
    url.searchParams.delete("open");
    url.searchParams.set("tour", "1");
    url.searchParams.set("lang", language);
    location.href = url.href;
  });
  $$('[data-map="reader"] .river, [data-map="reader"] .rain-line').forEach(path => {
    path.setAttribute("role", "button");
    path.setAttribute("tabindex", "0");
    path.setAttribute("aria-label", language === "zh" ? "阅读三条天地之线" : "Read about the three great lines");
    const select = () => shell.goToSection(2);
    path.addEventListener("click", select);
    path.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }
    });
  });

  if (params.get("open") === "1" || (readSeen() && params.get("tour") !== "1")) {
    journey.hidden = true;
    journey.setAttribute("inert", "");
    if (params.get("open") !== "1") shell.openBook({ immediate: true });
  } else {
    journey.hidden = false;
    journey.removeAttribute("inert");
    $(".opening-curtain").setAttribute("aria-hidden", "true");
    $(".opening-curtain").setAttribute("inert", "");
    $(".scene-question .opening-link").focus({ preventScroll: true });
  }
  renderOpening();
})();
