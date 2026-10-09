(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.MOUNTAIN_RESORT_GEOGRAPHY;
  if (!data || !geography || !window.ChapterShell) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the line under it (guideline R-3).
  const sections = {
    zh: [
      { label: "一 · 门外", location: "历史情绪" },
      { label: "二 · 椅背", location: "避暑山庄 · 北岭" },
      { label: "三 · 万树", location: "万树园 · 外庙" },
      { label: "四 · 闭门", location: "宫门 · 1861" },
      { label: "五 · 背影", location: "湖水 · 1927" }
    ],
    en: [
      { label: "I · Outside", location: "Historical emotion" },
      { label: "II · The Chair Back", location: "North ridge · Mountain Resort" },
      { label: "III · Ten Thousand Trees", location: "Wanshu Garden · Outlying temples" },
      { label: "IV · The Gates Close", location: "Palace gate · 1861" },
      { label: "V · Afterimage", location: "Lake · 1927" }
    ]
  };

  // A real chronology, so this chapter uses the optional docked timeline (guideline M-4).
  const timeline = {
    zh: ["清代", "1703", "1793", "1861", "1927"],
    en: ["QING", "1703", "1793", "1861", "1927"]
  };

  // On-map caption next to the timeline (kept from the original "status" line).
  const status = {
    zh: ["空间框架 · 长城内外", "椅背 · 园林展开", "帝国 · 向外环列", "闭门 · 王朝退场", "背影 · 两座园林"],
    en: [
      "Spatial frame · Inside and beyond the Wall",
      "Chair back · Garden opens",
      "Empire · Facing outward",
      "Closed · Dynasty recedes",
      "Afterimage · Two gardens"
    ]
  };

  const copy = {
    zh: {
      "map-teaser": "王朝退场",
      thesis: "在椅背之外，先看见山。",
      open: "绕到山庄背后",
      "reader-note": "园林没有移动。移动的是看它的时代。",
      "rail-caption": "原文章节",
      "map-aria": "承德避暑山庄与外八庙地理图",
      "regional-svg-title": "北京、古北口、承德与木兰围场区域关系",
      "regional-svg-desc": "以真实地理锚点呈现清帝北巡空间，路线和长城线为历史地理示意。",
      "resort-svg-title": "承德避暑山庄与外八庙",
      "resort-svg-desc": "按真实经纬度标示避暑山庄及主要外庙，园内分区为文学示意。",
      "chair-label": "山岭如椅背 · 面南而坐",
      "mountain-zone": "山区",
      "plain-zone": "平原区",
      "lake-zone": "湖区",
      "palace-zone": "宫殿区 · 正门",
      "outer-temples": "外庙环列 · 山庄在内",
      afterimage: "湖水留下最后的背影",
      "wanshu-title": "万树园 · 英国使团觐见",
      "wanshu-note": "园内位置约略 · 据今园中蒙古包",
      "memory-link": "记忆连接 · 不是同一地点",
      "summer-palace": "北京 · 颐和园",
      "memory-distance": "距承德约179 km · 直线",
      "wang-event": "王国维于此投水 · 1927",
      "chengde-present": "作者此时面对承德湖水",
      "data-property-label": "遗产地",
      "data-property": "避暑山庄与周围寺庙，UNESCO中心坐标约40.9875°N、117.9375°E；山庄遗产区611.2公顷。地图上的宫墙取自OpenStreetMap（关系8008566），围合约540公顷。",
      "data-points-label": "地点",
      "data-points": "第二至四节是真实地形：Copernicus DEM GLO-30，约100米一格，高程夸大三倍（山庄背后的山只比谷地高约四百米）。宫墙、湖泊、武烈河、外庙轮廓与丽正门取自OpenStreetMap；万树园在OSM中没有范围，以园中蒙古包的位置约略标出。",
      "data-zones-label": "分区",
      "data-zones": "山区、平原区、湖区的标签放在真实的山地、园北平地与湖面上；三区之间的界线不画。",
      "data-story-label": "叙事",
      "data-story": "“罗圈椅背”就是山庄西北真实的山岭，镜头从南面看过去；闭门落在真实的丽正门。椅背、闭门都是原文意象，不是可测量的地物。",
      "data-regional-label": "区域轴线",
      "data-regional": "第一、五节是同一张平面地图：标准地图的投影（正轴等积割圆锥，中央经线110°E），燕山一带为GLO-90晕渲（约350米一格）。长城取自OpenStreetMap中标为“长城”的墙体，以带垛口的城墙符号表示。北京、古北口、承德使用地理坐标；木兰围场以官方公布区域范围表达。北巡连线是历史空间示意，不是复原的逐段御道。",
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
      "complete-line": "王朝变更，山水依旧。"
    },
    en: {
      "map-teaser": "A dynasty exits",
      thesis: "Beyond the chair back, the mountain appears first.",
      open: "Walk behind the villa",
      "reader-note": "The garden does not move. The age looking at it does.",
      "rail-caption": "Original sections",
      "map-aria": "Geographic map of the Chengde Mountain Resort and the Outlying Temples",
      "regional-svg-title": "Beijing, Gubeikou, Chengde and Mulan: a regional map",
      "regional-svg-desc":
        "Real geographic anchors show the space of the Qing emperors' northern tours; the route and the Great Wall line are historical-geographic diagrams.",
      "resort-svg-title": "The Chengde Mountain Resort and the Outlying Temples",
      "resort-svg-desc":
        "The resort and the main outlying temples are placed at their real coordinates; the zones inside the garden are literary diagrams.",
      "chair-label": "The mountains form the chair back · Facing south",
      "mountain-zone": "Hills",
      "plain-zone": "Plain",
      "lake-zone": "Lakes",
      "palace-zone": "Palaces · Main gate",
      "outer-temples": "Temples without · Resort within",
      afterimage: "The lake keeps the last afterimage",
      "wanshu-title": "Wanshu Garden · Macartney embassy",
      "wanshu-note": "Approximate · at today's yurts in the garden",
      "memory-link": "Memory link · Not the same place",
      "summer-palace": "Beijing · Summer Palace",
      "memory-distance": "Approx. 179 km from Chengde · straight-line",
      "wang-event": "Wang Guowei died here · 1927",
      "chengde-present": "The writer is facing the Chengde lake",
      "data-property-label": "Property",
      "data-property": "The Mountain Resort and its Outlying Temples is centered at approximately 40.9875°N, 117.9375°E. The UNESCO resort property covers 611.2 hectares. The wall on the map is from OpenStreetMap (relation 8008566) and encloses about 540 hectares.",
      "data-points-label": "Places",
      "data-points": "Sections two to four are real terrain: Copernicus DEM GLO-30 at about 100 m, heights exaggerated three times (the hills behind the resort rise only some 400 m above the valley). The wall, lakes, Wulie River, temple footprints and Lizheng Gate are from OpenStreetMap; Wanshu Garden has no outline there and is placed approximately at today's yurts in the garden.",
      "data-zones-label": "Zones",
      "data-zones": "The labels for hills, plain and lakes sit on the real hills, the flat ground in the north of the garden and the lakes; no lines are drawn between the zones.",
      "data-story-label": "Narrative",
      "data-story": "The round-backed chair is the real ridge north-west of the resort, seen from the south; the closing gate is the real Lizheng Gate. The chair back and the closing gate are images from the essay, not measurable features.",
      "data-regional-label": "Regional axis",
      "data-regional": "Sections one and five are one flat map in the standard map's projection (Albers equal-area conic, central meridian 110°E), with GLO-90 shaded relief of the Yan Mountains (about 350 m). The Great Wall is the wall mapped as 长城 in OpenStreetMap, drawn with the battlemented wall symbol. Beijing, Gubeikou and Chengde use geographic coordinates; Mulan is shown as an officially published regional extent. The northern-tour line shows a historical relationship, not a reconstructed imperial road.",
      "data-memory-label": "Cross-city memory",
      "data-memory":
        "The Summer Palace uses its UNESCO coordinate and lies approximately 179 km from Chengde in a straight line. Wang Guowei died in Beijing; the Chengde lake is where the writer remembers him.",
      "data-disclaimer":
        "A literary reading map, not a substitute for survey, navigation or heritage-site management information.",
      "chengde-source": "Chengde Cultural Heritage Bureau",
      "summer-source": "Summer Palace coordinates",
      "mulan-source": "Mulan regional extent",
      "legend-title": "Map grammar",
      "legend-point": "Coordinate anchor",
      "legend-area": "Region or simplified zone",
      "legend-route": "Historical spatial relation",
      "legend-literary": "Literary image",
      "complete-line": "The mountains and waters remain."
    }
  };

  // The English source opens each section in capitals (small caps in the EPUB); show sentence case.
  const readableEnglishOpenings = new Map([
    ["PEOPLE LIKE US", "People like us"],
    ["THE CHENGDE MOUNTAIN RESORT BELONGED", "The Chengde Mountain Resort belonged"],
    ["KANGXI’S DIFFERENCE FROM WANLI", "Kangxi’s difference from Wanli"],
    ["ON THE WESTERN SIDE", "On the western side"],
    ["THE QING DYNASTY FELL", "The Qing dynasty fell"]
  ]);

  function formatParagraph(paragraph, lang) {
    if (lang !== "en") return paragraph;
    for (const [opening, replacement] of readableEnglishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  const body = document.body;
  const statusNumber = document.querySelector(".status-number");
  const statusLabel = document.querySelector(".status-label");
  const marks = document.querySelector(".terrain-marks");
  const compass = document.querySelector(".compass");
  const scaleBar = document.querySelector(".scale-bar");
  const features = window.MOUNTAIN_RESORT_FEATURES;
  let language = "zh"; // real value arrives through onRender
  let active = 0;
  let level = 1;

  /* ---------- map: labels and lines drawn over the flat map (sections 1, 5) and the 3D terrain (2-4) ---------- */

  const svgNS = "http://www.w3.org/2000/svg";
  const make = (tag, attributes = {}, parent) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (parent) parent.appendChild(node);
    return node;
  };
  const layer = (name) => make("g", { class: `marks-${name}` }, marks);
  const text = (key) => copy[language][key] || "";
  const regionalPlace = (id) => geography.regional.places.find((p) => p.id === id);

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
  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const typeSize = (node) => parseFloat(window.getComputedStyle(node).fontSize) || 16;

  // A labelled place: symbol, name and optional note lines; the label tries #1 右上, #2 右下, #2 左上, #3 左下,
  // #4 正上, #5 正下 (docs/map-guidance.md L-4) and keeps the first spot inside the panel and clear of the others.
  function mark(parent, cls, { radius = 4, symbol = "dot" } = {}) {
    const group = make("g", { class: `place ${cls}` }, parent);
    let shape;
    if (symbol === "tent") shape = make("path", { class: "symbol tent", d: "M-9 7L0-9L9 7ZM-4 7V1H4V7" }, group);
    else if (symbol === "gate") shape = make("path", { class: "symbol gate", d: "M-11 8V-4L0-11L11-4V8ZM-5 8V0H5V8" }, group);
    else shape = make("circle", { class: "symbol", r: radius }, group);
    return { group, shape, radius: symbol === "dot" ? radius : 10, name: make("text", { class: "name" }, group), notes: [make("text", { class: "note" }, group), make("text", { class: "note" }, group)] };
  }
  function hide(m) { m.group.style.display = "none"; }
  function place(m, p, taken, size, { force = false } = {}) {
    if (!p.visible) return hide(m);
    m.group.style.display = "";
    m.shape.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    taken.push({ left: p.x - m.radius - 2, right: p.x + m.radius + 2, top: p.y - m.radius - 2, bottom: p.y + m.radius + 2 });
    const lines = [m.name, ...m.notes].filter((node) => node.textContent);
    if (!lines.length) return;
    const sizes = lines.map(typeSize);
    const height = sizes.reduce((sum, s, i) => sum + s * (i ? 1.45 : 1.15), 0);
    const width = Math.max(...lines.map((node) => node.getComputedTextLength()));
    const gap = m.radius + 6;
    const spots = [
      ["start", p.x + gap, p.y - height + sizes[0] * 0.3], ["start", p.x + gap, p.y - sizes[0] * 0.2],
      ["end", p.x - gap - width, p.y - height + sizes[0] * 0.3], ["end", p.x - gap - width, p.y - sizes[0] * 0.2],
      ["middle", p.x - width / 2, p.y - gap - height], ["middle", p.x - width / 2, p.y + gap]
    ];
    let best = null;
    for (const [anchor, left, top] of spots) {
      const box = { left, right: left + width, top, bottom: top + height };
      const outside = Math.max(0, 8 - box.left) + Math.max(0, box.right - (size.width - 8)) + Math.max(0, 8 - box.top) + Math.max(0, box.bottom - (size.height - 8));
      const cost = outside * 1000 + taken.reduce((sum, other) => sum + overlapArea(box, other), 0);
      if (!best || cost < best.cost) best = { anchor, box, cost };
      if (!cost) break;
    }
    if (best.cost > 0 && !force) {
      lines.forEach((node) => { node.style.visibility = "hidden"; });
      return;
    }
    taken.push(best.box);
    const x = best.anchor === "start" ? best.box.left : best.anchor === "end" ? best.box.right : best.box.left + width / 2;
    let y = best.box.top;
    lines.forEach((node, index) => {
      y += sizes[index] * (index ? 1.45 : 1.0);
      node.style.visibility = "";
      node.setAttribute("text-anchor", best.anchor);
      node.setAttribute("x", x.toFixed(1));
      node.setAttribute("y", y.toFixed(1));
    });
  }
  // A free-standing label (a zone, a river, a region) centred on a point; dropped when it would cover another.
  function placeText(node, p, taken, size, { slide = false } = {}) {
    node.style.visibility = "hidden";
    if (!p.visible || !node.textContent) return;
    node.setAttribute("x", p.x.toFixed(1));
    node.setAttribute("y", p.y.toFixed(1));
    let b = node.getBBox();
    // a long label may slide sideways to stay inside the panel
    const shift = slide ? Math.max(0, 12 - b.x) - Math.max(0, b.x + b.width - (size.width - 12)) : 0;
    if (shift) { node.setAttribute("x", (p.x + shift).toFixed(1)); b = node.getBBox(); }
    const box = { left: b.x - 3, right: b.x + b.width + 3, top: b.y - 2, bottom: b.y + b.height + 2 };
    if (box.left < 8 || box.right > size.width - 8 || box.top < 8 || box.bottom > size.height - 8) return;
    if (taken.some((other) => overlapArea(box, other) > 0)) return;
    taken.push(box);
    node.style.visibility = "";
  }

  /* sections 1 and 5: the flat map */
  const flatLayer = layer("flat");
  const mulanArea = make("path", { class: "mulan-range" }, flatLayer);
  // the Great Wall (OpenStreetMap): a wall line with battlements on its outer, northern side
  const wallLine = make("path", { class: "great-wall" }, flatLayer);
  const wallTeeth = make("path", { class: "great-wall-teeth" }, flatLayer);
  const flatData = window.MOUNTAIN_RESORT_FLAT_MAP;
  const routeLine = make("path", { class: "regional-route" }, flatLayer);
  const memoryLine = make("path", { class: "memory-link" }, flatLayer);
  const wallLabel = make("text", { class: "line-label", "text-anchor": "middle" }, flatLayer);
  const mulanLabel = make("text", { class: "area-label", "text-anchor": "middle" }, flatLayer);
  const memoryLabel = make("text", { class: "memory-label", "text-anchor": "middle" }, flatLayer);
  const memoryNote = make("text", { class: "memory-note", "text-anchor": "middle" }, flatLayer);
  const flatMarks = {
    beijing: mark(flatLayer, "is-capital"),
    gubeikou: mark(flatLayer, "is-pass"),
    chengde: mark(flatLayer, "is-resort", { radius: 6 }),
    mulan: mark(flatLayer, "is-hunt"),
    summer: mark(flatLayer, "is-memory", { radius: 5 })
  };
  const mulan = geography.regional.mulanRange;
  const mulanRing = [];
  for (let i = 0; i <= 8; i += 1) mulanRing.push([mulan.west + ((mulan.east - mulan.west) * i) / 8, mulan.north]);
  for (let i = 0; i <= 8; i += 1) mulanRing.push([mulan.east - ((mulan.east - mulan.west) * i) / 8, mulan.south]);

  // a curve between two screen points, bowed to the left of travel (a relation, not a road)
  function curve(a, b, bend = 0.18) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return { d: `M${a.x.toFixed(1)},${a.y.toFixed(1)}Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`, mid: { x: mx - dy * bend * 0.5, y: my + dx * bend * 0.5, visible: true } };
  }

  // Each wall line is drawn, then a battlement every 7 px along it on the side facing north (screen up).
  function drawWall(project) {
    let line = "", teeth = "";
    (flatData?.greatWall || []).forEach((points) => {
      const xy = points.map(([lon, lat]) => project(lon, lat)).filter((p) => p.visible);
      if (xy.length < 2) return;
      line += xy.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
      let carry = 0;
      for (let i = 1; i < xy.length; i += 1) {
        const a = xy[i - 1], b = xy[i];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (!length) continue;
        let nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length;
        if (ny > 0) { nx = -nx; ny = -ny; }
        for (let s = 7 - carry; s < length; s += 7) {
          const x = a.x + ((b.x - a.x) * s) / length, y = a.y + ((b.y - a.y) * s) / length;
          teeth += `M${x.toFixed(1)},${y.toFixed(1)}l${(nx * 3.5).toFixed(1)},${(ny * 3.5).toFixed(1)}`;
        }
        carry = (carry + length) % 7;
      }
    });
    wallLine.setAttribute("d", line);
    wallTeeth.setAttribute("d", teeth);
  }

  function drawFlat(project, size, taken) {
    const at = (id) => project(...regionalPlace(id).coordinates);
    const one = level === 1;
    flatLayer.classList.toggle("is-memory", !one);
    mulanArea.setAttribute("d", one ? polyline(mulanRing, project, 0, true) : "");
    drawWall(project);
    routeLine.setAttribute("d", one ? polyline(geography.regional.imperialRoute, project) : "");
    const chengde = at("chengde"), summer = at("summer-palace");
    if (!one) {
      const link = curve(chengde, summer, -0.16);
      memoryLine.setAttribute("d", link.d);
      place(flatMarks.chengde, chengde, taken, size, { force: true });
      place(flatMarks.summer, summer, taken, size, { force: true });
      hide(flatMarks.beijing); hide(flatMarks.gubeikou); hide(flatMarks.mulan);
      placeText(memoryLabel, { ...link.mid, y: link.mid.y - 4 }, taken, size);
      placeText(memoryNote, { ...link.mid, y: link.mid.y + typeSize(memoryLabel) * 0.6 + typeSize(memoryNote) * 1.1 }, taken, size);
      [wallLabel, mulanLabel].forEach((node) => { node.style.visibility = "hidden"; });
      return;
    }
    memoryLine.setAttribute("d", "");
    [memoryLabel, memoryNote].forEach((node) => { node.style.visibility = "hidden"; });
    hide(flatMarks.summer);
    [["chengde", "chengde"], ["beijing", "beijing"], ["gubeikou", "gubeikou"]].forEach(([key, id]) => place(flatMarks[key], at(id), taken, size, { force: key === "chengde" }));
    place(flatMarks.mulan, at("mulan"), taken, size);
    placeText(mulanLabel, project((mulan.west + mulan.east) / 2, mulan.north + 0.06), taken, size);
    // the wall's name sits just south of the wall where the tour crosses it, at Gubeikou
    const w = at("gubeikou");
    placeText(wallLabel, { ...w, x: w.x - typeSize(wallLabel) * 2.6, y: w.y + typeSize(wallLabel) * 1.6 }, taken, size);
  }

  /* sections 2-4: the resort on the 3D terrain */
  const resortLayer = layer("resort");
  const riverAreas = features.riverArea.map(() => make("path", { class: "river-area" }, resortLayer));
  const riverLines = Object.entries(features.rivers).flatMap(([name, parts]) => parts.map((points) => ({ name, points, node: make("path", { class: "river-line" }, resortLayer) })));
  const lakePaths = features.lakes.map(() => make("path", { class: "lake" }, resortLayer));
  const wallPaths = features.resort.map(() => make("path", { class: "resort-wall" }, resortLayer));
  const templeEntries = Object.entries(features.temples);
  const templeLinks = templeEntries.filter(([, t]) => t.labelled).map(([id]) => ({ id, node: make("path", { class: "temple-link" }, resortLayer) }));
  const templePaths = templeEntries.map(([id, t]) => ({ id, t, nodes: t.rings.map(() => make("path", { class: "temple" }, resortLayer)) }));
  const zoneLabels = {
    chair: make("text", { class: "chair-label", "text-anchor": "middle" }, resortLayer),
    hills: make("text", { class: "zone-label", "text-anchor": "middle" }, resortLayer),
    plain: make("text", { class: "zone-label", "text-anchor": "middle" }, resortLayer),
    lakes: make("text", { class: "zone-label is-lake", "text-anchor": "middle" }, resortLayer),
    temples: make("text", { class: "zone-label is-temples", "text-anchor": "middle" }, resortLayer),
    river: make("text", { class: "river-label", "text-anchor": "middle" }, resortLayer)
  };
  const resortMarks = {
    gate: mark(resortLayer, "is-gate", { symbol: "gate" }),
    wanshu: mark(resortLayer, "is-event", { symbol: "tent" }),
    temples: Object.fromEntries(templeEntries.filter(([, t]) => t.labelled).map(([id]) => [id, mark(resortLayer, "is-temple", { radius: 3 })]))
  };
  const lonlat = (p) => [p.lon, p.lat];
  const resortRing = features.resort[0];
  const resortCentre = (() => {
    const s = resortRing.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [s[0] / resortRing.length, s[1] / resortRing.length];
  })();
  // the hills zone: the middle of the western half of the walled area (the hills fill the west and north-west)
  const hillsAt = (() => {
    const west = resortRing.filter(([x]) => x < resortCentre[0]);
    const s = west.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [(s[0] / west.length + resortCentre[0]) / 2, s[1] / west.length];
  })();
  const LIFT = 6;

  function drawResort(project, size, taken) {
    const temples = level >= 3;
    features.riverArea.forEach((ring, i) => riverAreas[i].setAttribute("d", polyline(ring, project, 1, true)));
    riverLines.forEach(({ points, node }) => node.setAttribute("d", polyline(points, project, 2)));
    features.lakes.forEach((ring, i) => lakePaths[i].setAttribute("d", polyline(ring, project, 2, true)));
    features.resort.forEach((ring, i) => wallPaths[i].setAttribute("d", polyline(ring, project, LIFT, true)));
    templePaths.forEach(({ t, nodes }) => t.rings.forEach((ring, i) => nodes[i].setAttribute("d", temples ? polyline(ring, project, LIFT, true) : "")));
    const centre = project(...resortCentre, LIFT);
    templeLinks.forEach(({ id, node }) => {
      const p = project(...features.temples[id].centre, LIFT);
      node.setAttribute("d", level === 3 && p.visible && centre.visible ? `M${centre.x.toFixed(1)},${centre.y.toFixed(1)}L${p.x.toFixed(1)},${p.y.toFixed(1)}` : "");
    });

    // every symbol takes its place before any label (docs/map-guidance.md L-10)
    if (level === 3) {
      Object.keys(resortMarks.temples).forEach((id) => {
        const p = project(...features.temples[id].centre, LIFT);
        if (p.visible) taken.push({ left: p.x - 5, right: p.x + 5, top: p.y - 5, bottom: p.y + 5 });
      });
    }
    // a narrow panel keeps the event's name and date; the note on its position stays in the notes drawer
    resortMarks.wanshu.notes[1].textContent = size.width < 520 ? "" : text("wanshu-note");
    // most important first: the gate and the 1793 event, then the temples, then the zones, then the river
    if (level === 4) place(resortMarks.gate, project(...lonlat(features.anchors.gate), LIFT), taken, size, { force: true });
    else hide(resortMarks.gate);
    if (level === 3) place(resortMarks.wanshu, project(...lonlat(features.anchors.wanshu), LIFT), taken, size, { force: true });
    else hide(resortMarks.wanshu);
    Object.entries(resortMarks.temples).forEach(([id, m]) => {
      if (level === 3) place(m, project(...features.temples[id].centre, LIFT), taken, size);
      else hide(m);
    });
    const two = level === 2;
    const zoneAt = {
      chair: project(...lonlat(features.ridge), 60),
      hills: project(...hillsAt, LIFT),
      plain: project(...lonlat(features.anchors.wanshu), LIFT),
      lakes: project(...lonlat(features.lakeCentre), 2),
      temples: (() => {
        const north = Object.values(features.temples).filter((t) => t.labelled).map((t) => t.centre);
        const lon = north.reduce((s, c) => s + c[0], 0) / north.length;
        return project(lon, Math.max(...north.map((c) => c[1])) + 0.006, LIFT);
      })()
    };
    // the chapter's image: if the ridge has no room for it, it moves up or down the slope
    for (const dy of [0, -1.6, 1.6, -3.2]) {
      const p = zoneAt.chair;
      placeText(zoneLabels.chair, two ? { ...p, y: p.y + dy * typeSize(zoneLabels.chair) } : { visible: false }, taken, size, { slide: true });
      if (!two || zoneLabels.chair.style.visibility !== "hidden") break;
    }
    ["hills", "plain", "lakes"].forEach((key) => placeText(zoneLabels[key], two ? zoneAt[key] : { visible: false }, taken, size));
    placeText(zoneLabels.temples, level === 3 ? zoneAt.temples : { visible: false }, taken, size);
    const wulie = features.rivers["武烈河"];
    if (wulie && level !== 4) {
      const points = wulie.flat();
      for (const t of [0.5, 0.42, 0.58, 0.34, 0.66]) {
        const [lon, lat] = points[Math.floor(points.length * t)];
        placeText(zoneLabels.river, project(lon, lat, 2), taken, size);
        if (zoneLabels.river.style.visibility !== "hidden") break;
      }
    } else zoneLabels.river.style.visibility = "hidden";
  }

  // north arrow and scale bar follow whichever map is shown
  function drawFurniture(view) {
    compass.style.setProperty("--north", `${(view.north * 180 / Math.PI).toFixed(1)}deg`);
    const steps = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
    // Keep the current length while its bar stays between 60 and 240 px: the camera sways, and recomputing every
    // frame made the bar jump between two lengths. The DOM is only written when something changed.
    let metres = drawFurniture.metres;
    if (!metres || metres / view.metresPerPixel < 60 || metres / view.metresPerPixel > 240) {
      metres = steps.find((value) => value / view.metresPerPixel >= 90) || steps[steps.length - 1];
      drawFurniture.metres = metres;
    }
    const px = Math.round(metres / view.metresPerPixel);
    if (px === drawFurniture.px && metres === drawFurniture.shown) return;
    drawFurniture.px = px;
    drawFurniture.shown = metres;
    scaleBar.setAttribute("viewBox", `-4 0 ${px + 64} 34`);
    scaleBar.setAttribute("width", String(px + 64));
    scaleBar.querySelector(".scale-line").setAttribute("d", `M0 4V12H${px}V4M${px / 2} 8V12`);
    const label = scaleBar.querySelector(".scale-label");
    label.setAttribute("x", String(px));
    label.setAttribute("text-anchor", "middle");
    label.textContent = metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
  }

  function drawMarks(project, view) {
    const { width, height } = marks.getBoundingClientRect();
    if (!width || !height) return;
    const size = { width, height };
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    marks.dataset.terrain = view.terrain;
    drawFurniture(view);
    const origin = marks.getBoundingClientRect();
    const taken = [compass, scaleBar, document.querySelector(".map-status")].map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 6, right: b.right - origin.left + 6, top: b.top - origin.top - 6, bottom: b.bottom - origin.top + 6 };
    });
    if (view.terrain === "flat") drawFlat(project, size, taken);
    else drawResort(project, size, taken);
  }

  function setMapText() {
    const zh = language === "zh";
    const name = (id) => regionalPlace(id)[zh ? "zh" : "en"];
    flatMarks.beijing.name.textContent = name("beijing");
    flatMarks.gubeikou.name.textContent = name("gubeikou");
    flatMarks.chengde.name.textContent = name("chengde");
    flatMarks.mulan.name.textContent = name("mulan");
    flatMarks.summer.name.textContent = text("summer-palace");
    flatMarks.summer.notes[0].textContent = text("wang-event");
    wallLabel.textContent = zh ? "长城" : "Great Wall";
    mulanLabel.textContent = zh ? "木兰围场 · 官方公布范围" : "Mulan · published extent";
    memoryLabel.textContent = "";
    memoryNote.textContent = text("memory-link");
    // on the map the English is shortened; the full phrase stays in the copy
    zoneLabels.chair.textContent = zh ? text("chair-label") : "The hills, a chair back";
    zoneLabels.hills.textContent = text("mountain-zone");
    zoneLabels.plain.textContent = text("plain-zone");
    zoneLabels.lakes.textContent = text("lake-zone");
    zoneLabels.temples.textContent = text("outer-temples");
    zoneLabels.river.textContent = zh ? "武烈河" : "Wulie River";
    resortMarks.gate.name.textContent = zh ? "丽正门 · 1861" : "Lizheng Gate · 1861";
    resortMarks.gate.notes[0].textContent = zh ? "山庄再度关闭" : "the resort closes again";
    resortMarks.wanshu.name.textContent = text("wanshu-title");
    resortMarks.wanshu.notes[0].textContent = "1793 · 09 · 14";
    resortMarks.wanshu.notes[1].textContent = text("wanshu-note");
    Object.entries(resortMarks.temples).forEach(([id, m]) => {
      const entry = geography.places.find((p) => p.id === id);
      m.name.textContent = entry ? entry[zh ? "zh" : "en"] : features.temples[id].name;
    });
    compass.querySelector("text").textContent = zh ? "北" : "N";
    compass.setAttribute("aria-label", zh ? "指北针" : "North arrow");
  }

  window.MOUNTAIN_RESORT_TERRAIN_RENDERER?.onFrame((project, view) => {
    if (window.MOUNTAIN_RESORT_TERRAIN_RENDERER.active()) drawMarks(project, view);
  });
  window.MOUNTAIN_RESORT_FLAT_MAP_VIEW?.onFrame(drawMarks);

  function renderStatus() {
    statusNumber.textContent = timeline[language][active];
    statusLabel.textContent = status[language][active];
  }

  // Called by the shell whenever copy is (re)applied, including the first time.
  function onRender(nextLanguage) {
    language = nextLanguage;
    setMapText();
    renderStatus();
  }

  // Called by the shell whenever the active section changes (and once at start).
  function onSection(index, _state, previous) {
    active = index;
    level = index + 1;
    body.dataset.readingLevel = String(level);
    // sections 1 and 5 are the flat map, 2-4 the 3D terrain
    window.MOUNTAIN_RESORT_FLAT_MAP_VIEW?.setState(level);
    window.MOUNTAIN_RESORT_TERRAIN_RENDERER?.setState(level);
    renderStatus();
  }

  window.ChapterShell.init({
    id: "mountain-resort",
    revealId: "chengde", // the homepage still knows this story as "chengde"
    number: data.number,
    data,
    sections,
    timeline,
    copy,
    formatParagraph,
    onRender,
    onSection,
    showReaderLocation: false,
    showReaderProgress: false
  });
})();
