(() => {
  "use strict";

  const data = window.CHAPTER_DATA;
  const geography = window.TAOIST_TOWER_GEOGRAPHY;
  if (!data || !geography) {
    document.body.innerHTML = "<p>Chapter data could not be loaded.</p>";
    return;
  }

  // Section label = ordinal + short title; location = the place line (guideline R-3).
  // The five sections are the essay's own numbered sections.
  const sections = {
    zh: [
      { label: "一 · 塔", location: "莫高窟门外 · 大泉河" },
      { label: "二 · 门", location: "藏经洞 · 1900年6月22日" },
      { label: "三 · 三个人", location: "敦煌 · 莫高窟" },
      { label: "四 · 二十九箱", location: "敦煌至世界 · 叙事路径" },
      { label: "五 · 三座墓", location: "敦煌 · 喀布尔 · 未知地点" }
    ],
    en: [
      { label: "I · The stupa", location: "Outside Mogao · Daquan River" },
      { label: "II · The opening", location: "Library Cave · 22 June 1900" },
      { label: "III · Three men", location: "Dunhuang · Mogao Caves" },
      { label: "IV · Twenty-nine crates", location: "Dunhuang to the world · Narrative route" },
      { label: "V · Three graves", location: "Dunhuang · Kabul · Unknown" }
    ]
  };

  const copy = {
    zh: {
      "map-aria": "藏经洞与文物流散文学地图",
      "map-teaser": "洞门开，经卷散",
      thesis: "洞门打开，经卷离开敦煌，流散世界。",
      open: "打开档案",
      "rail-caption": "阅读档案",
      "rail-aria": "阅读档案",
      "section-aria": "档案 {n}",
      "notes-keyboard": "↑ ↓ ← → 切换档案 · L 切换语言 · Esc 关闭本面板",
      "data-solid-label": "连线",
      "data-solid": "连线表示本篇叙述的地点关系，不是实测路线。蒋孝琬随斯坦因由喀什前往敦煌，三人在莫高窟相遇；文物流散图仅保留原文提及的大英博物馆方向。",
      "data-unknown-label": "空白",
      "data-unknown": "蒋孝琬的墓址没有可核验的坐标；地图上的“?”不是任意一点，而是地图无法回答的问题。",
      "data-china-label": "中国近景",
      "data-china": "采用自然资源部标准地图服务的投影底图；故事地点按同一正轴等积割圆锥投影定位（中央经线 110°E，标准纬线 25°N／47°N）。",
      "data-world-label": "世界与欧亚",
      "data-world": "使用 Natural Earth 等距圆柱投影；其中的中国高亮采用 1:10m 的 China point-of-view 版本，以匹配世界底图。",
      "notes-source-1": "中国近景：自然资源部标准地图服务（自助制图拓扑底图）",
      "notes-source-2": "世界与欧亚底图：Natural Earth 1:110m Admin 0 Countries",
      "notes-source-3": "世界视图中的中国高亮：Natural Earth 1:10m Admin 0 Countries",
      "data-disclaimer": "文学阅读地图：连线表达文章的叙事流向，不代表精确运输路线，也不替代测绘或导航信息。本章不把经卷设计成可收集物；主要视觉隐喻是“离开后的空白”。",
      "complete-line": "洞窟仍在敦煌，经卷散落世界。"
    },
    en: {
      "map-aria": "A literary map of the Library Cave and the dispersal of its artifacts",
      "map-teaser": "The door opens; the scrolls scatter",
      thesis: "A cave door opens. The manuscripts leave Dunhuang and scatter across the world.",
      open: "Enter the archive",
      "rail-caption": "Reading the Archive",
      "rail-aria": "Reading the Archive",
      "section-aria": "Record {n}",
      "notes-keyboard": "↑ ↓ ← → switch files · L language · Esc closes this panel",
      "data-solid-label": "Connections",
      "data-solid": "Connections show narrative relationships, not surveyed routes. Jiang accompanied Stein from Kashgar to Dunhuang, where the three met at Mogao. The dispersal map retains only the British Museum destination named in the essay.",
      "data-unknown-label": "Gap",
      "data-unknown": "Jiang Xiaowan’s burial place has no verifiable coordinate; the “?” is not an arbitrary point but a question the map cannot answer.",
      "data-china-label": "China close-up",
      "data-china": "Uses the projected base from the Ministry of Natural Resources standard-map service; story locations use the same Albers equal-area conic projection (central meridian 110°E, standard parallels 25°N / 47°N).",
      "data-world-label": "World & Eurasia",
      "data-world": "Natural Earth in an equirectangular projection; the China highlight uses the 1:10m China point-of-view version to match the world base.",
      "notes-source-1": "China close-up: Ministry of Natural Resources standard-map service (self-service mapping topology base)",
      "notes-source-2": "World and Eurasia base: Natural Earth 1:110m Admin 0 Countries",
      "notes-source-3": "China highlight in world views: Natural Earth 1:10m Admin 0 Countries",
      "data-disclaimer": "A literary reading map: connections show the essay’s narrative flow, not exact transport routes, and do not replace survey or navigation information. The chapter does not treat the manuscripts as collectibles; its main image is the blank left behind.",
      "complete-line": "The manuscripts are scattered across the globe."
    }
  };

  // The English EPUB sets each section opening in capitals; show them in sentence case.
  const englishOpenings = new Map([
    ["A RIVER FLOWS ", "A river flows "],
    ["ON JUNE 22, 1900 (", "On June 22, 1900 ("],
    ["THIS OUTCOME ", "This outcome "],
    ["AUREL STEIN ", "Aurel Stein "],
    ["ON OCTOBER 26, 1943, ", "On October 26, 1943, "]
  ]);

  function formatParagraph(paragraph, language) {
    if (language !== "en") return paragraph;
    for (const [opening, replacement] of englishOpenings) {
      if (paragraph.startsWith(opening)) return paragraph.replace(opening, replacement);
    }
    return paragraph;
  }

  const body = document.body;


  function svgNode(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function setPath(selector, value) {
    document.querySelector(selector)?.setAttribute("d", value);
  }

  function setTransform(selector, point) {
    document.querySelector(selector)?.setAttribute(
      "transform",
      `translate(${point.x} ${point.y})`
    );
  }

  function routePath(start, end, lift = 0) {
    const deltaX = end.x - start.x;
    const controlY = Math.min(start.y, end.y) - lift;
    return [
      `M${start.x},${start.y}`,
      `C${start.x + deltaX * 0.34},${controlY}`,
      `${start.x + deltaX * 0.68},${controlY}`,
      `${end.x},${end.y}`
    ].join(" ");
  }

  function applyGeography() {
    const mainlandDetail = path => path.match(/M[^M]+/g).filter(ring => {
      const values=ring.match(/-?\d+(?:\.\d+)?/g).map(Number);
      const points=[];for(let i=0;i<values.length;i+=2)points.push([values[i],values[i+1]]);
      return !points.every(([x,y])=>(x>620&&y>510)||(x>700&&y>478));
    }).join('');
    setPath("#china-outline", mainlandDetail(geography.china.outlinePath));
    setPath("#china-provinces", mainlandDetail(geography.china.provincePath));
    ["hubei", "gansu"].forEach((province) => {
      setPath(`#china-${province}`, geography.china.highlights[province]);
      const center = geography.china.centers[province];
      const label = document.querySelector(`#label-${province}`);
      const englishLabel = document.querySelector(`#label-${province}-en`);
      [label, englishLabel].forEach((node, index) => {
        node?.setAttribute("x", center.x);
        node?.setAttribute("y", center.y + index * 17);
      });
    });

    const chinaPoints = geography.china.points;
    setTransform("#node-macheng", chinaPoints.macheng);
    setTransform("#node-jiuquan", chinaPoints.jiuquan);
    setTransform("#node-dunhuang-biography", chinaPoints.dunhuang);
    setPath(
      "#route-macheng-jiuquan",
      routePath(chinaPoints.macheng, chinaPoints.jiuquan, 54)
    );
    setPath(
      "#route-jiuquan-dunhuang",
      routePath(chinaPoints.jiuquan, chinaPoints.dunhuang, 24)
    );

    ["two", "three"].forEach((level) => {
      setPath(`#eurasia-land-${level}`, geography.eurasia.landPath);
      setPath(`#eurasia-china-${level}`, geography.eurasia.highlights.china);
    });
    ["britain", "france", "russia"].forEach((country) => {
      setPath(
        `#eurasia-${country}-two`,
        geography.eurasia.highlights[country]
      );
    });

    const eurasiaPoints = geography.eurasia.points;
    setTransform("#node-kashgar-two", eurasiaPoints.kashgar);
    setTransform("#node-dunhuang-two", eurasiaPoints.dunhuang);
    setTransform("#node-beijing-two", eurasiaPoints.beijing);
    setTransform("#node-london-two", eurasiaPoints.london);
    setTransform("#node-paris-two", eurasiaPoints.paris);
    setTransform("#node-petersburg-two", eurasiaPoints.saintPetersburg);
    setPath(
      "#route-kashgar-dunhuang-two",
      routePath(eurasiaPoints.kashgar, eurasiaPoints.dunhuang, 28)
    );

    setTransform("#node-kashgar-three", eurasiaPoints.kashgar);
    setTransform("#meeting-at-mogao", eurasiaPoints.mogao);
    setPath(
      "#route-kashgar-dunhuang-three",
      routePath(eurasiaPoints.kashgar, eurasiaPoints.mogao, 35)
    );

    ["china", "britain"].forEach((country) => {
      setPath(
        `#world-${country}-four`,
        geography.world.highlights[country]
      );
    });
    setPath("#world-china-five", geography.world.highlights.china);
    setPath(
      "#world-afghanistan-five",
      geography.world.highlights.afghanistan
    );

    const worldPoints = geography.world.points;
    setTransform("#node-kashgar-four", worldPoints.kashgar);
    setTransform("#node-dunhuang-four", worldPoints.dunhuang);
    setTransform("#node-london-four", worldPoints.london);
    setPath(
      "#route-kashgar-dunhuang-four",
      routePath(worldPoints.kashgar, worldPoints.dunhuang, 10)
    );
    setPath(
      "#route-dunhuang-london-four",
      routePath(worldPoints.dunhuang, worldPoints.london, 45)
    );

    setTransform("#grave-dunhuang-five", worldPoints.dunhuang);
    setTransform("#grave-kabul-five", worldPoints.kabul);
    setPath(
      "#route-dunhuang-kabul-five",
      routePath(worldPoints.dunhuang, worldPoints.kabul, 35)
    );
  }

  function focusStoryMaps() {
    const svg = document.querySelector('.story-map');
    const project = (lon, lat) => ({x:70+(lon+15)/155*860, y:145+(76-lat)/58*505});
    const addCountry = (level, name, zh, en, point) => {
      const layer = svg.querySelector(`.geo-level-${level}`);
      const shape = svgNode('path', {class:`country-highlight ${name}`, d:geography.eurasia.highlights[name]});
      layer.querySelector('.country-highlight').before(shape);
      const marker = svgNode('g', {class:'geo-node power-node', id:`node-${name}-${level}`, transform:`translate(${point.x} ${point.y})`});
      marker.append(svgNode('circle', {class:'power-dot', r:4}));
      [['cn',zh],['en',en]].forEach(([language,title]) => {
        const text = svgNode('text', {x:10,y:-12,class:`geo-place label-${language}`});text.textContent=title;marker.append(text);
      });
      layer.append(marker);
      return marker;
    };
    addCountry('two','germany','德國','Germany',geography.eurasia.points.germany);
    addCountry('three','hungary','匈牙利','Hungary',geography.eurasia.points.hungary);
    addCountry('three','britain','英國 · 大英博物館','UK · British Museum',geography.eurasia.points.london);
    addCountry('three','india','印度','India',geography.eurasia.points.newDelhi);
    // Both collections and biography are framed by their actual story locations.
    const frames = {
      one: [geography.china.points.dunhuang,geography.china.points.jiuquan,geography.china.points.macheng],
      two: [project(-10,62),project(125,32)],
      three: [geography.eurasia.points.london,geography.eurasia.points.hungary,geography.eurasia.points.newDelhi,geography.eurasia.points.mogao],
      four: [geography.world.points.london,geography.world.points.dunhuang],
      five: [geography.world.points.kabul,geography.world.points.dunhuang]
    };
    const clip = svgNode('clipPath',{id:'story-focus-clip'});
    clip.append(svgNode('rect',{x:65,y:130,width:870,height:520}));svg.querySelector('defs').append(clip);
    Object.entries(frames).forEach(([name, points]) => {
      const layer=svg.querySelector(`.geo-level-${name}`);
      layer.setAttribute('clip-path','url(#story-focus-clip)');
      layer.querySelectorAll('.geo-sheet').forEach(n=>n.remove());
      const group=svgNode('g',{class:'focused-geography'});
      [...layer.children].filter(n=>!n.matches('.crate-manifest,.unknown-coordinate')).forEach(n=>group.append(n));
      if(name==='four'||name==='five')group.prepend(svgNode('path',{class:'world-land',d:geography.world.landPath}));
      layer.prepend(group);
      const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
      const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      const scale=Math.min(680/(maxX-minX+70),300/(maxY-minY+60));
      const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
      const targetY=name==='four'?330:name==='five'?340:375;
      group.setAttribute('transform',`translate(500 ${targetY}) scale(${scale}) translate(${-cx} ${-cy})`);
      // Geography enlarges; text and symbols retain a readable, consistent size.
      group.querySelectorAll('.geo-node,.meeting-at-mogao,.grave-node').forEach(node=>node.setAttribute('transform',`${node.getAttribute('transform')} scale(${1/scale})`));
      group.querySelectorAll(':scope > text').forEach(node=>{
        const x=+node.getAttribute('x'),y=+node.getAttribute('y');
        node.setAttribute('transform',`translate(${x} ${y}) scale(${1/scale}) translate(${-x} ${-y})`);
      });
    });
    svg.querySelector('.world-basemap').remove();
    const unknown=svg.querySelector('.unknown-coordinate');
    unknown.setAttribute('transform','translate(690 545)');
    unknown.prepend(svgNode('rect',{class:'unknown-note-paper'}));
    // Short captions keep neighboring European labels separate.
    const offsets={
      '#node-london-two':[-12,-24,'end'], '#node-paris-two':[-12,30,'end'],
      '#node-germany-two':[12,8,'start'], '#node-britain-three':[10,-48,'start'],
      '#node-hungary-three':[12,24,'start'], '#node-london-four':[10,-45,'start'],
      '#node-kashgar-three':[-10,-60,'end']
    };
    Object.entries(offsets).forEach(([selector,[x,y,anchor]])=>svg.querySelectorAll(`${selector} text`).forEach(n=>{n.setAttribute('x',x);n.setAttribute('y',y);n.setAttribute('text-anchor',anchor);}));
    const labelLines = (selector, zh, en) => {
      [['cn',zh],['en',en]].forEach(([lang,lines])=>{
        const text=svg.querySelector(`${selector} .geo-place.label-${lang}`)||svg.querySelector(`${selector} .label-${lang}`);
        text.replaceChildren(...lines.map((line,i)=>{const span=svgNode('tspan',{x:text.getAttribute('x'),dy:i?'1.2em':0});span.textContent=line;return span;}));
      });
    };
    labelLines('#node-britain-three',['英國','大英博物館'],['UK','British Museum']);
    labelLines('#node-london-four',['倫敦','大英博物館'],['London','British Museum']);
    labelLines('#node-kashgar-three',['喀什'],['Kashgar']);
    labelLines('#meeting-at-mogao',['莫高窟'],['Mogao Caves']);
    labelLines('#grave-dunhuang-five',['敦煌','王圓籙塔'],['Dunhuang',"Wang’s stupa"]);
    labelLines('#grave-kabul-five',['喀布爾','斯坦因墓'],['Kabul',"Stein’s grave"]);
    labelLines('.unknown-coordinate',['蔣孝琬','墓址未詳'],['Jiang Xiaowan','Burial place unknown']);
  }

  // Section IV: twenty-nine crates, built as SVG so each can arrive with its own delay.
  function buildCrates() {
    document.querySelectorAll(".crate-stack").forEach((stack) => {
      stack.replaceChildren();
      for (let index = 0; index < 29; index += 1) {
        const column = index % 6;
        const row = Math.floor(index / 6);
        const x = -88 + column * 31;
        const y = -53 + row * 24;
        const group = svgNode("g", { class: "crate-unit" });
        group.style.setProperty("--crate-delay", `${index * 28}ms`);
        const crate = svgNode("rect", {
          class: "crate",
          x,
          y,
          width: 25,
          height: 17
        });
        const cross = svgNode("path", {
          class: "crate-cross",
          d: `M${x},${y}L${x + 25},${y + 17}M${x + 25},${y}L${x},${y + 17}`
        });
        group.append(crate, cross);
        stack.appendChild(group);
      }
    });
  }

  function fitUnknownNote() {
    const note=document.querySelector('.unknown-coordinate');
    const boxes=[...note.querySelectorAll('circle,text')]
      .filter(node=>getComputedStyle(node).display!=='none')
      .map(node=>node.getBBox());
    const left=Math.min(...boxes.map(b=>b.x)),top=Math.min(...boxes.map(b=>b.y));
    const right=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height));
    const paper=note.querySelector('.unknown-note-paper');
    Object.entries({x:left-4,y:top-4,width:right-left+8,height:bottom-top+8}).forEach(([key,value])=>paper.setAttribute(key,value));
  }
  const scheduleNote=()=>requestAnimationFrame(fitUnknownNote);
  function onSection(index) {
    body.dataset.readingLevel = String(index + 1);
    scheduleNote();
  }

  applyGeography();
  focusStoryMaps();
  buildCrates();
  new ResizeObserver(scheduleNote).observe(document.querySelector('.story-map'));
  new MutationObserver(scheduleNote).observe(document.querySelector('.unknown-coordinate'),{subtree:true,attributes:true,attributeFilter:['style']});
  document.fonts?.ready.then(scheduleNote);

  ChapterShell.init({
    id: "taoist-tower",
    showReaderLocation: false,
    showReaderProgress: false,
    number: data.number,
    data,
    sections,
    copy,
    formatParagraph,
    onRender: scheduleNote,
    onSection
  });
})();
