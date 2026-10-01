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
      "wanshu-note": "原文事件落点 · 园内方位示意",
      "memory-link": "记忆连接 · 不是同一地点",
      "summer-palace": "北京 · 颐和园",
      "memory-distance": "距承德约179 km · 直线",
      "wang-event": "王国维于此投水 · 1927",
      "chengde-present": "作者此时面对承德湖水",
      "data-property-label": "遗产地",
      "data-property": "避暑山庄与周围寺庙，UNESCO中心坐标约40.9875°N、117.9375°E；山庄遗产区611.2公顷。",
      "data-points-label": "地点",
      "data-points": "山庄及六处外庙按WGS 84坐标投影，表达彼此真实方位与距离。",
      "data-zones-label": "分区",
      "data-zones": "西北山地、北部平原、东南湖区依据承德市文物局总体格局绘制；内部轮廓为阅读示意，不是测绘边界。",
      "data-story-label": "叙事",
      "data-story": "“罗圈椅”、闭门和湖中背影来自原文意象，不代表可测量地物。",
      "data-regional-label": "区域轴线",
      "data-regional": "北京、古北口、承德使用地理坐标；木兰围场以官方公布区域范围表达。连线表示北巡空间关系，不是复原的逐段御道。",
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
      "wanshu-note": "Textual location · position diagrammatic",
      "memory-link": "Memory link · Not the same place",
      "summer-palace": "Beijing · Summer Palace",
      "memory-distance": "Approx. 179 km from Chengde · straight-line",
      "wang-event": "Wang Guowei died here · 1927",
      "chengde-present": "The writer is facing the Chengde lake",
      "data-property-label": "Property",
      "data-property":
        "The Mountain Resort and its Outlying Temples is centered at approximately 40.9875°N, 117.9375°E. The UNESCO resort property covers 611.2 hectares.",
      "data-points-label": "Places",
      "data-points":
        "The resort and six outlying temples are projected from WGS 84 coordinates to preserve their relative directions and distances.",
      "data-zones-label": "Zones",
      "data-zones":
        "The northwest hills, northern plain and southeast lakes follow the overall layout published by the Chengde Cultural Heritage Bureau. Interior outlines are a reading diagram, not a surveyed boundary.",
      "data-story-label": "Narrative",
      "data-story":
        "The round-backed chair, closing gate and reflected figure are images from the essay, not measurable geographic features.",
      "data-regional-label": "Regional axis",
      "data-regional":
        "Beijing, Gubeikou and Chengde use geographic coordinates. Mulan is shown as an officially published regional extent. Connecting lines express the northern inspection geography, not a reconstructed turn-by-turn imperial road.",
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
  const revealLayers = [...document.querySelectorAll(".reveal-layer")];
  let language = "zh"; // real value arrives through onRender
  let active = 0;

  function project([longitude, latitude]) {
    const { west, east, south, north } = geography.extent;
    return {
      x: 90 + ((longitude - west) / (east - west)) * 800,
      y: 690 - ((latitude - south) / (north - south)) * 600
    };
  }

  function projectRegional([longitude, latitude]) {
    const { west, east, south, north } = geography.regional.extent;
    return {
      x: 90 + ((longitude - west) / (east - west)) * 800,
      y: 600 - ((latitude - south) / (north - south)) * 420
    };
  }

  function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function pathFromCoordinates(coordinates, projection) {
    return coordinates
      .map((coordinate, index) => {
        const point = projection(coordinate);
        return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join("");
  }

  function applyRegionalGeography() {
    const regional = geography.regional;
    const group = document.querySelector("#regional-geography");
    group.innerHTML = "";

    const rangeNorthwest = projectRegional([regional.mulanRange.west, regional.mulanRange.north]);
    const rangeSoutheast = projectRegional([regional.mulanRange.east, regional.mulanRange.south]);
    group.appendChild(createSvgElement("rect", {
      class: "mulan-range",
      x: rangeNorthwest.x,
      y: rangeNorthwest.y,
      width: rangeSoutheast.x - rangeNorthwest.x,
      height: rangeSoutheast.y - rangeNorthwest.y,
      rx: 18
    }));

    const route = createSvgElement("path", {
      class: "regional-route",
      d: pathFromCoordinates(regional.imperialRoute, projectRegional)
    });
    const wall = createSvgElement("path", {
      class: "regional-wall",
      d: pathFromCoordinates(regional.greatWall, projectRegional)
    });
    group.append(route, wall);

    const wallMid = projectRegional(regional.greatWall[2]);
    const wallLabel = createSvgElement("text", {
      class: "regional-line-label",
      x: wallMid.x - 48,
      y: wallMid.y + 35
    });
    wallLabel.dataset.regionalFixed = "wall";
    group.appendChild(wallLabel);

    const offsets = {
      beijing: { x: 14, y: -14, anchor: "start" },
      "summer-palace": { x: -5, y: 35, anchor: "start" },
      gubeikou: { x: 16, y: -16, anchor: "start" },
      chengde: { x: -15, y: -16, anchor: "end" },
      mulan: { x: 15, y: -14, anchor: "start" }
    };

    regional.places.filter((place) => place.id !== "summer-palace").forEach((place) => {
      const point = projectRegional(place.coordinates);
      const offset = offsets[place.id];
      const pointGroup = createSvgElement("g", {
        class: `regional-point ${place.kind}`,
        transform: `translate(${point.x} ${point.y})`
      });
      pointGroup.dataset.regionalPlace = place.id;
      pointGroup.append(
        createSvgElement("circle", { class: "point-halo", r: place.id === "chengde" ? 35 : 26 }),
        ...(place.id === "chengde"
          ? [createSvgElement("circle", { class: "zoom-ring", r: 15 })]
          : []),
        createSvgElement("circle", { class: "point-dot", r: place.id === "chengde" ? 6 : 4.5 })
      );
      const label = createSvgElement("text", {
        x: offset.x,
        y: offset.y,
        "text-anchor": offset.anchor
      });
      label.dataset.regionalLabel = place.id;
      pointGroup.appendChild(label);

      group.appendChild(pointGroup);
    });
  }

  function applyGeography() {
    const group = document.querySelector("#geographic-points");
    const resort = geography.places.find((place) => place.id === "resort");
    const resortPoint = project(resort.coordinates);
    const projected = geography.places.map((place) => ({ ...place, point: project(place.coordinates) }));

    const relationGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    projected.filter((place) => place.kind === "temple").forEach((place) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.classList.add("relation");
      line.setAttribute("x1", resortPoint.x);
      line.setAttribute("y1", resortPoint.y);
      line.setAttribute("x2", place.point.x);
      line.setAttribute("y2", place.point.y);
      relationGroup.appendChild(line);
    });
    group.appendChild(relationGroup);

    projected.forEach((place) => {
      const pointGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pointGroup.classList.add("geo-point", place.kind);
      pointGroup.dataset.place = place.id;
      pointGroup.setAttribute("transform", `translate(${place.point.x} ${place.point.y})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", place.kind === "resort" ? "7" : "5");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const labelLeft = ["putuo", "xumi"].includes(place.id);
      const labelY = place.id === "puyou" ? 34 : -9;
      label.setAttribute("x", labelLeft ? "-11" : "11");
      label.setAttribute("y", labelY);
      label.setAttribute("text-anchor", labelLeft ? "end" : "start");
      label.dataset.geoLabel = place.id;

      const coordinate = document.createElementNS("http://www.w3.org/2000/svg", "text");
      coordinate.classList.add("geo-coordinate");
      coordinate.setAttribute("x", labelLeft ? "-11" : "11");
      coordinate.setAttribute("y", labelY + 17);
      coordinate.setAttribute("text-anchor", labelLeft ? "end" : "start");
      coordinate.textContent = `${place.coordinates[1].toFixed(4)}°N · ${place.coordinates[0].toFixed(4)}°E`;
      pointGroup.append(circle, label, coordinate);
      group.appendChild(pointGroup);
    });

    const temples = projected.filter((place) => place.kind === "temple").sort((a, b) => a.point.x - b.point.x);
    const arc = temples.map((place, index) => `${index ? "L" : "M"}${place.point.x},${place.point.y}`).join("");
    document.querySelector("#temple-arc").setAttribute("d", arc);
  }

  function updateGeographyLabels() {
    geography.places.forEach((place) => {
      const label = document.querySelector(`[data-geo-label="${place.id}"]`);
      if (label) label.textContent = place[language];
    });
    geography.regional.places.forEach((place) => {
      const label = document.querySelector(`[data-regional-label="${place.id}"]`);
      if (label) label.textContent = place[language];
    });
    const wallLabel = document.querySelector('[data-regional-fixed="wall"]');
    if (wallLabel) wallLabel.textContent = language === "zh" ? "长城" : "Great Wall";
  }

  function renderStatus() {
    statusNumber.textContent = timeline[language][active];
    statusLabel.textContent = status[language][active];
  }

  // Called by the shell whenever copy is (re)applied, including the first time.
  function onRender(nextLanguage) {
    language = nextLanguage;
    updateGeographyLabels();
    renderStatus();
  }

  // Called by the shell whenever the active section changes (and once at start).
  function onSection(index, _state, previous) {
    active = index;
    const level = index + 1;
    body.dataset.readingLevel = String(level);
    revealLayers.forEach((layer) => {
      layer.classList.toggle("is-visible", Number(layer.dataset.level) <= level);
    });
    if ((previous === 0 && index === 1) || (previous === 1 && index === 0)) {
      body.classList.add("is-scale-transition");
      window.clearTimeout(onSection.scaleTimer);
      onSection.scaleTimer = window.setTimeout(() => {
        body.classList.remove("is-scale-transition");
      }, 1650);
    }
    renderStatus();
  }

  applyRegionalGeography();
  applyGeography();

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
    onSection
  });
})();
