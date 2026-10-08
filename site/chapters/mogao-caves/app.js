(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.MOGAO_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // The four sections are the essay's own numbered sections.
  const sections = {
    zh: [
      { label: "一 · 石窟的来路", location: "印度 · 犍陀罗 · 敦煌" },
      { label: "二 · 活了一千年", location: "鸣沙山东麓 · 大泉河" },
      { label: "三 · 一窟一窟", location: "十六国 → 明清" },
      { label: "四 · 远处飘零", location: "莫高窟 · 北京 · 美国" }
    ],
    en: [
      { label: "I · Where the caves came from", location: "India · Gandhara · Dunhuang" },
      { label: "II · A thousand years alive", location: "Echoing Sand Hill · the Daquan valley" },
      { label: "III · Cave by cave", location: "Sixteen Kingdoms to Ming and Qing" },
      { label: "IV · Drifting far away", location: "Mogao · Beijing · America" }
    ]
  };

  /* ---------- where in the essay the map changes (by paragraph, per edition) ---------- */

  const repeat = (name, count) => Array(count).fill(name);
  // Part three walks the dynasties paragraph by paragraph: -1 is the opening, 0-7 index the steps.
  const dynastySteps = [-1, 0, 1, 1, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 6, 6, 7];
  const stages = {
    zh: [
      ["dunhuang", "india", "india", "china", "china"],
      [...repeat("day", 9), "dusk", "dusk"],
      dynastySteps.map((step) => `step${step}`),
      [...repeat("russians", 4), ...repeat("america", 3), ...repeat("villagers", 3), ...repeat("beijing", 4), ...repeat("world", 2)]
    ],
    en: [
      // the English edition opens with ten paragraphs on the Western Regions
      [...repeat("west", 10), "dunhuang", "india", "india", "china", "china"],
      [...repeat("day", 9), "dusk", "dusk"],
      dynastySteps.map((step) => `step${step}`),
      [...repeat("russians", 8), ...repeat("america", 3), ...repeat("villagers", 4), ...repeat("beijing", 4), ...repeat("world", 2)]
    ]
  };

  const fmt = (n) => Number(n).toLocaleString("en");
  const place = (id) => geography.places.find((p) => p.id === id);
  const caveCount = geography.caves.list.length;
  const copy = {
    zh: {
      "map-aria": "莫高窟与佛教艺术来路的三维地形图",
      "map-teaser": "一座山包，半部艺术史。",
      thesis: "看活了一千年的生命。",
      open: "走进洞窟",
      "rail-caption": "原文章节",
      "cliff-title": "断崖立面 · 示意",
      "notes-keyboard": "↑ ↓ ← → 切换节次 · L 切换语言 · Esc 关闭本面板",
      "data-views-label": "视图",
      "data-views": "第一节与第四节的世界部分是同一张平面世界地图（同一种投影，镜头随段落移动）：第一节看希腊、犍陀罗、印度到敦煌；第二节是鸣沙山东麓、大泉河谷与敦煌的三维地形，读到“闭馆之后的黄昏”转为夜色；第三节镜头贴近莫高窟断崖（30 米网格），并附断崖立面示意与朝代顺序；第四节先回到莫高窟一带，再回到那张世界地图，依次看美国、北京与几乎整个地球。",
      "data-arrows-label": "箭头",
      "data-arrows": "第一节的箭头表示原文所说的方向：佛像石窟从印度起身，在犍陀罗吸收了随亚历山大东征而来的希腊雕塑（西边汇入的虚线），再进入中国。它们是观念的走向，不是某一条实际道路。印度、希腊只写区域名，不定点；犍陀罗的点取 Wikidata 坐标。",
      "data-caves-label": "断崖立面",
      "data-caves": "断崖立面是示意图，不是地图：窟龛依朝代先后排列，不代表洞窟在断崖上的真实位置。所列 " + caveCount + " 个洞窟的编号与时代，取自敦煌研究院“数字敦煌”公开的洞窟（28 个），另加英文资料所记北凉的第 268、272、275 窟；莫高窟编号洞窟远多于此，这里只是例子。刻度只用原文的朝代名，不附年份；原文没有写到宋代的具体洞窟，这一格没有例子。",
      "data-away-label": "外流",
      "data-away": "第四节只画原文点名的人与地方：哈佛大学的兰登·华尔纳、费城艺术博物馆（英文作 Pennsylvania Museum of Art）的霍勒斯·杰恩、从北京雇来的翻译陈万里。弧线只示意方向，不是路线。村民“从大约十五公里外”赶来，地图以莫高窟为圆心画 15 公里圈，不指定村庄。“数字敦煌”记载第 320、323、329 窟的部分壁画于 1924 年被华尔纳剥走。藏经洞与斯坦因等人的外流见《道士塔》。",
      "data-text-label": "两个版本",
      "data-text": "英文译本依据较早的版本：第一节开头多出 10 段，写古代“西域”是几大文明相遇之地（地图在英文版读这几段时标出“西域”）；第四节多出“主人”等段落。村民的距离，中文作“大约十五公里”，英文引华尔纳原文作“fifteen miles”（约 24 公里），地图依中文。英文标题在语料中作 Mogai Caves，这里依正文写作 Mogao Caves。",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 经纬度，每块地形按其中心纬度的余弦等比例展开；世界地图为 Equal Earth 等面积投影，中央经线 130°E（让希腊与美国都在同一张图上、不被切开），图上的弧线只示意方向。距离另按大圆公式计算：莫高窟距敦煌市区直线约 " + fmt(place("dunhuang").distanceKm) + " 公里，距北京约 " + fmt(place("beijing").distanceKm) + " 公里，距哈佛约 " + fmt(place("harvard").distanceKm) + " 公里。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM：世界地图上希腊到河西走廊的晕渲由 GLO-90 内部缩图层平均为约 11 公里一格；敦煌一带为 GLO-90，约 157 米一格；断崖一带为 GLO-30，约 30 米一格。断崖只高几十米，高程有夸大。",
      "notes-source-1": "地点：Wikidata 坐标属性 P625，2026 年 9 月 27 日取得（莫高窟 Q43286、敦煌市 Q319114、犍陀罗 Q213651、北京 Q956、福格艺术博物馆 Q809600、费城艺术博物馆 Q510324）；鸣沙山依 OpenStreetMap",
      "notes-source-2": "洞窟编号与时代：敦煌研究院“数字敦煌”洞窟列表（e-dunhuang.com），2026 年 9 月 28 日取得；北凉三窟：Whitfield、Whitfield 与 Agnew，Cave Temples of Mogao at Dunhuang（2015），第 55 页",
      "notes-source-3": "地形：Copernicus DEM GLO-90 与 GLO-30（© DLR e.V. 2010–2014，© Airbus Defence and Space GmbH 2014–2018，欧盟与 ESA 哥白尼计划提供）",
      "notes-source-4": "断崖、大泉河、党河：OpenStreetMap contributors（ODbL 1.0），经 Overpass API 于 2026 年 9 月 28 日取得",
      "notes-source-5": "河流与陆地：Natural Earth（公有领域）",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或文物信息。断崖立面为示意。",
      "complete-line": "千年不枯的笑容，延伸到整个世界。"
    },
    en: {
      "map-aria": "Terrain maps of the Mogao Caves and the road their art travelled",
      "map-teaser": "A hill holding half an art history",
      thesis: "A life that has flourished for a millennium.",
      open: "Enter the caves",
      "rail-caption": "Sections",
      "cliff-title": "The cliff face · schematic",
      "notes-keyboard": "↑ ↓ ← → switch sections · L language · Esc closes this panel",
      "data-views-label": "Views",
      "data-views": "Section one and the world stages of section four are one flat world map in a single projection, its camera moving with the text: section one shows Greece, Gandhara and India to Dunhuang. Section two is 3D terrain of the east face of Echoing Sand Hill, the Daquan valley and Dunhuang; it turns to night at “when the caves are closed in the evening”. Section three moves close to the Mogao cliff (30 m cells), with a schematic cliff face and the sequence of dynasties. Section four returns to the Mogao area, then to the same world map for America, Beijing and almost the whole planet.",
      "data-arrows-label": "Arrows",
      "data-arrows": "The arrows in section one show the direction the essay describes: cave sculpture set out from India, took in Greek sculpture brought by Alexander’s campaign in Gandhara (the dashed line joining from the west), then entered China. They show a movement of ideas, not an actual road. India and Greece are named as regions, not points; Gandhara’s point is from Wikidata.",
      "data-caves-label": "Cliff face",
      "data-caves": "The cliff face is a diagram, not a map: the niches are ordered by period and do not show where caves sit in the cliff. The " + caveCount + " caves shown, with their numbers and periods, are those the Dunhuang Academy publishes on Digital Dunhuang (28), plus the Northern Liang caves 268, 272 and 275 from English-language sources; Mogao has many more numbered caves, so these are examples. The scale uses only the dynasty names in the essay, without years; the essay names no Song cave, so that step has no example.",
      "data-away-label": "Taken away",
      "data-away": "Section four draws only the people and places the essay names: Langdon Warner of Harvard, Horace Jayne of the Pennsylvania Museum of Art (today the Philadelphia Museum of Art), and the interpreter Chen Wanli, hired in Beijing. The curved lines show direction only, not routes. The villagers came from about fifteen kilometres away in the Chinese text; the map draws a 15 km circle around the caves and names no village. Digital Dunhuang records that parts of the murals in caves 320, 323 and 329 were removed by Warner in 1924. The Library Cave and Stein’s expeditions are in The Taoist Priest’s Tower.",
      "data-text-label": "Two editions",
      "data-text": "The English translation follows an earlier edition: section one opens with ten more paragraphs on the Western Regions as a meeting place of civilizations (the map names the region while you read them), and section four has more paragraphs, on “the owners”. The Chinese has the villagers coming from about fifteen kilometres; the English quotes Warner’s “fifteen miles” (about 24 km). The map follows the Chinese. The corpus heading reads “Mogai Caves”; the text itself has Mogao.",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 longitude and latitude, each terrain scaled by the cosine of its central latitude; the world map is the Equal Earth equal-area projection centred on 130°E (so Greece and America sit on one unbroken map), and its lines show direction only. Distances are great circles: the caves are about " + fmt(place("dunhuang").distanceKm) + " km from Dunhuang in a straight line, " + fmt(place("beijing").distanceKm) + " km from Beijing and " + fmt(place("harvard").distanceKm) + " km from Harvard.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM: the world map’s shaded relief from Greece to the Hexi Corridor is averaged from the GLO-90 internal overviews to about 11 km; the Dunhuang area is GLO-90 at about 157 m; the cliff is GLO-30 at about 30 m. The cliff is only tens of metres high, so heights are exaggerated.",
      "notes-source-1": "Places: Wikidata coordinate property P625, retrieved 27 September 2026 (Mogao Caves Q43286, Dunhuang Q319114, Gandhara Q213651, Beijing Q956, Fogg Museum Q809600, Philadelphia Museum of Art Q510324); Echoing Sand Hill from OpenStreetMap",
      "notes-source-2": "Cave numbers and periods: Dunhuang Academy, Digital Dunhuang cave list (e-dunhuang.com), retrieved 28 September 2026; Northern Liang caves: Whitfield, Whitfield and Agnew, Cave Temples of Mogao at Dunhuang (2015), p. 55",
      "notes-source-3": "Terrain: Copernicus DEM GLO-90 and GLO-30 (© DLR e.V. 2010–2014, © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)",
      "notes-source-4": "Cliff, Daquan River, Dang River: OpenStreetMap contributors (ODbL 1.0), via the Overpass API, 28 September 2026",
      "notes-source-5": "Rivers and land: Natural Earth (public domain)",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or heritage information. The cliff face is a diagram.",
      "complete-line": "A smile that has not withered for a thousand years, reaching across the world."
    }
  };

  // The English edition sets each section opening in capitals; show them in sentence case.
  const englishOpenings = new Map([
    ["SOME OF THE GREATEST CIVILIZATIONS ", "Some of the greatest civilizations "],
    ["TO SEE THE MOGAO CAVES ", "To see the Mogao Caves "],
    ["EACH TIME I VENTURE ", "Each time I venture "],
    ["AS I HURRIEDLY THOUGHT ", "As I hurriedly thought "]
  ]);
  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    for (const [opening, replacement] of englishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  /* ---------- shared drawing helpers (as in 鱼尾山屋) ---------- */

  const body = document.body;
  const svgNS = "http://www.w3.org/2000/svg";
  const scroller = document.querySelector(".reader-scroll");
  const marks = document.querySelector(".terrain-marks");
  const globeSvg = document.querySelector(".world-globe");
  const cliffSvg = document.querySelector(".cliff-elevation");
  const dynastyTrack = document.querySelector(".dynasty-track");
  const compass = document.querySelector(".compass");
  let language = body.dataset.language || "zh";
  let level = 1;
  let stage = "";
  let view = { terrain: "wide", north: 0, night: 0, shown: true };

  const make = (tag, attributes = {}, parent) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  };
  const layer = (name) => make("g", { class: `marks-${name}` }, marks);

  // Points behind the camera cannot be projected: a line breaks there, a polygon is skipped.
  const polyline = (points, project, lift = 0, close = false) => {
    let d = "";
    let pen = false;
    for (const [lon, lat] of points) {
      const p = project(lon, lat, lift);
      if (p.w <= 0.02) {
        if (close) return "";
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      pen = true;
    }
    return d && close ? d + "Z" : d;
  };

  function pointMark(parent, cls) {
    return {
      dot: make("circle", { class: `dot ${cls}`, r: 4 }, parent),
      name: make("text", { class: `name ${cls}` }, parent),
      note: make("text", { class: `note ${cls}` }, parent)
    };
  }
  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const typeSize = (node) => parseFloat(window.getComputedStyle(node).fontSize) || 16;
  function boxOf(mark, p, dx, dy, anchor, withNote, metrics) {
    const width = Math.max(mark.name.getComputedTextLength(), withNote ? mark.note.getComputedTextLength() : 0);
    const left = anchor === "end" ? p.x + dx - width : p.x + dx;
    const height = metrics.name * 1.15 + (withNote ? metrics.name * 0.2 + metrics.note * 1.3 : 0);
    return { left, right: left + width, top: p.y + dy, bottom: p.y + dy + height };
  }
  function hideMark(mark) {
    mark.dot.style.visibility = "hidden";
    mark.name.style.visibility = "hidden";
    mark.note.style.visibility = "hidden";
  }
  function bestSpot(mark, p, taken, size, withNote, metrics) {
    const n = metrics.name, gap = n * 0.5;
    const spots = [[gap, -1.5 * n, "start"], [gap, 0.75 * n, "start"], [-gap, -1.5 * n, "end"], [-gap, 0.75 * n, "end"],
      [gap, -2.9 * n, "start"], [-gap, -2.9 * n, "end"], [gap, 2.1 * n, "start"], [-gap, 2.1 * n, "end"]];
    let best = null;
    for (const [dx, dy, anchor] of spots) {
      const box = boxOf(mark, p, dx, dy, anchor, withNote, metrics);
      const outside = Math.max(0, 6 - box.left) + Math.max(0, box.right - (size.width - 6)) +
        Math.max(0, 6 - box.top) + Math.max(0, box.bottom - (size.height - 6));
      const cost = outside * 1000 + taken.reduce((sum, other) => sum + overlapArea(box, other), 0);
      if (!best || cost < best.cost) best = { cost, dx, dy, anchor, box };
      if (cost === 0) break;
    }
    return best;
  }
  function placeMark(mark, p, taken, size, noteOn = true) {
    if (!p.visible) return hideMark(mark);
    const metrics = { name: typeSize(mark.name), note: typeSize(mark.note) };
    let withNote = noteOn && Boolean(mark.note.textContent) && size.width >= 520;
    mark.dot.style.visibility = "";
    mark.dot.setAttribute("cx", p.x.toFixed(1));
    mark.dot.setAttribute("cy", p.y.toFixed(1));
    let best = bestSpot(mark, p, taken, size, withNote, metrics);
    if (best.cost > 0 && withNote) {
      const bare = bestSpot(mark, p, taken, size, false, metrics);
      if (bare.cost < best.cost) { best = bare; withNote = false; }
    }
    if (best.cost > 0 && !mark.dot.classList.contains("is-origin")) {
      mark.name.style.visibility = "hidden";
      mark.note.style.visibility = "hidden";
      return;
    }
    const slide = Math.max(0, 6 - best.box.left) - Math.max(0, best.box.right - (size.width - 6));
    if (slide) { best.dx += slide; best.box.left += slide; best.box.right += slide; }
    taken.push(best.box);
    [mark.name, mark.note].forEach((node) => node.setAttribute("text-anchor", best.anchor));
    mark.name.style.visibility = "";
    mark.name.setAttribute("x", (p.x + best.dx).toFixed(1));
    mark.name.setAttribute("y", (p.y + best.dy + metrics.name * 0.9).toFixed(1));
    mark.note.style.visibility = withNote ? "" : "hidden";
    mark.note.setAttribute("x", (p.x + best.dx).toFixed(1));
    mark.note.setAttribute("y", (p.y + best.dy + metrics.name * 1.35 + metrics.note * 1.0).toFixed(1));
  }
  function placeLineLabel(node, points, project, lift, taken, size) {
    node.style.visibility = "hidden";
    if (!points.length) return;
    const step = Math.max(1, Math.floor(points.length / 16));
    const middle = Math.floor(points.length / 2);
    const order = [];
    for (let k = 0; k <= points.length; k += step) {
      if (middle + k < points.length) order.push(middle + k);
      if (k && middle - k >= 0) order.push(middle - k);
    }
    for (const index of order) {
      const p = project(points[index][0], points[index][1], lift);
      if (!p.visible) continue;
      node.setAttribute("x", p.x.toFixed(1));
      node.setAttribute("y", (p.y - 8).toFixed(1));
      const b = node.getBBox();
      const box = { left: b.x - 4, right: b.x + b.width + 4, top: b.y - 2, bottom: b.y + b.height + 2 };
      if (box.left < 6 || box.right > size.width - 6 || box.top < 6 || box.bottom > size.height - 6) continue;
      if (taken.some((other) => overlapArea(box, other) > 0)) continue;
      taken.push(box);
      node.style.visibility = "";
      return;
    }
  }
  function reserve(taken, points) {
    points.forEach((p) => { if (p.visible) taken.push({ left: p.x - 6, right: p.x + 6, top: p.y - 6, bottom: p.y + 6 }); });
  }
  function placeText(node, p, dx, dy, taken, size) {
    node.style.visibility = p.visible ? "" : "hidden";
    node.setAttribute("x", (p.x + dx).toFixed(1));
    node.setAttribute("y", (p.y + dy).toFixed(1));
    if (taken && p.visible) {
      const b = node.getBBox();
      const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
      const outside = box.left < 6 || box.right > size.width - 6 || box.top < 6 || box.bottom > size.height - 6;
      if (outside || taken.some((other) => overlapArea(box, other) > 0)) node.style.visibility = "hidden";
      else taken.push(box);
    }
  }
  // A curved arrow from a to b (screen points), bending to the left of the direction of travel.
  function arrowPath(a, b, bend = 0.18) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const cx = mx - dy * bend, cy = my + dx * bend;
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }

  /* ---------- part one: the wide terrain ---------- */

  const defs = make("defs", {}, marks);
  const marker = make("marker", { id: "arrow-head", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
  make("path", { d: "M0,1L9,5L0,9Z", class: "arrow-head" }, marker);

  const wideLayer = layer("wide");
  const riverNames = { indus: ["印度河", "Indus"], ganges: ["恒河", "Ganges"] };
  const wideRivers = Object.entries(geography.wide.rivers).flatMap(([name, parts]) =>
    parts.map((points) => ({ name, points, node: make("path", { class: "river" }, wideLayer) })));
  const wideRiverLabels = Object.keys(geography.wide.rivers).map((name) => ({
    name, points: geography.wide.rivers[name].flat(), node: make("text", { class: "river-label", "text-anchor": "middle" }, wideLayer)
  }));
  const arrows = {
    india: make("path", { class: "idea-arrow", "marker-end": "url(#arrow-head)" }, wideLayer),
    greece: make("path", { class: "idea-arrow is-greek", "marker-end": "url(#arrow-head)" }, wideLayer),
    china: make("path", { class: "idea-arrow", "marker-end": "url(#arrow-head)" }, wideLayer)
  };
  const regionLabels = geography.regions.map((region) => ({ region, node: make("text", { class: "region-label", "text-anchor": "middle" }, wideLayer) }));
  const wideMarks = { mogao: pointMark(wideLayer, "is-origin"), gandhara: pointMark(wideLayer, "is-site") };

  function drawWide(project, size, taken) {
    const mogao = project(place("mogao").lon, place("mogao").lat, 2500);
    const gandhara = project(place("gandhara").lon, place("gandhara").lat, 2500);
    const regionAt = (id) => { const r = geography.regions.find((item) => item.id === id); return project(r.lon, r.lat, 2500); };
    wideRivers.forEach(({ points, node }) => node.setAttribute("d", polyline(points, project, 2000)));
    reserve(taken, [mogao, gandhara]);
    const after = (name) => ["west", "dunhuang", "india", "china"].indexOf(stage) >= ["west", "dunhuang", "india", "china"].indexOf(name);
    // region names first: the Dunhuang label (always shown) and Gandhara's note find room around them
    regionLabels.forEach(({ region, node }) => {
      const shown = region.id === "western-regions" ? stage === "west" && language === "en" : after("india");
      if (shown) placeText(node, regionAt(region.id), 0, 0, taken, size);
      else node.style.visibility = "hidden";
    });
    placeMark(wideMarks.mogao, mogao, taken, size);
    if (after("india")) placeMark(wideMarks.gandhara, gandhara, taken, size);
    else hideMark(wideMarks.gandhara);
    // the idea's direction: India -> Gandhara (Greece joining from the west) -> Dunhuang
    const india = regionAt("india"), greece = regionAt("greece");
    arrows.india.setAttribute("d", after("india") && india.visible && gandhara.visible ? arrowPath(india, gandhara, 0.2) : "");
    arrows.greece.setAttribute("d", after("india") && greece.visible && gandhara.visible ? arrowPath(greece, gandhara, -0.12) : "");
    arrows.china.setAttribute("d", after("china") && gandhara.visible && mogao.visible ? arrowPath(gandhara, mogao, -0.16) : "");
    wideRiverLabels.forEach(({ points, node }) => {
      if (after("india")) placeLineLabel(node, points, project, 2000, taken, size);
      else node.style.visibility = "hidden";
    });
  }

  /* ---------- parts two and four: the Dunhuang area; part three: the cliff ---------- */

  const localLayer = layer("local");
  const localRivers = Object.entries(geography.local.rivers).flatMap(([name, parts]) =>
    parts.map((part) => ({ name, points: part.points, node: make("path", { class: `river ${name === "大泉河" ? "is-daquan" : ""}` }, localLayer) })));
  const localRiverLabels = Object.entries(geography.local.rivers).map(([name, parts]) => ({
    name, points: parts.flatMap((part) => part.points), node: make("text", { class: "river-label", "text-anchor": "middle" }, localLayer)
  }));
  const cliffLines = geography.local.cliffs.map((c) => ({ points: c.points, node: make("path", { class: "cliff-line" }, localLayer) }));
  const villagerCircle = make("path", { class: "villager-circle" }, localLayer);
  const villagerLabel = make("text", { class: "circle-label", "text-anchor": "middle" }, localLayer);
  const moon = make("circle", { class: "moon", r: 16 }, localLayer);
  const localMarks = {
    mogao: pointMark(localLayer, "is-origin"),
    dunhuang: pointMark(localLayer, "is-town"),
    mingsha: pointMark(localLayer, "is-local")
  };
  const localRiverNames = { "大泉河": ["大泉河", "Daquan River"], "党河": ["党河", "Dang River"] };

  // the villagers' circle: 15 km around the caves (the Chinese text)
  const circlePoints = (() => {
    const mogao = place("mogao");
    const km = geography.villagersKm;
    return Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      return [mogao.lon + (km * Math.sin(a)) / (111.32 * Math.cos((mogao.lat * Math.PI) / 180)), mogao.lat + (km * Math.cos(a)) / 110.574];
    });
  })();

  function drawLocal(project, size, taken) {
    const lift = view.terrain === "cliff" ? 6 : 20;
    cliffLines.forEach(({ points, node }) => node.setAttribute("d", polyline(points, project, lift)));
    localRivers.forEach(({ points, node }) => node.setAttribute("d", polyline(points, project, lift)));
    marks.classList.toggle("is-moonlit", view.night > 0.5);
    const showCircle = level === 4 && stage === "villagers";
    villagerCircle.setAttribute("d", showCircle ? polyline(circlePoints, project, 40, true) : "");
    const mogao = project(place("mogao").lon, place("mogao").lat, lift);
    const dunhuang = project(place("dunhuang").lon, place("dunhuang").lat, lift);
    const mingsha = project(place("mingsha").lon, place("mingsha").lat, lift);
    reserve(taken, [mogao, dunhuang, mingsha]);
    placeMark(localMarks.mogao, mogao, taken, size);
    if (view.terrain === "local" || view.terrain === "region") {
      placeMark(localMarks.dunhuang, dunhuang, taken, size);
      placeMark(localMarks.mingsha, mingsha, taken, size);
    } else {
      hideMark(localMarks.dunhuang);
      hideMark(localMarks.mingsha);
    }
    if (showCircle) {
      const north = circlePoints[0];
      placeText(villagerLabel, project(north[0], north[1], 40), 0, -10, taken, size);
    } else villagerLabel.style.visibility = "hidden";
    moon.style.opacity = String(Math.max(0, view.night - 0.3));
    moon.setAttribute("cx", (size.width * 0.8).toFixed(1));
    moon.setAttribute("cy", (Math.max(90, size.height * 0.16)).toFixed(1));
    localRiverLabels.forEach(({ points, node }) => placeLineLabel(node, points, project, lift, taken, size));
  }

  /* ---------- part three: the schematic cliff face and the dynasties ---------- */

  const caves = [...geography.caves.list].sort((a, b) => a.step - b.step || a.number - b.number);
  let activeStep = -1;
  function drawCliffPanel() {
    const width = cliffSvg.clientWidth || 600;
    const height = cliffSvg.clientHeight || 120;
    cliffSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    cliffSvg.replaceChildren();
    const top = 10;
    const faceBottom = height - 48; // two caption lines sit below the face
    // the cliff: a slightly uneven top edge, three tiers of niches
    let edge = `M0,${faceBottom}V${top + 8}`;
    for (let x = 0; x <= width; x += width / 12) edge += `L${x.toFixed(1)},${(top + 6 * Math.sin(x / 37) + 4 * Math.cos(x / 13)).toFixed(1)}`;
    make("path", { class: "cliff-face", d: `${edge}V${faceBottom}Z` }, cliffSvg);
    const tiers = 3;
    const perTier = Math.ceil(caves.length / tiers);
    const cellW = width / (perTier + 1);
    const nicheH = Math.min(24, (faceBottom - top - 26) / tiers - 8);
    const nicheW = Math.min(18, cellW * 0.55, nicheH / 1.3);
    caves.forEach((cave, index) => {
      // columns run in time order; the three tiers are only there to look like a cliff face
      const column = Math.floor(index / tiers);
      const tier = index % tiers;
      const x = cellW * (column + 1) - nicheW / 2 + (tier - 1) * cellW * 0.18;
      const y = top + 14 + tier * (nicheH + 8);
      const cls = cave.step === activeStep ? "niche is-now" : cave.step < activeStep ? "niche is-past" : "niche";
      const group = make("g", { class: cls }, cliffSvg);
      make("path", { d: `M${x.toFixed(1)},${(y + nicheH).toFixed(1)}V${(y + nicheW / 2).toFixed(1)}A${(nicheW / 2).toFixed(1)},${(nicheW / 2).toFixed(1)} 0 0 1 ${(x + nicheW).toFixed(1)},${(y + nicheW / 2).toFixed(1)}V${(y + nicheH).toFixed(1)}Z` }, group);
    });
    // what the current step holds, in words: the cave numbers, then one note on a second line
    const now = caves.filter((cave) => cave.step === activeStep);
    // the note that matches the essay's paragraph comes first (the flying apsaras, the Pure Land, the dancer with the pipa)
    const featured = [420, 220, 112, 61, 3, 17, 320, 323, 329];
    const noted = now.filter((cave) => cave.note).sort((x, y) => featured.indexOf(x.number) - featured.indexOf(y.number))[0];
    const zh = language === "zh";
    const stepName = activeStep >= 0 ? geography.caves.steps[language][activeStep] : "";
    let first = "", second = "";
    if (activeStep >= 0 && now.length) {
      first = zh ? `${stepName}：第 ${now.map((cave) => cave.number).join("、")} 窟` : `${stepName}: caves ${now.map((cave) => cave.number).join(", ")}`;
      if (noted) second = zh ? `第 ${noted.number} 窟 · ${noted.note.zh}` : `Cave ${noted.number}: ${noted.note.en}`;
    } else if (activeStep === 5) first = zh ? "宋：原文没有写到具体洞窟" : "Song: the essay names no cave";
    else if (activeStep === 7) first = zh ? "明清：“没有太多的东西可以记住”" : "Ming and Qing: “not much worth remembering”";
    const lines = [first, second].filter(Boolean);
    lines.forEach((text, index) => {
      const node = make("text", { class: "cliff-caption", x: 4, y: (faceBottom + 20 + index * 20).toFixed(1) }, cliffSvg);
      node.textContent = text;
      // a list too long for the panel becomes a count
      if (index === 0 && node.getComputedTextLength && node.getComputedTextLength() > width - 8 && now.length) {
        node.textContent = zh ? `${stepName}：${now.length} 个洞窟示例` : `${stepName}: ${now.length} example caves`;
      }
      if (index === 1 && node.getComputedTextLength && node.getComputedTextLength() > width - 8) node.remove();
    });
  }

  function renderDynastyTrack() {
    const steps = geography.caves.steps[language];
    dynastyTrack.style.setProperty("--n", String(steps.length));
    dynastyTrack.replaceChildren(...steps.map((step, index) => {
      const tick = document.createElement("span");
      tick.className = "dynasty-tick";
      tick.textContent = step;
      tick.classList.toggle("is-passed", index <= activeStep);
      tick.classList.toggle("is-now", index === activeStep);
      return tick;
    }));
    dynastyTrack.style.setProperty("--f", String(Math.max(0, activeStep) / (steps.length - 1)));
  }

  /* ---------- part four: the world map (2D, as in 道士塔) ---------- */

  // The same flat world map as part one (world-map.js); each stage moves its camera. The lines are
  // curves that show direction only, not routes (as in 道士塔).
  const worldTargets = {
    america: { arcs: ["harvard", "philadelphia"] },
    beijing: { arcs: ["beijing"] },
    world: { arcs: ["harvard", "philadelphia", "beijing"] }
  };
  const worldParts = { arcs: {}, labels: {} };
  ["beijing", "harvard", "philadelphia"].forEach((id) => { worldParts.arcs[id] = make("path", { class: "world-arc" }, globeSvg); });
  ["mogao", "beijing", "harvard", "philadelphia"].forEach((id) => {
    worldParts.labels[id] = { dot: make("circle", { class: `dot ${id === "mogao" ? "is-origin" : "is-site"}`, r: 4 }, globeSvg), name: make("text", { class: `name ${id === "mogao" ? "is-origin" : ""}` }, globeSvg), note: make("text", { class: "note" }, globeSvg) };
  });

  // A curve from a to b that bows toward the top of the map, like 道士塔's routes.
  function worldCurve(a, b) {
    const lift = Math.max(24, Math.abs(b.x - a.x) * 0.18);
    const top = Math.min(a.y, b.y) - lift;
    const dx = b.x - a.x;
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)}C${(a.x + dx * 0.34).toFixed(1)},${top.toFixed(1)} ${(a.x + dx * 0.68).toFixed(1)},${top.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }

  // Part four's lines and names, on the flat world map's camera.
  function drawWorld(project) {
    const target = worldTargets[stage];
    if (!target) return;
    const { width, height } = globeSvg.getBoundingClientRect();
    if (!width || !height) return;
    globeSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const at = (id) => project(place(id).lon, place(id).lat);
    Object.entries(worldParts.arcs).forEach(([id, node]) => {
      node.setAttribute("d", target.arcs.includes(id) ? worldCurve(at(id), at("mogao")) : "");
    });
    const size = { width, height };
    const origin = globeSvg.getBoundingClientRect();
    const taken = [compass].map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 4, right: b.right - origin.left + 4, top: b.top - origin.top - 4, bottom: b.bottom - origin.top + 4 };
    });
    const shownIds = ["mogao", ...target.arcs];
    // a narrow panel has room for the short names only (the notes drawer keeps the full ones)
    const short = { harvard: ["哈佛", "Harvard"], philadelphia: ["费城", "Philadelphia"] };
    Object.entries(short).forEach(([id, names]) => {
      worldParts.labels[id].name.textContent = width < 520 ? names[language === "zh" ? 0 : 1] : place(id)[language === "zh" ? "zh" : "en"];
    });
    reserve(taken, shownIds.map(at));
    Object.entries(worldParts.labels).forEach(([id, mark]) => {
      if (shownIds.includes(id)) placeMark(mark, at(id), taken, size);
      else hideMark(mark);
    });
  }

  /* ---------- frame ---------- */

  function drawMarks(project, nextView) {
    view = nextView;
    const { width, height } = marks.getBoundingClientRect();
    const size = { width, height };
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    marks.dataset.terrain = view.shown ? view.terrain : "none";
    compass.style.setProperty("--north", `${(view.north * 180 / Math.PI).toFixed(1)}deg`);
    const origin = marks.getBoundingClientRect();
    const furniture = [compass];
    if (level === 3) furniture.push(document.querySelector(".cliff-panel"));
    const taken = furniture.map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 4, right: b.right - origin.left + 4, top: b.top - origin.top - 4, bottom: b.bottom - origin.top + 4 };
    });
    if (!view.shown) return;
    if (view.terrain === "wide") drawWide(project, size, taken);
    else if (view.terrain === "world") drawWorld(project);
    else drawLocal(project, size, taken);
  }

  /* ---------- text ---------- */

  function setMapText() {
    const zh = language === "zh";
    const name = (id) => place(id)[zh ? "zh" : "en"];
    wideMarks.mogao.name.textContent = zh ? "敦煌 · 莫高窟" : "Dunhuang · Mogao";
    wideMarks.mogao.note.textContent = zh ? "公元 366 年开窟" : "first cave cut in 366";
    wideMarks.gandhara.name.textContent = name("gandhara");
    wideMarks.gandhara.note.textContent = zh ? "希腊雕塑的影响" : "Greek sculpture’s influence";
    regionLabels.forEach(({ region, node }) => { node.textContent = region[zh ? "zh" : "en"]; });
    wideRiverLabels.forEach(({ name: river, node }) => { node.textContent = riverNames[river][zh ? 0 : 1]; });
    localMarks.mogao.name.textContent = name("mogao");
    localMarks.mogao.note.textContent = zh ? "鸣沙山东麓的断崖" : "the cliff on Echoing Sand Hill’s east face";
    localMarks.dunhuang.name.textContent = name("dunhuang");
    localMarks.dunhuang.note.textContent = zh ? `直线约 ${place("dunhuang").distanceKm} km` : `${place("dunhuang").distanceKm} km in a straight line`;
    localMarks.mingsha.name.textContent = name("mingsha");
    localMarks.mingsha.note.textContent = "";
    localRiverLabels.forEach(({ name: river, node }) => { node.textContent = (localRiverNames[river] || [river, river])[zh ? 0 : 1]; });
    villagerLabel.textContent = zh ? `约 ${geography.villagersKm} 公里` : `about ${geography.villagersKm} km`;
    const globeText = {
      mogao: [name("mogao"), ""],
      beijing: [name("beijing"), zh ? "陈万里受雇于此" : "where Chen Wanli was hired"],
      harvard: [name("harvard"), zh ? "兰登·华尔纳" : "Langdon Warner"],
      philadelphia: [name("philadelphia"), zh ? "霍勒斯·杰恩" : "Horace Jayne"]
    };
    Object.entries(worldParts.labels).forEach(([id, mark]) => { [mark.name.textContent, mark.note.textContent] = globeText[id]; });
    compass.querySelector("text").textContent = zh ? "北" : "N";
    compass.setAttribute("aria-label", zh ? "指北针" : "North arrow");
    renderDynastyTrack();
    drawCliffPanel();
  }

  // Which paragraph of the active section is at the reading line, and the map stage it calls for.
  function updateStage() {
    const section = scroller.querySelectorAll(".reading-section")[level - 1];
    if (!section) return;
    const paragraphs = [...section.querySelectorAll(".reading-section-body p")];
    const line = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.4;
    let index = 0;
    paragraphs.forEach((p, i) => { if (p.getBoundingClientRect().top <= line) index = i; });
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) index = paragraphs.length - 1;
    const list = stages[language][level - 1] || [];
    const next = list[Math.min(index, list.length - 1)] || "";
    let t = 0;
    if (level === 3) {
      const step = Number(next.replace("step", ""));
      if (step !== activeStep) {
        activeStep = step;
        renderDynastyTrack();
        drawCliffPanel();
      }
      t = Math.max(0, step) / 7;
    }
    if (next !== stage) {
      stage = next;
      body.dataset.stage = stage;
    }
    window.MOGAO_TERRAIN_RENDERER?.setStage(stage.startsWith("step") ? "cliff" : stage, t);
    window.MOGAO_WORLD_MAP_VIEW?.setView(level, stage);
    body.classList.toggle("globe-shown", level === 4 && Boolean(worldTargets[stage]));
  }

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    level = state.active + 1;
    setMapText();
    window.requestAnimationFrame(updateStage);
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    stage = "";
    activeStep = -1;
    window.MOGAO_TERRAIN_RENDERER?.setState(level);
    window.MOGAO_WORLD_MAP_VIEW?.setView(level, stage);
    body.classList.toggle("globe-shown", false);
    renderDynastyTrack();
    drawCliffPanel();
    window.requestAnimationFrame(updateStage);
  }

  // Parts one and four's world stages are the flat world map (world-map.js); the rest is the 3D terrain.
  window.MOGAO_TERRAIN_RENDERER?.onFrame((project, nextView) => {
    if (!window.MOGAO_WORLD_MAP_VIEW?.active()) drawMarks(project, nextView);
  });
  window.MOGAO_WORLD_MAP_VIEW?.onFrame((project, flatView) => {
    drawMarks(project, { terrain: level === 1 ? "wide" : "world", north: flatView.north, night: 0, shown: true });
  });
  scroller.addEventListener("scroll", () => window.requestAnimationFrame(updateStage), { passive: true });
  window.addEventListener("resize", () => window.requestAnimationFrame(drawCliffPanel));

  ChapterShell.init({
    id: "mogao-caves",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender,
    onSection,
    showReaderLocation: false,
    showReaderProgress: false
  });
})();
