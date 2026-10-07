(() => {
  "use strict";

  // Original book numbers remain stable; this edition includes nine chapters.
  const CHAPTER_PLAN = [
    {"id": "my-hometown", "number": 3, "index": "Chapter 03", "title": {"zh": "我的山河", "en": "My Hometown"}},
    {"id": "dujiangyan", "number": 4, "index": "Chapter 04", "title": {"zh": "都江堰", "en": "Dujiangyan"}},
    {"id": "taoist-tower", "number": 5, "index": "Chapter 05", "title": {"zh": "道士塔", "en": "The Taoist Priest’s Tower"}},
    {"id": "mogao-caves", "number": 6, "index": "Chapter 06", "title": {"zh": "莫高窟", "en": "Mogao Caves"}},
    {"id": "secret-spring", "number": 7, "index": "Chapter 07", "title": {"zh": "沙原隐泉", "en": "A Secret Spring in the Sand"}},
    {"id": "yangguan", "number": 8, "index": "Chapter 08", "title": {"zh": "阳关雪", "en": "Snow on the Southern Pass"}},
    {"id": "kashgar", "number": 9, "index": "Chapter 09", "title": {"zh": "西域喀什", "en": "Kashgar in the Western Regions"}},
    {"id": "chengde", "number": 10, "index": "Chapter 10", "title": {"zh": "山庄背影", "en": "The Villa from Behind"}},
    {"id": "fish-tail-lodge", "number": 11, "index": "Chapter 11", "title": {"zh": "鱼尾山屋", "en": "Fish Tail Lodge"}}
  ];
  const STORIES = {
    "my-hometown": {
      storageKey: "bittersweet-journey:my-hometown:complete",
      href: "./chapters/my-hometown/index.html?from=atlas",
      number: 3,
      title: { zh: "我的山河", en: "My Hometown" },
      preview: { zh: "沿黄河、长江与雨的痕迹，重新认识这片土地。", en: "Follow the Yellow River, the Yangtze, and the traces of rain to see this land anew." },
      enter: { zh: "沿三条线进入", en: "Follow the three lines" },
      receipt: { mark: "河", zh: "三条线留下了山河的底色。", en: "Three lines leave their trace upon the land." },
      seal: "./chapters/my-hometown/assets/seal-my-hometown.svg?v=20260930"
    },
    kashgar: {
      storageKey: "bittersweet-journey:kashgar:complete",
      href: "./chapters/kashgar/index.html?from=atlas",
      number: 9,
      title: { zh: "西域喀什", en: "Kashgar in the Western Regions" },
      clue: { zh: "有人把来世，选在这里。", en: "Someone chose to be reborn here." },
      preview: { zh: "如果生命能够重来一次，你愿意生在何处？", en: "If life could begin again, where would you choose to be born?" },
      unrevealedEnter: { zh: "循着远方，开卷", en: "Follow the far horizon" },
      enter: { zh: "进入西域喀什", en: "Enter Kashgar" },
      receipt: { mark: "域", zh: "远方，在这里有了归宿。", en: "Here, the faraway comes home." },
      seal: "./chapters/kashgar/assets/seal-kashgar.svg?v=81b3b06a7520"
    },
    yangguan: {
      storageKey: "bittersweet-journey:yangguan:complete",
      href: "./chapters/yangguan/index.html?from=atlas",
      number: 8,
      title: { zh: "阳关雪", en: "Snow on the Southern Pass" },
      preview: {
        zh: "不只是一座关。",
        en: "The search is for more than a pass."
      },
      unrevealedEnter: { zh: "循着诗句，踏雪出发", en: "Follow the poem into the snow" },
      enter: { zh: "再上阳关", en: "Return to the pass" },
      receipt: {
        mark: "雪",
        zh: "风雪掩故关，唐音犹在纸。",
        en: "Snow buries the ancient pass, yet the echoes of the Tang Dynasty linger on the page."
      },
      seal: "./chapters/yangguan/assets/seal-yangguan.svg?v=08a8a94e3ec9"
    },
    "mogao-caves": {
      storageKey: "bittersweet-journey:mogao-caves:complete",
      href: "./chapters/mogao-caves/index.html?from=atlas",
      number: 6,
      title: { zh: "莫高窟", en: "Mogao Caves" },
      preview: {
        zh: "争战之外，仍有人在这里留下善意。",
        en: "Beyond war, people still left acts of devotion here."
      },
      unrevealedEnter: { zh: "走进洞窟", en: "Enter the caves" },
      enter: { zh: "再进莫高窟", en: "Return to the caves" },
      receipt: {
        mark: "窟",
        zh: "千年不枯的笑容，延伸到整个世界。",
        en: "A smile that has not withered for a thousand years, reaching across the world."
      },
      seal: "./chapters/mogao-caves/assets/seal-mogao-caves.svg?v=c44eb9e1e8f9"
    },
    "fish-tail-lodge": {
      storageKey: "bittersweet-journey:fish-tail-lodge:complete",
      href: "./chapters/fish-tail-lodge/index.html?from=atlas",
      number: 11,
      title: { zh: "鱼尾山屋", en: "Fish Tail Lodge" },
      preview: {
        zh: "走遍古文明遗址之后，在雪峰下回望中国。",
        en: "After walking among ancient ruins, look back toward China beneath snow peaks."
      },
      unrevealedEnter: { zh: "推门看雪峰", en: "Open the door to the peaks" },
      enter: { zh: "回到鱼尾山屋", en: "Return to the lodge" },
      receipt: {
        mark: "归",
        zh: "惟告别，方领悟。",
        en: "Only in departure do we truly begin to comprehend it."
      },
      seal: "./chapters/fish-tail-lodge/assets/seal-fish-tail-lodge.svg?v=f19fcbe77db2"
    },
    dujiangyan: {
      storageKey: "bittersweet-journey:dujiangyan:complete",
      href: "./chapters/dujiangyan/index.html?from=atlas",
      number: 4,
      title: { zh: "都江堰", en: "Dujiangyan" },
      preview: {
        zh: "一项两千多年前的工程，如何让一片平原成为“天府之国”？",
        en: "How did a two-thousand-year-old waterworks turn a plain into the Land of Abundance?"
      },
      unrevealedEnter: { zh: "循着水声进入", en: "Follow the water" },
      enter: { zh: "沿岷江进入", en: "Follow the Min River" },
      receipt: {
        mark: "水",
        zh: "岷江的水，由此化作丰饶的成都平原。",
        en: "The Min River transforms into the fertile Chengdu Plain."
      },
      seal: "./chapters/dujiangyan/assets/seal-dujiangyan.svg?v=9051ca9b8108"
    },
    "secret-spring": {
      storageKey: "bittersweet-journey:secret-spring:complete",
      href: "./chapters/secret-spring/index.html?from=atlas",
      number: 7,
      title: { zh: "沙原隐泉", en: "A Secret Spring in the Sand" },
      preview: {
        zh: "沙漠中的蓝意。",
        en: "A spring hides where water should not exist."
      },
      enter: { zh: "沿脚印进入", en: "Follow the footprints" },
      receipt: {
        mark: "泉",
        zh: "鸣沙山深处，一弯清泉永驻于大漠版图。",
        en: "A crescent spring etches itself upon the desert."
      },
      seal: "./chapters/secret-spring/assets/seal-secret-spring.svg?v=3ce3b913eaf8"
    },
    "taoist-tower": {
      storageKey: "bittersweet-journey:taoist-tower:complete",
      href: "./chapters/taoist-tower/index.html?from=atlas",
      number: 5,
      title: { zh: "道士塔", en: "The Taoist Priest’s Tower" },
      preview: {
        zh: "经卷如何离开敦煌，流散世界？",
        en: "How do the manuscripts leave Dunhuang and scatter across the world?"
      },
      enter: { zh: "沿档案进入", en: "Enter the archive" },
      receipt: {
        mark: "空",
        zh: "洞窟仍在敦煌，经卷散落世界。",
        en: "The manuscripts are scattered across the globe."
      },
      seal: "./chapters/taoist-tower/assets/seal-taoist-tower.svg?v=c63c6a0345d0"
    },
    chengde: {
      storageKey: "bittersweet-journey:mountain-resort:complete",
      href: "./chapters/mountain-resort/index.html?from=atlas",
      number: 10,
      title: { zh: "山庄背影", en: "The Villa from Behind" },
      preview: {
        zh: "王朝变更，山水常在。",
        en: "Dynasties come and go; the mountains and waters remain."
      },
      enter: { zh: "绕到山庄背后", en: "Walk behind the villa" },
      receipt: {
        mark: "影",
        zh: "王朝变更，山水依旧。",
        en: "The mountains and waters remain."
      },
      seal: "./chapters/mountain-resort/assets/seal-mountain-resort.svg?v=0cc4b2079257"
    }
  };
  const body = document.body;
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const availablePoints = [...document.querySelectorAll(".story-point.available, .story-point.primary")];
  const preview = document.querySelector(".chapter-preview");
  const thoughtTrail = document.createElementNS('http://www.w3.org/2000/svg','svg');
  thoughtTrail.setAttribute('class','thought-trail');
  thoughtTrail.setAttribute('aria-hidden','true');
  [6,4,2.4].forEach(radius => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r',radius);thoughtTrail.append(circle);
  });
  preview.append(thoughtTrail);
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
  let receiptTimer = null;
  const orderedStories = CHAPTER_PLAN.filter(chapter => STORIES[chapter.id]).map(chapter => [chapter.id, {
    ...STORIES[chapter.id],
    ...chapter
  }]);
  const chapterTotal = orderedStories.length;
  window.ATLAS_STORIES = Object.freeze(orderedStories.map(([id,story]) => Object.freeze({id,storageKey:story.storageKey,title:story.title,seal:story.seal})));

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

    const silk = document.querySelector(".silk-road");
    const southwest = document.querySelector(".tea-road");
    const kashgar = geography.places.kashgar;
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
  }

  /* ---------- labels and seals on the map (docs/map-guidance.md §5-6, homepage setup M-6, M-7) ---------- */

  // Homepage type setup (M-6), in screen px: wider than 900 px / 900 px and below. Never below 10pt (13.5 px).
  const HOME_TYPE = { clue: [22, 16], number: [16, 14], context: [16, 14], seal: [36, 30] };
  const mapSvg = document.querySelector(".china-map");
  const sealLayer = document.querySelector(".chapter-seals");
  const svgNS = "http://www.w3.org/2000/svg";
  // one image seal per chapter that has one, shown once the chapter is read
  const seals = Object.fromEntries(Object.entries(STORIES).filter(([, story]) => story.seal).map(([name, story]) => {
    const image = document.createElementNS(svgNS, "image");
    image.setAttribute("href", story.seal);
    image.setAttribute("class", "chapter-seal");
    image.dataset.seal = name; // not data-story: that selects the chapter dots
    sealLayer.appendChild(image);
    return [name, image];
  }));

  const shownElement = (node) => Boolean(node) && window.getComputedStyle(node).display !== "none";
  const boxOverlap = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const distanceToBox = (x, y, b) => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
  const translation = (node) => {
    const match = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(node.getAttribute("transform") || "");
    return match ? [Number(match[1]), Number(match[2])] : [0, 0];
  };

  function layoutAtlas() {
    const ctm = mapSvg.getScreenCTM();
    const frame = mapSvg.getBoundingClientRect();
    if (!ctm || !frame.width) return;
    const scale = Math.hypot(ctm.a, ctm.b);
    const phone = window.innerWidth <= 900 ? 1 : 0; // the whole map fits a narrow screen, so its labels are smaller
    const unit = (px) => Math.max(px, 13.5) / scale; // screen px to map units, never under 10pt
    const size = { clue: unit(HOME_TYPE.clue[phone]), number: unit(HOME_TYPE.number[phone]), context: unit(HOME_TYPE.context[phone]) };
    const toMap = (x, y) => ({ x: (x - ctm.e) / ctm.a, y: (y - ctm.f) / ctm.d });

    // the part of the map a reader can see (the whole map when it scrolls sideways on a phone)
    const stage = document.querySelector(".atlas-map-stage");
    const stageBox = stage.getBoundingClientRect();
    const scrolls = stage.scrollWidth > stage.clientWidth + 1;
    const topLeft = toMap(scrolls ? frame.left : Math.max(frame.left, stageBox.left), Math.max(frame.top, stageBox.top));
    const bottomRight = toMap(scrolls ? frame.right : Math.min(frame.right, stageBox.right), Math.min(frame.bottom, stageBox.bottom));
    const margin = 6 / scale;
    const area = { left: topLeft.x + margin, right: bottomRight.x - margin, top: topLeft.y + margin, bottom: bottomRight.y - margin };

    // H0: the heading and call-out float over the map on wide screens (L-7)
    const taken = [];
    [".atlas-intro h1", ".cta-callout", ".atlas-navigation", ".atlas-geography-notes"].forEach((selector) => {
      const node = document.querySelector(selector);
      if (!shownElement(node)) return;
      const b = node.getBoundingClientRect();
      if (!b.width) return;
      const a = toMap(b.left - 4, b.top - 4), c = toMap(b.right + 4, b.bottom + 4);
      taken.push({ left: a.x, right: c.x, top: a.y, bottom: c.y });
    });

    // every dot takes its place before any label (L-10)
    const points = [...document.querySelectorAll(".story-point")].map((group) => {
      const [tx, ty] = translation(group);
      const core = group.querySelector(".point-core").getBBox();
      const extra = group.querySelector(".point-archive-mark");
      let r = Math.max(core.width, core.height) / 2;
      if (shownElement(extra)) {
        // the symbol includes its mark (道士塔's cave door): labels sit clear of the whole symbol
        const rect = extra.getBoundingClientRect(), a = toMap(rect.left,rect.top), b = toMap(rect.right,rect.bottom);
        const ccx = core.x + core.width / 2 + tx, ccy = core.y + core.height / 2 + ty;
        r = Math.max(r, ccx-a.x, b.x-ccx, ccy-a.y, b.y-ccy);
      }
      return {
        group, name: group.dataset.story, tx, ty, r,
        cx: core.x + core.width / 2 + tx, cy: core.y + core.height / 2 + ty,
        clues: [...group.querySelectorAll(".point-clue")],
        number: group.querySelector(".point-number"),
        mark: group.querySelector(".point-archive-mark")
      };
    });
    points.forEach((p) => {
      const pad = 2 / scale;
      taken.push({ left: p.cx - p.r - pad, right: p.cx + p.r + pad, top: p.cy - p.r - pad, bottom: p.cy + p.r + pad });
      if (shownElement(p.mark)) {
        const b = p.mark.getBoundingClientRect(), a = toMap(b.left,b.top), c = toMap(b.right,b.bottom);
        taken.push({ left:a.x, right:c.x, top:a.y, bottom:c.y });
      }
    });

    // L-3: a spot is not clear when it is nearer another dot than its own, or nearer a labelled dot than that dot's label
    const ownershipPenalty = (p, box, gap) => {
      const own = distanceToBox(p.cx, p.cy, box);
      return points.reduce((sum, q) => {
        if (q === p || Math.hypot(q.cx-p.cx,q.cy-p.cy)*scale < 32) return sum;
        const d = distanceToBox(q.cx, q.cy, box);
        if (d < own + gap) sum += 500;
        if (q.labelBox && d < distanceToBox(q.cx, q.cy, q.labelBox)) sum += 500;
        return sum;
      }, 0);
    };
    const cost = (box) => {
      const outside = Math.max(0, area.left - box.left) + Math.max(0, box.right - area.right) +
        Math.max(0, area.top - box.top) + Math.max(0, box.bottom - area.bottom);
      return outside * 1000 + taken.reduce((sum, other) => sum + boxOverlap(box, other), 0);
    };

    // The chapter labels (H1 on this map: they are the page's controls). Each tries #1-#5 (L-4); the positions are
    // searched together, most crowded dots first (H-2), so one long label cannot shut a neighbour out. If no
    // arrangement is fully clear, each label falls back to its least-crowded spot.
    // crowding is judged on screen: dots that zoom apart stop being a cluster
    const crowding = (p) => points.filter((q) => q !== p && Math.hypot(q.cx - p.cx, q.cy - p.cy) * scale < 90).length;
    points.forEach(p => {
      p.inView = p.cx > area.left && p.cx < area.right && p.cy > area.top && p.cy < area.bottom;
      [...p.clues,p.number, ...p.group.querySelectorAll('.chapter-label-leader')].forEach(node => { node.style.visibility = p.inView ? '' : 'hidden'; });
    });
    const labelled = [...points].sort((a, b) => crowding(b) - crowding(a)).filter((p) => p.inView && p.clues.some(shownElement));
    labelled.forEach((p) => {
      const clue = p.clues.find(shownElement);
      // font and halo are both set in map units, so both are rescaled at every zoom (the halo grew with the map before)
      p.clues.forEach((node) => { node.style.fontSize = `${size.clue.toFixed(2)}px`; node.style.strokeWidth = `${(3 / scale).toFixed(3)}px`; });
      p.number.style.fontSize = `${size.number.toFixed(2)}px`;
      p.number.style.strokeWidth = `${(2.5 / scale).toFixed(3)}px`;
      const availableWidth = area.right - area.left;
      const textWidth = clue.getComputedTextLength();
      if (textWidth > availableWidth) p.clues.forEach(node => { node.style.fontSize = (size.clue * availableWidth / textWidth) + 'px'; });
      const w = Math.max(clue.getComputedTextLength(), p.number.getComputedTextLength());
      // line heights from the fonts themselves (the English face has taller line boxes)
      const metrics = (node) => { node.setAttribute("y", "0"); const b = node.getBBox(); return { ascent: -b.y, height: b.height }; };
      const numberLine = metrics(p.number), clueLine = metrics(clue);
      const h = numberLine.height + clueLine.height;
      const gap = crowding(p) ? 28 / scale : size.clue * 0.25, lift = size.clue * 0.1;
      const { cx, cy, r } = p;
      // [text-anchor, block left, block top]: #1 右上, #2 右下, #2 左上, #3 左下, #4 正上, #5 正下
      p.candidates = [
        ["start", cx + r + gap, cy - lift - h], ["start", cx + r + gap, cy + lift],
        ["end", cx - r - gap - w, cy - lift - h], ["end", cx - r - gap - w, cy + lift],
        ["middle", cx - w / 2, cy - r - gap - h], ["middle", cx - w / 2, cy + r + gap]
      ];
      // Dense geographic clusters keep their dots in place; only their labels fan out.
      if (crowding(p)) {
        for (const row of [-2, 2, -3, 3, -4, 4]) {
          const y = cy + row * (h + 18 / scale);
          p.candidates.push(['start', cx + r + gap, y], ['end', cx - r - gap - w, y], ['middle', cx - w / 2, y]);
        }
      }
      p.candidates = p.candidates.map(([anchor, x, y]) => {
        x = Math.max(area.left, Math.min(area.right - w, x));
        const box = { left: x, right: x + w, top: y, bottom: y + h };
        return { anchor, x, y, w, box, fixed: cost(box) };
      });
      p.gap = gap;
      p.lines = { number: numberLine, clue: clueLine };
    });
    const labelSpacing = 16 / scale;
    const paddedLabel = box => ({left:box.left-labelSpacing, right:box.right+labelSpacing, top:box.top-labelSpacing, bottom:box.bottom+labelSpacing});
    // A leader runs from the dot to the nearest point of its label box. Leaders must not cross each other,
    // nor pass through another chapter's label, or the reader can no longer tell which label is whose (L-3).
    const leaderOf = (p, box) => {
      if (distanceToBox(p.cx, p.cy, box) * scale <= 20) return null;
      return [p.cx, p.cy, Math.max(box.left, Math.min(box.right, p.cx)), Math.max(box.top, Math.min(box.bottom, p.cy))];
    };
    const cross = (a, b) => {
      const d = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      const p1 = [a[0], a[1]], p2 = [a[2], a[3]], q1 = [b[0], b[1]], q2 = [b[2], b[3]];
      return d(p1, p2, q1) * d(p1, p2, q2) < 0 && d(q1, q2, p1) * d(q1, q2, p2) < 0;
    };
    const throughBox = (line, box) => {
      // sample the segment: a leader that enters another label's box passes through it
      for (let i = 1; i < 12; i++) {
        const x = line[0] + (line[2] - line[0]) * i / 12, y = line[1] + (line[3] - line[1]) * i / 12;
        if (x > box.left && x < box.right && y > box.top && y < box.bottom) return true;
      }
      return false;
    };
    const clash = (p, candidate) => {
      let sum = labelled.reduce((total, q) => (q.labelBox ? total + boxOverlap(candidate.box, paddedLabel(q.labelBox)) : total), 0) +
        ownershipPenalty(p, candidate.box, p.gap);
      const line = leaderOf(p, candidate.box);
      labelled.forEach((q) => {
        if (q === p || !q.labelBox) return;
        const other = leaderOf(q, q.labelBox);
        // crossing leaders outweigh any amount of overlap: the fallback never accepts one to save space
        if (line && other && cross(line, other)) sum += 1e7;
        if (line && throughBox(line, q.labelBox)) sum += 1e7;
        if (other && throughBox(other, candidate.box)) sum += 1e7;
      });
      return sum;
    };
    let budget = 40000;
    const search = (index) => {
      if (index === labelled.length) return true;
      const p = labelled[index];
      for (const candidate of p.candidates) {
        if (--budget < 0) return false;
        if (candidate.fixed > 0 || clash(p, candidate) > 0) continue;
        p.labelBox = candidate.box;
        p.chosen = candidate;
        if (search(index + 1)) return true;
        p.labelBox = null;
      }
      return false;
    };
    labelled.forEach((p) => { p.labelBox = null; p.chosen = null; });
    const clear = search(0);
    // recorded for the map checks (docs/map-guidance.md §10): "clear", or the dots with no clear spot of their own
    mapSvg.dataset.labelLayout = clear ? "clear" : "fallback: " + labelled.filter((p) => p.candidates.every((c) => c.fixed > 0)).map((p) => p.name).join(" ");
    if (!clear) {
      labelled.forEach((p) => { p.labelBox = null; p.chosen = null; });
      // Even a crowded overview must leave every chapter dot tappable.
      const pick = (p) => {
        const safe = p.candidates.filter(c => points.every(q => distanceToBox(q.cx,q.cy,c.box) > q.r + 2 / scale));
        p.chosen = safe.reduce((best, c) => {
          const total = c.fixed + clash(p, c);
          return !best || total < best.total ? { ...c, total } : best;
        }, null);
        p.labelBox = p.chosen?.box || null;
      };
      labelled.forEach(pick);
      // Repair passes: each label is chosen again against all the others, so a label placed early is not
      // left crossing a leader that was drawn after it. Stops once a pass changes nothing.
      for (let round = 0; round < 4; round += 1) {
        let changed = false;
        labelled.forEach((p) => {
          const before = p.chosen;
          p.labelBox = null;
          pick(p);
          if (p.chosen?.box !== before?.box && (p.chosen?.x !== before?.x || p.chosen?.y !== before?.y)) changed = true;
        });
        if (!changed) break;
      }
    }
    // H2: a label that still overlaps one already kept gives way (its dot stays, and its pop-up still names it).
    // Labels are kept in reading order of priority: the chapter being read back, then unread chapters, then read ones.
    const kept = [];
    const priority = (p) => (p.name === body.dataset.returningStory ? 0 : state.complete[p.name] ? 2 : 1);
    [...labelled].sort((a, b) => priority(a) - priority(b)).forEach((p) => {
      if (!p.chosen) return;
      if (kept.some((box) => boxOverlap(p.chosen.box, box) > 0)) { p.chosen = null; p.labelBox = null; return; }
      kept.push(p.chosen.box);
    });
    labelled.forEach((p) => {
      const best = p.chosen;
      let leader = p.group.querySelector('.chapter-label-leader');
      if (!leader) {
        leader = document.createElementNS(svgNS, 'path');
        leader.setAttribute('class', 'chapter-label-leader');
        leader.setAttribute('aria-hidden', 'true');
        p.group.prepend(leader);
      }
      leader.removeAttribute('d');
      if (best && distanceToBox(p.cx, p.cy, best.box) * scale > 20) {
        const x = Math.max(best.box.left, Math.min(best.box.right, p.cx));
        const y = Math.max(best.box.top, Math.min(best.box.bottom, p.cy));
        leader.setAttribute('d', 'M'+(p.cx-p.tx)+','+(p.cy-p.ty)+' L'+(x-p.tx)+','+(y-p.ty));
      }
      if (!best) {
        [...p.clues,p.number].forEach(node => { node.style.visibility = 'hidden'; });
        return;
      }
      const textX = best.anchor === "start" ? best.x : best.anchor === "end" ? best.x + best.w : best.x + best.w / 2;
      const put = (node, baseline) => {
        node.removeAttribute("transform");
        node.setAttribute("text-anchor", best.anchor);
        node.setAttribute("x", (textX - p.tx).toFixed(1));
        node.setAttribute("y", (baseline - p.ty).toFixed(1));
      };
      p.clues.forEach((node) => put(node, best.y + p.lines.number.height + p.lines.clue.ascent));
      put(p.number, best.y + p.lines.number.ascent);
      taken.push(best.box);
    });

    // M-7: each read chapter's seal next to its dot: #3 左下, #5 正下, #2 右下, #2 左上, #4 正上, #1 右上
    const sealSize = HOME_TYPE.seal[phone] / scale;
    points.forEach((p) => {
      const seal = seals[p.name];
      if (!seal) return;
      if (!state.complete[p.name] || !p.inView) { seal.classList.remove("is-shown"); return; }
      const gap = 4 / scale, { cx, cy, r } = p;
      const spots = [
        [cx - r - gap - sealSize, cy + gap], [cx - sealSize / 2, cy + r + gap], [cx + r + gap, cy + gap],
        [cx - r - gap - sealSize, cy - gap - sealSize], [cx - sealSize / 2, cy - r - gap - sealSize], [cx + r + gap, cy - gap - sealSize]
      ];
      const found = spots.map(([x, y]) => ({ x, y, box: { left: x, right: x + sealSize, top: y, bottom: y + sealSize } }))
        .find((spot) => cost(spot.box) === 0);
      seal.classList.toggle("is-shown", Boolean(found));
      if (!found) return;
      ["x", "y"].forEach((key) => seal.setAttribute(key, found[key].toFixed(1)));
      seal.setAttribute("width", sealSize.toFixed(1));
      seal.setAttribute("height", sealSize.toFixed(1));
      taken.push(found.box);
    });

    // H5: river and road names along their lines; a name with no clear spot is left out (L-8)
    const routeLabels = [...document.querySelectorAll(".ancient-routes .route-label")];
    [
      { path: document.querySelector("#global-yellow"), labels: [...document.querySelectorAll(".yellow-river .map-text")] },
      { path: document.querySelector("#global-yangtze"), labels: [...document.querySelectorAll(".yangtze-river .map-text")] },
      { path: document.querySelector(".silk-road"), labels: routeLabels.slice(0, 2) },
      { path: document.querySelector(".tea-road"), labels: routeLabels.slice(2, 4) }
    ].forEach(({ path, labels }) => {
      const label = labels.find(shownElement);
      labels.forEach((node) => { node.style.fontSize = `${size.context.toFixed(2)}px`; node.style.strokeWidth = `${(3 / scale).toFixed(3)}px`; node.setAttribute("text-anchor", "middle"); });
      if (!label || !path || !path.getTotalLength) return;
      const length = path.getTotalLength();
      const width = label.getComputedTextLength();
      const placed = [0.5, 0.6, 0.4, 0.7, 0.3, 0.8, 0.2, 0.9, 0.1].some((t) => {
        const point = path.getPointAtLength(length * t);
        const baseline = point.y - size.context * 0.4;
        const box = { left: point.x - width / 2, right: point.x + width / 2, top: baseline - size.context * 0.9, bottom: baseline + size.context * 0.25 };
        const nearDot = points.some((q) => distanceToBox(q.cx, q.cy, box) < Math.max(size.context, q.labelBox ? distanceToBox(q.cx, q.cy, q.labelBox) : 0));
        if (cost(box) > 0 || nearDot) return false;
        labels.forEach((node) => { node.setAttribute("x", point.x.toFixed(1)); node.setAttribute("y", baseline.toFixed(1)); });
        taken.push(box);
        return true;
      });
      labels.forEach((node) => { node.style.visibility = placed ? "" : "hidden"; });
    });
    window.ATLAS_CAMERA?.layoutLabels(taken, area, scale);
  }
  let layoutQueued = false;
  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    window.requestAnimationFrame(() => { layoutQueued = false; layoutAtlas(); });
  }

  const copy = {
    zh: {
      "site-title": "山河显影",
      "document-title": "山河显影 · 文化苦旅阅读地图",
      "view-stamps-aria": "查看已显影的圖章",
      "close-aria": "关闭",
      "stage-aria": "文化苦旅中国故事地图",
      "map-aria": "未完全显影的中国故事地图",
      "point-kashgar-aria": "西域喀什，尚未接入",
      "point-yangguan-aria": "进入阳关雪",
      "point-fish-tail-lodge-aria": "进入鱼尾山屋",
      "point-mogao-caves-aria": "进入莫高窟",
      "point-secret-spring-aria": "进入沙原隐泉",
      "point-taoist-tower-aria": "进入道士塔",
      "point-my-hometown-aria": "进入我的山河",
      "point-dujiangyan-aria": "进入都江堰",
      "point-chengde-aria": "进入山庄背影",
      "point-jiangnan-aria": "江南故事，尚未接入",
      "point-shanghai-aria": "人生故事群，尚未接入",
      kicker: "第 {n} 章 · 山河",
      "progress-label": "我的印章",
      "question-line-1": "一部书能够",
      "question-line-2": "照亮多少中国？",
      unavailable: "这处故事仍在等待显影",
      "receipt-title": "一处山河已经显影",
      "receipt-body": "岷江的水，由此化作丰饶的成都平原。",
      "cta-message": "提灯寻路，让山河慢慢亮起",
      "cta-hint": "移动游标／触碰提灯 · 拖动或双指缩放 · 完成章节留下光圈",
      reset: "重置阅读痕迹",
      source: "文本：余秋雨《文化苦旅》",
      "view-stamps": "圖章",
      "stamp-kicker": "已收藏圖章",
      "stamp-title": "圖章",
      "stamp-desc": "每完成一段旅程，就会留下一枚山河圖章。"
    },
    en: {
      "site-title": "Land, Made Visible",
      "document-title": "Land, Made Visible · A Reading Atlas of A Bittersweet Journey",
      "view-stamps-aria": "View the collected seals",
      "close-aria": "Close",
      "stage-aria": "Story map of China for A Bittersweet Journey Through Culture",
      "map-aria": "A partly revealed story map of China",
      "point-kashgar-aria": "Western Regions, Kashgar — not yet available",
      "point-yangguan-aria": "Enter Snow on the Southern Pass",
      "point-fish-tail-lodge-aria": "Enter Fish Tail Lodge",
      "point-mogao-caves-aria": "Enter the Mogao Caves",
      "point-secret-spring-aria": "Enter A Secret Spring in the Sand",
      "point-taoist-tower-aria": "Enter The Taoist Priest’s Tower",
      "point-my-hometown-aria": "Enter My Hometown",
      "point-dujiangyan-aria": "Enter Dujiangyan",
      "point-chengde-aria": "Enter The Villa from Behind",
      "point-jiangnan-aria": "Home stories in Jiangnan — not yet available",
      "point-shanghai-aria": "Later life stories — not yet available",
      kicker: "Chapter {n} · Land",
      "progress-label": "My Seals",
      "question-line-1": "How much of China",
      "question-line-2": "can one book illuminate?",
      unavailable: "This story is still waiting to be revealed",
      "receipt-title": "One landscape brought to light",
      "receipt-body": "The Min River transforms into the fertile Chengdu Plain.",
      "cta-message": "Carry a light into the landscape",
      "cta-hint": "Move or touch to light the way · Drag, scroll or pinch to explore · Finish a chapter to keep its light",
      reset: "Reset reading trace",
      source: "Text: Yu Qiuyu, A Bittersweet Journey Through Culture",
      "view-stamps": "Seals",
      "stamp-kicker": "Collected seals",
      "stamp-title": "Seals",
      "stamp-desc": "Each finished journey leaves a seal of its landscape."
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
      : window.localStorage.getItem("bittersweet-journey:language") || "en",
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
    // A chapter with a drawn seal shows the image; the others still show their glyph.
    mark.classList.toggle('has-seal', Boolean(story.seal));
    if (story.seal) {
      const seal = document.createElement('img');
      seal.src = story.seal;
      seal.alt = state.language === 'zh' ? `${story.title.zh}章节印记` : `${story.title.en} chapter seal`;
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
    const near = 76;
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
    const edgeTip = Math.min(Math.max(tip,32),limit-32);
    const start = vertical ? [edgeTip,best.side==='below'?0:height] : [best.side==='right'?0:width,edgeTip];
    const end = [cx-best.left,cy-best.top];
    [...thoughtTrail.children].forEach((circle,i) => {
      const t=[.28,.56,.8][i];
      circle.setAttribute('cx',start[0]+(end[0]-start[0])*t);
      circle.setAttribute('cy',start[1]+(end[1]-start[1])*t);
    });
  }

  function showPreview(point) {
    window.clearTimeout(hideTimer);
    const newThought = anchorPoint !== point || !preview.classList.contains('is-visible');
    anchorPoint = point;
    activeStory = point.dataset.story;
    renderPreview();
    positionPreview(point);
    preview.classList.add("is-visible");
    if (newThought) {
      [...thoughtTrail.children].reverse().forEach((circle, i) => {
        circle.getAnimations().forEach(animation => animation.cancel());
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          circle.animate([{opacity: 0}, {opacity: 1}], {
            duration: 90, delay: i * 45, easing: 'ease-out', fill: 'backwards'
          });
        }
      });
    }
  }

  function hidePreview() {
    window.clearTimeout(hideTimer);
    anchorPoint = null;
    preview.classList.remove("is-visible");
  }

  // A short grace period lets the pointer travel from the dot into the card.
  function scheduleHide() {
    window.clearTimeout(hideTimer);
    // Touch input does not use the hover dismissal timer.
    if (window.matchMedia('(hover: none)').matches) return;
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
    const question = document.querySelector('[data-copy="question-line-2"]');
    const word = state.language === 'zh' ? '照亮' : 'illuminate';
    const line = copy[state.language]['question-line-2'];
    const at = line.indexOf(word);
    // copy without the highlighted word: show it plainly rather than as "undefined"
    const [before, after] = at < 0 ? [line, ''] : [line.slice(0, at), line.slice(at + word.length)];
    const accent = document.createElement('span');
    accent.className = 'question-accent';
    accent.textContent = at < 0 ? '' : word;
    const sparks = document.createElement('span');
    sparks.className = 'title-fireflies';
    sparks.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 4; i++) sparks.append(document.createElement('i'));
    accent.append(sparks);
    question.replaceChildren(document.createTextNode(before), accent, document.createTextNode(after));
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
    body.classList.toggle("my-hometown-complete", state.complete["my-hometown"]);
    body.classList.toggle("dujiangyan-complete", state.complete.dujiangyan);
    body.classList.toggle("secret-spring-complete", state.complete["secret-spring"]);
    body.classList.toggle("taoist-tower-complete", state.complete["taoist-tower"]);
    body.classList.toggle("chengde-complete", state.complete.chengde);
    body.classList.toggle("kashgar-complete", state.complete.kashgar);
    body.classList.toggle("yangguan-complete", state.complete.yangguan);
    body.classList.toggle("fish-tail-lodge-complete", state.complete["fish-tail-lodge"]);
    body.classList.toggle("mogao-caves-complete", state.complete["mogao-caves"]);
    document.querySelector('[data-story="kashgar"]').setAttribute('aria-label', state.complete.kashgar ? (state.language === 'zh' ? '进入西域喀什' : 'Enter Kashgar') : STORIES.kashgar.clue[state.language]);
    availablePoints.forEach(point => {
      const name = point.dataset.story;
      const clue = point.querySelector(`.point-clue.unread.${state.language === 'zh' ? 'cn' : 'en'}`);
      point.setAttribute('aria-label', state.complete[name] ? STORIES[name].enter[state.language] : (clue?.textContent || STORIES[name].preview[state.language]));
    });
    const count = Object.values(state.complete).filter(Boolean).length;
    document.querySelector(".progress-count").textContent = String(count);
    body.classList.toggle("all-revealed", count === chapterTotal);
    renderStampGrid();
    scheduleLayout();
    window.dispatchEvent(new CustomEvent('atlas-progress-change'));
  }

  function renderStampGrid() {
    const text = stampText[state.language];
    const unlockedCount = orderedStories.filter(([name]) => state.complete[name]).length;

    stampGrid.innerHTML = orderedStories
      .map(([name, story]) => {
        const unlocked = Boolean(state.complete[name]);
        const title = story.title[state.language];
        const mark = unlocked && story.seal
          ? `<img src="${story.seal}" alt="" />`
          : unlocked ? story.receipt.mark : "";
        return `
          <div class="stamp-card${unlocked ? " is-unlocked" : ""}">
            <span class="stamp-mark${unlocked && story.seal ? ' has-seal' : ''}" role="img" aria-label="${unlocked ? title : text.locked}">${mark}</span>
            <span class="stamp-name">${title}</span>
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
    window.JOURNEY_AUDIO?.play('close', .36);
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

  let journeyPending=false;
  async function enterStory(storyName = activeStory) {
    if(journeyPending)return;
    journeyPending=true;
    window.JOURNEY_AUDIO?.enterChapter(storyName);
    let leaving=false;
    activeStory = storyName;
    hidePreview();
    try {
      const point=availablePoints.find(point=>point.dataset.story===storyName);
      const arrived=point&&window.ATLAS_JOURNEY?await window.ATLAS_JOURNEY.travelTo(point):true;
      if(!arrived)return;
      const url = new URL(STORIES[storyName].href, window.location.href);
      url.searchParams.set("lang", state.language);
      leaving=true;
      window.LAND_TRANSITION.navigate(url.href);
    } finally {journeyPending=false;if(!leaving)window.JOURNEY_AUDIO?.setAmbience(true);}
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
    point.addEventListener("pointerenter", event => { if (event.pointerType === 'mouse' && !window.ATLAS_CAMERA?.moving) showPreview(point); });
    point.addEventListener("pointerleave", event => { if (event.pointerType === 'mouse') scheduleHide(); });
    point.addEventListener("focus", () => showPreview(point));
    point.addEventListener("blur", scheduleHide);
    point.addEventListener("click", () => {
      enterStory(point.dataset.story);
    });
    point.addEventListener("keydown", (event) => {
      onKeyboardActivate(event, () => enterStory(point.dataset.story));
    });
  });
  enterButton.addEventListener("click", () => enterStory(activeStory));

  preview.addEventListener("pointerenter", () => window.clearTimeout(hideTimer));
  preview.addEventListener("pointerleave", event => { if (event.pointerType === 'mouse') scheduleHide(); });
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
    scheduleLayout();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleLayout);
  // the map zooms in when the page opens: lay the labels out again once it has settled
  mapSvg.addEventListener("transitionend", (event) => { if (event.target === mapSvg) scheduleLayout(); });
  [800, 1600, 3000].forEach((delay) => window.setTimeout(scheduleLayout, delay));

  document.querySelectorAll(".story-point.quiet").forEach((point) => {
    point.addEventListener("click", showUnavailable);
    point.addEventListener("keydown", (event) => onKeyboardActivate(event, showUnavailable));
  });

  function dismissReceipt() {
    window.clearTimeout(receiptTimer);
    receiptTimer = null;
    body.classList.remove("is-returning");
  }

  window.addEventListener("pageshow", () => {
    body.classList.remove("is-entering");
    if (!body.classList.contains("is-returning")) window.clearTimeout(receiptTimer);
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
      window.localStorage.removeItem(`bittersweet-journey:${name}:seal-reveal-seen`);
      state.complete[name] = false;
    });
    body.classList.remove("is-returning");
    ['started', 'scene'].forEach(key => window.localStorage.removeItem(`bittersweet-journey:kashgar:${key}`));
    window.localStorage.removeItem("bittersweet-journey:my-hometown:intro-seen");
    renderProgress();
    renderPreview();
  });

  // On a phone the map is wider than the screen and scrolls sideways: start centred on the chapter dots.
  function centreMapOnPoints() {
    const stage = document.querySelector(".atlas-map-stage");
    if (!stage || stage.scrollWidth <= stage.clientWidth) return;
    const cores = [...document.querySelectorAll(".story-point .point-core")].map((core) => core.getBoundingClientRect());
    const left = Math.min(...cores.map((r) => r.left)), right = Math.max(...cores.map((r) => r.right));
    const frame = stage.getBoundingClientRect();
    stage.scrollLeft += (left + right) / 2 - (frame.left + frame.width / 2);
  }

  applyRealGeography();
  new ResizeObserver(entries => {
    body.style.setProperty('--atlas-intro-height',`${entries[0].contentRect.height}px`);
    scheduleLayout();
  }).observe(document.querySelector('.atlas-intro'));
  window.addEventListener('atlas-camera-change', () => {
    // Keep chapter symbols comfortably sized at every scale, like their labels.
    const scale = Math.hypot(mapSvg.getScreenCTM().a,mapSvg.getScreenCTM().b);
    document.querySelectorAll('.story-point').forEach(group => {
      const complete = state.complete[group.dataset.story];
      const core = group.querySelector('.point-core');
      core.style.r = `${(complete ? 6 : 4) / scale}px`;
      core.style.strokeWidth = `${1.5 / scale}px`;
      const mark = group.querySelector('.point-archive-mark');
      if (mark) {
        const cx = core.getAttribute('cx'), cy = core.getAttribute('cy');
        mark.setAttribute('transform', `translate(${cx} ${cy}) scale(${1/scale}) translate(${-cx} ${-cy})`);
      }
      group.querySelectorAll('.point-glow,.point-pulse,.point-orbit').forEach(node => {
        node.style.r = `${(node.classList.contains('point-glow') ? 23 : 10) / scale}px`;
      });
    });
    if (window.ATLAS_CAMERA?.moving) hidePreview();
    else if (anchorPoint && preview.classList.contains('is-visible')) positionPreview(anchorPoint);
    scheduleLayout();
  });
  window.requestAnimationFrame(centreMapOnPoints);
  renderLanguage();
  renderProgress();
  if (pageParams.get("stamps") === "1") openStampModal();

  let firstReturnReveal = false;
  if (STORIES[returning] && state.complete[returning]) {
    const revealSeenKey = `bittersweet-journey:${returning}:seal-reveal-seen`;
    try {
      firstReturnReveal = localStorage.getItem(revealSeenKey) !== "true";
      if (firstReturnReveal) localStorage.setItem(revealSeenKey, "true");
    } catch { firstReturnReveal = true; }
  }
  if (STORIES[returning]) window.history.replaceState({}, "", "./index.html");

  if (firstReturnReveal) {
    renderReceipt(returning);
    seals[returning]?.classList.add("is-reveal-pending");
    body.dataset.returningStory = returning;
    // Run after the return-page curtain opens and the physical map camera is mounted.
    let started = false;
    const arrivalDeadline = performance.now() + 8000;
    const collect = () => {
      if (started) return;
      if (!window.ATLAS_CAMERA || !window.ATLAS_JOURNEY || document.documentElement.matches('.land-in-transit')) {
        if (performance.now() > arrivalDeadline) {
          // the map layers never mounted: show the seal and receipt without the animation
          started = true;
          seals[returning]?.classList.remove("is-reveal-pending");
          body.classList.add("is-returning");
          window.clearTimeout(receiptTimer);
          receiptTimer = window.setTimeout(dismissReceipt, 3000);
          return;
        }
        window.requestAnimationFrame(collect);return;
      }
      started = true;collectReturningSeal(returning);
    };
    if (document.readyState === 'complete') requestAnimationFrame(collect);
    else window.addEventListener('load',()=>requestAnimationFrame(collect),{once:true});
  }

  async function collectReturningSeal(name) {
    const target=document.querySelector('.site-progress');
    const source=document.querySelector(`[data-story="${name}"] .point-core`) || receipt.querySelector('.receipt-mark');
    if(!target||!source)return;
    const countNode=target.querySelector('[data-site-progress-count]');
    const finalCount=Object.values(state.complete).filter(Boolean).length;
    const previousCount=Math.max(0, finalCount - 1);
    if (countNode) countNode.textContent=String(previousCount);
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bounds=source.getBoundingClientRect(),frame=mapSvg.getBoundingClientRect();
    if(bounds.left<frame.left+10||bounds.right>frame.right-10||bounds.top<frame.top+10||bounds.bottom>frame.bottom-10)window.ATLAS_CAMERA.reset();
    await new Promise(requestAnimationFrame);
    body.dataset.sealCollection='lighting';
    await window.ATLAS_JOURNEY.revealChapter(name);
    const seal=seals[name];
    if(!state.complete[name]){seal?.classList.remove('is-reveal-pending');body.dataset.sealCollection='cancelled';return;}
    body.dataset.sealCollection='stamping';
    window.JOURNEY_AUDIO?.play('stamp', .48);
    seal?.classList.add('is-stamping');
    seal?.classList.remove('is-reveal-pending');
    if(seal&&!reducedMotion){
      const stamp=seal.animate([
        {opacity:0,transform:'scale(1.45) rotate(-9deg)'},
        {opacity:.95,transform:'scale(.97) rotate(0deg)',offset:.72},
        {opacity:.9,transform:'scale(1) rotate(0deg)'}
      ],{duration:460,easing:'cubic-bezier(.16,1,.3,1)'});
      try{await stamp.finished;}catch{}
    }
    seal?.classList.remove('is-stamping');
    body.classList.add('is-returning');
    window.clearTimeout(receiptTimer);
    receiptTimer=window.setTimeout(dismissReceipt,3000);
    const animateCount=()=>{
      if (!countNode) return;
      if (reducedMotion) {
        countNode.textContent=String(finalCount);
        return;
      }
      const started=performance.now();
      const tick=(now)=>{
        const progress=Math.min(1,(now-started)/520);
        const eased=1-Math.pow(1-progress,3);
        countNode.textContent=String(Math.round(previousCount+(finalCount-previousCount)*eased));
        if(progress<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    body.dataset.sealCollection='preparing';
    const announcement=document.createElement('span');
    announcement.className='seal-collection-status';announcement.setAttribute('role','status');
    document.body.append(announcement);
    const received=()=>{
      announcement.textContent=state.language==='en'?`${STORIES[name].title.en} seal added to your collection.`:`《${STORIES[name].title.zh}》印章已收入蒐集盒。`;
      body.dataset.sealCollection='collected';
      animateCount();
    };
    if(reducedMotion){received();return;}
    const image=document.createElement('img');
    image.className='flying-collection-seal';image.alt='';image.setAttribute('aria-hidden','true');
    image.src=STORIES[name].seal;
    try{await image.decode();}catch{received();return;}
    // A remembered zoom may put this chapter offscreen. Fit the story points before takeoff.
    const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
    const sx=a.left+a.width/2-24,sy=a.top+a.height/2-24;
    const ex=b.left+b.width/2-24,ey=b.top+b.height/2-24;
    const transform=(x,y,scale,rotation)=>`translate(${x}px,${y}px) scale(${scale}) rotate(${rotation}deg)`;
    image.style.transform=transform(sx,sy,.3,-14);document.body.append(image);
    body.dataset.sealCollection='flying';
    let flight;
    const cancel=()=>flight?.cancel();
    window.addEventListener('resize',cancel,{once:true});window.addEventListener('pagehide',cancel,{once:true});
    try {
      flight=image.animate([
        {transform:transform(sx,sy,.3,-14),opacity:0,offset:0},
        {transform:transform(sx,sy-18,1.1,-7),opacity:1,offset:.16},
        {transform:transform(sx+(ex-sx)*.45,Math.min(sy,ey)+70,.85,7),opacity:1,offset:.58},
        {transform:transform(ex,ey,.28,0),opacity:0,offset:1}
      ],{duration:950,easing:'cubic-bezier(.3,.05,.3,1)',fill:'forwards'});
      await flight.finished;
    } catch {} finally {
      image.remove();window.removeEventListener('resize',cancel);window.removeEventListener('pagehide',cancel);
      received();target.classList.add('is-receiving');
      window.setTimeout(()=>target.classList.remove('is-receiving'),300);
    }
  }
})();
