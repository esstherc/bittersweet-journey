(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.SECRET_SPRING_GEOGRAPHY;
  const waypointOrder = [1, 0, 2, 3];
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  const ui = {
    zh: {
      "map-eyebrow": "第一卷 · 山河",
      "chapter-title": data.zh.title,
      "chapter-subtitle": "水，藏在不该有水的地方",
      thesis: "先有脚印，然后才有泉。",
      open: "开始攀登",
      "back-atlas": "总地图",
      "map-data": "地图数据与准确性",
      "data-title": "真实地理与文学路径",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 / UTM 46N，地图保持地点、距离与地形的相对关系。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM GLO-30，约30米网格；作为三维沙山的高程基础。",
      "data-features-label": "地物",
      "data-features": "月牙泉、鸣沙山和党河来自 OpenStreetMap，获取于2026年7月24日。",
      "data-region-label": "区域",
      "data-region": "敦煌、莫高窟、榆林窟按真实坐标定位；图中距离为大圆直线距离，不是公路里程。",
      "data-3d-label": "三维",
      "data-3d": "3D沙山直接由DEM高程网格生成，并随阅读切换镜头。",
      "data-route-label": "脚印",
      "data-route": "原文没有可核验的行走坐标。虚线脚印仅表达阅读中的攀登，不是作者的实测路线。",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或景区安全信息。",
      "rail-caption": "阅读路标",
      cameraMode: ["贴近沙脊", "拉远至敦煌石窟带", "向月牙泉下潜", "泉边低空停驻"],
      cameraTech: ["3D terrain · DEM", "Regional positioning · WGS 84", "3D terrain · Camera dive", "3D terrain · Low hold"],
      "reader-note": "四个“路标”用于交互节奏，不是原文编号分节。",
      waypoint: ["路标一 · 脚印", "路标二 · 山脊", "路标三 · 下坡", "路标四 · 隐泉"],
      location: ["鸣沙山北缘", "沙脊 · 夕照", "峰坡 · 月牙泉", "泉边 · 静池"],
      "ridge-quote": "脚印像一条长不可及的绸带",
      finish: "完成本章 · 返回总图",
      "complete-kicker": "一处山河已经显影",
      "complete-line": "荒漠记住了一弯清泉。",
      source: "文本：余秋雨《文化苦旅》",
      "source-map": "地图：Copernicus DEM GLO-30 · OpenStreetMap"
    },
    en: {
      "map-eyebrow": "Book I · Land",
      "chapter-title": data.en.title,
      "chapter-subtitle": "Water, hidden where water should not be",
      thesis: "First the footprints. Then the spring.",
      open: "Begin the climb",
      "back-atlas": "Atlas",
      "map-data": "Map data & accuracy",
      "data-title": "Measured ground, literary path",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 / UTM 46N preserves the relative position, distance and terrain of the mapped features.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM GLO-30 at approximately 30 m spacing provides the elevation basis for the 3D dunes.",
      "data-features-label": "Features",
      "data-features": "Crescent Spring, Mingsha Mountain and the Dang River use OpenStreetMap data retrieved 24 July 2026.",
      "data-region-label": "Region",
      "data-region": "Dunhuang, Mogao and Yulin are positioned by geographic coordinates. Distances shown are great-circle lines, not road distances.",
      "data-3d-label": "3D",
      "data-3d": "The dune mesh is generated directly from the DEM and changes camera with the reading.",
      "data-route-label": "Footsteps",
      "data-route": "The essay gives no verifiable walking coordinates. The dotted footsteps express the literary climb; they are not the author's surveyed route.",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or visitor-safety information.",
      "rail-caption": "Waypoints",
      cameraMode: ["Skimming the dune", "Pulling back to the grottoes", "Diving toward the spring", "Holding low above the water"],
      cameraTech: ["3D terrain · DEM", "Regional positioning · WGS 84", "3D terrain · Camera dive", "3D terrain · Low hold"],
      "reader-note": "These four waypoints pace the interaction; they are not numbered sections in the original essay.",
      waypoint: ["Waypoint 1 · Footprints", "Waypoint 2 · The ridge", "Waypoint 3 · Descent", "Waypoint 4 · The spring"],
      location: ["North edge · Mingsha", "Dune ridge · Sunset", "Slope · Crescent Spring", "Spring edge · Still water"],
      "ridge-quote": "My footsteps are an unimaginably long silk ribbon",
      finish: "Complete chapter · Return to atlas",
      "complete-kicker": "One landscape brought to light",
      "complete-line": "The desert remembers a crescent of water.",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture",
      "source-map": "Map: Copernicus DEM GLO-30 · OpenStreetMap"
    }
  };

  const state = {
    language: window.localStorage.getItem("bittersweet-journey:language") || "zh",
    active: waypointOrder[0],
    open: false,
    dataPanelOpen: false,
    previewLock: false
  };

  function formatParagraph(paragraph) {
    if (state.language !== "en") return paragraph;
    return paragraph.startsWith("ROADS EXIST")
      ? paragraph.replace("ROADS EXIST", "Roads exist")
      : paragraph;
  }

  const body = document.body;
  const readingCopy = document.querySelector(".reading-copy");
  const readerPanel = document.querySelector(".reader-panel");
  const completeOverlay = document.querySelector(".chapter-complete-overlay");
  const sectionButtons = document.querySelector(".section-buttons");
  const railProgress = document.querySelector(".rail-line i");
  const finishButton = document.querySelector(".finish-chapter");
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const revealLayers = [...document.querySelectorAll(".reveal-layer")];
  const dataButton = document.querySelector(".map-data-button");
  const dataPanel = document.querySelector(".map-data-panel");
  let readingSections = [];
  let scrollFrame = null;

  function setPath(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute("d", value);
  }

  function applyGeography() {
    setPath("#mingsha-boundary", geography.paths.mingshaBoundary);
    setPath("#danghe-path", geography.paths.danghe);
    setPath("#spring-lake", geography.paths.lake);
    setPath("#spring-halo", geography.paths.lake);

    const { peak, lake } = geography.points;
    document.querySelector("#peak-ring").setAttribute("cx", peak.x);
    document.querySelector("#peak-ring").setAttribute("cy", peak.y);
    document.querySelector("#peak-mark").setAttribute("transform", `translate(${peak.x} ${peak.y})`);
    ["cn", "en"].forEach((language) => {
      const label = document.querySelector(`#peak-label-${language}`);
      label.setAttribute("x", peak.x + 24);
      label.setAttribute("y", peak.y - 8);
    });

    ["spring-marker", "spring-core", "oasis-ring-a", "oasis-ring-b"].forEach((id) => {
      const node = document.querySelector(`#${id}`);
      node.setAttribute("cx", lake.x);
      node.setAttribute("cy", lake.y);
    });
    ["cn", "en"].forEach((language) => {
      const springLabel = document.querySelector(`#spring-label-${language}`);
      springLabel.setAttribute("x", lake.x + 24);
      springLabel.setAttribute("y", lake.y - 16);
      const oasisNote = document.querySelector(`#oasis-note-${language}`);
      oasisNote.setAttribute("x", lake.x + 50);
      oasisNote.setAttribute("y", lake.y + 54);
    });
  }

  function renderReadingSections() {
    readingCopy.innerHTML = "";
    waypointOrder.forEach((sectionIndex) => {
      const section = data[state.language].sections[sectionIndex];
      const sectionNumber = sectionIndex + 1;
      const sectionElement = document.createElement("section");
      sectionElement.className = "reading-section";
      sectionElement.id = `reading-section-${sectionNumber}`;
      sectionElement.dataset.sectionIndex = String(sectionIndex);

      const header = document.createElement("header");
      header.className = "reader-header";

      const headingGroup = document.createElement("div");
      const waypoint = document.createElement("h2");
      waypoint.className = "reader-waypoint";
      waypoint.textContent = ui[state.language].waypoint[sectionIndex];
      const location = document.createElement("p");
      location.className = "reader-location";
      location.textContent = ui[state.language].location[sectionIndex];
      headingGroup.append(waypoint, location);

      const progress = document.createElement("span");
      progress.className = "reader-progress";
      progress.textContent = `${String(sectionNumber).padStart(2, "0")} / 04`;
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
        p.style.animationDelay = `${Math.min(paragraphIndex * 34, 280)}ms`;
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
      if (!Array.isArray(value) && value) node.textContent = value;
    });

    renderReadingSections();
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
  }

  function renderMap() {
    const level = state.active + 1;
    const orderPosition = waypointOrder.indexOf(state.active);
    body.dataset.readingLevel = String(level);
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= level);
    });
    railProgress.style.width = `${(orderPosition + 1) * 25}%`;
    [...sectionButtons.children].forEach((button) => {
      button.setAttribute("aria-current", String(Number(button.dataset.sectionIndex) === state.active));
    });
    document.querySelector(".camera-mode").textContent = ui[state.language].cameraMode[state.active];
    document.querySelector(".camera-tech").textContent = ui[state.language].cameraTech[state.active];
    window.SECRET_SPRING_TERRAIN_RENDERER?.setState(level);
  }

  function renderSectionButtons() {
    sectionButtons.innerHTML = "";
    waypointOrder.forEach((sectionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-button";
      button.dataset.sectionIndex = String(sectionIndex);
      button.textContent = String(sectionIndex + 1).padStart(2, "0");
      button.setAttribute("aria-label", `Waypoint ${sectionIndex + 1}`);
      button.addEventListener("click", () => goToSection(sectionIndex));
      sectionButtons.appendChild(button);
    });
  }

  function setActiveSection(index) {
    const nextIndex = waypointOrder.includes(index) ? index : waypointOrder[0];
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
    const targetIndex = waypointOrder.includes(index) ? index : waypointOrder[0];
    if (!state.open) openBook();
    setActiveSection(targetIndex);
    window.requestAnimationFrame(() => {
      readingSections
        .find((section) => Number(section.dataset.sectionIndex) === targetIndex)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateSectionFromScroll() {
    scrollFrame = null;
    if (!state.open || !readingSections.length || state.previewLock) return;
    const threshold = window.innerHeight * 0.34;
    let nextIndex = waypointOrder[0];
    let activeSection = readingSections[0];
    readingSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= threshold) {
        nextIndex = Number(section.dataset.sectionIndex);
        activeSection = section;
      }
    });
    setActiveSection(nextIndex);
    if (activeSection) {
      const rect = activeSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (threshold - rect.top) / Math.max(rect.height, 1)));
      window.SECRET_SPRING_TERRAIN_RENDERER?.setProgress(progress);
      body.style.setProperty("--section-progress", progress.toFixed(3));
    }
  }

  function scheduleScrollUpdate() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateSectionFromScroll);
  }

  function toggleDataPanel(force) {
    state.dataPanelOpen = typeof force === "boolean" ? force : !state.dataPanelOpen;
    body.classList.toggle("data-panel-open", state.dataPanelOpen);
    dataButton.setAttribute("aria-expanded", String(state.dataPanelOpen));
    dataPanel.setAttribute("aria-hidden", String(!state.dataPanelOpen));
    if (state.dataPanelOpen) dataPanel.querySelector(".close-data").focus();
  }

  function changeLanguage(language) {
    state.language = language;
    window.localStorage.setItem("bittersweet-journey:language", language);
    renderText();
    renderMap();
    if (state.open) {
      window.requestAnimationFrame(() => {
        readingSections
          .find((section) => Number(section.dataset.sectionIndex) === state.active)
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }

  function finishChapter() {
    if (body.classList.contains("is-completing")) return;
    window.localStorage.setItem("bittersweet-journey:secret-spring:complete", "true");
    window.localStorage.setItem("bittersweet-journey:language", state.language);
    body.classList.add("is-completing");
    completeOverlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "../../index.html?revealed=secret-spring";
    }, 3000);
  }

  applyGeography();
  renderSectionButtons();
  renderText();
  renderMap();

  document.querySelector(".open-book").addEventListener("click", openBook);
  finishButton.addEventListener("click", finishChapter);
  dataButton.addEventListener("click", () => toggleDataPanel());
  document.querySelector(".close-data").addEventListener("click", () => toggleDataPanel(false));

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => changeLanguage(button.dataset.language));
  });

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.dataPanelOpen) {
      toggleDataPanel(false);
      dataButton.focus();
      return;
    }
    if (event.key.toLowerCase() === "l") {
      changeLanguage(state.language === "zh" ? "en" : "zh");
      return;
    }
    if (!state.open || event.target.matches("button, a")) return;
    const orderPosition = waypointOrder.indexOf(state.active);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      goToSection(waypointOrder[Math.min(orderPosition + 1, waypointOrder.length - 1)]);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      goToSection(waypointOrder[Math.max(orderPosition - 1, 0)]);
    }
  });

  const previewParams = new URLSearchParams(window.location.search);
  if (previewParams.get("open") === "1") {
    state.previewLock = true;
    openBook();
    const requestedSection = previewParams.has("section")
      ? Number(previewParams.get("section")) - 1
      : waypointOrder[0];
    setActiveSection(requestedSection);
  }
  if (previewParams.get("data") === "1") {
    toggleDataPanel(true);
  }
})();
