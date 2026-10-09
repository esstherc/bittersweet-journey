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


  const copy = {
    zh: {
      "map-aria": "鸣沙山与月牙泉三维地形图",
      "map-svg-title": "鸣沙山与月牙泉文学地图",
      "map-svg-desc": "三维地形和月牙泉轮廓随阅读逐层显影；虚线脚印为文学叙事路径，不是实测路线。",
      "map-teaser": "沙山后的一弯泉",
      thesis: "先有脚印，然后才有泉。",
      open: "开始攀登",
      "rail-caption": "阅读路标",
      "rail-aria": "阅读路标",
      "section-aria": "路标 {n}",
      "ridge-quote": "脚印像一条长不可及的绸带",
      "notes-keyboard": "↑ ↓ ← → 切换路标 · L 切换语言 · Esc 关闭本面板",
      "data-3d-label": "三维",
      "data-3d": "3D沙山直接由DEM高程网格生成，并随阅读切换镜头。",
      "data-route-label": "脚印",
      "data-route": "原文没有可核验的行走坐标。虚线脚印仅表达阅读中的攀登，不是作者的实测路线。",
      "data-region-label": "区域",
      "data-region": "第二节的区域地图是 Copernicus DEM 三维地形；敦煌、月牙泉、莫高窟、榆林窟按真实坐标定位，图中距离为大圆直线距离，不是公路里程。",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 经纬度，地形按中心纬度等比例展开；指北针与比例尺随三维镜头更新，比例尺量的是画面中央附近的距离。",
      "data-terrain-label": "地形",
      "data-terrain": "鸣沙山一带：Copernicus DEM GLO-30，约 50 米网格；敦煌至榆林窟：GLO-90，约 430 米网格。高程有夸大。",
      "data-features-label": "地物",
      "data-features": "月牙泉、鸣沙山和党河来自 OpenStreetMap，获取于2026年7月24日。",
      "notes-source-1": "地形：Copernicus DEM GLO-30",
      "notes-source-2": "地物：OpenStreetMap contributors，经 Overpass API 获取",
      "notes-source-3": "莫高窟坐标：甘肃省文化和旅游主管部门公开资料",
      "notes-source-4": "榆林窟坐标：开放地理数据，并与敦煌研究院的位置说明交叉核对",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航或景区安全信息。",
      "complete-line": "鸣沙山深处，一弯清泉永驻于大漠版图。"
    },
    en: {
      "map-aria": "Terrain map of Mingsha Mountain and Crescent Spring",
      "map-svg-title": "Literary map of Mingsha Mountain and Crescent Spring",
      "map-svg-desc": "The 3D terrain and the outline of the spring appear layer by layer as you read; the dotted footsteps are a literary path, not a surveyed route.",
      "map-teaser": "A crescent spring beyond the dunes",
      thesis: "First the footprints. Then the spring.",
      open: "Begin the climb",
      "rail-caption": "Waypoints",
      "rail-aria": "Reading waypoints",
      "section-aria": "Waypoint {n}",
      "ridge-quote": "My footsteps are an unimaginably long silk ribbon",
      "notes-keyboard": "↑ ↓ ← → switch waypoints · L language · Esc closes this panel",
      "data-3d-label": "3D",
      "data-3d": "The dune mesh is generated directly from the DEM and changes camera with the reading.",
      "data-route-label": "Footsteps",
      "data-route": "The essay gives no verifiable walking coordinates. The dotted footsteps express the literary climb; they are not the author's surveyed route.",
      "data-region-label": "Region",
      "data-region": "The regional map in section two is Copernicus DEM terrain; Dunhuang, Crescent Spring, Mogao and Yulin sit at their real coordinates. Distances shown are great-circle lines, not road distances.",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 longitude and latitude, each terrain scaled by its central latitude. The north arrow and scale bar follow the 3D camera; the scale is measured near the middle of the view.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Around Mingsha: Copernicus DEM GLO-30 at about 50 m; Dunhuang to Yulin: GLO-90 at about 430 m. Heights are exaggerated.",
      "data-features-label": "Features",
      "data-features": "Crescent Spring, Mingsha Mountain and the Dang River use OpenStreetMap data retrieved 24 July 2026.",
      "notes-source-1": "Terrain: Copernicus DEM GLO-30",
      "notes-source-2": "Features: OpenStreetMap contributors, retrieved through the Overpass API",
      "notes-source-3": "Mogao coordinates: public material from Gansu's culture and tourism authority",
      "notes-source-4": "Yulin coordinates: open geographic data, cross-checked against the Dunhuang Academy's location description",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation or visitor-safety information.",
      "complete-line": "A crescent spring etches itself upon the desert."
    }
  };

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    return paragraph.startsWith("ROADS EXIST")
      ? paragraph.replace("ROADS EXIST", "Roads exist")
      : paragraph;
  }

  /* ---------- map: labels and symbols on real terrain positions (docs/map-guidance.md) ---------- */

  const body = document.body;
  const svgNS = "http://www.w3.org/2000/svg";
  const scroller = document.querySelector(".reader-scroll");
  const marks = document.querySelector(".terrain-marks");
  const compass = document.querySelector(".compass");
  const scaleBar = document.querySelector(".scale-bar");
  const places = geography.places;
  const features = geography.features;
  let language = body.dataset.language || "zh";
  let level = 1;
  let walked = 0; // how far the reader is through section one (0-1): the footprints appear as they climb

  const make = (tag, attributes = {}, parent) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  };
  const layer = (name) => make("g", { class: `marks-${name}` }, marks);

  // Points behind the camera cannot be projected: a line breaks there, a polygon is skipped.
  const polyline = (points, project, lift = 0, close = false) => {
    let d = "", pen = false;
    for (const [lon, lat] of points) {
      const p = project(lon, lat, lift);
      if (p.w <= 0.02) { if (close) return ""; pen = false; continue; }
      d += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      pen = true;
    }
    return d && close ? d + "Z" : d;
  };

  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const distanceToBox = (x, y, b) => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
  const typeSize = (node) => parseFloat(window.getComputedStyle(node).fontSize) || 16;

  // Symbols drawn in a 24-unit box, centred on the place.
  const SYMBOLS = {
    // a dune peak: two crests, with the near slope's shadow line
    mountain: "M-12 7L-3-8L2-1L5-5L12 7Z M-3-8L0 7",
    // a spring: a water drop above two ripples
    spring: "M0-11C3-6 6-3 6 1A6 6 0 0 1-6 1C-6-3-3-6 0-11Z M-10 8Q0 4 10 8 M-7 11Q0 8 7 11",
    // a cave temple: an arched niche
    cave: "M-8 8V-1A8 8 0 0 1 8-1V8Z M-3 8V2A3 3 0 0 1 3 2V8",
    town: "M-4 0A4 4 0 1 0 4 0A4 4 0 1 0-4 0Z"
  };
  const symbolRadius = 20;

  // A labelled place: symbol, name, optional note (name above note, moved together: L-2).
  function makeMark(parent, cls, symbol) {
    const group = make("g", { class: `place ${cls}` }, parent);
    return {
      group,
      leader: make("path", { class: "leader" }, group),
      backdrop: make("circle", { class: "backdrop", r: 20 }, group),
      symbol: make("path", { class: "symbol", d: symbol }, group),
      name: make("text", { class: "name" }, group),
      note: make("text", { class: "note" }, group)
    };
  }
  function hideMark(mark) { mark.group.style.visibility = "hidden"; }

  // L-4: #1 右上, #2 右下, #2 左上, #3 左下, #4 正上, #5 正下; the first fully clear spot wins.
  // Not clear: overlaps anything placed, leaves the panel, or sits nearer another place's symbol than its
  // own (L-3). With no clear spot the note goes, then the name (H2); the symbol always stays.
  function placeMark(mark, p, taken, size, symbols, withNote = true, focus = false) {
    if (!p.visible) return hideMark(mark);
    mark.group.style.visibility = "";
    // symbols are drawn 1.5x on a paper disc, so they read on sand and on water alike
    mark.symbol.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(1.5)`);
    mark.backdrop.setAttribute("cx", p.x.toFixed(1));
    mark.backdrop.setAttribute("cy", p.y.toFixed(1));
    const nameSize = typeSize(mark.name), noteSize = typeSize(mark.note);
    // line boxes measured from the fonts themselves (the English face is taller than 1.15 em)
    const line = (node) => { node.setAttribute("y", "0"); const b = node.getBBox(); return { ascent: -b.y, height: b.height || node === mark.name ? b.height : 0 }; };
    const nameLine = line(mark.name), noteLine = mark.note.textContent ? line(mark.note) : { ascent: 0, height: 0 };
    const tryWith = (note, strict = true) => {
      const w = Math.max(mark.name.getComputedTextLength(), note ? mark.note.getComputedTextLength() : 0);
      const h = nameLine.height + (note ? nameSize * 0.12 + noteLine.height : 0);
      const gap = nameSize * 0.25, r = symbolRadius, lift = nameSize * 0.1;
      const spots = [
        ["start", p.x + r + gap, p.y - lift - h], ["start", p.x + r + gap, p.y + lift],
        ["end", p.x - r - gap - w, p.y - lift - h], ["end", p.x - r - gap - w, p.y + lift],
        ["middle", p.x - w / 2, p.y - r - gap - h], ["middle", p.x - w / 2, p.y + r + gap]
      ];
      // the focus in a tight cluster: further below or above, joined by a leader line
      if (!strict) for (let k = 1; k <= 4; k += 1) {
        spots.push(["middle", p.x - w / 2, p.y + r + gap + k * h * 0.5], ["middle", p.x - w / 2, p.y - r - gap - h - k * h * 0.5]);
      }
      for (const [anchor, x0, y] of spots) {
        // a label near the edge slides back inside the panel before the spot is judged
        const x = Math.max(6, Math.min(size.width - 6 - w, x0));
        const box = { left: x, right: x + w, top: y, bottom: y + h };
        if (box.right > size.width - 6 || box.top < 6 || box.bottom > size.height - 6) continue;
        if (p.x > box.left - gap && p.x < box.right + gap && p.y > box.top - gap && p.y < box.bottom + gap) continue;
        if (taken.some((other) => overlapArea(box, other) > 0)) continue;
        const own = distanceToBox(p.x, p.y, box);
        if (strict && symbols.some((q) => q !== p && q.visible && distanceToBox(q.x, q.y, box) < own + gap)) continue;
        return { anchor, x, y, w, box };
      }
      return null;
    };
    let note = withNote && Boolean(mark.note.textContent);
    let spot = tryWith(note);
    if (!spot && note) { note = false; spot = tryWith(false); }
    // the focus of a view (H1) keeps its name even in a tight cluster: only the ownership test is relaxed
    if (!spot && focus) spot = tryWith(false, false);
    if (!spot) { mark.name.style.visibility = "hidden"; mark.note.style.visibility = "hidden"; mark.leader.removeAttribute("d"); return; }
    taken.push(spot.box);
    const reach = distanceToBox(p.x, p.y, spot.box);
    if (reach > symbolRadius + nameSize * 0.5) {
      const ex = Math.max(spot.box.left, Math.min(spot.box.right, p.x)), ey = Math.max(spot.box.top, Math.min(spot.box.bottom, p.y));
      mark.leader.setAttribute("d", `M${p.x.toFixed(1)},${p.y.toFixed(1)}L${ex.toFixed(1)},${ey.toFixed(1)}`);
    } else mark.leader.removeAttribute("d");
    const textX = spot.anchor === "start" ? spot.x : spot.anchor === "end" ? spot.x + spot.w : spot.x + spot.w / 2;
    [mark.name, mark.note].forEach((node) => node.setAttribute("text-anchor", spot.anchor));
    mark.name.style.visibility = "";
    mark.name.setAttribute("x", textX.toFixed(1));
    mark.name.setAttribute("y", (spot.y + nameLine.ascent).toFixed(1));
    mark.note.style.visibility = note ? "" : "hidden";
    mark.note.setAttribute("x", textX.toFixed(1));
    mark.note.setAttribute("y", (spot.y + nameLine.height + nameSize * 0.12 + noteLine.ascent).toFixed(1));
  }
  // H5: a line label on the first clear point of its line, from the middle outward; none if nothing is clear.
  function placeLineLabel(node, points, project, lift, taken, size) {
    node.style.visibility = "hidden";
    if (!points.length) return;
    const step = Math.max(1, Math.floor(points.length / 16)), middle = Math.floor(points.length / 2);
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
  const reserve = (taken, points) => points.forEach((p) => {
    if (p.visible) taken.push({ left: p.x - symbolRadius, right: p.x + symbolRadius, top: p.y - symbolRadius, bottom: p.y + symbolRadius });
  });

  /* the local terrain: sections one, three, four */
  const localLayer = layer("local");
  const boundary = make("path", { class: "mingsha-boundary" }, localLayer);
  const localRivers = features.danghe.map(() => make("path", { class: "river" }, localLayer));
  const localRiverLabel = make("text", { class: "river-label", "text-anchor": "middle" }, localLayer);
  const lakePaths = features.lake.map(() => make("path", { class: "spring-lake" }, localLayer));
  const oasisRings = [make("circle", { class: "oasis-ring" }, localLayer), make("circle", { class: "oasis-ring is-outer" }, localLayer)];
  const routeTrace = make("path", { class: "route-trace", id: "ridge-route" }, localLayer);
  const footprints = Array.from({ length: 34 }, () => make("ellipse", { class: "footprint" }, localLayer));
  const quote = make("text", { class: "ridge-quote" }, localLayer);
  const quotePath = make("textPath", { href: "#ridge-route", startOffset: "6%" }, quote);
  const localMarks = {
    peak: makeMark(localLayer, "is-peak", SYMBOLS.mountain),
    spring: makeMark(localLayer, "is-spring", SYMBOLS.spring)
  };

  /* the regional terrain: section two */
  const regionalLayer = layer("regional");
  const regionalRivers = features.danghe.map(() => make("path", { class: "river" }, regionalLayer));
  const regionalRiverLabel = make("text", { class: "river-label", "text-anchor": "middle" }, regionalLayer);
  const links = [["dunhuang", "spring"], ["spring", "mogao"], ["mogao", "yulin"]].map(([a, b]) => ({
    a, b, line: make("path", { class: "link" }, regionalLayer), label: make("text", { class: "link-label", "text-anchor": "middle" }, regionalLayer)
  }));
  const regionalMarks = {
    dunhuang: makeMark(regionalLayer, "is-town", SYMBOLS.town),
    spring: makeMark(regionalLayer, "is-spring is-origin", SYMBOLS.spring),
    mogao: makeMark(regionalLayer, "is-cave", SYMBOLS.cave),
    yulin: makeMark(regionalLayer, "is-cave", SYMBOLS.cave)
  };

  function drawLocal(project, size, taken) {
    const peak = project(places.peak.lon, places.peak.lat, 20);
    const spring = project(places.spring.lon, places.spring.lat, 4);
    const showSpring = level >= 3;
    boundary.setAttribute("d", features.mingshaBoundary.map((part) => polyline(part, project, 6, true)).join(""));
    features.danghe.forEach((part, i) => localRivers[i].setAttribute("d", polyline(part, project, 4)));
    features.lake.forEach((part, i) => lakePaths[i].setAttribute("d", showSpring ? polyline(part, project, 2, true) : ""));
    lakePaths.forEach((node) => node.classList.toggle("is-still", level === 4));
    // the narrative climb: alternating footprints along the editorial route
    routeTrace.setAttribute("d", polyline(features.route, project, 8));
    const route = features.route.map(([lon, lat]) => project(lon, lat, 8));
    let last = null;
    footprints.forEach((foot, index) => {
      const t = (index + 0.5) / footprints.length;
      if (level === 1 && t > 0.08 + walked * 0.84 + 0.04) { foot.style.visibility = "hidden"; return; }
      const at = t * (route.length - 1), i = Math.floor(at), f = at - i;
      const a = route[i], b = route[Math.min(route.length - 1, i + 1)];
      if (!a.visible || !b.visible) { foot.style.visibility = "hidden"; return; }
      const x0 = a.x + (b.x - a.x) * f, y0 = a.y + (b.y - a.y) * f;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const side = index % 2 ? 1 : -1;
      const x = x0 - Math.sin(angle) * 3.4 * side, y = y0 + Math.cos(angle) * 3.4 * side;
      if (last && Math.hypot(x - last[0], y - last[1]) < 9) { foot.style.visibility = "hidden"; return; }
      last = [x, y];
      foot.style.visibility = "";
      foot.setAttribute("cx", x.toFixed(1));
      foot.setAttribute("cy", y.toFixed(1));
      foot.setAttribute("rx", "2.4");
      foot.setAttribute("ry", "4.8");
      foot.setAttribute("transform", `rotate(${(angle * 180 / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`);
    });
    quote.style.visibility = level >= 3 ? "" : "hidden";
    oasisRings.forEach((ring, i) => {
      ring.style.visibility = level === 4 && spring.visible ? "" : "hidden";
      ring.setAttribute("cx", spring.x.toFixed(1));
      ring.setAttribute("cy", spring.y.toFixed(1));
      ring.setAttribute("r", String(i ? 44 : 30));
    });
    const symbols = [peak, ...(showSpring ? [spring] : [])];
    reserve(taken, symbols);
    // the spring is the focus once it appears; otherwise the peak
    if (showSpring) placeMark(localMarks.spring, spring, taken, size, symbols, level === 4, true);
    else hideMark(localMarks.spring);
    placeMark(localMarks.peak, peak, taken, size, symbols);
    placeLineLabel(localRiverLabel, features.danghe.flat(), project, 4, taken, size);
    if (level >= 3) {
      const b = quote.getBBox();
      const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
      const inside = b.width > 0 && box.left >= 6 && box.right <= size.width - 6 && box.top >= 6 && box.bottom <= size.height - 6;
      quote.style.visibility = inside && !taken.some((other) => overlapArea(box, other) > 0) ? "" : "hidden";
    }
  }

  function drawRegional(project, size, taken) {
    const at = (id) => project(places[id].lon, places[id].lat, 60);
    features.danghe.forEach((part, i) => regionalRivers[i].setAttribute("d", polyline(part, project, 20)));
    const points = Object.fromEntries(Object.keys(regionalMarks).map((id) => [id, at(id)]));
    const symbols = Object.values(points);
    reserve(taken, symbols);
    links.forEach(({ a, b, line }) => {
      const p = points[a], q = points[b];
      line.setAttribute("d", p.visible && q.visible ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}L${q.x.toFixed(1)},${q.y.toFixed(1)}` : "");
    });
    ["spring", "mogao", "yulin", "dunhuang"].forEach((id) => placeMark(regionalMarks[id], points[id], taken, size, symbols, true, id === "spring"));
    // distances along their lines, placed last (H6), hidden where they would cover anything
    links.forEach(({ a, b, label }) => {
      const p = points[a], q = points[b];
      label.style.visibility = "hidden";
      if (!p.visible || !q.visible) return;
      // along the line (middle first), just above it, then just below
      const size22 = typeSize(label);
      for (const t of [0.5, 0.4, 0.6, 0.3, 0.7]) for (const dy of [-8, size22 + 6]) {
        label.setAttribute("x", (p.x + (q.x - p.x) * t).toFixed(1));
        label.setAttribute("y", (p.y + (q.y - p.y) * t + dy).toFixed(1));
        const bb = label.getBBox();
        const box = { left: bb.x - 3, right: bb.x + bb.width + 3, top: bb.y - 2, bottom: bb.y + bb.height + 2 };
        if (box.left < 6 || box.right > size.width - 6 || box.top < 6 || box.bottom > size.height - 6) continue;
        if (taken.some((other) => overlapArea(box, other) > 0)) continue;
        taken.push(box);
        label.style.visibility = "";
        return;
      }
    });
    placeLineLabel(regionalRiverLabel, features.danghe.flat(), project, 20, taken, size);
  }

  // A scale bar of a round length (90 px or more) for the middle of the view, and a north arrow that turns with it.
  function drawFurniture(view) {
    compass.style.setProperty("--north", `${(view.north * 180 / Math.PI).toFixed(1)}deg`);
    const steps = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
    const metres = steps.find((m) => m / view.metresPerPixel >= 90) || steps[steps.length - 1];
    const px = Math.round(metres / view.metresPerPixel);
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
    const size = { width, height };
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    marks.dataset.terrain = view.terrain;
    drawFurniture(view);
    // map furniture first (L-7)
    const origin = marks.getBoundingClientRect();
    const taken = [compass, scaleBar].map((node) => {
      const b = node.getBoundingClientRect();
      return { left: b.left - origin.left - 6, right: b.right - origin.left + 6, top: b.top - origin.top - 6, bottom: b.bottom - origin.top + 6 };
    });
    if (view.terrain === "regional") drawRegional(project, size, taken);
    else drawLocal(project, size, taken);
  }

  /* ---------- map text, in the current language only ---------- */

  function setMapText() {
    const zh = language === "zh";
    const name = (id) => places[id][zh ? "zh" : "en"];
    localMarks.peak.name.textContent = name("peak");
    localMarks.spring.name.textContent = name("spring");
    localMarks.spring.note.textContent = zh ? "风沙中如此一静" : "Stillness within the sand";
    regionalMarks.dunhuang.name.textContent = name("dunhuang");
    regionalMarks.spring.name.textContent = zh ? "鸣沙山 · 月牙泉" : "Mingsha · Crescent Spring";
    regionalMarks.mogao.name.textContent = name("mogao");
    regionalMarks.yulin.name.textContent = name("yulin");
    Object.values(regionalMarks).forEach((mark) => { mark.note.textContent = ""; });
    links.forEach(({ label }) => {
      label.textContent = "";
    });
    localRiverLabel.textContent = zh ? "党河" : "Dang River";
    regionalRiverLabel.textContent = localRiverLabel.textContent;
    quotePath.textContent = copy[language]["ridge-quote"];
    compass.querySelector("text").textContent = zh ? "北" : "N";
    compass.setAttribute("aria-label", zh ? "指北针" : "North arrow");
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
    const progress = Math.max(0, Math.min(1, (threshold - (rect.top - top)) / Math.max(rect.height - threshold, 1)));
    if (level === 1) walked = progress;
    renderer.setProgress(progress);
  }

  function onRender(nextLanguage) {
    language = nextLanguage;
    setMapText();
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    window.SECRET_SPRING_TERRAIN_RENDERER?.setState(level);
  }

  window.SECRET_SPRING_TERRAIN_RENDERER?.onFrame(drawMarks);
  scroller.addEventListener("scroll", () => window.requestAnimationFrame(updateLight), { passive: true });

  ChapterShell.init({
    id: "secret-spring",
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
