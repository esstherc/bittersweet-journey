(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.YANGGUAN_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // The essay has no numbered sections: five parts pace the map (see reader note).
  const sections = {
    zh: [
      { label: "一 · 诗与远方", location: "未出发 · 诗境" },
      { label: "二 · 雪漠孤行", location: "敦煌县城以西 · 雪" },
      { label: "三 · 荒原坟冢", location: "沙地 · 坟堆" },
      { label: "四 · 阳关古址", location: "烽火台 · 雪峰" },
      { label: "五 · 西出阳关", location: "渭城曲 · 唐人" }
    ],
    en: [
      { label: "I · Poems and distant places", location: "Before setting out" },
      { label: "II · Alone in the snow", location: "West of Dunhuang · Snow" },
      { label: "III · Mounds on the wasteland", location: "Open desert · Burial mounds" },
      { label: "IV · The ruins of Yangguan", location: "Beacon tower · Snow peaks" },
      { label: "V · West of Yangguan", location: "Song at Weicheng · The Tang" }
    ]
  };

  // On-map caption (M-5): what the current view shows.
  const captions = {
    zh: ["纸上的阳关", "出敦煌，入雪漠", "疑是古战场", "阳关古址", "渭城一杯酒"],
    en: ["The pass on paper", "Out of Dunhuang, into the snow", "Perhaps an old battlefield", "The old site of the Southern Pass", "One more cup, at Weicheng"]
  };
  const captionTech = [
    "3D terrain · Copernicus DEM",
    "Regional · WGS 84",
    "3D terrain · Literary mounds",
    "3D terrain · Wikidata Q909541",
    "3D terrain · Looking west"
  ];

  const labels = {
    zh: {
      pass: "阳关古址 · 烽燧",
      wall: "阳关长城（汉）",
      oasis: "今阳关绿洲",
      peak: "阿尔金山",
      poem: ["劝君更尽一杯酒，", "西出阳关无故人。"],
      dunhuang: "敦煌县城",
      yangguan: "阳关",
      road: "今公路",
      distance: `直线约 ${geography.regional.distanceKm} km`,
      regionalWall: "阳关长城"
    },
    en: {
      pass: "Yangguan · beacon site",
      wall: "Han-era wall line",
      oasis: "Today’s Yangguan oasis",
      peak: "Altun Mountains",
      poem: ["I urge my friend to have one last cup of wine /", "Westward beyond the Southern Pass, there are no familiar faces."],
      dunhuang: "Dunhuang (county town)",
      yangguan: "The Southern Pass",
      road: "modern road",
      distance: `${geography.regional.distanceKm} km in a straight line`,
      regionalWall: "Han-era wall line"
    }
  };

  const copy = {
    zh: {
      "map-aria": "阳关一带三维雪漠地形图",
      "regional-svg-title": "敦煌县城与阳关的区域关系",
      "map-teaser": "冲着一首诗，去寻一座关。",
      thesis: "诗句比关隘活得更久。",
      open: "踏雪出发",
      "rail-caption": "阅读行程",
      "rail-aria": "阅读行程",
      "section-aria": "段落 {n}",
      "reader-note": "五个段落用于交互节奏，不是原文编号分节。",
      "notes-keyboard": "↑ ↓ ← → 切换段落 · L 切换语言 · Esc 关闭本面板",
      "data-3d-label": "三维",
      "data-3d": "雪漠地形直接由 DEM 高程网格生成，随阅读切换镜头；雪的覆盖随原文变化：出发时大雪，天晴后低处化出沙底，高处与远山积雪不化。",
      "data-real-label": "真实地物",
      "data-real": "阳关烽燧点、阳关长城（汉代烽燧线）、今阳关绿洲（林场、果园、水体与渠道）和阿尔金山均按真实坐标放在地形上。",
      "data-literary-label": "文学意象",
      "data-literary": "地图上的脚印（叙事路径）与坟堆都是文学示意：原文没有可核验的行走坐标，也没有指名坟堆所在的遗址，所以它们不是作者的实测路线，也不是测绘坟场。“今阳关绿洲”指现代农林用地，不代表汉唐时的屯垦范围。",
      "data-far-label": "诗境",
      "data-far": "第一段换用一块从阳关到苏州的大范围地形（约 8 公里一格），白帝城、黄鹤楼、寒山寺按真实坐标标在上面，虚线连到原点阳关，数字为大圆直线距离（白帝城 1,713 km、黄鹤楼 2,106 km、寒山寺 2,568 km；手机上只显示地名）。镜头由高处俯视，北方朝上。第三至五段换回阳关周边的细网格地形。",
      "data-region-label": "区域",
      "data-region": "第二段切换为敦煌县城—阳关的区域图，距离为大圆直线距离，不是公路里程。",
      "data-projection-label": "投影",
      "data-projection": "WGS 84 经纬度，局部按纬度余弦等比例展开，保持地物的相对位置与距离。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM GLO-90，重采样为约 325 米网格；高程夸大 8 倍，1600 米以上按 0.3 压缩，仅为显示，使平原起伏与远山同时可读。",
      "data-snow-label": "雪",
      "data-snow": "积雪、化雪与飘雪是依原文叙述的视觉表达，不是气象资料。",
      "notes-source-1": "地形：Copernicus DEM GLO-90（© DLR e.V. 2010–2014，© Airbus Defence and Space GmbH 2014–2018，欧盟与 ESA 哥白尼计划提供）",
      "notes-source-2": "阳关坐标：Wikidata Q909541（坐标属性 P625），2026 年 9 月 27 日取得",
      "notes-source-3": "阳关长城、绿洲、公路：OpenStreetMap contributors（ODbL 1.0），经 Overpass API 于 2026 年 9 月 27 日取得",
      "notes-source-4": "敦煌县城坐标：与《沙原隐泉》章节所用数据相同；白帝城、黄鹤楼、寒山寺：Wikidata Q803709、Q462372、Q1146619",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航、文物保护或景区安全信息。王维诗中的渭城不在这次行程范围内，未上图。",
      "complete-line": "风雪掩关，唐音犹在纸上。"
    },
    en: {
      "map-aria": "3D snow-desert terrain around Yangguan, the Southern Pass",
      "regional-svg-title": "Dunhuang and the Southern Pass",
      "map-teaser": "Setting out through snow, for a pass in a poem.",
      thesis: "Verses outlive the pass.",
      open: "Set out into the snow",
      "rail-caption": "The walk",
      "rail-aria": "Parts of the walk",
      "section-aria": "Part {n}",
      "reader-note": "These five parts pace the interaction; the essay itself has no numbered sections.",
      "notes-keyboard": "↑ ↓ ← → switch parts · L language · Esc closes this panel",
      "data-3d-label": "3D",
      "data-3d": "The snow desert is generated directly from the DEM and changes camera with the reading. Snow follows the essay: heavy at the start, melting on low ground once the sky clears, lasting on the heights and the far mountains.",
      "data-real-label": "Real features",
      "data-real": "The beacon site of the pass, the Han-era wall line, today’s oasis (forest farm, orchards, water and channels) and the Altun Mountains sit on the terrain at their real coordinates.",
      "data-literary-label": "Literary",
      "data-literary": "The footprints (the narrative path) and the burial mounds are literary: the essay gives no verifiable walking coordinates and names no site for the mounds, so they are neither the author’s surveyed route nor a mapped burial ground. “Today’s Yangguan oasis” is modern farm and forest land, not the Han or Tang garrison fields.",
      "data-far-label": "Poems",
      "data-far": "Part one uses a wide terrain from the pass to Suzhou (about 8 km per cell). White Emperor City, Yellow Crane Tower and Cold Mountain Temple sit at their real coordinates, joined by dashed lines to the origin at the pass; the figures are great-circle distances (White Emperor City 1,713 km, Yellow Crane Tower 2,106 km, Cold Mountain Temple 2,568 km; phones show the names only). The view looks down from high above, north up. Parts three to five return to the fine terrain around the pass.",
      "data-region-label": "Region",
      "data-region": "Part two switches to a regional map of Dunhuang and the pass. The distance is a great-circle line, not a road distance.",
      "data-projection-label": "Projection",
      "data-projection": "WGS 84 longitude and latitude, scaled by the cosine of latitude so relative position and distance hold.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM GLO-90, resampled to about 325 m. Heights are exaggerated eight times and compressed by 0.3 above 1,600 m, for display only, so the plain and the mountains are both readable.",
      "data-snow-label": "Snow",
      "data-snow": "Snow cover, melting and falling snow follow the essay; they are not weather data.",
      "notes-source-1": "Terrain: Copernicus DEM GLO-90 (© DLR e.V. 2010–2014, © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)",
      "notes-source-2": "The pass: Wikidata Q909541 (coordinate property P625), retrieved 27 September 2026",
      "notes-source-3": "Wall line, oasis and roads: OpenStreetMap contributors (ODbL 1.0), via the Overpass API, 27 September 2026",
      "notes-source-4": "Dunhuang: the same coordinate as in A Secret Spring in the Sand; White Emperor City, Yellow Crane Tower, Cold Mountain Temple: Wikidata Q803709, Q462372, Q1146619",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation, heritage or visitor-safety information. Weicheng in Wang Wei’s poem lies outside this walk and is not mapped.",
      "complete-line": "Snow covers the pass; its verses remain on the page."
    }
  };

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    return paragraph.startsWith("IN ANCIENT CHINA") ? paragraph.replace("IN ANCIENT CHINA", "In ancient China") : paragraph;
  }

  const body = document.body;
  const svgNS = "http://www.w3.org/2000/svg";
  const scroller = document.querySelector(".reader-scroll");
  const marks = document.querySelector(".terrain-marks");
  const regional = document.querySelector(".regional-map");
  const modeLabel = document.querySelector(".camera-mode");
  const techLabel = document.querySelector(".camera-tech");
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let language = body.dataset.language || "zh";
  let level = 1;
  let progress = 0;

  const make = (tag, attributes = {}, parent) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  };

  /* ---------- regional map (level 2) ---------- */

  const region = geography.regional;
  regional.setAttribute("viewBox", region.viewBox.join(" "));
  regional.setAttribute("preserveAspectRatio", "xMidYMid slice");
  make("image", { href: region.image, x: 0, y: 0, width: region.viewBox[2], height: region.viewBox[3], class: "regional-relief" }, regional);
  const regionalRoads = make("g", { class: "regional-roads" }, regional);
  region.roads.forEach((d) => make("path", { d }, regionalRoads));
  const regionalWall = make("g", { class: "regional-wall" }, regional);
  region.wall.forEach((d) => make("path", { d }, regionalWall));
  const [dx, dy] = region.dunhuang;
  const [px, py] = region.pass;
  make("path", { class: "regional-line", d: `M${dx},${dy}L${px},${py}` }, regional);
  const regionalPoint = (x, y, cls) => {
    const group = make("g", { class: `regional-point ${cls}`, transform: `translate(${x} ${y})` }, regional);
    make("circle", { r: 13, class: "halo" }, group);
    make("circle", { r: 4.5 }, group);
    return make("text", { x: 0, y: -22, "text-anchor": "middle" }, group);
  };
  const regionalText = {
    dunhuang: regionalPoint(dx, dy, "is-town"),
    yangguan: regionalPoint(px, py, "is-pass"),
    distance: make("text", { class: "regional-distance", x: (dx + px) / 2, y: (dy + py) / 2 - 14, "text-anchor": "middle" }, regional),
    wall: make("text", { class: "regional-note", x: px + 150, y: py - 44 }, regional)
  };

  // The regional map is scaled to cover the panel, so its edges are cut off at some sizes. Each label tries a few
  // spots around its place and takes the first one fully in view and clear of the others (units are map units).
  function layoutRegional() {
    const frame = regional.getBoundingClientRect();
    if (!frame.width || !frame.height) return;
    const [, , vw, vh] = region.viewBox;
    const s = Math.max(frame.width / vw, frame.height / vh);
    const view = { left: (vw - frame.width / s) / 2, top: (vh - frame.height / s) / 2 };
    view.right = vw - view.left;
    view.bottom = vh - view.top;
    const margin = 10 / s;
    const taken = [[dx, dy], [px, py]].map(([x, y]) => ({ left: x - 13, right: x + 13, top: y - 13, bottom: y + 13 }));
    const fit = (node, [ox, oy], candidates) => {
      const n = typeSize(node);
      let last = null;
      for (const [cx, cy, anchor] of candidates(n)) {
        node.setAttribute("text-anchor", anchor);
        node.setAttribute("x", cx.toFixed(1));
        node.setAttribute("y", cy.toFixed(1));
        let b = node.getBBox();
        const shift = Math.max(0, view.left + margin - (b.x + ox)) - Math.max(0, b.x + ox + b.width - (view.right - margin));
        if (shift) { node.setAttribute("x", (cx + shift).toFixed(1)); b = node.getBBox(); }
        const box = { left: b.x + ox, right: b.x + ox + b.width, top: b.y + oy, bottom: b.y + oy + b.height };
        last = box;
        const inside = box.top >= view.top + margin && box.bottom <= view.bottom - margin;
        if (inside && !taken.some((other) => overlapArea(box, other) > 0)) { taken.push(box); return; }
      }
      taken.push(last);
    };
    fit(regionalText.dunhuang, [dx, dy], (n) => [[0, -22, "middle"], [-n * 0.6, -n * 0.4, "end"], [0, n * 1.5, "middle"], [n * 0.6, n * 1.3, "start"]]);
    fit(regionalText.yangguan, [px, py], (n) => [[0, -22, "middle"], [0, n * 1.5, "middle"], [n * 0.7, n * 0.35, "start"], [n * 0.7, -n * 0.6, "start"]]);
    const mx = (dx + px) / 2, my = (dy + py) / 2;
    fit(regionalText.distance, [0, 0], (n) => [[mx, my - 14, "middle"], [mx + n * 0.5, my + n * 1.3, "start"], [mx, my + n * 1.5, "middle"]]);
    fit(regionalText.wall, [0, 0], (n) => [[px + 150, py - 44, "start"], [px + n, py + n * 2.6, "start"], [px + 150, py + n * 2.2, "start"], [px + n * 4, py + n * 4, "start"]]);
  }
  window.addEventListener("resize", () => window.requestAnimationFrame(layoutRegional));

  /* ---------- labels on the 3D terrain ---------- */

  const local = geography.local;
  const layer = (name) => make("g", { class: `marks-${name}` }, marks);
  const oasis = layer("oasis");
  const greenPaths = local.green.map(() => make("path", { class: "green" }, oasis));
  const waterPaths = local.water.map(() => make("path", { class: "water" }, oasis));
  const streamPaths = local.streams.map(() => make("path", { class: "stream" }, oasis));
  const wallLayer = layer("wall");
  const wallPaths = local.wall.map(() => make("path", {}, wallLayer));
  // Narrative path as footprints (as in 沙原隐泉): left and right feet alternate along the route.
  const routeLayer = layer("route");
  const routePath = make("path", { class: "route-trace" }, routeLayer);
  const FOOTPRINTS = 140;
  const footprints = Array.from({ length: FOOTPRINTS }, () => make("ellipse", { class: "footprint" }, routeLayer));
  // position along the route (0-1) -> lon/lat, by distance along the polyline
  const routeLengths = [0];
  for (let index = 1; index < local.route.length; index += 1) {
    const [a, b] = [local.route[index - 1], local.route[index]];
    routeLengths.push(routeLengths[index - 1] + Math.hypot((b[0] - a[0]) * Math.cos(0.7), b[1] - a[1]));
  }
  const routeAt = (t) => {
    const target = t * routeLengths[routeLengths.length - 1];
    let index = 1;
    while (index < routeLengths.length - 1 && routeLengths[index] < target) index += 1;
    const span = routeLengths[index] - routeLengths[index - 1] || 1;
    const f = (target - routeLengths[index - 1]) / span;
    const [a, b] = [local.route[index - 1], local.route[index]];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  const moundLayer = layer("mounds");
  const moundPaths = local.mounds.map(() => make("path", {}, moundLayer));
  const passLayer = layer("pass");
  const passGlyph = make("path", { class: "beacon" }, passLayer);
  const passLabel = make("text", { class: "label" }, passLayer);
  const passCoord = make("text", { class: "coord" }, passLayer);
  passCoord.textContent = `${geography.points.pass.lat.toFixed(3)}°N · ${geography.points.pass.lon.toFixed(3)}°E`;
  const tagLayer = layer("tags");
  const tag = (cls) => make("text", { class: cls }, tagLayer);
  const tags = { wall: tag("tag wall-tag"), oasis: tag("tag oasis-tag") };
  const peakLabel = make("text", { class: "peak-label" }, layer("peak"));
  // Part one: the wide terrain from the pass to Suzhou. The three poetic sites named in the essay sit
  // at their real places; a dashed line joins each to the pass (the origin, Wikidata Q909541).
  const farLayer = layer("far");
  const riverPaths = Object.entries(local.rivers).flatMap(([name, parts]) =>
    parts.map((points) => ({ points, node: make("path", { class: `far-river river-${name}` }, farLayer) })));
  const riverLabels = {
    yangtze: make("text", { class: "far-river-label" }, farLayer),
    yellow: make("text", { class: "far-river-label" }, farLayer)
  };
  const farMarks = local.farSites.map((site) => ({
    site,
    ray: make("path", { class: "far-ray" }, farLayer),
    dot: make("circle", { class: "far-dot", r: 4 }, farLayer),
    name: make("text", { class: "far-name" }, farLayer),
    note: make("text", { class: "far-note" }, farLayer)
  }));
  const farOrigin = make("circle", { class: "far-origin", r: 5 }, farLayer);
  const originName = make("text", { class: "far-origin-name" }, farLayer);
  const originNote = make("text", { class: "far-note" }, farLayer);
  const poemLayer = layer("poem");
  const poemLines = Array.from({ length: 4 }, () => make("text", {}, poemLayer));
  let poemText = [];

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
  // Offsets follow the rendered type size, so labels keep their spacing at any size.
  const typeSize = (node) => parseFloat(window.getComputedStyle(node).fontSize) || 16;
  const place = (node, p, dx = 0, dy = 0) => {
    // hidden behind the camera, or pushed above the panel's top edge
    node.style.visibility = p.visible && p.y + dy > 14 ? "" : "hidden";
    node.setAttribute("x", (p.x + dx).toFixed(1));
    node.setAttribute("y", (p.y + dy).toFixed(1));
  };
  // Slide a label sideways so it stays inside the panel; returns its box.
  const keepInside = (node, width) => {
    if (node.style.visibility === "hidden") return null;
    let b = node.getBBox();
    const shift = Math.max(0, 6 - b.x) - Math.max(0, b.x + b.width - (width - 6));
    if (shift) {
      node.setAttribute("x", (parseFloat(node.getAttribute("x")) + shift).toFixed(1));
      b = node.getBBox();
    }
    return { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
  };
  const centre = (points) => {
    const sum = points.reduce((acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat], [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  };
  const oasisCentre = centre(local.green.flatMap((item) => item.points));
  const wallCentre = centre(local.wall[Math.floor(local.wall.length / 2)].points);

  // River labels sit on a point of the river chosen by longitude (Yangtze upstream in Sichuan, west of the sites;
  // Yellow River at its great bend), so they stay on the line at any camera.
  const riverLabelAt = { yangtze: 104.5, yellow: 106.5 };
  function riverAnchor(name) {
    let best = null;
    local.rivers[name].forEach((points) => points.forEach(([lon, lat]) => {
      if (!best || Math.abs(lon - riverLabelAt[name]) < Math.abs(best[0] - riverLabelAt[name])) best = [lon, lat];
    }));
    return best;
  }
  const riverAnchors = { yangtze: riverAnchor("yangtze"), yellow: riverAnchor("yellow") };

  function drawFar(project) {
    riverPaths.forEach(({ points, node }) => node.setAttribute("d", polyline(points, project, 400)));

    const origin = project(geography.points.pass.lon, geography.points.pass.lat, 400);
    farOrigin.setAttribute("cx", origin.x.toFixed(1));
    farOrigin.setAttribute("cy", origin.y.toFixed(1));
    const originSize = typeSize(originName);
    place(originName, origin, originSize * 0.6, 0);
    place(originNote, origin, originSize * 0.6, originSize * 0.35 + typeSize(originNote));
    // Labels: each tries above-right, below-right, above-left, below-left and takes the first spot
    // that stays in the panel and clears the labels already placed (the sites run roughly east-west).
    const panelWidth = marks.clientWidth, panelHeight = marks.clientHeight;
    // On narrow panels the sites sit close together: show names only (distances stay in the notes).
    const compact = panelWidth < 520;
    const taken = [boxOf(originName, originNote, origin, originSize * 0.6, -originSize * 0.9, "start", compact)];
    farMarks
      .map((mark) => ({ ...mark, p: project(mark.site.lon, mark.site.lat, 400) }))
      .sort((a, b) => b.p.x - a.p.x) // the right side is the most crowded: place from there
      .forEach(({ site, ray, dot, name, note, p }) => {
        if (!p.visible || !origin.visible) {
          ray.setAttribute("d", "");
          dot.style.visibility = "hidden";
          [name, note].forEach((node) => { node.style.visibility = "hidden"; });
          return;
        }
        ray.setAttribute("d", `M${origin.x.toFixed(1)},${origin.y.toFixed(1)}L${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        dot.style.visibility = "";
        dot.setAttribute("cx", p.x.toFixed(1));
        dot.setAttribute("cy", p.y.toFixed(1));
        const n = typeSize(name), gap = n * 0.5;
        const spots = [
          [gap, -1.5 * n, "start"], [gap, 0.95 * n, "start"], [-gap, -1.5 * n, "end"], [-gap, 0.95 * n, "end"],
          [gap, -2.8 * n, "start"], [-gap, -2.8 * n, "end"], [gap, 2.25 * n, "start"], [-gap, 2.25 * n, "end"]
        ];
        // first spot that is inside the panel and clear; otherwise the inside spot that overlaps least
        let best = null;
        for (const [dx, dy, anchor] of spots) {
          const box = boxOf(name, note, p, dx, dy, anchor, compact);
          const outside = Math.max(0, 6 - box.left) + Math.max(0, box.right - (panelWidth - 6)) +
            Math.max(0, 6 - box.top) + Math.max(0, box.bottom - (panelHeight - 6));
          const cost = outside * 1000 + taken.reduce((sum, other) => sum + overlapArea(box, other), 0);
          if (!best || cost < best.cost) best = { cost, dx, dy, anchor, box };
          if (cost === 0) break;
        }
        if (best.cost > 0 && !compact) {
          // crowded: try the name alone before giving up the name as well
          const bare = spots.map(([sx, sy, sa]) => {
            const box = boxOf(name, note, p, sx, sy, sa, true);
            const outside = Math.max(0, 6 - box.left) + Math.max(0, box.right - (panelWidth - 6)) +
              Math.max(0, 6 - box.top) + Math.max(0, box.bottom - (panelHeight - 6));
            return { cost: outside * 1000 + taken.reduce((sum, other) => sum + overlapArea(box, other), 0), dx: sx, dy: sy, anchor: sa, box, bare: true };
          }).sort((a, b) => a.cost - b.cost)[0];
          if (bare.cost < best.cost) best = bare;
        }
        if (best.cost > 0) {
          [name, note].forEach((node) => { node.style.visibility = "hidden"; });
          return;
        }
        const { dx, dy, anchor, box } = best;
        const noteShown = !compact && !best.bare;
        note.style.display = noteShown ? "" : "none";
        taken.push(box);
        [name, note].forEach((node) => node.setAttribute("text-anchor", anchor));
        place(name, p, dx, dy + n * 0.9);
        place(note, p, dx, dy + n * 1.35 + typeSize(note));
        if (!noteShown) note.style.visibility = "hidden";
      });

    // River names are secondary: drawn last, and dropped where they would cover a place name.
    Object.entries(riverLabels).forEach(([name, node]) => {
      const r = typeSize(node);
      place(node, project(riverAnchors[name][0], riverAnchors[name][1], 400), r * 0.7, name === "yangtze" ? r * 1.35 : -r * 0.7);
      if (node.style.visibility === "hidden") return;
      const b = node.getBBox();
      const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
      if (taken.some((other) => overlapArea(box, other) > 0)) node.style.visibility = "hidden";
    });
  }

  // Box of a two-line label (name above note) whose top-left/top-right is at p + (dx, dy).
  function boxOf(name, note, p, dx, dy, anchor, nameOnly = false) {
    const width = nameOnly ? name.getComputedTextLength() : Math.max(name.getComputedTextLength(), note.getComputedTextLength());
    const left = anchor === "end" ? p.x + dx - width : p.x + dx;
    const n = typeSize(name);
    return { left, right: left + width, top: p.y + dy, bottom: p.y + dy + (nameOnly ? n * 1.15 : n * 1.35 + typeSize(note) * 1.3) };
  }
  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  // North arrow: turns with the camera; straight up on the regional map.
  const compass = document.querySelector(".compass");
  let northAngle = 0;
  function drawCompass() {
    const angle = level === 2 ? 0 : northAngle;
    compass.style.setProperty("--north", `${(angle * 180 / Math.PI).toFixed(1)}deg`);
  }

  function drawMarks(project, view) {
    const { width, height } = marks.getBoundingClientRect();
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    northAngle = view.north;
    drawCompass();
    // Each layer is drawn only on the terrain it belongs to (the terrains swap between parts).
    if (level === 2) layoutRegional();
    if (view.terrain === "wide") {
      if (level === 1) drawFar(project);
      return;
    }
    if (level < 3) return;

    local.green.forEach((item, index) => greenPaths[index].setAttribute("d", polyline(item.points, project, 2, true)));
    local.water.forEach((item, index) => waterPaths[index].setAttribute("d", polyline(item.points, project, 2, true)));
    local.streams.forEach((item, index) => streamPaths[index].setAttribute("d", polyline(item.points, project, 2)));
    local.wall.forEach((item, index) => wallPaths[index].setAttribute("d", polyline(item.points, project, 6)));

    // The path is walked as part three is read, then stays.
    const shown = level === 3 ? Math.max(2, Math.ceil(progress * local.route.length)) : local.route.length;
    routePath.setAttribute("d", polyline(local.route.slice(0, shown), project, 4));
    const walked = shown / local.route.length;
    // Far away, steps crowd together on screen: keep only those at least a step apart.
    let last = null;
    footprints.forEach((foot, index) => {
      const t = (index + 0.5) / FOOTPRINTS;
      if (t > walked) { foot.style.visibility = "hidden"; return; }
      const [lon, lat] = routeAt(t);
      const [lon2, lat2] = routeAt(Math.min(1, t + 0.004));
      const a = project(lon, lat, 4), b = project(lon2, lat2, 4);
      if (!a.visible) { foot.style.visibility = "hidden"; return; }
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const side = index % 2 ? 1 : -1;
      const scale = Math.max(0.5, Math.min(1.3, 1.1 / a.w)); // nearer steps look larger
      const offset = 2.6 * scale * side;
      const x = a.x - Math.sin(angle) * offset, y = a.y + Math.cos(angle) * offset;
      if (last && Math.hypot(x - last[0], y - last[1]) < 7 * scale) { foot.style.visibility = "hidden"; return; }
      last = [x, y];
      foot.style.visibility = "";
      foot.setAttribute("cx", x.toFixed(1));
      foot.setAttribute("cy", y.toFixed(1));
      foot.setAttribute("rx", (1.6 * scale).toFixed(2));
      foot.setAttribute("ry", (3.4 * scale).toFixed(2));
      foot.setAttribute("transform", `rotate(${(angle * 180 / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`);
    });

    local.mounds.forEach(([lon, lat, t], index) => {
      const p = project(lon, lat, 0);
      const appear = level > 3 || t - 0.22 <= progress * 0.55;
      if (!p.visible || !appear) {
        moundPaths[index].setAttribute("d", "");
        return;
      }
      const s = Math.max(2.2, Math.min(8, 8 / p.w));
      moundPaths[index].setAttribute("d", `M${(p.x - s).toFixed(1)},${p.y.toFixed(1)}Q${p.x.toFixed(1)},${(p.y - s * 1.5).toFixed(1)} ${(p.x + s).toFixed(1)},${p.y.toFixed(1)}`);
    });

    const pass = project(geography.points.pass.lon, geography.points.pass.lat, 0);
    if (pass.visible) {
      const s = Math.max(4, Math.min(11, 10 / pass.w));
      passGlyph.setAttribute("d", `M${pass.x - s},${pass.y}L${pass.x - s * 0.7},${pass.y - s * 2.2}L${pass.x + s * 0.5},${pass.y - s * 2.35}L${pass.x + s * 0.9},${pass.y}Z`);
      const flip = pass.x > width * 0.5;
      [passLabel, passCoord].forEach((node) => node.setAttribute("text-anchor", flip ? "end" : "start"));
      place(passLabel, pass, flip ? -14 : 14, -s * 2.4);
      place(passCoord, pass, flip ? -14 : 14, -s * 2.4 + typeSize(passLabel) * 0.35 + typeSize(passCoord));
    } else {
      passGlyph.setAttribute("d", "");
      [passLabel, passCoord].forEach((node) => { node.style.visibility = "hidden"; });
    }
    const passBoxes = [keepInside(passLabel, width), keepInside(passCoord, width)].filter(Boolean);

    const tagSize = typeSize(tags.wall);
    place(tags.wall, project(wallCentre[0], wallCentre[1], 40), tagSize * 0.67, -tagSize * 0.67);
    place(tags.oasis, project(oasisCentre[0], oasisCentre[1], 10), -tagSize * 0.5, tagSize * 1.8);
    place(peakLabel, project(geography.points.peak.lon, geography.points.peak.lat, 80), 0, -typeSize(peakLabel) * 0.7);
    // the wall and oasis tags are secondary: they give way to the pass label
    [tags.wall, tags.oasis, peakLabel].forEach((node) => {
      const box = keepInside(node, width);
      if (box && passBoxes.some((other) => overlapArea(box, other) > 0)) node.style.visibility = "hidden";
    });
    // The two lines of the poem, shrunk only if a line would be wider than the panel; on a narrow panel
    // where even the smallest size (10pt) would not fit, each line breaks in two at its middle space.
    const setPoem = (lines) => poemLines.forEach((line, index) => { line.textContent = lines[index] || ""; line.style.fontSize = ""; });
    const widestOf = () => Math.max(...poemLines.map((line) => (line.textContent ? line.getComputedTextLength() : 0)));
    setPoem(poemText);
    const poemSize = typeSize(poemLines[0]);
    const room = width - 24;
    let widest = widestOf();
    if (poemSize * room / widest < 13.4) {
      setPoem(poemText.flatMap((line) => {
        const middle = line.length / 2;
        let cut = -1;
        for (let index = 0; index < line.length; index += 1) {
          if (line[index] === " " && (cut < 0 || Math.abs(index - middle) < Math.abs(cut - middle))) cut = index;
        }
        return cut < 0 ? [line] : [line.slice(0, cut), line.slice(cut + 1)];
      }));
      widest = widestOf();
    }
    const fitted = widest > room ? Math.max(13.4, poemSize * room / widest) : poemSize;
    poemLines.forEach((line, index) => {
      if (fitted !== poemSize) line.style.fontSize = `${fitted.toFixed(1)}px`;
      line.setAttribute("x", (width / 2).toFixed(1));
      line.setAttribute("y", (height * 0.2 + index * fitted * (language === "en" ? 1.6 : 1.8)).toFixed(1));
    });
  }

  /* ---------- snowfall ---------- */

  const snowCanvas = document.querySelector(".snowfall");
  const snowContext = snowCanvas.getContext("2d");
  const flakes = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, v: 0.25 + Math.random() * 0.75, p: Math.random() * 6.28 }));
  let snow = 0;
  let snowGoal = 0;
  let wind = 0;
  let windGoal = 0;

  function snowTarget() {
    if (level === 1) return [0.85, 0.15];
    if (level === 2) return [0.75 * (1 - Math.min(1, Math.max(0, (progress - 0.45) / 0.3))), 0.2]; // 天竟晴了
    if (level === 4) return [0.16, 1.4]; // 西北风浩荡：雪不落，只被风卷起
    if (level === 5) return [progress > 0.78 ? 0.3 : 0, 0.3]; // 怕还要下雪
    return [0, 0];
  }

  function drawSnow() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = snowCanvas.clientWidth;
    const height = snowCanvas.clientHeight;
    if (snowCanvas.width !== Math.round(width * ratio)) snowCanvas.width = Math.round(width * ratio);
    if (snowCanvas.height !== Math.round(height * ratio)) snowCanvas.height = Math.round(height * ratio);
    snowContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    snowContext.clearRect(0, 0, width, height);
    snow += (snowGoal - snow) * 0.03;
    wind += (windGoal - wind) * 0.03;
    if (snow < 0.01) return;
    const count = Math.round(flakes.length * snow);
    snowContext.fillStyle = "rgba(255,255,255,0.9)";
    for (let index = 0; index < count; index += 1) {
      const flake = flakes[index];
      flake.y += (flake.v * 0.0018) * (1 + wind * 0.3);
      flake.x += (Math.sin(flake.p + flake.y * 6) * 0.0004) + wind * 0.0016 * flake.v;
      if (flake.y > 1.02) { flake.y = -0.02; flake.x = Math.random(); }
      if (flake.x > 1.02) flake.x = -0.02;
      snowContext.globalAlpha = 0.35 + flake.r / 4;
      snowContext.beginPath();
      snowContext.arc(flake.x * width, flake.y * height, flake.r, 0, 6.283);
      snowContext.fill();
    }
    snowContext.globalAlpha = 1;
  }

  function tick() {
    if (!reduced()) drawSnow();
    else snowContext.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    window.requestAnimationFrame(tick);
  }

  /* ---------- reading state ---------- */

  function setCaption() {
    modeLabel.textContent = captions[language][level - 1];
    techLabel.textContent = captionTech[level - 1];
  }

  function updateSnowGoal() {
    [snowGoal, windGoal] = snowTarget();
  }

  // Where in the active part the reader is (0-1), measured like the shell measures sections.
  function updateProgress() {
    const threshold = scroller.clientHeight * 0.4;
    const top = scroller.getBoundingClientRect().top;
    const section = scroller.querySelectorAll(".reading-section")[level - 1];
    if (!section) return;
    const rect = section.getBoundingClientRect();
    progress = Math.max(0, Math.min(1, (threshold - (rect.top - top)) / Math.max(rect.height - threshold, 1)));
    // The last part can never scroll past the threshold; reaching the end counts as the end.
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) progress = 1;
    window.YANGGUAN_TERRAIN_RENDERER?.setProgress(progress);
    updateSnowGoal();
  }

  function onRender(nextLanguage, state) {
    language = nextLanguage;
    const text = labels[language];
    passLabel.textContent = text.pass;
    tags.wall.textContent = text.wall;
    tags.oasis.textContent = text.oasis;
    peakLabel.textContent = text.peak;
    poemText = text.poem;
    poemLines.forEach((line, index) => { line.textContent = text.poem[index] || ""; });
    farMarks.forEach(({ site, name, note }) => {
      name.textContent = site[language];
      note.textContent = `${site.distanceKm.toLocaleString("en")} km`;
    });
    originName.textContent = language === "zh" ? "阳关" : "The Southern Pass";
    originNote.textContent = language === "zh" ? "原点 · 烽燧遗址" : "origin · beacon site";
    riverLabels.yangtze.textContent = language === "zh" ? "长江" : "Yangtze";
    riverLabels.yellow.textContent = language === "zh" ? "黄河" : "Yellow River";
    compass.querySelector("text").textContent = language === "zh" ? "北" : "N";
    compass.setAttribute("aria-label", language === "zh" ? "指北针" : "North arrow");
    regionalText.dunhuang.textContent = text.dunhuang;
    regionalText.yangguan.textContent = text.yangguan;
    regionalText.distance.textContent = text.distance;
    regionalText.wall.textContent = text.regionalWall;
    window.requestAnimationFrame(layoutRegional);
    level = state.active + 1;
    setCaption();
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    setCaption();
    drawCompass();
    window.YANGGUAN_TERRAIN_RENDERER?.setState(level);
    window.requestAnimationFrame(updateProgress);
  }

  window.YANGGUAN_TERRAIN_RENDERER?.onFrame(drawMarks);
  scroller.addEventListener("scroll", () => window.requestAnimationFrame(updateProgress), { passive: true });
  window.requestAnimationFrame(tick);

  ChapterShell.init({
    id: "yangguan",
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender,
    onSection
  });
})();
