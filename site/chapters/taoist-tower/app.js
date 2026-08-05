(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.TAOIST_TOWER_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  const ui = {
    zh: {
      "map-eyebrow": "第一卷 · 山河",
      "chapter-title": data.zh.title,
      "map-aria": "藏经洞与文物流散文学地图",
      sectionSubtitle: [
        "人物地理 · 从湖北到河西走廊",
        "1900 · 西北考古与全球权力背景",
        "一条可定位的行程，一场发生在洞窟里的相遇",
        "二十九箱离开敦煌",
        "两处可定位的墓，一处地理空白"
      ],
      thesis: "一扇洞门打开，经卷被带离敦煌，散入帝国收藏。",
      open: "打开档案",
      "back-atlas": "总地图",
      "map-note": "地图说明",
      "note-title": "真实投影、文中行程与背景关系",
      "note-body": "中国近景采用自然资源部标准地图服务的投影底图，故事地点按同一正轴等积割圆锥投影定位；世界与欧亚视图使用 Natural Earth 等距圆柱投影。",
      "note-ethics": "红色实线表示本篇明确叙述的地点关系；赭色虚线表示法、俄收藏等补充背景。武当山仅作为湖北道教文化背景，不是王圆箓的已知行迹。",
      "rail-caption": "阅读档案",
      "reader-note": "五份档案对应原文五个编号分节。",
      file: ["档案一 · 塔", "档案二 · 门", "档案三 · 三个人", "档案四 · 二十九箱", "档案五 · 三座墓"],
      location: ["莫高窟门外 · 大泉河", "藏经洞 · 1900年6月22日", "敦煌 · 莫高窟", "敦煌至世界 · 叙事路径", "敦煌 · 喀布尔 · 未知地点"],
      stateName: ["塔", "门", "三个人", "二十九箱", "三座墓"],
      "route-caption": "叙事路径 · 非精确运输路线",
      finish: "完成本章 · 返回总图",
      "complete-kicker": "一条流散路径已经显影",
      "complete-line": "洞窟留在敦煌，文字走向世界。",
      source: "文本：余秋雨《文化苦旅》",
      "source-map": "地图：中国标准地图服务投影底图 · Natural Earth 世界底图"
    },
    en: {
      "map-eyebrow": "Book I · Land",
      "chapter-title": data.en.title,
      "map-aria": "A literary map of the Library Cave and the dispersal of its artefacts",
      sectionSubtitle: [
        "Biography map · From Hubei to the Hexi Corridor",
        "1900 · Northwest archaeology and global power",
        "A locatable journey; a meeting inside the cave",
        "Twenty-nine crates leave Dunhuang",
        "Two locatable graves; one geographic absence"
      ],
      thesis: "A cave opens. Its manuscripts are taken from Dunhuang and dispersed among imperial collections.",
      open: "Open the archive",
      "back-atlas": "Atlas",
      "map-note": "Map note",
      "note-title": "Projected geography, narrated journeys, contextual links",
      "note-body": "The China close-up uses the projected base supplied by the Ministry of Natural Resources standard-map service; story locations use the same Albers equal-area conic projection. World and Eurasia views use Natural Earth in an equirectangular projection.",
      "note-ethics": "Solid red lines mark relationships stated in the essay; ochre dashes add later French and Russian collection context. Wudang is shown only as Hubei Daoist context, not a documented journey by Wang.",
      "rail-caption": "Reading files",
      "reader-note": "The five files preserve the source chapter’s five numbered sections.",
      file: ["File I · The stupa", "File II · The opening", "File III · Three men", "File IV · Twenty-nine crates", "File V · Three graves"],
      location: ["Outside Mogao · Daquan River", "Library Cave · 22 June 1900", "Dunhuang · Mogao Caves", "Dunhuang to the world · Narrative route", "Dunhuang · Kabul · Unknown"],
      stateName: ["The stupa", "The opening", "Three men", "Twenty-nine crates", "Three graves"],
      "route-caption": "Narrative route · Not a verified transport route",
      finish: "Complete chapter · Return to atlas",
      "complete-kicker": "A route of dispersal brought to light",
      "complete-line": "The cave remains in Dunhuang. Its words travel the world.",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture",
      "source-map": "Map: China standard-map projected base · Natural Earth world base"
    }
  };

  const pageParams = new URLSearchParams(window.location.search);
  const requestedLanguage = pageParams.get("lang");
  const state = {
    language: ["zh", "en"].includes(requestedLanguage)
      ? requestedLanguage
      : window.localStorage.getItem("bittersweet-journey:language") || "zh",
    active: 0,
    open: false,
    noteOpen: false,
    previewLock: false
  };

  const englishOpenings = new Map([
    ["A RIVER FLOWS ", "A river flows "],
    ["ON JUNE 22, 1900 (", "On June 22, 1900 ("],
    ["THIS OUTCOME ", "This outcome "],
    ["AUREL STEIN ", "Aurel Stein "],
    ["ON OCTOBER 26, 1943, ", "On October 26, 1943, "]
  ]);

  const body = document.body;
  const readingCopy = document.querySelector(".reading-copy");
  const readerPanel = document.querySelector(".reader-panel");
  const sectionButtons = document.querySelector(".section-buttons");
  const railProgress = document.querySelector(".rail-line i");
  const stateNumber = document.querySelector(".state-number");
  const stateName = document.querySelector(".state-name");
  const mapSubtitle = document.querySelector(".map-subtitle");
  const storyMap = document.querySelector(".story-map");
  const noteButton = document.querySelector(".map-note-button");
  const notePanel = document.querySelector(".map-note-panel");
  const completeOverlay = document.querySelector(".chapter-complete-overlay");
  const finishButton = document.querySelector(".finish-chapter");
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  let readingSections = [];
  let scrollFrame = null;

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

  function buildArchiveMarks() {
    const field = document.querySelector(".manuscript-field");
    for (let index = 0; index < 54; index += 1) {
      const column = index % 9;
      const row = Math.floor(index / 9);
      const width = 28 + ((index * 11) % 19);
      const x = 223 + column * 62 + ((row % 2) * 5);
      const y = 211 + row * 59 + ((column % 3) * 3);
      const manuscript = svgNode("rect", {
        class: "manuscript",
        x,
        y,
        width,
        height: 9 + (index % 3),
        rx: 1
      });
      manuscript.style.animationDelay = `${(index % 14) * 38}ms`;
      field.appendChild(manuscript);
    }

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

  function formatParagraph(paragraph) {
    if (state.language !== "en") return paragraph;
    for (const [opening, replacement] of englishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  function renderReadingSections() {
    readingCopy.innerHTML = "";
    data[state.language].sections.forEach((section, sectionIndex) => {
      const sectionElement = document.createElement("section");
      sectionElement.className = "reading-section";
      sectionElement.id = `reading-section-${sectionIndex + 1}`;
      sectionElement.dataset.sectionIndex = String(sectionIndex);

      const header = document.createElement("header");
      header.className = "reader-header";

      const headingGroup = document.createElement("div");
      const file = document.createElement("h2");
      file.className = "reader-file";
      file.textContent = ui[state.language].file[sectionIndex];
      const location = document.createElement("p");
      location.className = "reader-location";
      location.textContent = ui[state.language].location[sectionIndex];
      headingGroup.append(file, location);

      const progress = document.createElement("span");
      progress.className = "reader-progress";
      progress.textContent = `${String(sectionIndex + 1).padStart(2, "0")} / 05`;
      progress.setAttribute("aria-label", state.language === "zh" ? "阅读进度" : "Reading progress");
      header.append(headingGroup, progress);

      const rule = document.createElement("div");
      rule.className = "reader-rule";
      rule.setAttribute("aria-hidden", "true");

      const sectionBody = document.createElement("div");
      sectionBody.className = "reading-section-body";
      section.paragraphs.forEach((paragraph, paragraphIndex) => {
        const p = document.createElement("p");
        p.textContent = formatParagraph(paragraph);
        p.style.animationDelay = `${Math.min(paragraphIndex * 32, 290)}ms`;
        sectionBody.appendChild(p);
      });

      sectionElement.append(header, rule, sectionBody);
      readingCopy.appendChild(sectionElement);
    });
    readingSections = [...readingCopy.querySelectorAll(".reading-section")];
  }

  function renderText() {
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    body.dataset.language = state.language;
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const value = ui[state.language][node.dataset.copy];
      if (typeof value === "string") node.textContent = value;
    });
    renderReadingSections();
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
    storyMap.setAttribute("aria-label", ui[state.language]["map-aria"]);
    renderMap();
  }

  function renderMap() {
    const level = state.active + 1;
    body.dataset.readingLevel = String(level);
    railProgress.style.width = `${level * 20}%`;
    stateNumber.textContent = String(level).padStart(2, "0");
    stateName.textContent = ui[state.language].stateName[state.active];
    mapSubtitle.textContent = ui[state.language].sectionSubtitle[state.active];
    [...sectionButtons.children].forEach((button, index) => {
      button.setAttribute("aria-current", String(index === state.active));
    });
  }

  function renderSectionButtons() {
    sectionButtons.innerHTML = "";
    for (let index = 0; index < 5; index += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-button";
      button.textContent = String(index + 1).padStart(2, "0");
      button.setAttribute("aria-label", `Section ${index + 1}`);
      button.addEventListener("click", () => goToSection(index));
      sectionButtons.appendChild(button);
    }
  }

  function setActiveSection(index) {
    const nextIndex = Math.max(0, Math.min(4, index));
    if (nextIndex === state.active) return;
    state.active = nextIndex;
    renderMap();
  }

  function openBook() {
    state.open = true;
    body.classList.add("is-open");
    readerPanel.setAttribute("tabindex", "-1");
    window.setTimeout(() => readerPanel.focus({ preventScroll: true }), 650);
  }

  function goToSection(index) {
    const targetIndex = Math.max(0, Math.min(4, index));
    if (!state.open) openBook();
    setActiveSection(targetIndex);
    window.requestAnimationFrame(() => {
      readingSections[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateSectionFromScroll() {
    scrollFrame = null;
    if (!state.open || !readingSections.length || state.previewLock) return;
    const threshold = window.innerHeight * 0.34;
    let nextIndex = 0;
    readingSections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= threshold) nextIndex = index;
    });
    setActiveSection(nextIndex);
  }

  function scheduleScrollUpdate() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateSectionFromScroll);
  }

  function toggleNote(force) {
    state.noteOpen = typeof force === "boolean" ? force : !state.noteOpen;
    body.classList.toggle("note-panel-open", state.noteOpen);
    noteButton.setAttribute("aria-expanded", String(state.noteOpen));
    notePanel.setAttribute("aria-hidden", String(!state.noteOpen));
    if (state.noteOpen) notePanel.querySelector(".close-note").focus();
  }

  function changeLanguage(language) {
    state.language = language;
    window.localStorage.setItem("bittersweet-journey:language", language);
    renderText();
    if (state.open) {
      window.requestAnimationFrame(() => {
        readingSections[state.active]?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }

  function finishChapter() {
    if (body.classList.contains("is-completing")) return;
    window.localStorage.setItem("bittersweet-journey:taoist-tower:complete", "true");
    window.localStorage.setItem("bittersweet-journey:language", state.language);
    body.classList.add("is-completing");
    completeOverlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "../../index.html?revealed=taoist-tower";
    }, 3000);
  }

  applyGeography();
  buildArchiveMarks();
  renderSectionButtons();
  renderText();

  document.querySelector(".open-book").addEventListener("click", openBook);
  finishButton.addEventListener("click", finishChapter);
  noteButton.addEventListener("click", () => toggleNote());
  document.querySelector(".close-note").addEventListener("click", () => toggleNote(false));

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => changeLanguage(button.dataset.language));
  });

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.noteOpen) {
      toggleNote(false);
      noteButton.focus();
      return;
    }
    if (event.key.toLowerCase() === "l") {
      changeLanguage(state.language === "zh" ? "en" : "zh");
      return;
    }
    if (!state.open || event.target.matches("button, a")) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      goToSection(Math.min(state.active + 1, 4));
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      goToSection(Math.max(state.active - 1, 0));
    }
  });

  const previewParams = pageParams;
  if (previewParams.get("open") === "1") {
    state.previewLock = true;
    openBook();
    const requestedSection = previewParams.has("section")
      ? Number(previewParams.get("section")) - 1
      : 0;
    setActiveSection(requestedSection);
  }
  if (previewParams.get("note") === "1") {
    toggleNote(true);
  }
})();
