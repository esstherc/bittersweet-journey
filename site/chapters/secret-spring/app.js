(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.SECRET_SPRING_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // Sections follow the essay's own order; level = index + 1 drives layers and the 3D camera.
  const sections = {
    zh: [
      { label: "一 · 脚印", location: "鸣沙山北缘" },
      { label: "二 · 山脊", location: "沙脊 · 夕照" },
      { label: "三 · 下坡", location: "峰坡 · 月牙泉" },
      { label: "四 · 隐泉", location: "泉边 · 静池" }
    ],
    en: [
      { label: "I · Footprints", location: "North edge · Mingsha" },
      { label: "II · The ridge", location: "Dune ridge · Sunset" },
      { label: "III · Descent", location: "Slope · Crescent Spring" },
      { label: "IV · The spring", location: "Spring edge · Still water" }
    ]
  };

  const cameraMode = {
    zh: ["贴近沙脊", "拉远至敦煌石窟带", "向月牙泉下潜", "泉边低空停驻"],
    en: ["Skimming the dune", "Pulling back to the grottoes", "Diving toward the spring", "Holding low above the water"]
  };
  const cameraTech = ["3D terrain · DEM", "Regional positioning · WGS 84", "3D terrain · Camera dive", "3D terrain · Low hold"];

  const copy = {
    zh: {
      "map-aria": "鸣沙山与月牙泉三维地形图",
      "map-svg-title": "鸣沙山与月牙泉文学地图",
      "map-svg-desc": "三维地形和月牙泉轮廓随阅读逐层显影；虚线脚印为文学叙事路径，不是实测路线。",
      "map-teaser": "沙山后有一弯水",
      thesis: "先有脚印，然后才有泉。",
      open: "开始攀登",
      "rail-caption": "阅读路标",
      "rail-aria": "阅读路标",
      "section-aria": "路标 {n}",
      "reader-note": "四个“路标”用于交互节奏，不是原文编号分节。",
      "ridge-quote": "脚印像一条长不可及的绸带",
      "notes-keyboard": "↑ ↓ ← → 切换路标 · L 切换语言 · Esc 关闭本面板",
      "data-3d-label": "三维",
      "data-3d": "3D沙山直接由DEM高程网格生成，并随阅读切换镜头。",
      "data-route-label": "脚印",
      "data-route": "原文没有可核验的行走坐标。虚线脚印仅表达阅读中的攀登，不是作者的实测路线。",
      "data-region-label": "区域",
      "data-region": "敦煌、莫高窟、榆林窟按真实坐标定位；图中距离为大圆直线距离，不是公路里程。",
      "data-projection-label": "投影",
      "data-projection": "地图保持地点、距离与地形的相对关系。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM GLO-30，约30米网格；作为三维沙山的高程基础。",
      "data-features-label": "地物",
      "data-features": "月牙泉、鸣沙山和党河来自 OpenStreetMap，获取于2026年7月24日。",
      "notes-source-1": "地形：Copernicus DEM GLO-30",
      "notes-source-2": "地物：OpenStreetMap contributors，经 Overpass API 获取",
      "notes-source-3": "莫高窟坐标：甘肃省文化和旅游主管部门公开资料",
      "notes-source-4": "榆林窟坐标：开放地理数据，并与敦煌研究院的位置说明交叉核对",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或景区安全信息。",
      "complete-line": "荒漠记住了一弯清泉。"
    },
    en: {
      "map-aria": "Terrain map of Mingsha Mountain and Crescent Spring",
      "map-svg-title": "Literary map of Mingsha Mountain and Crescent Spring",
      "map-svg-desc": "The 3D terrain and the outline of the spring appear layer by layer as you read; the dotted footsteps are a literary path, not a surveyed route.",
      "map-teaser": "Water beyond the dune",
      thesis: "First the footprints. Then the spring.",
      open: "Begin the climb",
      "rail-caption": "Waypoints",
      "rail-aria": "Reading waypoints",
      "section-aria": "Waypoint {n}",
      "reader-note": "These four waypoints pace the interaction; they are not numbered sections in the original essay.",
      "ridge-quote": "My footsteps are an unimaginably long silk ribbon",
      "notes-keyboard": "↑ ↓ ← → switch waypoints · L language · Esc closes this panel",
      "data-3d-label": "3D",
      "data-3d": "The dune mesh is generated directly from the DEM and changes camera with the reading.",
      "data-route-label": "Footsteps",
      "data-route": "The essay gives no verifiable walking coordinates. The dotted footsteps express the literary climb; they are not the author's surveyed route.",
      "data-region-label": "Region",
      "data-region": "Dunhuang, Mogao and Yulin are positioned by geographic coordinates. Distances shown are great-circle lines, not road distances.",
      "data-projection-label": "Projection",
      "data-projection": "The map preserves the relative position, distance and terrain of the mapped features.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM GLO-30 at approximately 30 m spacing provides the elevation basis for the 3D dunes.",
      "data-features-label": "Features",
      "data-features": "Crescent Spring, Mingsha Mountain and the Dang River use OpenStreetMap data retrieved 24 July 2026.",
      "notes-source-1": "Terrain: Copernicus DEM GLO-30",
      "notes-source-2": "Features: OpenStreetMap contributors, retrieved through the Overpass API",
      "notes-source-3": "Mogao coordinates: public material from Gansu's culture and tourism authority",
      "notes-source-4": "Yulin coordinates: open geographic data, cross-checked against the Dunhuang Academy's location description",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or visitor-safety information.",
      "complete-line": "The desert remembers a crescent of water."
    }
  };

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    return paragraph.startsWith("ROADS EXIST")
      ? paragraph.replace("ROADS EXIST", "Roads exist")
      : paragraph;
  }

  const body = document.body;
  const revealLayers = [...document.querySelectorAll(".reveal-layer")];
  const modeLabel = document.querySelector(".camera-mode");
  const techLabel = document.querySelector(".camera-tech");
  const scroller = document.querySelector(".reader-scroll");

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

  function setCaption(language, index) {
    modeLabel.textContent = cameraMode[language][index];
    techLabel.textContent = cameraTech[index];
  }

  // Slow light drift while a section is read: a fraction of the way through the active section.
  function updateLight() {
    const renderer = window.SECRET_SPRING_TERRAIN_RENDERER;
    if (!renderer || !body.classList.contains("is-open")) return;
    const threshold = scroller.clientHeight * 0.4;
    const top = scroller.getBoundingClientRect().top;
    let active = null;
    scroller.querySelectorAll(".reading-section").forEach((section) => {
      if (section.getBoundingClientRect().top - top <= threshold) active = section;
    });
    if (!active) return;
    const rect = active.getBoundingClientRect();
    renderer.setProgress((threshold - (rect.top - top)) / Math.max(rect.height, 1));
  }

  let language = document.body.dataset.language || "zh";
  let level = 1;

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    setCaption(language, state.active);
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= level);
    });
    setCaption(language, index);
    window.SECRET_SPRING_TERRAIN_RENDERER?.setState(level);
  }

  applyGeography();
  scroller.addEventListener("scroll", () => window.requestAnimationFrame(updateLight), { passive: true });

  ChapterShell.init({
    id: "secret-spring",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender,
    onSection
  });
})();
