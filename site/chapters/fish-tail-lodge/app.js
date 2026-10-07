(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.FISHTAIL_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Keep the rail neutral: the essay's six numbered sections are the source structure.
  const sections = {
    zh: [
      { label: "一" },
      { label: "二" },
      { label: "三" },
      { label: "四" },
      { label: "五" },
      { label: "六" }
    ],
    en: [
      { label: "I" },
      { label: "II" },
      { label: "III" },
      { label: "IV" },
      { label: "V" },
      { label: "VI" }
    ]
  };

  const elevations = geography.elevations;
  const fmt = (n) => Number(n).toLocaleString("en");
  const copy = {
    zh: {
      "map-aria": "喜马拉雅山南麓与古文明遗址的三维地形图",
      "map-teaser": "雪峰下，回望中国。",
      thesis: "离开之后，才读懂了它。",
      open: "进入章节",
      "rail-caption": "原文章节",
      "notes-keyboard": "↑ ↓ ← → 切换节次 · L 切换语言 · Esc 关闭本面板",
      "data-views-label": "视图",
      "data-views": "第一节先从南亚总览进入尼泊尔，再沿加德满都—博克拉方向缩放，最后切入博克拉一带的三维地形（鱼尾山屋、费瓦湖、鱼尾峰、安纳布尔纳）；第二至四节换成从地中海到太平洋的大范围地形，北方朝上；第五、六节是加德满都到边境的三维地形，最后停在波特科西河峡谷的中尼友谊桥。",
      "data-sites-label": "遗址",
      "data-sites": "第一节沿加德满都—博克拉的实际公路方向展开。第二、三节只标出正文正在谈论的古文明地点；悬停或聚焦正文中的地名，地图会点亮相应地点与河流。千禧之旅的完整行程与日期出自《千年一叹》，本文没有写。原文只说“古代波斯文明”，地图以波斯波利斯为代表点。",
      "data-barrier-label": "屏障",
      "data-barrier": "第四节依原文标出喜马拉雅、昆仑、天山、阿尔泰，塔克拉玛干与戈壁，以及东面、南面的海；不画国界。读到去蓝毗尼的一段，镜头移回尼泊尔。",
      "data-text-label": "原文与地理",
      "data-text": "原文说乘拉缆浮筏“渡过了一条清澈的雪水河”，鱼尾山屋其实在费瓦湖畔，地图画湖，正文照原文。去蓝毗尼“来回行车六百公里”是公路里程，直线距离约 105 公里。第五节的车队路线沿今阿尼哥公路（约 " + fmt(geography.border.highwayKm) + " 公里），只是示意这一段路，不是当年车队的实测轨迹。",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 经纬度，每块地形按其中心纬度的余弦等比例展开；大范围地形跨度大，东西向距离在南北两端有明显误差。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM GLO-90：博克拉约 250 米一格、边境约 340 米一格；大范围地形由内部缩图层平均为约 28 公里一格。为了看得见，高程都有夸大，大范围地形夸大最多。",
      "data-height-label": "海拔",
      "data-height": "原文说关口海拔一千九百米、樟木两千六百米。DEM 在友谊桥点位约 " + fmt(elevations.bridge.point) + " 米、附近最高 " + fmt(elevations.bridge.max5x5) + " 米；樟木镇代表点约 " + fmt(elevations.zhangmu.point) + " 米，附近最高 " + fmt(elevations.zhangmu.max5x5) + " 米（樟木沿山坡分布，高差很大）。鱼尾峰公开资料为 6,993 米，DEM 格网会削低峰顶（约 " + fmt(elevations.machhapuchhre.max5x5) + " 米）。地图标公开资料与 DEM，正文照原文。",
      "notes-source-1": "地点：Wikidata 坐标属性 P625，2026 年 9 月 27 日取得（鱼尾山屋 Q111402808、鱼尾峰 Q1051394、蓝毗尼 Q9213、中尼友谊桥 Q7524764 等 23 处）",
      "notes-source-2": "地形：Copernicus DEM GLO-90（© DLR e.V. 2010–2014，© Airbus Defence and Space GmbH 2014–2018，欧盟与 ESA 哥白尼计划提供）",
      "notes-source-3": "费瓦湖、河流、阿尼哥公路：OpenStreetMap contributors（ODbL 1.0），经 Overpass API 于 2026 年 9 月 27 日取得",
      "notes-source-4": "山系、沙漠、海域与大河：Natural Earth（公有领域）",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或边境通行信息。地图不画国界。",
      "complete-line": "惟告别，方领悟。"
    },
    en: {
      "map-aria": "Terrain maps of the southern Himalayas and the ancient sites named in the essay",
      "map-teaser": "Beneath snow peaks",
      thesis: "I did not comprehend it until I was separated from it.",
      open: "Enter chapter",
      "rail-caption": "Sections",
      "notes-keyboard": "↑ ↓ ← → switch sections · L language · Esc closes this panel",
      "data-views-label": "Views",
      "data-views": "Section one begins with a South Asia overview, zooms along the Kathmandu–Pokhara direction, then resolves into 3D terrain around Pokhara (the lodge, Phewa Lake, Machhapuchhre, Annapurna). Sections two to four use a wide terrain from the Mediterranean to the Pacific, north up. Sections five and six are 3D terrain from Kathmandu to the border, ending at the Friendship Bridge in the Bhote Koshi gorge.",
      "data-sites-label": "Sites",
      "data-sites": "Section one follows the actual road direction from Kathmandu to Pokhara. Sections two and three show only the ancient sites being discussed in the text; hovering or focusing a place name lights up its site and related rivers on the map. The full itinerary and dates of the millennium journey are in Sign in a Thousand Years, not in this essay. The essay speaks only of “ancient Persian civilization”; Persepolis stands for it.",
      "data-barrier-label": "Barriers",
      "data-barrier": "Section four marks what the essay names: the Himalayas, Kunlun, Tian Shan and Altai, the Taklimakan and the Gobi, and the seas to the east and south; no borders are drawn. When the day trip to Lumbini begins, the view returns to Nepal.",
      "data-text-label": "Text and ground",
      "data-text": "The essay says they crossed “a clear river of snowmelt” by raft; Fish Tail Lodge is in fact on Phewa Lake, so the map shows the lake while the text is kept as written. The “six hundred kilometers” to Lumbini and back is road distance; the straight line is about 105 km. The motorcade in section five follows today’s Araniko Highway (about " + fmt(geography.border.highwayKm) + " km) to show the road, not the motorcade’s surveyed track.",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 longitude and latitude, each terrain scaled by the cosine of its central latitude. The wide terrain spans so much that east-west distances are noticeably off at its north and south edges.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM GLO-90: about 250 m per cell around Pokhara and 340 m at the border; the wide terrain is averaged from the internal overviews to about 28 km. Heights are exaggerated so the relief is visible, the wide terrain most of all.",
      "data-height-label": "Heights",
      "data-height": "The essay gives 1,900 m at the border post and 2,600 m at Zhangmu. The DEM reads about " + fmt(elevations.bridge.point) + " m at the bridge (" + fmt(elevations.bridge.max5x5) + " m highest nearby) and " + fmt(elevations.zhangmu.point) + " m at Zhangmu’s point (" + fmt(elevations.zhangmu.max5x5) + " m nearby; the town climbs a steep slope). Machhapuchhre is published as 6,993 m; the DEM grid lowers the summit (about " + fmt(elevations.machhapuchhre.max5x5) + " m). The map shows published and DEM heights; the text is kept as written.",
      "notes-source-1": "Places: Wikidata coordinate property P625, retrieved 27 September 2026 (Fish Tail Lodge Q111402808, Machhapuchhre Q1051394, Lumbini Q9213, Sino-Nepal Friendship Bridge Q7524764 and 19 more)",
      "notes-source-2": "Terrain: Copernicus DEM GLO-90 (© DLR e.V. 2010–2014, © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)",
      "notes-source-3": "Phewa Lake, rivers, Araniko Highway: OpenStreetMap contributors (ODbL 1.0), via the Overpass API, 27 September 2026",
      "notes-source-4": "Ranges, deserts, seas and great rivers: Natural Earth (public domain)",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or border-crossing information. No borders are drawn.",
      "complete-line": "Only in departure do we truly begin to comprehend it."
    }
  };

  // The English edition sets each section opening in capitals; show them in sentence case.
  const englishOpenings = new Map([
    ["IN THE LAST YEAR ", "In the last year "],
    ["I ARRIVED AT A PLACE CALLED POKHARA ", "I arrived at a place called Pokhara "],
    ["THE HIMALAYAS ", "The Himalayas "],
    ["OUR ROUTE “OUT OF EGYPT” ", "Our route “out of Egypt” "],
    ["I INVESTIGATED ", "I investigated "],
    ["TODAY WAS THE LAST DAY ", "Today was the last day "],
    ["A MAJOR ROAD FROM NEPAL TO CHINA ", "A major road from Nepal to China "]
  ]);
  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    for (const [opening, replacement] of englishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  /* ---------- map labels ---------- */

  const body = document.body;
  const svgNS = "http://www.w3.org/2000/svg";
  const scroller = document.querySelector(".reader-scroll");
  const marks = document.querySelector(".terrain-marks");
  const compass = document.querySelector(".compass");
  const place = (id) => geography.places.find((p) => p.id === id);
  let language = body.dataset.language || "zh";
  let level = 1;
  let progress = 0;
  let view = { terrain: "pokhara", north: 0, night: 0, glow: 0, zoomedToNepal: false };
  let narrativeFocusKey = null;
  let pointerFocusKey = null;
  let keyboardFocusKey = null;
  let lockedFocusKey = null;

  const wideFocusGroups = {
    "section-2": { sites: ["parthenon", "olympia", "mycenae", "knossos", "giza", "cairo", "luxor"], rivers: [] },
    greece: { sites: ["parthenon", "olympia", "mycenae", "knossos"], rivers: [] },
    egypt: { sites: ["giza", "cairo", "luxor"], rivers: ["nile"] },
    "section-3": { sites: ["sinai", "jerusalem", "baghdad", "babylon", "persepolis", "mohenjo"], rivers: ["jordan", "tigris", "euphrates", "indus"] },
    levant: { sites: ["sinai", "jerusalem"], rivers: ["jordan"] },
    mesopotamia: { sites: ["baghdad", "babylon"], rivers: ["tigris", "euphrates"] },
    persia: { sites: ["persepolis"], rivers: [] },
    indus: { sites: ["mohenjo"], rivers: ["indus"] },
    parthenon: { sites: ["parthenon"], rivers: [] },
    olympia: { sites: ["olympia"], rivers: [] },
    mycenae: { sites: ["mycenae"], rivers: [] },
    knossos: { sites: ["knossos"], rivers: [] },
    giza: { sites: ["giza"], rivers: [] },
    cairo: { sites: ["cairo"], rivers: ["nile"] },
    luxor: { sites: ["luxor"], rivers: ["nile"] },
    nile: { sites: ["giza", "cairo", "luxor"], rivers: ["nile"] },
    sinai: { sites: ["sinai"], rivers: [] },
    jerusalem: { sites: ["jerusalem"], rivers: ["jordan"] },
    jordan: { sites: ["jerusalem"], rivers: ["jordan"] },
    baghdad: { sites: ["baghdad"], rivers: ["tigris"] },
    babylon: { sites: ["babylon"], rivers: ["tigris", "euphrates"] },
    tigris: { sites: ["baghdad", "babylon"], rivers: ["tigris"] },
    euphrates: { sites: ["babylon"], rivers: ["euphrates"] },
    persepolis: { sites: ["persepolis"], rivers: [] },
    mohenjo: { sites: ["mohenjo"], rivers: ["indus"] }
  };

  const paragraphFocus = {
    2: ["section-2", "section-2", "section-2", "section-2", "section-2", "greece", "greece", "greece", "greece", "egypt", "egypt", "egypt", "egypt"],
    3: ["section-3", "section-3", "section-3", "section-3", "levant", "levant", "levant", "levant", "levant", "mesopotamia", "mesopotamia", "mesopotamia", "persia", "indus", "section-3", "section-3"]
  };

  const narrativeTerms = {
    zh: [
      ["美索不达米亚文明", "mesopotamia"], ["摩亨佐·达罗", "mohenjo"], ["巴特农神庙", "parthenon"],
      ["古希腊文明", "greece"], ["希腊文明", "greece"], ["埃及文明", "egypt"], ["波斯文明", "persia"],
      ["底格里斯河", "tigris"], ["幼发拉底河", "euphrates"], ["西奈沙漠", "sinai"], ["印度文明", "indus"],
      ["巴比伦文明", "mesopotamia"], ["巴比伦帝国", "babylon"], ["奥林匹亚", "olympia"], ["迈锡尼", "mycenae"], ["克里特岛", "knossos"], ["克里特", "knossos"],
      ["金字塔", "giza"], ["尼罗河", "nile"], ["开罗", "cairo"], ["卢克索", "luxor"],
      ["约旦河", "jordan"], ["耶路撒冷", "jerusalem"], ["巴格达", "baghdad"], ["巴比伦", "babylon"],
      ["波斯帝国", "persia"], ["波斯", "persia"], ["印度河", "indus"]
    ],
    en: [
      ["Mesopotamian civilization", "mesopotamia"], ["Mohenjo-daro", "mohenjo"], ["Parthenon", "parthenon"],
      ["Greek civilization", "greece"], ["Egyptian civilization", "egypt"], ["Persian civilization", "persia"],
      ["Tigris River", "tigris"], ["Euphrates River", "euphrates"], ["Sinai Desert", "sinai"], ["Indian civilization", "indus"],
      ["Babylonian civilization", "mesopotamia"], ["Babylonian Empire", "babylon"], ["Olympia", "olympia"], ["Mycenae", "mycenae"], ["Crete", "knossos"], ["Pyramids", "giza"],
      ["Nile River", "nile"], ["Nile", "nile"], ["Cairo", "cairo"], ["Luxor", "luxor"],
      ["Jordan River", "jordan"], ["Jerusalem", "jerusalem"], ["Baghdad", "baghdad"], ["Babylon", "babylon"],
      ["Persian Empire", "persia"], ["Persia", "persia"], ["Indus River", "indus"]
    ]
  };

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

  // A labelled point: dot, name, optional note. Labels avoid each other and the panel edges.
  function pointMark(parent, cls) {
    return {
      halo: make("circle", { class: `dot-halo ${cls}`, r: 11 }, parent),
      dot: make("circle", { class: `dot ${cls}`, r: 4 }, parent),
      name: make("text", { class: `name ${cls}` }, parent),
      note: make("text", { class: `note ${cls}` }, parent)
    };
  }
  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  // Offsets follow the rendered type size, so labels keep their spacing at any size.
  const typeSize = (node) => parseFloat(window.getComputedStyle(node).fontSize) || 16;
  function boxOf(mark, p, dx, dy, anchor, withNote, metrics) {
    const width = Math.max(mark.name.getComputedTextLength(), withNote ? mark.note.getComputedTextLength() : 0);
    const left = anchor === "end" ? p.x + dx - width : p.x + dx;
    const height = metrics.name * 1.15 + (withNote ? metrics.name * 0.2 + metrics.note * 1.3 : 0);
    return { left, right: left + width, top: p.y + dy, bottom: p.y + dy + height };
  }
  function hideMark(mark) {
    mark.halo.style.visibility = "hidden";
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
  function placeMark(mark, p, taken, size, noteOn = true, force = false) {
    if (!p.visible) return hideMark(mark);
    const metrics = { name: typeSize(mark.name), note: typeSize(mark.note) };
    let withNote = noteOn && Boolean(mark.note.textContent) && size.width >= 520;
    mark.halo.style.visibility = "";
    mark.halo.setAttribute("cx", p.x.toFixed(1));
    mark.halo.setAttribute("cy", p.y.toFixed(1));
    mark.dot.style.visibility = "";
    mark.dot.setAttribute("cx", p.x.toFixed(1));
    mark.dot.setAttribute("cy", p.y.toFixed(1));
    let best = bestSpot(mark, p, taken, size, withNote, metrics);
    // a crowded label first drops its note, then its name; the dot still marks the place
    if (best.cost > 0 && withNote) {
      const bare = bestSpot(mark, p, taken, size, false, metrics);
      if (bare.cost < best.cost) { best = bare; withNote = false; }
    }
    if (best.cost > 0 && !force && !mark.dot.classList.contains("is-origin")) {
      mark.name.style.visibility = "hidden";
      mark.note.style.visibility = "hidden";
      return;
    }
    // an always-shown label (the lodge, the bridge) slides sideways to stay inside the panel
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
  // A river's name goes on the first point along it, from the middle outward, where it fits clear of
  // everything already placed; a river with no clear spot goes unnamed.
  function placeRiverLabel(node, points, project, lift, taken, size) {
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
  // Dots are reserved before any label is placed, so no label covers another place's dot.
  function reserve(taken, points) {
    points.forEach((p) => { if (p.visible) taken.push({ left: p.x - 6, right: p.x + 6, top: p.y - 6, bottom: p.y + 6 }); });
  }
  // With `taken`, a label that would clash with another or leave the panel is hidden instead.
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

  /* part one: Pokhara */
  const pokharaLayer = layer("pokhara");
  const riverPaths = geography.pokhara.rivers.map((r) => ({ r, node: make("path", { class: "river" }, pokharaLayer) }));
  const lakePaths = geography.pokhara.lakes.map((l) => ({ l, node: make("path", { class: "lake" }, pokharaLayer) }));
  const lampGlow = make("circle", { class: "lamp-glow", r: 18 }, pokharaLayer);
  const pokharaMarks = {
    lodge: pointMark(pokharaLayer, "is-origin"),
    pokhara: pointMark(pokharaLayer, "is-town"),
    machhapuchhre: pointMark(pokharaLayer, "is-peak"),
    annapurna: pointMark(pokharaLayer, "is-peak")
  };
  const lakeLabel = make("text", { class: "water-label" }, pokharaLayer);

  /* parts two to four: wide terrain */
  const wideLayer = layer("wide");
  const wideRivers = Object.entries(geography.wide.rivers).flatMap(([name, parts]) =>
    parts.map((points) => ({ name, points, node: make("path", { class: `river river-${name}` }, wideLayer) })));
  const riverNames = {
    nile: ["尼罗河", "Nile"], tigris: ["底格里斯河", "Tigris"], euphrates: ["幼发拉底河", "Euphrates"],
    jordan: ["约旦河", "Jordan"], indus: ["印度河", "Indus"], ganges: ["恒河", "Ganges"],
    yellow: ["黄河", "Yellow River"], yangtze: ["长江", "Yangtze"]
  };
  const wideRiverLabels = Object.keys(geography.wide.rivers).map((name) => ({
    name,
    points: geography.wide.rivers[name].flat(),
    node: make("text", { class: "river-label", "text-anchor": "middle" }, wideLayer)
  }));
  const regionPaths = geography.wide.regions.map((region) => ({
    region,
    label: make("text", { class: `region-label region-${region.kind}` }, wideLayer)
  }));
  const seaLabels = geography.wide.seas.map((sea) => ({ sea, node: make("text", { class: "water-label sea" }, wideLayer) }));
  const siteMarks = geography.places.filter((p) => p.section).map((site) => {
    const mark = pointMark(wideLayer, "is-site");
    Object.values(mark).forEach((node) => { node.dataset.place = site.id; });
    return { site, mark };
  });
  const nepalMarks = { lumbini: pointMark(wideLayer, "is-site"), kathmandu: pointMark(wideLayer, "is-town") };

  /* parts five and six: the road to the border */
  const borderLayer = layer("border");
  const borderRivers = geography.border.rivers.map((r) => ({ r, node: make("path", { class: "river" }, borderLayer) }));
  const bhoteKoshi = geography.border.rivers.filter((r) => r.name === "Bhote Koshi").flatMap((r) => r.points);
  const bhoteKoshiLabel = make("text", { class: "river-label", "text-anchor": "middle" }, borderLayer);
  const roadTrace = make("path", { class: "road-trace" }, borderLayer);
  const roadDone = make("path", { class: "road" }, borderLayer);
  const motorcade = make("circle", { class: "motorcade", r: 5 }, borderLayer);
  const gate = make("path", { class: "gate" }, borderLayer);
  const borderMarks = {
    kathmandu: pointMark(borderLayer, "is-town"),
    kodari: pointMark(borderLayer, "is-town"),
    bridge: pointMark(borderLayer, "is-origin"),
    zhangmu: pointMark(borderLayer, "is-town")
  };

  const highway = geography.border.highway;

  function drawPokhara(project, size, taken) {
    riverPaths.forEach(({ r, node }) => node.setAttribute("d", polyline(r.points, project, 20)));
    lakePaths.forEach(({ l, node }) => node.setAttribute("d", polyline(l.points, project, 8, true)));
    const lodge = project(place("lodge").lon, place("lodge").lat, 30);
    const town = project(place("pokhara").lon, place("pokhara").lat, 30);
    reserve(taken, [lodge, town]);
    lampGlow.setAttribute("cx", lodge.x.toFixed(1));
    lampGlow.setAttribute("cy", lodge.y.toFixed(1));
    lampGlow.style.opacity = String(Math.max(0, view.night - 0.15) * 1.1);
    placeMark(pokharaMarks.lodge, lodge, taken, size);
    placeMark(pokharaMarks.machhapuchhre, project(place("machhapuchhre").lon, place("machhapuchhre").lat, 80), taken, size);
    placeMark(pokharaMarks.annapurna, project(place("annapurna").lon, place("annapurna").lat, 80), taken, size);
    placeMark(pokharaMarks.pokhara, town, taken, size);
    const lake = geography.pokhara.lakes[0];
    if (lake) {
      // the first spot around the lake that stays clear of the lodge and town labels
      const at = project(place("phewa").lon, place("phewa").lat, 10);
      for (const [dx, dy] of [[-36, 40], [-70, -24], [-90, 30], [0, 70], [-40, -60]]) {
        placeText(lakeLabel, at, dx, dy, taken, size);
        if (lakeLabel.style.visibility !== "hidden") break;
      }
    }
  }

  function currentWideFocus() {
    const interactionKey = pointerFocusKey || keyboardFocusKey || lockedFocusKey;
    const key = interactionKey || narrativeFocusKey;
    return {
      key,
      interaction: Boolean(interactionKey),
      group: wideFocusGroups[key] || { sites: [], rivers: [] }
    };
  }

  function setWideMarkState(mark, context, selected) {
    Object.values(mark).forEach((node) => {
      node.classList.toggle("is-context", context);
      node.classList.toggle("is-selected", selected);
      node.classList.toggle("is-muted", !context);
    });
  }

  function placeWideDot(mark, p) {
    if (!p.visible) return hideMark(mark);
    mark.halo.style.visibility = "";
    mark.halo.setAttribute("cx", p.x.toFixed(1));
    mark.halo.setAttribute("cy", p.y.toFixed(1));
    mark.dot.style.visibility = "";
    mark.dot.setAttribute("cx", p.x.toFixed(1));
    mark.dot.setAttribute("cy", p.y.toFixed(1));
    mark.name.style.visibility = "hidden";
    mark.note.style.visibility = "hidden";
  }

  function drawWide(project, size, taken) {
    const focus = currentWideFocus();
    const focusSites = new Set(focus.group.sites);
    const focusRivers = new Set(focus.group.rivers);
    const sectionRivers = level === 2 ? ["nile"] : level === 3 ? ["jordan", "tigris", "euphrates", "indus"] : ["yellow", "yangtze", "ganges"];
    wideRivers.forEach(({ name, points, node }) => {
      const show = sectionRivers.includes(name);
      node.setAttribute("d", show ? polyline(points, project, 2500) : "");
      const context = focusRivers.has(name);
      node.classList.toggle("is-context", context);
      node.classList.toggle("is-selected", focus.interaction && context);
      node.classList.toggle("is-muted", level !== 4 && !context);
    });
    const showSites = level === 2 || level === 3;
    const available = siteMarks
      .filter(({ site }) => showSites && site.section === level)
      .map((item) => ({ ...item, p: project(item.site.lon, item.site.lat, 2500) }));
    siteMarks.forEach(({ site, mark }) => {
      if (!showSites || site.section !== level) {
        setWideMarkState(mark, false, false);
        hideMark(mark);
      }
    });
    available.forEach(({ site, mark, p }) => {
      const context = focusSites.has(site.id);
      setWideMarkState(mark, context, focus.interaction && context);
      placeWideDot(mark, p);
    });
    reserve(taken, available.map(({ p }) => p));
    available
      .filter(({ site }) => focusSites.has(site.id))
      .sort((a, b) => Number(b.mark.dot.classList.contains("is-selected")) - Number(a.mark.dot.classList.contains("is-selected")))
      .forEach(({ mark, p }) => placeMark(mark, p, taken, size, false, mark.dot.classList.contains("is-selected")));
    const barriers = level === 4 && !view.zoomedToNepal;
    regionPaths.forEach(({ region, label }) => {
      if (barriers) placeText(label, project(region.label[0], region.label[1], 4500), 0, 0, taken, size);
      else label.style.visibility = "hidden";
    });
    seaLabels.forEach(({ sea, node }) => {
      if (barriers) placeText(node, project(sea.label[0], sea.label[1], 0), 0, 0, taken, size);
      else node.style.visibility = "hidden";
    });
    const nepal = level === 4 && view.zoomedToNepal;
    const lumbini = project(place("lumbini").lon, place("lumbini").lat, 2500);
    if (nepal) {
      placeMark(nepalMarks.lumbini, lumbini, taken, size);
      placeMark(nepalMarks.kathmandu, project(place("kathmandu").lon, place("kathmandu").lat, 2500), taken, size);
    } else {
      hideMark(nepalMarks.lumbini);
      hideMark(nepalMarks.kathmandu);
    }
    // river names last, only where they fit
    wideRiverLabels.forEach(({ name, points, node }) => {
      const show = level === 4 ? sectionRivers.includes(name) : focusRivers.has(name);
      node.classList.toggle("is-context", focusRivers.has(name));
      node.classList.toggle("is-selected", focus.interaction && focusRivers.has(name));
      if (show && !nepal) placeRiverLabel(node, points, project, 2500, taken, size);
      else node.style.visibility = "hidden";
    });
  }

  function drawBorder(project, size, taken) {
    borderRivers.forEach(({ r, node }) => node.setAttribute("d", polyline(r.points, project, 20)));
    roadTrace.setAttribute("d", polyline(highway, project, 40));
    // the motorcade moves along the road as part five is read, and has arrived by part six
    const reached = level === 5 ? Math.max(2, Math.round(progress * highway.length)) : highway.length;
    roadDone.setAttribute("d", polyline(highway.slice(0, reached), project, 40));
    const head = highway[Math.min(highway.length - 1, reached - 1)];
    const h = project(head[0], head[1], 40);
    motorcade.style.visibility = h.visible && level === 5 ? "" : "hidden";
    motorcade.setAttribute("cx", h.x.toFixed(1));
    motorcade.setAttribute("cy", h.y.toFixed(1));
    const bridge = project(place("bridge").lon, place("bridge").lat, 30);
    // the full English name is wider than a phone's map panel
    borderMarks.bridge.name.textContent = language === "en" && size.width < 520 ? "Friendship Bridge" : place("bridge")[language === "zh" ? "zh" : "en"];
    const z = project(place("zhangmu").lon, place("zhangmu").lat, 30);
    reserve(taken, ["bridge", "zhangmu", level === 6 ? "kodari" : "kathmandu"].map((id) => project(place(id).lon, place(id).lat, 30)));
    // the white stone gate on the far end of the bridge, toward Zhangmu
    const gx = bridge.x + (z.x - bridge.x) * 0.12, gy = bridge.y + (z.y - bridge.y) * 0.12;
    const s = 9;
    if (level === 6 && bridge.visible) taken.push({ left: gx - s * 1.4, right: gx + s * 1.4, top: gy - s * 1.8, bottom: gy + 2 });
    placeMark(borderMarks.bridge, bridge, taken, size);
    placeMark(borderMarks.zhangmu, z, taken, size);
    if (level === 6) {
      gate.setAttribute("d", bridge.visible ? `M${gx - s},${gy}V${gy - s * 1.6}H${gx + s}V${gy}M${gx - s * 1.25},${gy - s * 1.6}H${gx + s * 1.25}M${gx - s * 0.35},${gy}V${gy - s}H${gx + s * 0.35}V${gy}` : "");
      placeMark(borderMarks.kodari, project(place("kodari").lon, place("kodari").lat, 30), taken, size);
      hideMark(borderMarks.kathmandu);
    } else {
      gate.setAttribute("d", "");
      hideMark(borderMarks.kodari);
      placeMark(borderMarks.kathmandu, project(place("kathmandu").lon, place("kathmandu").lat, 30), taken, size);
    }
    placeRiverLabel(bhoteKoshiLabel, bhoteKoshi, project, 20, taken, size);
  }

  function drawMarks(project, nextView) {
    view = nextView;
    const { width, height } = marks.getBoundingClientRect();
    const size = { width, height };
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    marks.dataset.terrain = view.terrain;
    compass.style.setProperty("--north", `${(view.north * 180 / Math.PI).toFixed(1)}deg`);
    marks.classList.toggle("is-night", view.night > 0.5);
    // The compass is map furniture; labels leave a small safety zone around it.
    const origin = marks.getBoundingClientRect();
    const taken = [compass].map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 4, right: b.right - origin.left + 4, top: b.top - origin.top - 4, bottom: b.bottom - origin.top + 4 };
    });
    if (view.terrain === "pokhara") drawPokhara(project, size, taken);
    if (view.terrain === "wide") drawWide(project, size, taken);
    if (view.terrain === "border") drawBorder(project, size, taken);
  }

  /* ---------- text on the map ---------- */

  const peakNote = (id) => {
    if (id === "machhapuchhre") return language === "zh" ? "6,993 米" : "6,993 m";
    return language === "zh" ? "8,091 米" : "8,091 m";
  };
  function setMapText() {
    const zh = language === "zh";
    const name = (id) => place(id)[language === "zh" ? "zh" : "en"];
    [["lodge", pokharaMarks.lodge], ["pokhara", pokharaMarks.pokhara], ["machhapuchhre", pokharaMarks.machhapuchhre], ["annapurna", pokharaMarks.annapurna]]
      .forEach(([id, mark]) => { mark.name.textContent = name(id); mark.note.textContent = ""; });
    pokharaMarks.machhapuchhre.note.textContent = peakNote("machhapuchhre");
    pokharaMarks.annapurna.note.textContent = peakNote("annapurna");
    lakeLabel.textContent = name("phewa");
    siteMarks.forEach(({ site, mark }) => {
      mark.name.textContent = site[language === "zh" ? "zh" : "en"];
      mark.note.textContent = "";
    });
    nepalMarks.lumbini.name.textContent = name("lumbini");
    nepalMarks.lumbini.note.textContent = "";
    nepalMarks.kathmandu.name.textContent = name("kathmandu");
    nepalMarks.kathmandu.note.textContent = "";
    regionPaths.forEach(({ region, label }) => { label.textContent = region[language === "zh" ? "zh" : "en"]; });
    wideRiverLabels.forEach(({ name, node }) => { node.textContent = riverNames[name][zh ? 0 : 1]; });
    bhoteKoshiLabel.textContent = zh ? "波特科西河" : "Bhote Koshi";
    seaLabels.forEach(({ sea, node }) => { node.textContent = sea[language === "zh" ? "zh" : "en"]; });
    borderMarks.kathmandu.name.textContent = name("kathmandu");
    borderMarks.kathmandu.note.textContent = "";
    borderMarks.kodari.name.textContent = name("kodari");
    borderMarks.kodari.note.textContent = "";
    borderMarks.bridge.name.textContent = name("bridge");
    borderMarks.bridge.note.textContent = "";
    borderMarks.zhangmu.name.textContent = name("zhangmu");
    borderMarks.zhangmu.note.textContent = "";
    compass.querySelector("text").textContent = zh ? "北" : "N";
    compass.setAttribute("aria-label", zh ? "指北针" : "North arrow");
  }

  function updateNarrativeLinkStates() {
    const active = pointerFocusKey || keyboardFocusKey || lockedFocusKey;
    document.querySelectorAll(".map-place-link").forEach((button) => {
      const selected = button.dataset.mapFocus === active;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(button.dataset.mapFocus === lockedFocusKey));
    });
  }

  function setPointerFocus(key) {
    pointerFocusKey = key;
    updateNarrativeLinkStates();
  }

  function setKeyboardFocus(key) {
    keyboardFocusKey = key;
    updateNarrativeLinkStates();
  }

  function toggleLockedFocus(key) {
    lockedFocusKey = lockedFocusKey === key ? null : key;
    updateNarrativeLinkStates();
  }

  function enhanceNarrativeLinks() {
    const terms = [...narrativeTerms[language]].sort((a, b) => b[0].length - a[0].length);
    const flags = language === "en" ? "gi" : "g";
    const escaped = terms.map(([term]) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(escaped.join("|"), flags);
    const lookup = new Map(terms.map(([term, key]) => [language === "en" ? term.toLowerCase() : term, key]));
    [2, 3].forEach((sectionNumber) => {
      document.querySelectorAll(`#reading-section-${sectionNumber} .reading-section-body p`).forEach((paragraph) => {
        const source = paragraph.textContent;
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of source.matchAll(pattern)) {
          if (language === "en" && (/[A-Za-z]/.test(source[match.index - 1] || "") || /[A-Za-z]/.test(source[match.index + match[0].length] || ""))) continue;
          fragment.append(document.createTextNode(source.slice(cursor, match.index)));
          const label = match[0];
          const key = lookup.get(language === "en" ? label.toLowerCase() : label);
          const belongsHere = wideFocusGroups[key]?.sites.some((id) => place(id)?.section === sectionNumber);
          if (!belongsHere) {
            fragment.append(document.createTextNode(label));
            cursor = match.index + label.length;
            continue;
          }
          const button = document.createElement("button");
          button.type = "button";
          button.className = "map-place-link";
          button.dataset.mapFocus = key;
          button.textContent = label;
          button.setAttribute("aria-label", language === "zh" ? `${label}，在地图上点亮` : `${label}, highlight on map`);
          button.setAttribute("aria-pressed", "false");
          button.addEventListener("mouseenter", () => setPointerFocus(key));
          button.addEventListener("mouseleave", () => { if (pointerFocusKey === key) setPointerFocus(null); });
          button.addEventListener("focus", () => setKeyboardFocus(key));
          button.addEventListener("blur", () => { if (keyboardFocusKey === key) setKeyboardFocus(null); });
          button.addEventListener("click", (event) => {
            toggleLockedFocus(key);
            if (event.detail > 0) button.blur();
          });
          button.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
              lockedFocusKey = null;
              pointerFocusKey = null;
              keyboardFocusKey = null;
              button.blur();
              updateNarrativeLinkStates();
            }
          });
          fragment.append(button);
          cursor = match.index + label.length;
        }
        fragment.append(document.createTextNode(source.slice(cursor)));
        paragraph.replaceChildren(fragment);
      });
    });
    updateNarrativeLinkStates();
  }

  function updateNarrativeFocus() {
    if (level !== 2 && level !== 3) {
      narrativeFocusKey = null;
      return;
    }
    const section = document.querySelector(`#reading-section-${level}`);
    const paragraphs = [...(section?.querySelectorAll(".reading-section-body p") || [])];
    if (!paragraphs.length) return;
    const scrollRect = scroller.getBoundingClientRect();
    const readingLine = scrollRect.top + Math.min(scroller.clientHeight * 0.34, 210);
    let paragraphIndex = 0;
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.getBoundingClientRect().top <= readingLine) paragraphIndex = index;
    });
    const next = paragraphFocus[level][paragraphIndex] || `section-${level}`;
    if (next === narrativeFocusKey) return;
    narrativeFocusKey = next;
    window.FISHTAIL_TERRAIN_RENDERER?.setWideFocus(wideFocusGroups[next]?.sites || []);
  }

  // Where in the active section the reader is (0-1).
  function updateProgress() {
    const threshold = scroller.clientHeight * 0.4;
    const top = scroller.getBoundingClientRect().top;
    const section = scroller.querySelectorAll(".reading-section")[level - 1];
    if (!section) return;
    const rect = section.getBoundingClientRect();
    progress = Math.max(0, Math.min(1, (threshold - (rect.top - top)) / Math.max(rect.height - threshold, 1)));
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) progress = 1;
    window.FISHTAIL_TERRAIN_RENDERER?.setProgress(progress);
    window.FISHTAIL_MAPBOX?.setProgress(level, progress);
    updateNarrativeFocus();
  }

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    level = state.active + 1;
    setMapText();
    enhanceNarrativeLinks();
    window.requestAnimationFrame(updateNarrativeFocus);
    window.FISHTAIL_MAPBOX?.setLanguage(language);
  }

  function onSection(index) {
    level = index + 1;
    pointerFocusKey = null;
    keyboardFocusKey = null;
    lockedFocusKey = null;
    narrativeFocusKey = null;
    updateNarrativeLinkStates();
    body.dataset.readingLevel = String(level);
    window.FISHTAIL_TERRAIN_RENDERER?.setState(level);
    window.FISHTAIL_MAPBOX?.setSection(level);
    window.requestAnimationFrame(() => {
      updateProgress();
      updateNarrativeFocus();
    });
  }

  window.FISHTAIL_TERRAIN_RENDERER?.onFrame(drawMarks);
  scroller.addEventListener("scroll", () => window.requestAnimationFrame(updateProgress), { passive: true });

  ChapterShell.init({
    id: "fish-tail-lodge",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender,
    onSection
  });
})();
