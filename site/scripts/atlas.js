(() => {
  "use strict";

  // Original book numbers remain stable; this edition includes nine chapters.
  const CHAPTER_PLAN = [
    {"id": "my-hometown", "number": 3, "index": "Chapter 03", "title": {"zh": "我的山河", "en": "My Hometown"}},
    {"id": "dujiangyan", "number": 4, "index": "Chapter 04", "title": {"zh": "都江堰", "en": "Dujiangyan Irrigation System"}},
    {"id": "taoist-tower", "number": 5, "index": "Chapter 05", "title": {"zh": "道士塔", "en": "The Taoist Priest’s Tower"}},
    {"id": "mogao-caves", "number": 6, "index": "Chapter 06", "title": {"zh": "莫高窟", "en": "Mogao Caves"}},
    {"id": "secret-spring", "number": 7, "index": "Chapter 07", "title": {"zh": "沙原隐泉", "en": "A Secret Spring in the Sand"}},
    {"id": "yangguan", "number": 8, "index": "Chapter 08", "title": {"zh": "阳关雪", "en": "Snow on the Southern Pass"}},
    {"id": "kashgar", "number": 9, "index": "Chapter 09", "title": {"zh": "西域喀什", "en": "Kashgar in the Western Regions"}},
    {"id": "chengde", "number": 10, "index": "Chapter 10", "title": {"zh": "山庄背影", "en": "The Villa from Behind"}},
    {"id": "fish-tail-lodge", "number": 11, "index": "Chapter 11", "title": {"zh": "鱼尾山屋", "en": "Fish Tail Lodge"}}
  ];
  const STORIES = {
    kashgar: {
      storageKey: "bittersweet-journey:kashgar:complete",
      href: "./chapters/kashgar/index.html?from=atlas",
      number: 9,
      title: { zh: "西域喀什", en: "Kashgar in the Western Regions" },
      clue: { zh: "有人把来世，选在这里。", en: "Where would you live again?" },
      preview: { zh: "如果生命能够重来一次，你愿意生在何处？", en: "If you could live again, where would you choose to be born?" },
      unrevealedEnter: { zh: "循着远方，开卷", en: "Follow the distance" },
      enter: { zh: "进入西域喀什", en: "Enter Kashgar" },
      receipt: { mark: "域", zh: "远方，在这里有了归宿。", en: "Here, the faraway finds a home." }
    },
    dujiangyan: {
      storageKey: "bittersweet-journey:dujiangyan:complete",
      href: "./chapters/dujiangyan/index.html?from=atlas",
      number: 4,
      title: { zh: "都江堰", en: "Dujiangyan" },
      preview: {
        zh: "一项两千多年前的工程，如何让一片平原成为“天府之国”？",
        en: "How did a two-thousand-year-old work of water turn a plain into the Land of Abundance?"
      },
      unrevealedEnter: { zh: "循着水声进入", en: "Follow the water" },
      enter: { zh: "沿岷江进入", en: "Follow the Min River" },
      receipt: {
        mark: "水",
        zh: "岷江的水，在这里成为成都平原。",
        en: "Here, the Min River becomes the Chengdu Plain."
      }
    },
    "secret-spring": {
      storageKey: "bittersweet-journey:secret-spring:complete",
      href: "./chapters/secret-spring/index.html?from=atlas",
      number: 7,
      title: { zh: "沙原隐泉", en: "A Secret Spring in the Sand" },
      preview: {
        zh: "翻过一座真实的沙山，水为什么会藏在最不该有水的地方？",
        en: "Beyond a measured dune, why does water hide where water should not exist?"
      },
      enter: { zh: "沿脚印进入", en: "Follow the footprints" },
      receipt: {
        mark: "泉",
        zh: "鸣沙山后，一弯清泉留在了地图上。",
        en: "Beyond Mingsha Mountain, a crescent of water remains on the map."
      }
    },
    "taoist-tower": {
      storageKey: "bittersweet-journey:taoist-tower:complete",
      href: "./chapters/taoist-tower/index.html?from=atlas",
      number: 5,
      title: { zh: "道士塔", en: "The Taoist Priest’s Tower" },
      preview: {
        zh: "一扇洞门打开以后，里面的文字为什么走向世界？",
        en: "Once a cave door opens, why do its words travel the world?"
      },
      enter: { zh: "沿档案进入", en: "Enter through the archive" },
      receipt: {
        mark: "空",
        zh: "洞窟留在敦煌，文字走向世界。",
        en: "The cave remains in Dunhuang. Its words travel the world."
      }
    },
    chengde: {
      storageKey: "bittersweet-journey:mountain-resort:complete",
      href: "./chapters/mountain-resort/index.html?from=atlas",
      number: 10,
      title: { zh: "山庄背影", en: "The Villa from Behind" },
      preview: {
        zh: "一座塞外园林，如何成为一个王朝由盛转衰的椅背与背影？",
        en: "How does a garden beyond the Wall become both chair back and afterimage of a dynasty?"
      },
      enter: { zh: "绕到山庄背后", en: "Walk behind the villa" },
      receipt: {
        mark: "影",
        zh: "王朝退场后，山水仍坐在原处。",
        en: "After the dynasty recedes, the mountains and water remain seated."
      }
    }
  };
  const body = document.body;
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const availablePoints = [...document.querySelectorAll(".story-point.available, .story-point.primary")];
  const preview = document.querySelector(".chapter-preview");
  const experience = document.querySelector(".atlas-experience");
  const enterButton = document.querySelector(".enter-story");
  const unavailable = document.querySelector(".unavailable-note");
  const receipt = document.querySelector(".reveal-receipt");
  const progressButton = document.querySelector(".atlas-progress");
  const viewStampsButton = document.querySelector(".view-stamps");
  const stampOverlay = document.querySelector(".stamp-overlay");
  const stampClose = document.querySelector(".stamp-close");
  const stampCount = document.querySelector(".stamp-count");
  const stampGrid = document.querySelector(".stamp-grid");
  const pageParams = new URLSearchParams(window.location.search);
  const returning = pageParams.get("revealed");
  const requestedLanguage = pageParams.get("lang");
  let activeStory = STORIES[returning] ? returning : "dujiangyan";
  const orderedStories = CHAPTER_PLAN.map(chapter => [chapter.id, {
    ...STORIES[chapter.id],
    ...chapter
  }]);
  const chapterTotal = CHAPTER_PLAN.length;

  function applyRealGeography() {
    const geography = window.REAL_GEOGRAPHY?.global;
    if (!geography) return;

    document.querySelector("#global-yellow").setAttribute("d", geography.major.yellow);
    document.querySelector("#global-yangtze").setAttribute("d", geography.major.yangtze);

    const secondary = document.querySelector("#global-secondary-rivers");
    secondary.innerHTML = "";
    Object.entries(geography.secondary).forEach(([name, path]) => {
      if (!path) return;
      const river = document.createElementNS("http://www.w3.org/2000/svg", "path");
      river.dataset.river = name;
      river.setAttribute("d", path);
      secondary.appendChild(river);
    });

    ["yellow", "yangtze"].forEach((river) => {
      const position = geography.labels[river];
      ["cn", "en"].forEach((language, index) => {
        const label = document.querySelector(`#global-${river}-label-${language}`);
        label.setAttribute("x", position.x);
        label.setAttribute("y", position.y + index * 15);
      });
    });

    const originalAnchors = {
      kashgar: [118, 327],
      yangguan: [235, 304],
      "secret-spring": [286, 272],
      "taoist-tower": [314, 245],
      dujiangyan: [455, 476],
      chengde: [856, 252],
    };
    Object.entries(originalAnchors).forEach(([name, [x, y]]) => {
      const geographyName = ["secret-spring", "taoist-tower"].includes(name) ? "dunhuang" : name;
      const point = geography.places[geographyName];
      const group = document.querySelector(`[data-story="${name}"]`);
      if (!group) return;
      const offset = name === "taoist-tower" ? { x: 65, y: -58 } : { x: 0, y: 0 };
      group.setAttribute(
        "transform",
        `translate(${point.x - x + offset.x} ${point.y - y + offset.y})`
      );
    });

    const labelOffsets = {
      yangguan: [-72, 34],
      "secret-spring": [14, -28],
    };
    Object.entries(labelOffsets).forEach(([name, [x, y]]) => {
      document.querySelectorAll(`[data-story="${name}"] text`).forEach((label) => {
        label.setAttribute("transform", `translate(${x} ${y})`);
      });
    });

    const silk = document.querySelector(".silk-road");
    const southwest = document.querySelector(".tea-road");
    const kashgar = geography.places.kashgar;
    document.querySelector('.kashgar-memory').setAttribute('transform', `translate(${kashgar.x} ${kashgar.y})`);
    const dunhuang = geography.places.dunhuang;
    const dujiangyan = geography.places.dujiangyan;
    silk.setAttribute(
      "d",
      `M${kashgar.x},${kashgar.y}C${kashgar.x + 64},${kashgar.y - 32} ${dunhuang.x - 65},${dunhuang.y + 10} ${dunhuang.x},${dunhuang.y}`
    );
    southwest.setAttribute(
      "d",
      `M${dujiangyan.x - 116},${dujiangyan.y + 96}C${dujiangyan.x - 78},${dujiangyan.y + 44} ${dujiangyan.x - 28},${dujiangyan.y + 28} ${dujiangyan.x},${dujiangyan.y}`
    );

    const chengdu = geography.places.chengdu;
    document.querySelector("#memory-source").setAttribute("d", geography.secondary.min);
    document.querySelector("#memory-line-main").setAttribute(
      "d",
      `M${dujiangyan.x},${dujiangyan.y}C${dujiangyan.x + 1},${dujiangyan.y + 2} ${chengdu.x - 2},${chengdu.y - 1} ${chengdu.x},${chengdu.y}`
    );
    document.querySelector("#memory-line-a").setAttribute(
      "d",
      `M${dujiangyan.x + 2},${dujiangyan.y + 3}C${dujiangyan.x + 15},${dujiangyan.y - 3} ${dujiangyan.x + 30},${dujiangyan.y - 1} ${dujiangyan.x + 45},${dujiangyan.y + 4}`
    );
    document.querySelector("#memory-line-b").setAttribute(
      "d",
      `M${dujiangyan.x + 3},${dujiangyan.y + 5}C${dujiangyan.x + 18},${dujiangyan.y + 8} ${dujiangyan.x + 33},${dujiangyan.y + 14} ${dujiangyan.x + 50},${dujiangyan.y + 19}`
    );
    document.querySelector("#memory-line-c").setAttribute(
      "d",
      `M${dujiangyan.x + 2},${dujiangyan.y + 5}C${dujiangyan.x + 11},${dujiangyan.y + 15} ${dujiangyan.x + 22},${dujiangyan.y + 25} ${dujiangyan.x + 37},${dujiangyan.y + 32}`
    );
    document.querySelector("#plain-memory").setAttribute(
      "d",
      `M${chengdu.x - 15},${chengdu.y - 12}C${chengdu.x + 12},${chengdu.y - 18} ${chengdu.x + 48},${chengdu.y - 2} ${chengdu.x + 53},${chengdu.y + 21}C${chengdu.x + 23},${chengdu.y + 38} ${chengdu.x - 10},${chengdu.y + 23} ${chengdu.x - 15},${chengdu.y - 12}Z`
    );
    document.querySelector("#chengdu-dot").setAttribute("cx", chengdu.x);
    document.querySelector("#chengdu-dot").setAttribute("cy", chengdu.y);
    ["cn", "en"].forEach((language, index) => {
      const label = document.querySelector(`#chengdu-label-${language}`);
      label.setAttribute("x", chengdu.x + 11);
      label.setAttribute("y", chengdu.y + 4 + index * 15);
    });

    document.querySelector(".secret-spring-memory").setAttribute(
      "transform",
      `translate(${dunhuang.x} ${dunhuang.y})`
    );
    document.querySelector(".taoist-tower-memory").setAttribute(
      "transform",
      `translate(${dunhuang.x + 65} ${dunhuang.y - 58})`
    );
    document.querySelector(".chengde-memory").setAttribute(
      "transform",
      `translate(${geography.places.chengde.x} ${geography.places.chengde.y})`
    );
  }

  const copy = {
    zh: {
      "site-title": "山河显影",
      "document-title": "山河显影 · 文化苦旅阅读地图",
      "view-stamps-aria": "查看已显影的文字印",
      "close-aria": "关闭",
      "stage-aria": "文化苦旅中国故事地图",
      "map-aria": "未完全显影的中国故事地图",
      "point-kashgar-aria": "西域喀什，尚未接入",
      "point-yangguan-aria": "阳关雪，尚未接入",
      "point-secret-spring-aria": "进入沙原隐泉",
      "point-taoist-tower-aria": "进入道士塔",
      "point-dujiangyan-aria": "进入都江堰",
      "point-chengde-aria": "进入山庄背影",
      "point-jiangnan-aria": "江南故事，尚未接入",
      "point-shanghai-aria": "人生故事群，尚未接入",
      kicker: "第 {n} 章 · 山河",
      "progress-label": "已显影",
      "question-line-1": "一部书能够",
      "question-line-2": "照亮多少中国？",
      unavailable: "这处故事仍在等待显影",
      "receipt-title": "一处山河已经显影",
      "receipt-body": "岷江的水，在这里成为成都平原。",
      "cta-message": "地图尚未全部显影，请继续阅读",
      "cta-hint": "滚动／悬停／点击以显影",
      reset: "重置阅读痕迹",
      source: "文本：余秋雨《文化苦旅》",
      "view-stamps": "文字印",
      "stamp-kicker": "已显影文字",
      "stamp-title": "文字印",
      "stamp-desc": "每完成一段旅程，就会留下一枚字的印记。"
    },
    en: {
      "site-title": "Land, Made Visible",
      "document-title": "Land, Made Visible · A Reading Atlas of A Bittersweet Journey",
      "view-stamps-aria": "View the collected word seals",
      "close-aria": "Close",
      "stage-aria": "Story map of China for A Bittersweet Journey Through Culture",
      "map-aria": "A partly revealed story map of China",
      "point-kashgar-aria": "Western Regions, Kashgar — not yet available",
      "point-yangguan-aria": "The Pass, Yangguan — not yet available",
      "point-secret-spring-aria": "Enter A Secret Spring in the Sand",
      "point-taoist-tower-aria": "Enter The Taoist Priest’s Tower",
      "point-dujiangyan-aria": "Enter Dujiangyan",
      "point-chengde-aria": "Enter The Villa from Behind",
      "point-jiangnan-aria": "Home stories in Jiangnan — not yet available",
      "point-shanghai-aria": "Later life stories — not yet available",
      kicker: "Chapter {n} · Land",
      "progress-label": "Revealed",
      "question-line-1": "How much of China",
      "question-line-2": "can one book illuminate?",
      unavailable: "This story is still waiting to be revealed",
      "receipt-title": "One landscape brought to light",
      "receipt-body": "Here, the Min River becomes the Chengdu Plain.",
      "cta-message": "The map is not fully revealed yet, keep reading",
      "cta-hint": "Scroll / hover / click to reveal",
      reset: "Reset reading trace",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture",
      "view-stamps": "Word Seals",
      "stamp-kicker": "Characters Revealed",
      "stamp-title": "Word Seals",
      "stamp-desc": "Each finished journey leaves behind a single character."
    }
  };

  const stampText = {
    zh: { locked: "尚未显影", count: (n, total) => `已集 ${n} / ${total}` },
    en: {
      locked: "Not yet revealed",
      count: (n, total) => `${n} / ${total} collected`
    }
  };

  const state = {
    language: ["zh", "en"].includes(requestedLanguage)
      ? requestedLanguage
      : window.localStorage.getItem("bittersweet-journey:language") || "zh",
    complete: Object.fromEntries(
      Object.entries(STORIES).map(([name, story]) => [
        name,
        window.localStorage.getItem(story.storageKey) === "true"
      ])
    )
  };
  window.localStorage.setItem("bittersweet-journey:language", state.language);

  function renderPreview() {
    const story = STORIES[activeStory];
    preview.querySelector('[data-copy="preview-text"]').textContent = story.preview[state.language];
    const invitation = !state.complete[activeStory] && story.unrevealedEnter
      ? story.unrevealedEnter : story.enter;
    enterButton.querySelector("span").textContent = invitation[state.language];
  }

  function renderReceipt(name) {
    const story = STORIES[name];
    const mark = receipt.querySelector('.receipt-mark');
    mark.replaceChildren();
    mark.classList.toggle('has-seal', name === 'kashgar');
    if (name === 'kashgar') {
      const seal = document.createElement('img');
      seal.src = './chapters/kashgar/assets/seal-kashgar.svg';
      seal.alt = state.language === 'zh' ? '西域喀什章节印记' : 'Kashgar chapter seal';
      mark.append(seal);
    } else mark.textContent = story.receipt.mark;
    receipt.querySelector('strong').textContent = story.receipt[state.language];
  }

  /* ---------- chapter callout: anchored next to the dot ---------- */

  let anchorPoint = null;
  let hideTimer = null;

  function overlapArea(a, b) {
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  }

  // What a dot really occupies on screen: its core (a little padded, it is the click target),
  // its number and its current-language label. The empty glow is ignored.
  function parts(point) {
    const found = [];
    point.querySelectorAll(".point-core, .point-number, .point-clue").forEach((node) => {
      if (getComputedStyle(node).display === "none") return;
      const rect = node.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      const core = node.classList.contains("point-core");
      const pad = core ? 14 : 0;
      found.push({
        core,
        left: rect.left - pad,
        right: rect.right + pad,
        top: rect.top - pad,
        bottom: rect.bottom + pad
      });
    });
    return found;
  }

  // Try every side at a few distances and alignments; keep the placement that hides the least.
  // Close is better, but when the dots are crowded the card may sit farther off, joined by a leader line.
  function positionPreview(point) {
    const host = experience.getBoundingClientRect();
    const core = point.querySelector(".point-core").getBoundingClientRect();
    const cx = core.left + core.width / 2 - host.left;
    const cy = core.top + core.height / 2 - host.top;
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    const near = 28;
    const gaps = [near, near + 44, near + 88, near + 132];
    const shift = 44;
    const margin = 12;
    const minTop = parseFloat(getComputedStyle(experience).paddingTop) + margin;
    const footer = document.querySelector(".atlas-footer").getBoundingClientRect();
    const maxBottom = (footer.top < host.bottom ? footer.top : host.bottom) - host.top - margin;

    const rel = (rect) => ({
      left: rect.left - host.left,
      right: rect.right - host.left,
      top: rect.top - host.top,
      bottom: rect.bottom - host.top
    });
    const weighed = [];
    const cores = [];
    document.querySelectorAll(".story-point").forEach((other) => {
      const own = other === point;
      const quiet = other.classList.contains("quiet");
      parts(other).forEach((part) => {
        const box = rel(part);
        if (part.core) cores.push(box);
        const weight = part.core
          ? (own ? 200 : quiet ? 6 : 60)
          : (own ? 8 : quiet ? 0.6 : 4);
        weighed.push({ box, weight });
      });
    });
    const headline = document.createRange();
    headline.selectNodeContents(document.querySelector(".atlas-intro h1"));
    const intro = [headline, document.querySelector(".cta-callout")].map((node) => rel(node.getBoundingClientRect()));

    const clampX = (x) => Math.min(Math.max(x, margin), host.width - margin - width);
    const clampY = (y) => Math.min(Math.max(y, minTop), maxBottom - height);
    const candidates = [];
    gaps.forEach((gap) => {
      [0, -shift, shift, -shift * 2, shift * 2].forEach((offset) => {
        const x = clampX(cx - width / 2 + offset);
        candidates.push({ side: "below", gap, left: x, top: cy + gap });
        candidates.push({ side: "above", gap, left: x, top: cy - gap - height });
        const y = clampY(cy - height / 2 + offset);
        candidates.push({ side: "left", gap, left: cx - gap - width, top: y });
        candidates.push({ side: "right", gap, left: cx + gap, top: y });
      });
    });

    let best = null;
    candidates.forEach((candidate, order) => {
      const box = {
        left: candidate.left,
        right: candidate.left + width,
        top: candidate.top,
        bottom: candidate.top + height
      };
      const outside =
        Math.max(0, margin - box.left) +
        Math.max(0, box.right - (host.width - margin)) +
        Math.max(0, minTop - box.top) +
        Math.max(0, box.bottom - maxBottom);
      const covered =
        weighed.reduce((sum, item) => sum + overlapArea(box, item.box) * item.weight, 0) +
        intro.reduce((sum, item) => sum + overlapArea(box, item), 0) * 3;
      // the card's button (bottom-left) must never land on a dot: a tap there would enter the wrong chapter
      const button = {
        left: box.left + 8,
        right: box.left + 180,
        top: box.bottom - 46,
        bottom: box.bottom - 6
      };
      const onDot = cores.reduce((sum, item) => sum + overlapArea(button, item), 0) * 400;
      candidate.cost = outside * 1e6 + covered + onDot + (candidate.gap - near) * 30 + order * 0.01;
      if (!best || candidate.cost < best.cost) best = candidate;
    });

    const vertical = best.side === "below" || best.side === "above";
    const tip = vertical ? cx - best.left : cy - best.top;
    const limit = vertical ? width : height;
    preview.dataset.side = best.side;
    preview.style.left = `${Math.round(best.left)}px`;
    preview.style.top = `${Math.round(best.top)}px`;
    preview.style.setProperty("--tip", `${Math.round(Math.min(Math.max(tip, 18), limit - 18))}px`);
    preview.style.setProperty("--lead", `${Math.max(0, best.gap - near)}px`);
  }

  function showPreview(point) {
    window.clearTimeout(hideTimer);
    anchorPoint = point;
    activeStory = point.dataset.story;
    renderPreview();
    positionPreview(point);
    preview.classList.add("is-visible");
  }

  function hidePreview() {
    window.clearTimeout(hideTimer);
    anchorPoint = null;
    preview.classList.remove("is-visible");
  }

  // A short grace period lets the pointer travel from the dot into the card.
  function scheduleHide() {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hidePreview, 260);
  }

  function renderLanguage() {
    body.dataset.language = state.language;
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    document.title = copy[state.language]["document-title"];
    document.querySelectorAll("[data-aria]").forEach((node) => {
      const value = copy[state.language][node.dataset.aria];
      if (value) node.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const value = copy[state.language][node.dataset.copy];
      if (value) node.textContent = value;
    });
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
    renderPreview();
    if (anchorPoint && preview.classList.contains("is-visible")) positionPreview(anchorPoint);
    renderStampGrid();
    if (STORIES[returning]) {
      renderReceipt(returning);
    }
  }

  function renderProgress() {
    body.classList.toggle("dujiangyan-complete", state.complete.dujiangyan);
    body.classList.toggle("secret-spring-complete", state.complete["secret-spring"]);
    body.classList.toggle("taoist-tower-complete", state.complete["taoist-tower"]);
    body.classList.toggle("chengde-complete", state.complete.chengde);
    body.classList.toggle("kashgar-complete", state.complete.kashgar);
    document.querySelector('[data-story="kashgar"]').setAttribute('aria-label', state.complete.kashgar ? (state.language === 'zh' ? '进入西域喀什' : 'Enter Kashgar') : STORIES.kashgar.clue[state.language]);
    availablePoints.forEach(point => {
      const name = point.dataset.story;
      const clue = point.querySelector(`.point-clue.unread.${state.language === 'zh' ? 'cn' : 'en'}`);
      point.setAttribute('aria-label', state.complete[name] ? STORIES[name].enter[state.language] : (clue?.textContent || STORIES[name].preview[state.language]));
    });
    const count = Object.values(state.complete).filter(Boolean).length;
    document.querySelector(".progress-count").textContent = String(count).padStart(2, "0");
    body.classList.toggle("all-revealed", count === chapterTotal);
    renderStampGrid();
  }

  function renderStampGrid() {
    const text = stampText[state.language];
    const unlockedCount = orderedStories.filter(([name]) => state.complete[name]).length;

    stampGrid.innerHTML = orderedStories
      .map(([name, story]) => {
        const unlocked = Boolean(state.complete[name]);
        const title = story.title[state.language];
        const line = unlocked ? story.receipt[state.language] : text.locked;
        const mark = unlocked && name === 'kashgar'
          ? '<img src="./chapters/kashgar/assets/seal-kashgar.svg" alt="" />'
          : unlocked ? story.receipt.mark : "";
        return `
          <div class="stamp-card${unlocked ? " is-unlocked" : ""}">
            <span class="stamp-mark${unlocked && name === 'kashgar' ? ' has-seal' : ''}">${mark}</span>
            <span class="stamp-name">${title}</span>
            <span class="stamp-line">${line}</span>
          </div>
        `;
      })
      .join("");

    stampCount.textContent = text.count(unlockedCount, orderedStories.length);
  }

  function openStampModal() {
    renderStampGrid();
    stampOverlay.hidden = false;
    window.requestAnimationFrame(() => stampOverlay.classList.add("is-visible"));
    document.addEventListener("keydown", onStampKeydown);
    stampClose.focus();
  }

  function closeStampModal() {
    stampOverlay.classList.remove("is-visible");
    document.removeEventListener("keydown", onStampKeydown);
    window.setTimeout(() => {
      stampOverlay.hidden = true;
    }, 260);
    progressButton.focus();
  }

  function onStampKeydown(event) {
    if (event.key === "Escape") closeStampModal();
  }

  function enterStory(storyName = activeStory) {
    activeStory = storyName;
    const url = new URL(STORIES[storyName].href, window.location.href);
    url.searchParams.set("lang", state.language);
    window.LAND_TRANSITION.navigate(url.href);
  }

  function showUnavailable() {
    unavailable.classList.add("is-visible");
    window.clearTimeout(showUnavailable.timer);
    showUnavailable.timer = window.setTimeout(() => {
      unavailable.classList.remove("is-visible");
    }, 1600);
  }

  function onKeyboardActivate(event, action) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      window.localStorage.setItem("bittersweet-journey:language", state.language);
      renderLanguage();
      renderProgress();
    });
  });

  availablePoints.forEach((point) => {
    point.addEventListener("mouseenter", () => showPreview(point));
    point.addEventListener("mouseleave", scheduleHide);
    point.addEventListener("focus", () => showPreview(point));
    point.addEventListener("blur", scheduleHide);
    // A touch tap fires an emulated mouseenter before click, so what the callout looked like
    // *before* the tap is recorded at pointerdown. First tap opens the callout; a second tap
    // on the same dot (or the callout's button) enters the chapter. Mouse clicks always enter.
    let tap = null;
    point.addEventListener("pointerdown", (event) => {
      tap = {
        touch: event.pointerType === "touch",
        wasShowing: anchorPoint === point && preview.classList.contains("is-visible")
      };
    });
    point.addEventListener("click", () => {
      const last = tap;
      tap = null;
      if (last && last.touch && !last.wasShowing) showPreview(point);
      else enterStory(point.dataset.story);
    });
    point.addEventListener("keydown", (event) => {
      onKeyboardActivate(event, () => enterStory(point.dataset.story));
    });
  });
  enterButton.addEventListener("click", () => enterStory(activeStory));

  preview.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
  preview.addEventListener("mouseleave", scheduleHide);
  preview.addEventListener("focusin", () => window.clearTimeout(hideTimer));
  preview.addEventListener("focusout", scheduleHide);
  document.addEventListener("pointerdown", (event) => {
    if (!preview.contains(event.target) && !event.target.closest(".story-point")) hidePreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hidePreview();
  });
  window.addEventListener("resize", () => {
    if (anchorPoint && preview.classList.contains("is-visible")) positionPreview(anchorPoint);
  });

  document.querySelectorAll(".story-point.quiet").forEach((point) => {
    point.addEventListener("click", showUnavailable);
    point.addEventListener("keydown", (event) => onKeyboardActivate(event, showUnavailable));
  });

  receipt.querySelector("button").addEventListener("click", () => {
    body.classList.remove("is-returning");
  });

  window.addEventListener("pageshow", () => {
    body.classList.remove("is-entering");
    hidePreview();
  });

  progressButton.addEventListener("click", openStampModal);
  viewStampsButton.addEventListener("click", openStampModal);
  stampClose.addEventListener("click", closeStampModal);
  stampOverlay.addEventListener("click", (event) => {
    if (event.target === stampOverlay) closeStampModal();
  });

  document.querySelector(".reset-progress").addEventListener("click", () => {
    Object.entries(STORIES).forEach(([name, story]) => {
      window.localStorage.removeItem(story.storageKey);
      state.complete[name] = false;
    });
    body.classList.remove("is-returning");
    ['started', 'scene'].forEach(key => window.localStorage.removeItem(`bittersweet-journey:kashgar:${key}`));
    renderProgress();
    renderPreview();
  });

  applyRealGeography();
  renderLanguage();
  renderProgress();
  if (pageParams.get("stamps") === "1") openStampModal();

  if (STORIES[returning] && state.complete[returning]) {
    renderReceipt(returning);
    body.dataset.returningStory = returning;
    body.classList.add("is-returning");
    window.history.replaceState({}, "", "./index.html");
  }
})();
