(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  if (!data) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  const ui = {
    zh: {
      "map-eyebrow": "第一卷 · 山河",
      "chapter-title": data.zh.title,
      "chapter-subtitle": "水，被读出来的形状",
      thesis: "地图并不存在，直到它被阅读。",
      open: "开卷",
      "back-atlas": "总地图",
      sound: "水声",
      "not-scale": "非测绘比例",
      section: ["第一节", "第二节", "第三节", "第四节"],
      location: ["岷江 · 都江堰", "江声 · 鱼嘴", "水理 · 李冰", "青城山 · 伏龙观"],
      finish: "完成本章 · 返回总图",
      "map-quote": "拜水都江堰，问道青城山",
      "complete-kicker": "一处山河已经显影",
      "complete-line": "岷江的水，正在回到中国。",
      source: "文本：余秋雨《文化苦旅》"
    },
    en: {
      "map-eyebrow": "Book I · Land",
      "chapter-title": data.en.title,
      "chapter-subtitle": "The shape of water, read into view",
      thesis: "The map does not exist until it is read.",
      open: "Begin",
      "back-atlas": "Atlas",
      sound: "Water",
      "not-scale": "Not to scale",
      section: ["Section I", "Section II", "Section III", "Section IV"],
      location: ["Min River · Dujiangyan", "The roar · Yuzui", "Water logic · Li Bing", "Qingcheng · Fulong"],
      finish: "Complete chapter · Return to atlas",
      "map-quote": "Pay homage to the water; seek the Way in Qingcheng",
      "complete-kicker": "One landscape brought to light",
      "complete-line": "The Min River is returning to the map.",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture"
    }
  };

  const state = {
    language: window.localStorage.getItem("bittersweet-journey:language") || "zh",
    active: 0,
    open: false
  };

  const readableEnglishOpenings = new Map([
    ["IMAGINE AN ANCESTOR", "Imagine an ancestor"],
    ["BEFORE GOING TO DUJIANGYAN", "Before going to Dujiangyan"],
    ["ALL OF THIS", "All of this"],
    ["I SAW A BRIDGE", "I saw a bridge"]
  ]);

  function formatParagraph(paragraph) {
    if (state.language !== "en") return paragraph;
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

  const readingCopy = document.querySelector(".reading-copy");
  const readerPanel = document.querySelector(".reader-panel");
  const completeOverlay = document.querySelector(".chapter-complete-overlay");
  const sectionButtons = document.querySelector(".section-buttons");
  const finishButton = document.querySelector(".finish-chapter");
  const railProgress = document.querySelector(".rail-line i");
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const revealLayers = [...document.querySelectorAll(".reveal-layer")];
  let readingSections = [];
  let scrollFrame = null;

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
      const sectionLabel = document.createElement("p");
      sectionLabel.className = "reader-section-label";
      sectionLabel.textContent = ui[state.language].section[sectionIndex];
      const location = document.createElement("p");
      location.className = "reader-location";
      location.textContent = ui[state.language].location[sectionIndex];
      headingGroup.append(sectionLabel, location);

      const progress = document.createElement("span");
      progress.className = "reader-progress";
      progress.setAttribute("aria-label", state.language === "zh" ? "阅读进度" : "Reading progress");
      progress.textContent = `${String(sectionIndex + 1).padStart(2, "0")} / 04`;
      header.append(headingGroup, progress);

      const rule = document.createElement("div");
      rule.className = "reader-rule";
      rule.setAttribute("aria-hidden", "true");

      const body = document.createElement("div");
      body.className = "reading-section-body";
      section.paragraphs.forEach((paragraph, paragraphIndex) => {
        const p = document.createElement("p");
        p.textContent = formatParagraph(paragraph);
        p.style.animationDelay = `${Math.min(paragraphIndex * 35, 280)}ms`;
        body.appendChild(p);
      });

      sectionElement.append(header, rule, body);
      readingCopy.appendChild(sectionElement);
    });

    readingSections = [...readingCopy.querySelectorAll(".reading-section")];
  }

  function setText() {
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    document.body.dataset.language = state.language;

    document.querySelectorAll("[data-copy]").forEach((node) => {
      const key = node.dataset.copy;
      const value = ui[state.language][key];
      if (!Array.isArray(value) && value) {
        node.textContent = value;
      }
    });

    renderReadingSections();

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
  }

  function setMap() {
    const revealLevel = state.active + 1;
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= revealLevel);
    });
    railProgress.style.width = `${(revealLevel / 4) * 100}%`;

    [...sectionButtons.children].forEach((button, index) => {
      button.setAttribute("aria-current", String(index === state.active));
    });
  }

  function renderSections() {
    sectionButtons.innerHTML = "";
    for (let index = 0; index < 4; index += 1) {
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
    const nextIndex = Math.max(0, Math.min(3, index));
    if (state.active === nextIndex) return;
    state.active = nextIndex;
    setMap();
  }

  function goToSection(index) {
    const targetIndex = Math.max(0, Math.min(3, index));
    if (!state.open) openBook();
    setActiveSection(targetIndex);
    window.requestAnimationFrame(() => {
      readingSections[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateSectionFromScroll() {
    scrollFrame = null;
    if (!state.open || !readingSections.length) return;

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

  function openBook() {
    state.open = true;
    document.body.classList.add("is-open");
    readerPanel.setAttribute("tabindex", "-1");
    setTimeout(() => readerPanel.focus({ preventScroll: true }), 700);
  }

  function finishChapter() {
    if (document.body.classList.contains("is-completing")) return;
    window.localStorage.setItem("bittersweet-journey:dujiangyan:complete", "true");
    window.localStorage.setItem("bittersweet-journey:language", state.language);
    document.body.classList.add("is-completing");
    completeOverlay.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "../../index.html?revealed=dujiangyan";
    }, 3000);
  }

  applyRealGeography();
  renderSections();
  setText();
  setMap();

  document.querySelector(".open-book").addEventListener("click", openBook);

  finishButton.addEventListener("click", finishChapter);

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      window.localStorage.setItem("bittersweet-journey:language", state.language);
      setText();
      setMap();
      if (state.open) {
        window.requestAnimationFrame(() => {
          readingSections[state.active]?.scrollIntoView({ behavior: "auto", block: "start" });
        });
      }
    });
  });

  document.querySelector(".sound-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const nextValue = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(nextValue));
  });

  document.querySelectorAll("[data-section-target]").forEach((point) => {
    point.addEventListener("click", () => goToSection(Number(point.dataset.sectionTarget)));
  });

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "l") {
      state.language = state.language === "zh" ? "en" : "zh";
      window.localStorage.setItem("bittersweet-journey:language", state.language);
      setText();
      setMap();
      if (state.open) {
        window.requestAnimationFrame(() => {
          readingSections[state.active]?.scrollIntoView({ behavior: "auto", block: "start" });
        });
      }
    }
  });
})();
