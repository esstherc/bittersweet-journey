(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.MOUNTAIN_RESORT_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  const ui = {
    zh: {
      "map-eyebrow": "第一卷 · 山河",
      "chapter-title": data.zh.title,
      "chapter-subtitle": "一把罗圈椅，坐过一个疲惫的王朝",
      "chair-label": "山岭如椅背 · 面南而坐",
      "mountain-zone": "山区",
      "plain-zone": "平原区",
      "lake-zone": "湖区",
      "palace-zone": "宫殿区 · 正门",
      "outer-temples": "外庙环列 · 山庄在内",
      afterimage: "湖水留下最后的背影",
      "wanshu-title": "万树园 · 英国使团觐见",
      "wanshu-note": "原文事件落点 · 园内方位示意",
      "memory-link": "记忆连接 · 不是同一地点",
      "summer-palace": "北京 · 颐和园",
      "memory-distance": "距承德约179 km · 直线",
      "wang-event": "王国维于此投水 · 1927",
      "chengde-present": "作者此时面对承德湖水",
      "reader-kicker": "承德 · 塞外",
      thesis: "园林没有移动。移动的是看它的时代。",
      open: "绕到山庄背后",
      "opening-kicker": "承德 · 薄暮",
      "opening-line": "在椅背之外，先看见山。",
      "rail-caption": "原文章节",
      "map-data": "地图数据与准确性",
      "data-title": "真实地点与文学分区",
      "data-property-label": "遗产地",
      "data-property": "避暑山庄与周围寺庙，UNESCO中心坐标约40.9875°N、117.9375°E；山庄遗产区611.2公顷。",
      "data-points-label": "地点",
      "data-points": "山庄及六处外庙按WGS 84坐标投影，表达彼此真实方位与距离。",
      "data-zones-label": "分区",
      "data-zones": "西北山地、北部平原、东南湖区依据承德市文物局总体格局绘制；内部轮廓为阅读示意，不是测绘边界。",
      "data-story-label": "叙事",
      "data-story": "“罗圈椅”、闭门和湖中背影来自原文意象，不代表可测量地物。",
      "data-regional-label": "区域轴线",
      "data-regional": "北京、古北口、承德使用地理坐标；木兰围场以官方公布区域范围表达。连线表示北巡空间关系，不是复原的逐段御道。",
      "data-memory-label": "跨城记忆",
      "data-memory": "颐和园使用UNESCO坐标，与承德直线约179公里。王国维事件发生在北京；承德湖面只是作者产生联想的位置。",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或遗产地管理信息。",
      "chengde-source": "承德市文物局",
      "summer-source": "颐和园坐标",
      "mulan-source": "木兰区域",
      "legend-title": "图面语法",
      "legend-point": "坐标地点",
      "legend-area": "区域或简化分区",
      "legend-route": "历史空间关系",
      "legend-literary": "文学意象",
      section: ["一 · 门外", "二 · 椅背", "三 · 万树", "四 · 闭门", "五 · 背影"],
      location: ["历史情绪", "避暑山庄 · 北岭", "万树园 · 外庙", "宫门 · 1861", "湖水 · 1927"],
      status: ["空间框架 · 长城内外", "椅背 · 园林展开", "帝国 · 向外环列", "闭门 · 王朝退场", "背影 · 两座园林"],
      years: ["清代", "1703", "1793", "1861", "1927"],
      finish: "完成本章 · 返回总图",
      "complete-kicker": "一处山河已经显影",
      "complete-line": "一个王朝离开后，山水仍坐在原处。",
      source: "文本：余秋雨《文化苦旅》"
    },
    en: {
      "map-eyebrow": "Book I · Land",
      "chapter-title": data.en.title,
      "chapter-subtitle": "A round-backed chair where an exhausted dynasty rested",
      "chair-label": "The mountains form the chair back · Facing south",
      "mountain-zone": "Hills",
      "plain-zone": "Plain",
      "lake-zone": "Lakes",
      "palace-zone": "Palaces · Main gate",
      "outer-temples": "Temples without · Resort within",
      afterimage: "The lake keeps the last afterimage",
      "wanshu-title": "Wanshu Garden · Macartney embassy",
      "wanshu-note": "Textual location · position diagrammatic",
      "memory-link": "Memory link · Not the same place",
      "summer-palace": "Beijing · Summer Palace",
      "memory-distance": "Approx. 179 km from Chengde · straight-line",
      "wang-event": "Wang Guowei died here · 1927",
      "chengde-present": "The writer is facing the Chengde lake",
      "reader-kicker": "Chengde · Beyond the Wall",
      thesis: "The garden does not move. The age looking at it does.",
      open: "Walk behind the villa",
      "opening-kicker": "Chengde · Twilight",
      "opening-line": "Beyond the chair back, the mountain appears first.",
      "rail-caption": "Original sections",
      "map-data": "Map data & accuracy",
      "data-title": "Measured places, literary zones",
      "data-property-label": "Property",
      "data-property": "The Mountain Resort and its Outlying Temples is centered at approximately 40.9875°N, 117.9375°E. The UNESCO resort property covers 611.2 hectares.",
      "data-points-label": "Places",
      "data-points": "The resort and six outlying temples are projected from WGS 84 coordinates to preserve their relative directions and distances.",
      "data-zones-label": "Zones",
      "data-zones": "The northwest hills, northern plain and southeast lakes follow the overall layout published by the Chengde Cultural Heritage Bureau. Interior outlines are a reading diagram, not a surveyed boundary.",
      "data-story-label": "Narrative",
      "data-story": "The round-backed chair, closing gate and reflected figure are images from the essay, not measurable geographic features.",
      "data-regional-label": "Regional axis",
      "data-regional": "Beijing, Gubeikou and Chengde use geographic coordinates. Mulan is shown as an officially published regional extent. Connecting lines express the northern inspection geography, not a reconstructed turn-by-turn imperial road.",
      "data-memory-label": "Cross-city memory",
      "data-memory": "The Summer Palace uses its UNESCO coordinate and lies approximately 179 km from Chengde in a straight line. Wang Guowei died in Beijing; the Chengde lake is where the writer remembers him.",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or heritage-site management information.",
      "chengde-source": "Chengde Cultural Heritage Bureau",
      "summer-source": "Summer Palace coordinates",
      "mulan-source": "Mulan regional extent",
      "legend-title": "Map grammar",
      "legend-point": "Coordinate anchor",
      "legend-area": "Region or simplified zone",
      "legend-route": "Historical spatial relation",
      "legend-literary": "Literary image",
      section: ["I · Outside", "II · The Chair Back", "III · Ten Thousand Trees", "IV · The Gates Close", "V · Afterimage"],
      location: ["Historical emotion", "North ridge · Mountain Resort", "Wanshu Garden · Outlying temples", "Palace gate · 1861", "Lake · 1927"],
      status: ["Spatial frame · Inside and beyond the Wall", "Chair back · Garden opens", "Empire · Facing outward", "Closed · Dynasty recedes", "Afterimage · Two gardens"],
      years: ["QING", "1703", "1793", "1861", "1927"],
      finish: "Complete chapter · Return to atlas",
      "complete-kicker": "One landscape brought to light",
      "complete-line": "After a dynasty leaves, the mountains and water remain seated.",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture"
    }
  };

  const state = {
    language: window.localStorage.getItem("bittersweet-journey:language") || "zh",
    active: 0,
    open: false,
    dataPanelOpen: false,
    previewLock: false
  };

  const body = document.body;
  const readingCopy = document.querySelector(".reading-copy");
  const sectionButtons = document.querySelector(".section-buttons");
  const railProgress = document.querySelector(".rail-line i");
  const statusNumber = document.querySelector(".status-number");
  const statusLabel = document.querySelector(".status-label");
  const dataButton = document.querySelector(".map-data-button");
  const dataPanel = document.querySelector(".map-data-panel");
  const completeOverlay = document.querySelector(".chapter-complete-overlay");
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const revealLayers = [...document.querySelectorAll(".reveal-layer")];
  let readingSections = [];
  let scrollFrame = null;

  function project([longitude, latitude]) {
    const { west, east, south, north } = geography.extent;
    return {
      x: 90 + ((longitude - west) / (east - west)) * 800,
      y: 690 - ((latitude - south) / (north - south)) * 600
    };
  }

  function projectRegional([longitude, latitude]) {
    const { west, east, south, north } = geography.regional.extent;
    return {
      x: 90 + ((longitude - west) / (east - west)) * 800,
      y: 600 - ((latitude - south) / (north - south)) * 420
    };
  }

  function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function pathFromCoordinates(coordinates, projection) {
    return coordinates
      .map((coordinate, index) => {
        const point = projection(coordinate);
        return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join("");
  }

  function applyRegionalGeography() {
    const regional = geography.regional;
    const group = document.querySelector("#regional-geography");
    group.innerHTML = "";

    const rangeNorthwest = projectRegional([regional.mulanRange.west, regional.mulanRange.north]);
    const rangeSoutheast = projectRegional([regional.mulanRange.east, regional.mulanRange.south]);
    group.appendChild(createSvgElement("rect", {
      class: "mulan-range",
      x: rangeNorthwest.x,
      y: rangeNorthwest.y,
      width: rangeSoutheast.x - rangeNorthwest.x,
      height: rangeSoutheast.y - rangeNorthwest.y,
      rx: 18
    }));

    const route = createSvgElement("path", {
      class: "regional-route",
      d: pathFromCoordinates(regional.imperialRoute, projectRegional)
    });
    const wall = createSvgElement("path", {
      class: "regional-wall",
      d: pathFromCoordinates(regional.greatWall, projectRegional)
    });
    group.append(route, wall);

    const wallMid = projectRegional(regional.greatWall[2]);
    const wallLabel = createSvgElement("text", {
      class: "regional-line-label",
      x: wallMid.x - 48,
      y: wallMid.y + 35
    });
    wallLabel.dataset.regionalFixed = "wall";
    wallLabel.textContent = state.language === "zh" ? "长城" : "Great Wall";
    group.appendChild(wallLabel);

    const offsets = {
      beijing: { x: 14, y: -14, anchor: "start" },
      "summer-palace": { x: -5, y: 35, anchor: "start" },
      gubeikou: { x: 16, y: -16, anchor: "start" },
      chengde: { x: -15, y: -16, anchor: "end" },
      mulan: { x: 15, y: -14, anchor: "start" }
    };

    regional.places.filter((place) => place.id !== "summer-palace").forEach((place) => {
      const point = projectRegional(place.coordinates);
      const offset = offsets[place.id];
      const pointGroup = createSvgElement("g", {
        class: `regional-point ${place.kind}`,
        transform: `translate(${point.x} ${point.y})`
      });
      pointGroup.dataset.regionalPlace = place.id;
      pointGroup.append(
        createSvgElement("circle", { class: "point-halo", r: place.id === "chengde" ? 35 : 26 }),
        ...(place.id === "chengde"
          ? [createSvgElement("circle", { class: "zoom-ring", r: 15 })]
          : []),
        createSvgElement("circle", { class: "point-dot", r: place.id === "chengde" ? 6 : 4.5 })
      );
      const label = createSvgElement("text", {
        x: offset.x,
        y: offset.y,
        "text-anchor": offset.anchor
      });
      label.dataset.regionalLabel = place.id;
      label.textContent = place[state.language];
      pointGroup.appendChild(label);

      group.appendChild(pointGroup);
    });
  }

  function applyGeography() {
    const group = document.querySelector("#geographic-points");
    const resort = geography.places.find((place) => place.id === "resort");
    const resortPoint = project(resort.coordinates);
    const projected = geography.places.map((place) => ({ ...place, point: project(place.coordinates) }));

    const relationGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    projected.filter((place) => place.kind === "temple").forEach((place) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.classList.add("relation");
      line.setAttribute("x1", resortPoint.x);
      line.setAttribute("y1", resortPoint.y);
      line.setAttribute("x2", place.point.x);
      line.setAttribute("y2", place.point.y);
      relationGroup.appendChild(line);
    });
    group.appendChild(relationGroup);

    projected.forEach((place) => {
      const pointGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pointGroup.classList.add("geo-point", place.kind);
      pointGroup.dataset.place = place.id;
      pointGroup.setAttribute("transform", `translate(${place.point.x} ${place.point.y})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", place.kind === "resort" ? "7" : "5");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const labelLeft = ["putuo", "xumi"].includes(place.id);
      const labelY = place.id === "puyou" ? 34 : -9;
      label.setAttribute("x", labelLeft ? "-11" : "11");
      label.setAttribute("y", labelY);
      label.setAttribute("text-anchor", labelLeft ? "end" : "start");
      label.textContent = place[state.language];
      label.dataset.geoLabel = place.id;

      const coordinate = document.createElementNS("http://www.w3.org/2000/svg", "text");
      coordinate.classList.add("geo-coordinate");
      coordinate.setAttribute("x", labelLeft ? "-11" : "11");
      coordinate.setAttribute("y", labelY + 17);
      coordinate.setAttribute("text-anchor", labelLeft ? "end" : "start");
      coordinate.textContent = `${place.coordinates[1].toFixed(4)}°N · ${place.coordinates[0].toFixed(4)}°E`;
      pointGroup.append(circle, label, coordinate);
      group.appendChild(pointGroup);
    });

    const temples = projected.filter((place) => place.kind === "temple").sort((a, b) => a.point.x - b.point.x);
    const arc = temples.map((place, index) => `${index ? "L" : "M"}${place.point.x},${place.point.y}`).join("");
    document.querySelector("#temple-arc").setAttribute("d", arc);
  }

  function updateGeographyLabels() {
    geography.places.forEach((place) => {
      const label = document.querySelector(`[data-geo-label="${place.id}"]`);
      if (label) label.textContent = place[state.language];
    });
    geography.regional.places.forEach((place) => {
      const label = document.querySelector(`[data-regional-label="${place.id}"]`);
      if (label) label.textContent = place[state.language];
    });
    const wallLabel = document.querySelector('[data-regional-fixed="wall"]');
    if (wallLabel) wallLabel.textContent = state.language === "zh" ? "长城" : "Great Wall";
  }

  function renderReadingSections() {
    readingCopy.innerHTML = "";
    data[state.language].sections.forEach((section, sectionIndex) => {
      const element = document.createElement("section");
      element.className = "reading-section";
      element.dataset.sectionIndex = String(sectionIndex);
      element.id = `section-${sectionIndex + 1}`;

      const header = document.createElement("header");
      header.className = "reader-header";
      const headingGroup = document.createElement("div");
      const heading = document.createElement("h2");
      heading.className = "reader-waypoint";
      heading.textContent = ui[state.language].section[sectionIndex];
      const location = document.createElement("p");
      location.className = "reader-location";
      location.textContent = ui[state.language].location[sectionIndex];
      headingGroup.append(heading, location);
      const progress = document.createElement("span");
      progress.className = "reader-progress";
      progress.textContent = `${String(sectionIndex + 1).padStart(2, "0")} / 05`;
      header.append(headingGroup, progress);

      const rule = document.createElement("div");
      rule.className = "reader-rule";
      const sectionBody = document.createElement("div");
      sectionBody.className = "reading-section-body";
      section.paragraphs.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        sectionBody.appendChild(p);
      });
      element.append(header, rule, sectionBody);
      readingCopy.appendChild(element);
    });
    readingSections = [...readingCopy.querySelectorAll(".reading-section")];
  }

  function renderSectionButtons() {
    sectionButtons.innerHTML = "";
    for (let index = 0; index < 5; index += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-button";
      button.dataset.sectionIndex = String(index);
      button.textContent = String(index + 1).padStart(2, "0");
      button.setAttribute("aria-label", `${state.language === "zh" ? "原文章节" : "Original section"} ${index + 1}`);
      button.addEventListener("click", () => goToSection(index));
      sectionButtons.appendChild(button);
    }
  }

  function renderText() {
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    body.dataset.language = state.language;
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const value = ui[state.language][node.dataset.copy];
      if (value && !Array.isArray(value)) node.textContent = value;
    });
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
    renderReadingSections();
    renderSectionButtons();
    updateGeographyLabels();
  }

  function renderMap() {
    const level = state.active + 1;
    body.dataset.readingLevel = String(level);
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= level);
    });
    [...sectionButtons.children].forEach((button) => {
      button.setAttribute("aria-current", String(Number(button.dataset.sectionIndex) === state.active));
    });
    railProgress.style.width = `${(state.active + 1) * 20}%`;
    statusNumber.textContent = ui[state.language].years[state.active];
    statusLabel.textContent = ui[state.language].status[state.active];
    body.style.setProperty("--timeline-progress", `${state.active * 25}%`);
  }

  function openBook() {
    if (state.open) return;
    state.open = true;
    body.classList.add("is-open");
    document.querySelector(".opening-gate").setAttribute("aria-hidden", "true");
  }

  function setActiveSection(index) {
    const next = Math.max(0, Math.min(4, Number(index) || 0));
    if (state.active === next) return;
    const previous = state.active;
    state.active = next;
    if ((previous === 0 && next === 1) || (previous === 1 && next === 0)) {
      body.classList.add("is-scale-transition");
      window.clearTimeout(setActiveSection.scaleTimer);
      setActiveSection.scaleTimer = window.setTimeout(() => {
        body.classList.remove("is-scale-transition");
      }, 1650);
    }
    renderMap();
  }

  function goToSection(index) {
    openBook();
    setActiveSection(index);
    window.requestAnimationFrame(() => {
      readingSections[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateFromScroll() {
    scrollFrame = null;
    if (!state.open || state.previewLock) return;
    const threshold = window.innerHeight * .34;
    let next = 0;
    readingSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= threshold) {
        next = Number(section.dataset.sectionIndex);
      }
    });
    setActiveSection(next);
  }

  function scheduleScrollUpdate() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateFromScroll);
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
  }

  function finishChapter() {
    if (body.classList.contains("is-completing")) return;
    window.localStorage.setItem("bittersweet-journey:mountain-resort:complete", "true");
    window.localStorage.setItem("bittersweet-journey:language", state.language);
    body.classList.add("is-completing");
    completeOverlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "../../index.html?revealed=chengde";
    }, 2800);
  }

  applyRegionalGeography();
  applyGeography();
  renderText();
  renderMap();

  document.querySelector(".open-book").addEventListener("click", openBook);
  document.querySelector(".gate-open").addEventListener("click", openBook);
  document.querySelector(".finish-chapter").addEventListener("click", finishChapter);
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
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      goToSection(Math.min(state.active + 1, 4));
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      goToSection(Math.max(state.active - 1, 0));
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("open") === "1") {
    state.previewLock = true;
    openBook();
    const requested = params.has("section") ? Number(params.get("section")) - 1 : 0;
    setActiveSection(requested);
  }
  if (params.get("data") === "1") toggleDataPanel(true);
})();
