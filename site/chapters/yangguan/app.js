(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.YANGGUAN_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  const sections = {
    zh: [
      { label: "一 · 诗与远方", location: "未出发" },
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
      "map-teaser": "冒雪，寻阳关。",
      thesis: "诗句比关隘活得更久。",
      open: "踏雪出发",
      "rail-caption": "阅读行程",
      "rail-aria": "阅读行程",
      "section-aria": "段落 {n}",
      "notes-keyboard": "↑ ↓ ← → 切换段落 · L 切换语言 · Esc 关闭本面板",
      "data-3d-label": "三维",
      "data-3d": "雪漠地形直接由 DEM 高程网格生成，随阅读切换镜头；雪的覆盖随原文变化：出发时大雪，天晴后低处化出沙底，高处与远山积雪不化。",
      "data-real-label": "真实地物",
      "data-real": "阳关烽燧点、阳关长城（汉代烽燧线）、今阳关绿洲（林场、果园、水体与渠道）和阿尔金山均按真实坐标放在地形上。",
      "data-literary-label": "文学意象",
      "data-literary": "地图上的脚印（叙事路径）与坟堆都是文学示意：原文没有可核验的行走坐标，也没有指名坟堆所在的遗址，所以它们不是作者的实测路线，也不是测绘坟场。“今阳关绿洲”指现代农林用地，不代表汉唐时的屯垦范围。",
      "data-far-label": "远方地标",
      "data-far": "第一段是一张平面的中国标准地图（与道士塔第一张图相同的底图与投影），白帝城、黄鹤楼、寒山寺按真实坐标标在上面，虚线连到原点阳关，数字为大圆直线距离（白帝城 1,713 km、黄鹤楼 2,106 km、寒山寺 2,568 km；手机上只显示地名）。第二段同一张地图推近敦煌县城与阳关。第三至五段换回阳关周边的三维地形。",
      "data-region-label": "区域",
      "data-region": "第一、二段是同一张平面地图（与道士塔第一张图相同的标准地图与投影）：第一段看全国，第二段镜头推近敦煌县城—阳关，叠上同一 DEM 的晕渲、道路与汉长城线。距离为大圆直线距离，不是公路里程。",
      "data-projection-label": "投影",
      "data-projection": "第一、二段：正轴等积割圆锥投影（中央经线 110°E，标准纬线 25°N／47°N，克拉索夫斯基椭球），即标准地图本身的投影；指北针随经线方向微转。第三至五段：WGS 84 经纬度，局部按纬度余弦等比例展开。",
      "data-terrain-label": "地形",
      "data-terrain": "Copernicus DEM GLO-90，重采样为约 325 米网格；高程夸大 8 倍，1600 米以上按 0.3 压缩，仅为显示，使平原起伏与远山同时可读。",
      "data-snow-label": "雪",
      "data-snow": "积雪、化雪与飘雪是依原文叙述的视觉表达，不是气象资料。",
      "notes-source-1": "中国底图（第一、二段）：自然资源部标准地图服务；地形与第二段晕渲：Copernicus DEM GLO-90（© DLR e.V. 2010–2014，© Airbus Defence and Space GmbH 2014–2018，欧盟与 ESA 哥白尼计划提供）",
      "notes-source-2": "阳关坐标：Wikidata Q909541（坐标属性 P625），2026 年 9 月 27 日取得",
      "notes-source-3": "阳关长城、绿洲、公路：OpenStreetMap contributors（ODbL 1.0），经 Overpass API 于 2026 年 9 月 27 日取得",
      "notes-source-4": "敦煌县城坐标：与《沙原隐泉》章节所用数据相同；白帝城、黄鹤楼、寒山寺：Wikidata Q803709、Q462372、Q1146619",
      "data-disclaimer": "文学阅读地图，不替代测绘、导航、文物保护或景区安全信息。王维诗中的渭城不在这次行程范围内，未上图。",
      "complete-line": "风雪掩故关，唐音犹在纸。"
    },
    en: {
      "map-aria": "3D snow-desert terrain around Yangguan, the Southern Pass",
      "regional-svg-title": "Dunhuang and the Southern Pass",
      "map-teaser": "Through snow, seeking Yangguan",
      thesis: "Verses outlive the pass.",
      open: "Set out into the snow",
      "rail-caption": "The walk",
      "rail-aria": "Parts of the walk",
      "section-aria": "Part {n}",
      "notes-keyboard": "↑ ↓ ← → switch parts · L language · Esc closes this panel",
      "data-3d-label": "3D",
      "data-3d": "The snow desert is generated directly from the DEM and changes camera with the reading. Snow follows the essay: heavy at the start, melting on low ground once the sky clears, lasting on the heights and the far mountains.",
      "data-real-label": "Real features",
      "data-real": "The beacon site of the pass, the Han-era wall line, today’s oasis (forest farm, orchards, water and channels) and the Altun Mountains sit on the terrain at their real coordinates.",
      "data-literary-label": "Literary",
      "data-literary": "The footprints (the narrative path) and the burial mounds are literary: the essay gives no verifiable walking coordinates and names no site for the mounds, so they are neither the author’s surveyed route nor a mapped burial ground. “Today’s Yangguan oasis” is modern farm and forest land, not the Han or Tang garrison fields.",
      "data-far-label": "Poems",
      "data-far": "Part one is a flat standard map of China (the same base and projection as the first map of The Taoist Priest’s Tower). White Emperor City, Yellow Crane Tower and Cold Mountain Temple sit at their real coordinates, joined by dashed lines to the origin at the pass; the figures are great-circle distances (White Emperor City 1,713 km, Yellow Crane Tower 2,106 km, Cold Mountain Temple 2,568 km; phones show short names only). Part two moves the same map in to Dunhuang and the pass. Parts three to five return to the 3D terrain around the pass.",
      "data-region-label": "Region",
      "data-region": "Parts one and two are one flat map (the same standard map and projection as the first map of The Taoist Priest’s Tower): part one shows the country, part two moves in to Dunhuang and the pass, over shaded relief from the same DEM with roads and the Han wall line. The distance is a great-circle line, not a road distance.",
      "data-projection-label": "Projection",
      "data-projection": "Parts one and two: Albers equal-area conic (central meridian 110°E, standard parallels 25°N / 47°N, Krassovsky), the standard map’s own projection; the north arrow turns slightly with the meridians. Parts three to five: WGS 84 longitude and latitude, scaled by the cosine of latitude.",
      "data-terrain-label": "Terrain",
      "data-terrain": "Copernicus DEM GLO-90, resampled to about 325 m. Heights are exaggerated eight times and compressed by 0.3 above 1,600 m, for display only, so the plain and the mountains are both readable.",
      "data-snow-label": "Snow",
      "data-snow": "Snow cover, melting and falling snow follow the essay; they are not weather data.",
      "notes-source-1": "Base map of China (parts one and two): Ministry of Natural Resources standard-map service. Terrain and part two’s relief: Copernicus DEM GLO-90 (© DLR e.V. 2010–2014, © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)",
      "notes-source-2": "The pass: Wikidata Q909541 (coordinate property P625), retrieved 27 September 2026",
      "notes-source-3": "Wall line, oasis and roads: OpenStreetMap contributors (ODbL 1.0), via the Overpass API, 27 September 2026",
      "notes-source-4": "Dunhuang: the same coordinate as in A Secret Spring in the Sand; White Emperor City, Yellow Crane Tower, Cold Mountain Temple: Wikidata Q803709, Q462372, Q1146619",
      "data-disclaimer": "A literary reading map, not a substitute for survey, navigation, heritage or visitor-safety information. Weicheng in Wang Wei’s poem lies outside this walk and is not mapped.",
      "complete-line": "Snow buries the ancient pass, yet the echoes of the Tang Dynasty linger on the page."
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
  const gansuLabel = make("text", { class: "province-label" }, farLayer);
  // Part two: Dunhuang to the pass on the same flat map; label sizes as before (guideline T-5 exception).
  const regionalLayer = layer("regional");
  const regionalLine = make("path", { class: "regional-line" }, regionalLayer);
  const regionalPoint = (cls) => {
    const group = make("g", { class: `regional-point ${cls}` }, regionalLayer);
    return { group, halo: make("circle", { r: 13, class: "halo" }, group), dot: make("circle", { r: 4.5 }, group), text: make("text", { class: "regional-name" }, regionalLayer) };
  };
  const regionalText = {
    dunhuang: regionalPoint("is-town"),
    yangguan: regionalPoint("is-pass"),
    distance: make("text", { class: "regional-distance" }, regionalLayer),
    wall: make("text", { class: "regional-note" }, regionalLayer)
  };
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
      .map((mark, index) => ({ ...mark, index, p: project(mark.site.lon, mark.site.lat, 400) }))
      .sort((a, b) => b.p.x - a.p.x) // the right side is the most crowded: place from there
      .forEach(({ site, ray, dot, name, note, index, p }) => {
        // The distant poetic sites enter in the order in which the prose recalls them.
        // This keeps the opening view quiet and lets the cultural map assemble while reading.
        const revealAt = 0.08 + index * 0.11;
        if (progress < revealAt) {
          ray.setAttribute("d", "");
          dot.style.visibility = "hidden";
          [name, note].forEach((node) => { node.style.visibility = "hidden"; });
          return;
        }
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
        // a narrow panel has room for the short English names only (the notes drawer keeps the full ones)
        if (language === "en") name.textContent = compact ? site.en.replace(/ (City|Tower|Temple)$/, "") : site.en;
        const n = typeSize(name), gap = n * 0.5;
        const spots = [
          [gap, -1.5 * n, "start"], [gap, 0.95 * n, "start"], [-gap, -1.5 * n, "end"], [-gap, 0.95 * n, "end"],
          [gap, -2.8 * n, "start"], [-gap, -2.8 * n, "end"], [gap, 2.25 * n, "start"], [-gap, 2.25 * n, "end"],
          // a narrow panel: names alone, a little further above or below the dot, centred on it
          ...(compact ? [[0, -2.1 * n, "middle"], [0, 1.0 * n, "middle"]] : [])
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

    // The province of the origin, named as on 道士塔's first map; it gives way to the place labels.
    const flat = window.YANGGUAN_FLAT_MAP;
    if (flat) {
      place(gansuLabel, project(flat.china.gansuLabel[0], flat.china.gansuLabel[1]), 0, 0);
      const b = gansuLabel.getBBox();
      const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
      const note = originNote.style.visibility !== "hidden" && originNote.getBBox();
      const noteBox = note && { left: note.x, right: note.x + note.width, top: note.y, bottom: note.y + note.height };
      if ([...taken, noteBox].some((other) => other && overlapArea(box, other) > 0)) gansuLabel.style.visibility = "hidden";
      else taken.push(box);
    }
    // River names are secondary: drawn last, and dropped where they would cover a place name.
    Object.entries(riverLabels).forEach(([name, node]) => {
      const r = typeSize(node);
      place(node, project(riverAnchors[name][0], riverAnchors[name][1], 400), r * 0.7, name === "yangtze" ? r * 1.35 : -r * 0.7);
      if (node.style.visibility === "hidden") return;
      const b = node.getBBox();
      const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
      const note = originNote.style.visibility !== "hidden" && originNote.getBBox();
      const noteBox = note && { left: note.x, right: note.x + note.width, top: note.y, bottom: note.y + note.height };
      const cut = box.left < 6 || box.right > panelWidth - 6 || box.bottom > panelHeight - 6;
      if (cut || [...taken, noteBox].some((other) => other && overlapArea(box, other) > 0)) node.style.visibility = "hidden";
    });
  }

  // Box of a two-line label (name above note) whose top-left/top-right is at p + (dx, dy).
  function boxOf(name, note, p, dx, dy, anchor, nameOnly = false) {
    const width = nameOnly ? name.getComputedTextLength() : Math.max(name.getComputedTextLength(), note.getComputedTextLength());
    const left = anchor === "end" ? p.x + dx - width : anchor === "middle" ? p.x + dx - width / 2 : p.x + dx;
    const n = typeSize(name);
    return { left, right: left + width, top: p.y + dy, bottom: p.y + dy + (nameOnly ? n * 1.15 : n * 1.35 + typeSize(note) * 1.3) };
  }
  const overlapArea = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  // North arrow: turns with the camera, and on the flat map with the conic projection's meridians.
  const compass = document.querySelector(".compass");
  let northAngle = 0;
  function drawCompass() {
    compass.style.setProperty("--north", `${(northAngle * 180 / Math.PI).toFixed(1)}deg`);
  }

  // Part two's labels: each tries a few spots around its place and keeps the first one inside the
  // panel and clear of the others.
  function drawRegional(project, width, height) {
    const d = project(geography.points.dunhuang.lon, geography.points.dunhuang.lat);
    const p = project(geography.points.pass.lon, geography.points.pass.lat);
    regionalLine.setAttribute("d", `M${d.x.toFixed(1)},${d.y.toFixed(1)}L${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    [[regionalText.dunhuang, d], [regionalText.yangguan, p]].forEach(([mark, at]) => mark.group.setAttribute("transform", `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)})`));
    const taken = [d, p].map((at) => ({ left: at.x - 13, right: at.x + 13, top: at.y - 13, bottom: at.y + 13 }));
    // place names always show; the distance and the wall note give way when nothing is clear
    const fit = (node, candidates, optional = false) => {
      node.style.visibility = "";
      const n = typeSize(node);
      let last = null;
      for (const [x, y, anchor] of candidates(n)) {
        node.setAttribute("text-anchor", anchor);
        node.setAttribute("x", x.toFixed(1));
        node.setAttribute("y", y.toFixed(1));
        let b = node.getBBox();
        const shift = Math.max(0, 10 - b.x) - Math.max(0, b.x + b.width - (width - 10));
        if (shift) { node.setAttribute("x", (x + shift).toFixed(1)); b = node.getBBox(); }
        const box = { left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height };
        last = box;
        if (box.top >= 10 && box.bottom <= height - 10 && !taken.some((other) => overlapArea(box, other) > 0)) { taken.push(box); return; }
      }
      if (optional) node.style.visibility = "hidden";
      else taken.push(last);
    };
    fit(regionalText.dunhuang.text, (n) => [[d.x, d.y - 22, "middle"], [d.x - n * 0.6, d.y - n * 0.4, "end"], [d.x, d.y + n * 1.5, "middle"], [d.x + n * 0.6, d.y + n * 1.3, "start"]]);
    fit(regionalText.yangguan.text, (n) => [[p.x, p.y - 22, "middle"], [p.x, p.y + n * 1.5, "middle"], [p.x + n * 0.7, p.y + n * 0.35, "start"], [p.x + n * 0.7, p.y - n * 0.6, "start"]]);
    const mx = (d.x + p.x) / 2, my = (d.y + p.y) / 2;
    fit(regionalText.distance, (n) => [[mx, my - 14, "middle"], [mx + n * 0.5, my + n * 1.3, "start"], [mx, my + n * 1.5, "middle"], [mx, my - n * 2, "middle"], [mx, my + n * 2.6, "middle"]], true);
    const w = project(wallCentre[0], wallCentre[1]);
    fit(regionalText.wall, (n) => [[w.x, w.y - n * 0.8, "middle"], [w.x, w.y + n * 1.6, "middle"], [w.x + n, w.y - n, "start"], [w.x + n, w.y + n * 1.4, "start"]], true);
  }

  function drawMarks(project, view) {
    const { width, height } = marks.getBoundingClientRect();
    marks.setAttribute("viewBox", `0 0 ${width} ${height}`);
    northAngle = view.north;
    drawCompass();
    // Each layer is drawn only on the map it belongs to: the flat map for parts one and two, the 3D terrain after.
    if (view.terrain === "flat") {
      if (level === 1) drawFar(project);
      if (level === 2) drawRegional(project, width, height);
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

  function updateSnowGoal() {
    [snowGoal, windGoal] = snowTarget();
  }

  function updatePoemPresence() {
    if (level !== 5) {
      poemLayer.style.removeProperty("opacity");
      return;
    }
    poemLayer.style.opacity = String(Math.min(1, 0.42 + progress * 0.72));
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
    updatePoemPresence();
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
      note.textContent = "";
    });
    originName.textContent = language === "zh" ? "阳关" : "The Southern Pass";
    originNote.textContent = language === "zh" ? "原点 · 烽燧遗址" : "origin · beacon site";
    riverLabels.yangtze.textContent = language === "zh" ? "长江" : "Yangtze";
    riverLabels.yellow.textContent = language === "zh" ? "黄河" : "Yellow River";
    compass.querySelector("text").textContent = language === "zh" ? "北" : "N";
    compass.setAttribute("aria-label", language === "zh" ? "指北针" : "North arrow");
    regionalText.dunhuang.text.textContent = text.dunhuang;
    regionalText.yangguan.text.textContent = text.yangguan;
    regionalText.distance.textContent = "";
    regionalText.wall.textContent = text.regionalWall;
    gansuLabel.textContent = language === "zh" ? "甘肃" : "Gansu";
    level = state.active + 1;
  }

  function onSection(index) {
    level = index + 1;
    body.dataset.readingLevel = String(level);
    drawCompass();
    window.YANGGUAN_TERRAIN_RENDERER?.setState(level);
    window.YANGGUAN_FLAT_MAP_VIEW?.setState(level);
    updatePoemPresence();
    window.requestAnimationFrame(updateProgress);
  }

  window.YANGGUAN_TERRAIN_RENDERER?.onFrame((project, view) => {
    if (!window.YANGGUAN_FLAT_MAP_VIEW?.active()) drawMarks(project, view);
  });
  window.YANGGUAN_FLAT_MAP_VIEW?.onFrame(drawMarks);
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
    onSection,
    showReaderLocation: false,
    showReaderProgress: false
  });
})();
