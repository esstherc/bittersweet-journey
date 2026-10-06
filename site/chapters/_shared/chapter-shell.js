/*
  Shared chapter shell behavior. Rules: docs/chapter-layout-guideline.md.
  A chapter calls ChapterShell.init({ id, number, data, sections, copy, ... }) and only owns its map.
*/
(() => {
  "use strict";

  const LANGUAGE_KEY = "bittersweet-journey:language";
  const ATLAS_URL = "../../index.html";
  const COMPLETE_DELAY = 4200;

  const SHELL_COPY = {
    zh: {
      "site-title": "山河显影",
      "wordmark-aria": "山河显影，返回中国总地图",
      "curtain-kicker": "第 {n} 章",
      "back-atlas": "总地图",
      source: "文本：余秋雨《文化苦旅》",
      "notes-button": "地图说明与数据来源",
      "notes-title": "地图说明与数据来源",
      "notes-map-title": "如何阅读这幅地图",
      "notes-data-title": "数据与投影",
      "notes-sources-title": "数据来源",
      "notes-disclaimer-title": "声明",
      "notes-keyboard-title": "键盘",
      "notes-keyboard": "↑ ↓ ← → 切换节次 · L 切换语言 · Esc 关闭本面板",
      "close-aria": "关闭",
      "reader-aria": "章节正文",
      "rail-aria": "章节段落",
      "section-aria": "第 {n} 节",
      "progress-aria": "阅读进度",
      "timeline-caption": "时间线",
      "timeline-aria": "历史时间线",
      finish: "完成本章 · 返回总图",
      "rail-caption": "阅读章节",
      "complete-kicker": "一处山河已经显影",
      "preface-title": "说明"
    },
    en: {
      "site-title": "Land, Made Visible",
      "wordmark-aria": "Land, Made Visible — back to the atlas",
      "curtain-kicker": "Chapter {n}",
      "back-atlas": "Atlas",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture",
      "notes-button": "Map notes & sources",
      "notes-title": "Map notes & sources",
      "notes-map-title": "Reading this map",
      "notes-data-title": "Data & projection",
      "notes-sources-title": "Sources",
      "notes-disclaimer-title": "Disclaimer",
      "notes-keyboard-title": "Keyboard",
      "notes-keyboard": "↑ ↓ ← → switch sections · L language · Esc closes this panel",
      "close-aria": "Close",
      "reader-aria": "Chapter text",
      "rail-aria": "Chapter sections",
      "section-aria": "Section {n}",
      "progress-aria": "Reading progress",
      "timeline-caption": "Timeline",
      "timeline-aria": "Historical timeline",
      finish: "Complete chapter · Return to atlas",
      "rail-caption": "Sections",
      "complete-kicker": "One landscape brought to light",
      "preface-title": "Author’s note"
    }
  };

  const pad = (value) => String(value).padStart(2, "0");

  function init(config) {
    const { id, number, data } = config;
    const body = document.body;
    const query = (selector) => document.querySelector(selector);

    const els = {
      mapStage: query(".map-stage"),
      reader: query(".reader-panel"),
      scroll: query(".reader-scroll"),
      copyRoot: query(".reading-copy"),
      curtain: query(".opening-curtain"),
      openButton: query(".open-book"),
      finishButton: query(".finish-chapter"),
      railButtons: query(".section-buttons"),
      railFill: query(".rail-line i"),
      timelineTrack: query(".timeline-track"),
      overlay: query(".chapter-complete-overlay"),
      notesButton: query(".notes-button"),
      notesDrawer: query(".notes-drawer"),
      closeNotes: query(".close-notes"),
      atlasLinks: [...document.querySelectorAll("[data-atlas-link]")],
      languageButtons: [...document.querySelectorAll(".language-switch button[data-language]")]
    };

    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang");
    const state = {
      language: ["zh", "en"].includes(requested)
        ? requested
        : window.localStorage.getItem(LANGUAGE_KEY) || "en",
      active: 0,
      open: false,
      notesOpen: false,
      previewLock: false
    };
    window.localStorage.setItem(LANGUAGE_KEY, state.language);

    let headers = [];
    let scrollFrame = null;
    let programmaticUntil = 0;

    function text(key) {
      if (key === "chapter-title") return data[state.language].title;
      const own = config.copy?.[state.language]?.[key];
      return own !== undefined ? own : SHELL_COPY[state.language][key];
    }

    function fill(template) {
      return String(template).replace("{n}", pad(number));
    }

    /* ---------- rendering ---------- */

    function renderSections() {
      const sections = data[state.language].sections;
      const meta = config.sections?.[state.language] || [];
      const total = sections.length;
      els.copyRoot.innerHTML = "";

      // Optional author's note before the first section (data[language].preface). It is not a section:
      // the rail and the active-section tracking ignore it.
      const preface = data[state.language].preface || [];
      if (preface.length) {
        const aside = document.createElement("aside");
        aside.className = "reader-preface";
        const title = document.createElement("p");
        title.className = "reader-preface-title";
        title.textContent = text("preface-title");
        aside.appendChild(title);
        preface.forEach((paragraph) => {
          const p = document.createElement("p");
          p.textContent = config.formatParagraph ? config.formatParagraph(paragraph, state.language) : paragraph;
          aside.appendChild(p);
        });
        els.copyRoot.appendChild(aside);
      }

      sections.forEach((section, index) => {
        const element = document.createElement("section");
        element.className = "reading-section";
        element.id = `reading-section-${index + 1}`;
        element.dataset.sectionIndex = String(index);

        const header = document.createElement("header");
        header.className = "reader-header";
        const heading = document.createElement("div");
        const label = document.createElement("p");
        label.className = "reader-section-label";
        label.textContent = meta[index]?.label ?? section.label;
        heading.appendChild(label);
        if (meta[index]?.location) {
          const location = document.createElement("p");
          location.className = "reader-location";
          location.textContent = meta[index].location;
          heading.appendChild(location);
        }
        const progress = document.createElement("span");
        progress.className = "reader-progress";
        progress.setAttribute("aria-label", text("progress-aria"));
        progress.textContent = `${pad(index + 1)} / ${pad(total)}`;
        header.append(heading, progress);

        const rule = document.createElement("div");
        rule.className = "reader-rule";
        rule.setAttribute("aria-hidden", "true");

        const bodyEl = document.createElement("div");
        bodyEl.className = "reading-section-body";
        section.paragraphs.forEach((paragraph, paragraphIndex) => {
          const p = document.createElement("p");
          p.textContent = config.formatParagraph
            ? config.formatParagraph(paragraph, state.language)
            : paragraph;
          // 一, 二, 三 ... are bare strokes: as a drop cap they read as a rule, not as the first character.
          if (paragraphIndex === 0 && /^[一二三四五六七八九十〇○]/.test(p.textContent)) p.classList.add("no-dropcap");
          p.style.animationDelay = `${Math.min(paragraphIndex * 35, 280)}ms`;
          bodyEl.appendChild(p);
        });

        element.append(header, rule, bodyEl);
        els.copyRoot.appendChild(element);
      });

      headers = [...els.copyRoot.querySelectorAll(".reader-header")];
      renderRail(total);
      renderTimeline();
    }

    function renderRail(total) {
      const focusedIndex = [...els.railButtons.children].indexOf(document.activeElement);
      els.railButtons.innerHTML = "";
      for (let index = 0; index < total; index += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "section-button";
        button.textContent = pad(index + 1);
        button.setAttribute("aria-label", text("section-aria").replace("{n}", index + 1));
        button.addEventListener("click", () => goToSection(index));
        els.railButtons.appendChild(button);
      }
      updateRail();
      if (focusedIndex >= 0) els.railButtons.children[focusedIndex]?.focus({ preventScroll: true });
    }

    function updateRail() {
      const total = headers.length || 1;
      [...els.railButtons.children].forEach((button, index) => {
        button.setAttribute("aria-current", String(index === state.active));
      });
      els.railFill.style.width = `${((state.active + 1) / total) * 100}%`;
      updateTimeline();
    }

    /* Optional docked timeline in the map panel [M-4]: config.timeline = { zh: [...], en: [...] } */
    function renderTimeline() {
      if (!els.timelineTrack) return;
      const labels = config.timeline?.[state.language] || [];
      els.timelineTrack.style.setProperty("--n", String(labels.length));
      els.timelineTrack.innerHTML = "";
      labels.forEach((label) => {
        const tick = document.createElement("span");
        tick.className = "timeline-tick";
        tick.textContent = label;
        els.timelineTrack.appendChild(tick);
      });
      const fillLine = document.createElement("i");
      fillLine.className = "timeline-fill";
      fillLine.setAttribute("aria-hidden", "true");
      els.timelineTrack.appendChild(fillLine);
      updateTimeline();
    }

    function updateTimeline() {
      if (!els.timelineTrack) return;
      const ticks = els.timelineTrack.querySelectorAll(".timeline-tick");
      ticks.forEach((tick, index) => {
        tick.setAttribute("aria-current", String(index === state.active));
        tick.classList.toggle("is-passed", index <= state.active);
      });
      els.timelineTrack.style.setProperty(
        "--f",
        String(ticks.length > 1 ? state.active / (ticks.length - 1) : 0)
      );
    }

    function applyCopy() {
      const language = state.language;
      document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
      body.dataset.language = language;
      document.title = `${text("site-title")} · ${data[language].title}`;

      document.querySelectorAll("[data-copy]").forEach((node) => {
        const value = text(node.dataset.copy);
        if (typeof value === "string") {
          node.textContent = node.dataset.copy === "curtain-kicker" ? fill(value) : value;
        }
      });
      document.querySelectorAll("[data-aria]").forEach((node) => {
        const value = text(node.dataset.aria);
        if (typeof value === "string") node.setAttribute("aria-label", value);
      });

      els.atlasLinks.forEach((link) => {
        link.href = `${ATLAS_URL}?lang=${language}`;
      });
      els.languageButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.language === language));
      });

      renderSections();
      config.onRender?.(language, state);
    }

    /* ---------- sections ---------- */

    function setActive(index) {
      const next = Math.max(0, Math.min(headers.length - 1, index));
      if (next === state.active && els.railButtons.children.length) {
        updateRail();
        return;
      }
      const previous = state.active;
      state.active = next;
      updateRail();
      config.onSection?.(next, state, previous);
    }

    function updateFromScroll() {
      scrollFrame = null;
      if (!state.open || state.previewLock || performance.now() < programmaticUntil) return;
      const { scrollTop, clientHeight, scrollHeight } = els.scroll;
      let next = 0;
      if (scrollHeight > clientHeight && scrollTop + clientHeight >= scrollHeight - 4) {
        next = headers.length - 1;
      } else {
        headers.forEach((header, index) => {
          if (headerTop(header) <= clientHeight * 0.4) next = index;
        });
      }
      setActive(next);
    }

    // Header position inside the scroll area, measured from real geometry.
    function headerTop(header) {
      return header.getBoundingClientRect().top - els.scroll.getBoundingClientRect().top;
    }

    function scrollToTop(top, instant) {
      const options = { top: Math.max(0, top), behavior: instant ? "instant" : "smooth" };
      if (typeof els.scroll.scrollTo === "function") els.scroll.scrollTo(options);
      else els.scroll.scrollTop = options.top;
    }

    function goToSection(index, { instant = false } = {}) {
      const target = Math.max(0, Math.min(headers.length - 1, index));
      if (!state.open) openBook();
      setActive(target);
      programmaticUntil = performance.now() + (instant ? 50 : 900);
      if (target === 0) scrollToTop(0, instant);
      else if (headers[target]) scrollToTop(els.scroll.scrollTop + headerTop(headers[target]) - 28, instant);
    }

    /* ---------- curtain ---------- */

    function openBook({ immediate = false } = {}) {
      if (state.open) return;
      state.open = true;
      window.JOURNEY_AUDIO?.setAmbience(false);
      if (!immediate) window.JOURNEY_AUDIO?.play('page', .48);
      if (immediate) els.curtain.style.transition = "none";
      body.classList.add("is-open");
      els.curtain.setAttribute("aria-hidden", "true");
      els.curtain.setAttribute("inert", "");
      els.mapStage.removeAttribute("inert");
      els.reader.removeAttribute("inert");
      els.scroll.setAttribute("tabindex", "-1");
      window.setTimeout(() => els.scroll.focus({ preventScroll: true }), immediate ? 0 : 700);
      config.onOpen?.(state);
    }

    /* ---------- notes drawer ---------- */

    function toggleNotes(force, { focus = true } = {}) {
      state.notesOpen = typeof force === "boolean" ? force : !state.notesOpen;
      if (!state.notesOpen) window.JOURNEY_AUDIO?.play('close', .36);
      body.classList.toggle("notes-open", state.notesOpen);
      els.notesButton.setAttribute("aria-expanded", String(state.notesOpen));
      els.notesDrawer.setAttribute("aria-hidden", String(!state.notesOpen));
      if (focus) (state.notesOpen ? els.closeNotes : els.notesButton).focus();
    }

    /* ---------- language ---------- */

    function changeLanguage(language) {
      if (language === state.language) return;
      state.language = language;
      window.localStorage.setItem(LANGUAGE_KEY, language);
      applyCopy();
      if (state.open) goToSection(state.active, { instant: true });
    }

    /* ---------- completion ---------- */

    function finishChapter() {
      if (body.dataset.chapterCompleted === "true") return;
      body.dataset.chapterCompleted = "true";
      body.classList.add("is-completing");
      els.overlay.setAttribute("aria-hidden", "false");
      window.JOURNEY_AUDIO?.play('complete', .58);
      window.localStorage.setItem(`bittersweet-journey:${id}:complete`, "true");
      window.localStorage.setItem(LANGUAGE_KEY, state.language);
      window.setTimeout(() => {
        const destination = `${ATLAS_URL}?revealed=${config.revealId || id}&lang=${state.language}`;
        if (window.LAND_TRANSITION) window.LAND_TRANSITION.navigate(destination);
        else window.location.href = destination;
      }, window.JOURNEY_AUDIO?.enabled ? COMPLETE_DELAY : 1400);
    }

    /* ---------- events ---------- */

    els.languageButtons.forEach((button) => {
      button.addEventListener("click", () => changeLanguage(button.dataset.language));
    });
    els.openButton.addEventListener("click", () => openBook());
    els.finishButton.addEventListener("click", finishChapter);
    els.notesButton.addEventListener("click", () => toggleNotes());
    els.closeNotes.addEventListener("click", () => toggleNotes(false));
    els.scroll.addEventListener(
      "scroll",
      () => {
        if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateFromScroll);
      },
      { passive: true }
    );

    document.addEventListener("click", (event) => {
      if (!state.notesOpen) return;
      if (els.notesDrawer.contains(event.target) || els.notesButton.contains(event.target)) return;
      toggleNotes(false, { focus: false });
    });

    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape" && state.notesOpen) {
        toggleNotes(false);
        return;
      }
      if (event.key.toLowerCase() === "l") {
        changeLanguage(state.language === "zh" ? "en" : "zh");
        return;
      }
      if (!state.open || event.target.closest?.("input, textarea, select, [contenteditable], .notes-drawer")) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        goToSection(state.active + 1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        goToSection(state.active - 1);
      }
    });

    window.addEventListener("pageshow", () => {
      body.classList.remove("is-completing");
      delete body.dataset.chapterCompleted;
      els.overlay.setAttribute("aria-hidden", "true");
    });

    /* ---------- start ---------- */

    applyCopy();
    updateRail();
    config.onSection?.(state.active, state);

    // Keep the local title leaf and paper turn on top of the shared reading shell.
    if (window.CHAPTER_OPENING) {
      window.CHAPTER_OPENING.mount({
        copy: () => ({
          language: state.language,
          number: fill(text("curtain-kicker")),
          title: text("chapter-title"),
          line: text(id === "mountain-resort" ? "reader-note" : "map-teaser"),
          action: text("open")
        }),
        language: changeLanguage,
        enter: () => openBook({ immediate: true }),
        sections: ".reading-copy .reading-section",
        preview: params.get("open") === "1"
      });
    }

    if (params.get("open") === "1") {
      state.previewLock = true;
      openBook({ immediate: true });
      const section = params.has("section") ? Number(params.get("section")) - 1 : 0;
      const align = () => goToSection(Number.isFinite(section) ? section : 0, { instant: true });
      window.requestAnimationFrame(align);
      // Web fonts change line heights after first layout; realign once they are ready.
      if (document.fonts?.ready) document.fonts.ready.then(align);
      window.setTimeout(align, 450);
    } else if (!window.CHAPTER_OPENING) {
      els.openButton.focus({ preventScroll: true });
    }
    if (params.get("notes") === "1") toggleNotes(true, { focus: false });

    return { state, goToSection, openBook, toggleNotes, changeLanguage };
  }

  window.ChapterShell = { init };
})();
