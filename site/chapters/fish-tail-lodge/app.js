(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.FISHTAIL_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // The six sections are the essay's own numbered sections.
  const sections = {
    zh: [
      { label: "一 · 鱼尾山屋", location: "博克拉 · 喜马拉雅南麓" },
      { label: "二 · 思维高度", location: "希腊 · 克里特 · 埃及" },
      { label: "三 · 出埃及", location: "西奈 · 中东 · 波斯 · 印度" },
      { label: "四 · 未曾中断", location: "中华文明 · 蓝毗尼" },
      { label: "五 · 世纪最后一天", location: "加德满都 → 樟木" },
      { label: "六 · 国门", location: "中尼友谊桥" }
    ],
    en: [
      { label: "I · Fish Tail Lodge", location: "Pokhara · South of the Himalayas" },
      { label: "II · A height of thought", location: "Greece · Crete · Egypt" },
      { label: "III · Out of Egypt", location: "Sinai · Middle East · Persia · India" },
      { label: "IV · Unbroken", location: "Chinese civilization · Lumbini" },
      { label: "V · The century’s last day", location: "Kathmandu to Zhangmu" },
      { label: "VI · The gate", location: "Sino-Nepal Friendship Bridge" }
    ]
  };

  const captions = {
    zh: ["博克拉 · 鱼尾山屋", "希腊、克里特、埃及", "从西奈到印度河", "中华文明的天然屏障", "加德满都 → 边境", "峡谷上的大桥"],
    en: ["Pokhara · Fish Tail Lodge", "Greece, Crete, Egypt", "From Sinai to the Indus", "The natural walls around China", "Kathmandu to the border", "The bridge over the gorge"]
  };
  const captionMood = {
    zh: { night: "炉火与烛光", dawn: "朝霞染红峰顶", lumbini: "去蓝毗尼，佛陀诞生地" },
    en: { night: "Stove and candlelight", dawn: "Dawn on the peaks", lumbini: "To Lumbini, the Buddha’s birthplace" }
  };
  const captionTech = [
    "3D terrain · Copernicus DEM", "Wide terrain · Wikidata places", "Wide terrain · Wikidata places",
    "Wide terrain · Natural Earth regions", "3D terrain · OpenStreetMap road", "3D terrain · Bhote Koshi gorge"
  ];

  const elevations = geography.elevations;
  const fmt = (n) => Number(n).toLocaleString("en");
  const copy = {
    zh: {
      "map-aria": "喜马拉雅山南麓与古文明遗址的三维地形图",
      "map-teaser": "雪峰下，回望中国。",
      thesis: "离开之后，才读懂了它。",
      open: "推门看雪峰",
      "rail-caption": "原文章节",
      "notes-keyboard": "↑ ↓ ← → 切换节次 · L 切换语言 · Esc 关闭本面板",
      "data-views-label": "视图",
      "data-views": "第一节是博克拉一带的三维地形（鱼尾山屋、费瓦湖、鱼尾峰、安纳布尔纳）；第二至四节换成从地中海到太平洋的大范围地形，北方朝上；第五、六节是加德满都到边境的三维地形，最后停在波特科西河峡谷的中尼友谊桥。",
      "data-sites-label": "遗址",
      "data-sites": "文中提到的古文明遗址按真实坐标标出，读到哪一节显出哪些；虚线从“此刻所在”的鱼尾山屋连过去，数字为大圆直线距离。只标点，不连成路线：千禧之旅的完整行程与日期出自《千年一叹》，本文没有写。原文只说“古代波斯文明”，地图以波斯波利斯为代表点；摩亨佐-达罗是“深夜路过，未及考察”，以较淡的点表示。",
      "data-barrier-label": "屏障",
      "data-barrier": "第四节依原文标出喜马拉雅、昆仑、天山、阿尔泰，塔克拉玛干与戈壁，以及东面、南面的海；不画国界。读到去蓝毗尼的一段，镜头移回尼泊尔。",
      "data-text-label": "原文与地理",
      "data-text": "原文说乘拉缆浮筏“渡过了一条清澈的雪水河”，鱼尾山屋其实在费瓦湖畔，地图画湖，正文照原文。去蓝毗尼“来回行车六百公里”是公路里程，直线距离约 105 公里。第五节的车队路线沿今阿尼哥公路（约 " + fmt(geography.border.highwayKm) + " 公里），只是示意这一段路，不是当年车队的实测轨迹。",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 经纬度，每块地形按其中心纬度的余弦等比例展开；大范围地形跨度大，东西向距离在南北两端有明显误差，图上的公里数另按大圆公式计算。",
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
      open: "Open the door to the peaks",
      "rail-caption": "Sections",
      "notes-keyboard": "↑ ↓ ← → switch sections · L language · Esc closes this panel",
      "data-views-label": "Views",
      "data-views": "Section one is 3D terrain around Pokhara (the lodge, Phewa Lake, Machhapuchhre, Annapurna). Sections two to four use a wide terrain from the Mediterranean to the Pacific, north up. Sections five and six are 3D terrain from Kathmandu to the border, ending at the Friendship Bridge in the Bhote Koshi gorge.",
      "data-sites-label": "Sites",
      "data-sites": "The ancient sites named in the essay sit at their real coordinates and appear section by section; dashed lines join them to the lodge, “where I am now”, and the figures are great-circle distances. They are points only, not a route: the full itinerary and dates of the millennium journey are in Sign in a Thousand Years, not in this essay. The essay speaks only of “ancient Persian civilization”; Persepolis stands for it. Mohenjo-daro was “passed by at night”, so it is drawn fainter.",
      "data-barrier-label": "Barriers",
      "data-barrier": "Section four marks what the essay names: the Himalayas, Kunlun, Tian Shan and Altai, the Taklimakan and the Gobi, and the seas to the east and south; no borders are drawn. When the day trip to Lumbini begins, the view returns to Nepal.",
      "data-text-label": "Text and ground",
      "data-text": "The essay says they crossed “a clear river of snowmelt” by raft; Fish Tail Lodge is in fact on Phewa Lake, so the map shows the lake while the text is kept as written. The “six hundred kilometers” to Lumbini and back is road distance; the straight line is about 105 km. The motorcade in section five follows today’s Araniko Highway (about " + fmt(geography.border.highwayKm) + " km) to show the road, not the motorcade’s surveyed track.",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 longitude and latitude, each terrain scaled by the cosine of its central latitude. The wide terrain spans so much that east-west distances are noticeably off at its north and south edges; distances shown are computed separately as great circles.",
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
  const modeLabel = document.querySelector(".camera-mode");
  const techLabel = document.querySelector(".camera-tech");
  const compass = document.querySelector(".compass");
  const place = (id) => geography.places.find((p) => p.id === id);
  let language = body.dataset.language || "zh";
  let level = 1;
  let progress = 0;
  let view = { terrain: "pokhara", north: 0, night: 0, glow: 0, zoomedToNepal: false };

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
    // a crowded label first drops its note, then its name; the dot still marks the place
    if (best.cost > 0 && withNote) {
      const bare = bestSpot(mark, p, taken, size, false, metrics);
      if (bare.cost < best.cost) { best = bare; withNote = false; }
    }
    if (best.cost > 0 && !mark.dot.classList.contains("is-origin")) {
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
    outlines: region.outlines.map(() => make("path", { class: `region region-${region.kind}` }, wideLayer)),
    label: make("text", { class: `region-label region-${region.kind}` }, wideLayer)
  }));
  const seaLabels = geography.wide.seas.map((sea) => ({ sea, node: make("text", { class: "water-label sea" }, wideLayer) }));
  const siteRays = geography.places.filter((p) => p.section).map((site) => ({ site, node: make("path", { class: "ray" }, wideLayer) }));
  const lumbiniRay = make("path", { class: "ray ray-lumbini" }, wideLayer);
  const wideOrigin = pointMark(wideLayer, "is-origin");
  const siteMarks = geography.places.filter((p) => p.section).map((site) => ({ site, mark: pointMark(wideLayer, site.role === "passed" ? "is-passed" : "is-site") }));
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

  function drawWide(project, size, taken) {
    const lodgeP = project(place("lodge").lon, place("lodge").lat, 3000);
    wideRivers.forEach(({ name, points, node }) => {
      const show = level === 4 ? ["yellow", "yangtze", "ganges"].includes(name) : !["yellow", "yangtze"].includes(name);
      node.setAttribute("d", show ? polyline(points, project, 2500) : "");
    });
    // the lodge first: every other label gives way to it
    const showSites = level === 2 || level === 3;
    const shown = siteMarks
      .filter(({ site }) => showSites && site.section <= level)
      .map(({ site }) => project(site.lon, site.lat, 2500));
    reserve(taken, [lodgeP, ...shown]);
    placeMark(wideOrigin, lodgeP, taken, size);
    const barriers = level === 4 && !view.zoomedToNepal;
    regionPaths.forEach(({ region, outlines, label }) => {
      outlines.forEach((node, i) => node.setAttribute("d", barriers ? polyline(region.outlines[i], project, 3500, true) : ""));
      if (barriers) placeText(label, project(region.label[0], region.label[1], 4500), 0, 0, taken, size);
      else label.style.visibility = "hidden";
    });
    seaLabels.forEach(({ sea, node }) => {
      if (barriers) placeText(node, project(sea.label[0], sea.label[1], 0), 0, 0, taken, size);
      else node.style.visibility = "hidden";
    });
    siteRays.forEach(({ site, node }) => {
      const p = project(site.lon, site.lat, 2500);
      const on = showSites && site.section <= level && p.visible && lodgeP.visible;
      node.setAttribute("d", on ? `M${lodgeP.x.toFixed(1)},${lodgeP.y.toFixed(1)}L${p.x.toFixed(1)},${p.y.toFixed(1)}` : "");
    });
    // sites from the right (nearest the lodge) outward, so the crowded Levant settles first
    siteMarks
      .map((item) => ({ ...item, p: project(item.site.lon, item.site.lat, 2500) }))
      .sort((a, b) => b.p.x - a.p.x)
      .forEach(({ site, mark, p }) => {
        // distances only for the sites this section adds; earlier ones keep just their names,
        // or on a phone just their dots
        if (!showSites || site.section > level) return hideMark(mark);
        if (site.section < level && size.width < 520) {
          hideMark(mark);
          mark.dot.style.visibility = p.visible ? "" : "hidden";
          mark.dot.setAttribute("cx", p.x.toFixed(1));
          mark.dot.setAttribute("cy", p.y.toFixed(1));
          return;
        }
        placeMark(mark, p, taken, size, site.section === level);
      });
    const nepal = level === 4 && view.zoomedToNepal;
    const lumbini = project(place("lumbini").lon, place("lumbini").lat, 2500);
    lumbiniRay.setAttribute("d", nepal && lumbini.visible ? `M${lodgeP.x.toFixed(1)},${lodgeP.y.toFixed(1)}L${lumbini.x.toFixed(1)},${lumbini.y.toFixed(1)}` : "");
    if (nepal) {
      placeMark(nepalMarks.lumbini, lumbini, taken, size);
      placeMark(nepalMarks.kathmandu, project(place("kathmandu").lon, place("kathmandu").lat, 2500), taken, size);
    } else {
      hideMark(nepalMarks.lumbini);
      hideMark(nepalMarks.kathmandu);
    }
    // river names last, only where they fit
    wideRiverLabels.forEach(({ name, points, node }) => {
      const show = level === 4 ? ["yellow", "yangtze", "ganges"].includes(name) : !["yellow", "yangtze"].includes(name);
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
    // the on-map caption and north arrow are furniture that labels keep clear of
    const origin = marks.getBoundingClientRect();
    const taken = [document.querySelector(".camera-caption"), compass].map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 4, right: b.right - origin.left + 4, top: b.top - origin.top - 4, bottom: b.bottom - origin.top + 4 };
    });
    if (view.terrain === "pokhara") drawPokhara(project, size, taken);
    if (view.terrain === "wide") drawWide(project, size, taken);
    if (view.terrain === "border") drawBorder(project, size, taken);
    updateCaption();
  }

  /* ---------- text on the map ---------- */

  const peakNote = (id) => {
    if (id === "machhapuchhre") return language === "zh" ? "6,993 米（公开资料）" : "6,993 m (published)";
    return language === "zh" ? "8,091 米（公开资料）" : "8,091 m (published)";
  };
  function setMapText() {
    const zh = language === "zh";
    const name = (id) => place(id)[language === "zh" ? "zh" : "en"];
    [["lodge", pokharaMarks.lodge], ["pokhara", pokharaMarks.pokhara], ["machhapuchhre", pokharaMarks.machhapuchhre], ["annapurna", pokharaMarks.annapurna]]
      .forEach(([id, mark]) => { mark.name.textContent = name(id); mark.note.textContent = ""; });
    pokharaMarks.machhapuchhre.note.textContent = peakNote("machhapuchhre");
    pokharaMarks.annapurna.note.textContent = peakNote("annapurna");
    lakeLabel.textContent = name("phewa");
    wideOrigin.name.textContent = name("lodge");
    wideOrigin.note.textContent = zh ? "此刻所在" : "where I am now";
    siteMarks.forEach(({ site, mark }) => {
      mark.name.textContent = site[language === "zh" ? "zh" : "en"];
      mark.note.textContent = site.role === "passed"
        ? (zh ? `深夜路过 · ${fmt(site.distanceKm)} km` : `passed at night · ${fmt(site.distanceKm)} km`)
        : `${fmt(site.distanceKm)} km`;
    });
    nepalMarks.lumbini.name.textContent = name("lumbini");
    nepalMarks.lumbini.note.textContent = zh ? `佛陀诞生地 · 直线 ${place("lumbini").distanceKm} km` : `the Buddha’s birthplace · ${place("lumbini").distanceKm} km`;
    nepalMarks.kathmandu.name.textContent = name("kathmandu");
    nepalMarks.kathmandu.note.textContent = "";
    regionPaths.forEach(({ region, label }) => { label.textContent = region[language === "zh" ? "zh" : "en"]; });
    wideRiverLabels.forEach(({ name, node }) => { node.textContent = riverNames[name][zh ? 0 : 1]; });
    bhoteKoshiLabel.textContent = zh ? "波特科西河" : "Bhote Koshi";
    seaLabels.forEach(({ sea, node }) => { node.textContent = sea[language === "zh" ? "zh" : "en"]; });
    borderMarks.kathmandu.name.textContent = name("kathmandu");
    borderMarks.kathmandu.note.textContent = "";
    borderMarks.kodari.name.textContent = name("kodari");
    borderMarks.kodari.note.textContent = zh ? "尼泊尔海关" : "Nepali customs";
    borderMarks.bridge.name.textContent = name("bridge");
    borderMarks.bridge.note.textContent = zh ? `DEM 约 ${fmt(elevations.bridge.point)} 米` : `DEM about ${fmt(elevations.bridge.point)} m`;
    borderMarks.zhangmu.name.textContent = name("zhangmu");
    borderMarks.zhangmu.note.textContent = zh ? `DEM 约 ${fmt(elevations.zhangmu.point)} 米` : `DEM about ${fmt(elevations.zhangmu.point)} m`;
    compass.querySelector("text").textContent = zh ? "北" : "N";
    compass.setAttribute("aria-label", zh ? "指北针" : "North arrow");
  }

  function updateCaption() {
    let text = captions[language][level - 1];
    if (level === 1 && view.glow > 0.5) text = captionMood[language].dawn;
    else if (level === 1 && view.night > 0.5) text = captionMood[language].night;
    else if (level === 4 && view.zoomedToNepal) text = captionMood[language].lumbini;
    if (modeLabel.textContent !== text) modeLabel.textContent = text;
    techLabel.textContent = captionTech[level - 1];
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
  }

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    level = state.active + 1;
    setMapText();
    updateCaption();
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    window.FISHTAIL_TERRAIN_RENDERER?.setState(level);
    window.requestAnimationFrame(updateProgress);
    updateCaption();
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
