(() => {
  "use strict";

  const STORIES = {
    dujiangyan: {
      storageKey: "bittersweet-journey:dujiangyan:complete",
      href: "./chapters/dujiangyan/index.html?from=atlas",
      index: "Chapter 04 / Land",
      title: { zh: "都江堰", en: "Dujiangyan" },
      preview: {
        zh: "一项两千多年前的工程，如何让一片平原成为“天府之国”？",
        en: "How did a two-thousand-year-old work of water turn a plain into the Land of Abundance?"
      },
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
      index: "Chapter 07 / Land",
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
      index: "Chapter 05 / Land",
      title: { zh: "道士塔", en: "The Taoist Priest’s Tower" },
      preview: {
        zh: "藏经洞打开以后，经卷如何从敦煌走向世界？",
        en: "After the Library Cave opens, how do its manuscripts travel from Dunhuang into the world?"
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
      index: "Chapter 10 / Land",
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
  const enterButton = document.querySelector(".enter-story");
  const unavailable = document.querySelector(".unavailable-note");
  const receipt = document.querySelector(".reveal-receipt");
  const returning = new URLSearchParams(window.location.search).get("revealed");
  let activeStory = STORIES[returning] ? returning : "dujiangyan";

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
      jiangnan: [938, 532],
      shanghai: [1055, 525]
    };
    Object.entries(originalAnchors).forEach(([name, [x, y]]) => {
      const geographyName = ["secret-spring", "taoist-tower"].includes(name) ? "dunhuang" : name;
      const point = geography.places[geographyName];
      const group = document.querySelector(`[data-story="${name}"]`);
      const offset = name === "taoist-tower" ? { x: 65, y: -58 } : { x: 0, y: 0 };
      group.setAttribute(
        "transform",
        `translate(${point.x - x + offset.x} ${point.y - y + offset.y})`
      );
    });

    const labelOffsets = {
      yangguan: [-72, 34],
      "secret-spring": [14, -28],
      jiangnan: [-92, 35],
      shanghai: [22, -32]
    };
    Object.entries(labelOffsets).forEach(([name, [x, y]]) => {
      document.querySelectorAll(`[data-story="${name}"] text`).forEach((label) => {
        label.setAttribute("transform", `translate(${x} ${y})`);
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
      "progress-label": "已显影",
      volume: "第一卷 · 山河",
      "question-line-1": "一部书能够",
      "question-line-2": "照亮多少中国？",
      thesis: "这里没有完整国界。河流、道路和地名，只在故事被阅读之后留下。",
      disclaimer: "文学示意图 · 非行政地图",
      unavailable: "这处故事仍在等待显影",
      "receipt-title": "一处山河已经显影",
      "receipt-body": "岷江的水，在这里成为成都平原。",
      "footer-question": "地图尚未完整，请继续阅读。",
      reset: "重置阅读痕迹"
    },
    en: {
      "progress-label": "Revealed",
      volume: "Book I · Land",
      "question-line-1": "How much of China",
      "question-line-2": "can one book illuminate?",
      thesis: "There is no complete border here. Rivers, roads and names remain only after their stories have been read.",
      disclaimer: "Literary diagram · No administrative border",
      unavailable: "This story is still waiting to be revealed",
      "receipt-title": "One landscape brought to light",
      "receipt-body": "Here, the Min River becomes the Chengdu Plain.",
      "footer-question": "Map is not yet complete, keep reading.",
      reset: "Reset reading trace"
    }
  };

  const state = {
    language: window.localStorage.getItem("bittersweet-journey:language") || "zh",
    complete: Object.fromEntries(
      Object.entries(STORIES).map(([name, story]) => [
        name,
        window.localStorage.getItem(story.storageKey) === "true"
      ])
    )
  };

  function renderPreview() {
    const story = STORIES[activeStory];
    preview.querySelector(".preview-index").textContent = story.index;
    preview.querySelector('[data-preview-title="zh"]').textContent = story.title.zh;
    preview.querySelector('[data-preview-title="en"]').textContent = story.title.en;
    preview.querySelector('[data-copy="preview-text"]').textContent = story.preview[state.language];
    enterButton.querySelector("span").textContent = story.enter[state.language];
  }

  function renderLanguage() {
    body.dataset.language = state.language;
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const value = copy[state.language][node.dataset.copy];
      if (value) node.textContent = value;
    });
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
    renderPreview();
    if (STORIES[returning]) {
      receipt.querySelector(".receipt-mark").textContent = STORIES[returning].receipt.mark;
      receipt.querySelector("strong").textContent = STORIES[returning].receipt[state.language];
    }
  }

  function renderProgress() {
    body.classList.toggle("dujiangyan-complete", state.complete.dujiangyan);
    body.classList.toggle("secret-spring-complete", state.complete["secret-spring"]);
    body.classList.toggle("taoist-tower-complete", state.complete["taoist-tower"]);
    body.classList.toggle("chengde-complete", state.complete.chengde);
    const count = Object.values(state.complete).filter(Boolean).length;
    document.querySelector(".progress-count").textContent = String(count).padStart(2, "0");
  }

  function enterStory(storyName = activeStory) {
    if (body.classList.contains("is-entering")) return;
    activeStory = storyName;
    body.classList.add("is-entering");
    window.setTimeout(() => {
      window.location.href = STORIES[storyName].href;
    }, 920);
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
    });
  });

  availablePoints.forEach((point) => {
    const selectStory = () => {
      activeStory = point.dataset.story;
      renderPreview();
      preview.classList.add("is-visible");
    };
    point.addEventListener("mouseenter", selectStory);
    point.addEventListener("focus", selectStory);
    point.addEventListener("click", () => enterStory(point.dataset.story));
    point.addEventListener("keydown", (event) => {
      onKeyboardActivate(event, () => enterStory(point.dataset.story));
    });
  });
  enterButton.addEventListener("click", () => enterStory(activeStory));

  document.querySelectorAll(".story-point.quiet").forEach((point) => {
    point.addEventListener("click", showUnavailable);
    point.addEventListener("keydown", (event) => onKeyboardActivate(event, showUnavailable));
  });

  receipt.querySelector("button").addEventListener("click", () => {
    body.classList.remove("is-returning");
  });

  document.querySelector(".reset-progress").addEventListener("click", () => {
    Object.entries(STORIES).forEach(([name, story]) => {
      window.localStorage.removeItem(story.storageKey);
      state.complete[name] = false;
    });
    body.classList.remove("is-returning");
    renderProgress();
  });

  applyRealGeography();
  renderLanguage();
  renderProgress();

  if (STORIES[returning] && state.complete[returning]) {
    const returnedStory = STORIES[returning];
    receipt.querySelector(".receipt-mark").textContent = returnedStory.receipt.mark;
    receipt.querySelector("strong").textContent = returnedStory.receipt[state.language];
    body.classList.add("is-returning");
    window.history.replaceState({}, "", "./index.html");
  }
})();
