/*
  莫高窟 parts one and four: one flat world map in one projection, one camera (as 道士塔).
  Part one frames Greece, Gandhara, India and Dunhuang (with shaded relief); part four moves the same
  camera to America, the villagers' Dunhuang (the 3D terrain takes over there), Beijing and the world.
  Data: world-map-data.js (tools/build_mogao_world_map.py) - Equal Earth, central meridian 130°E; the
  formula below is the builder's, so labels drawn by app.js land on the map.
  Exposes window.MOGAO_WORLD_MAP_VIEW:
    active()               true while the flat map is shown
    setView(level, stage)  which part and paragraph-level stage the reader is at
    onFrame(callback)      callback(project, view) every frame while active;
                           project(lon, lat) -> {x, y, w, visible} in panel pixels;
                           view = { terrain: "world", north: screen angle of north at Mogao (radians) }
*/
(() => {
  "use strict";

  const data = window.MOGAO_WORLD_MAP;
  const geography = window.MOGAO_GEOGRAPHY;
  const svg = document.querySelector(".world-flat");
  if (!data || !geography || !svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attributes, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  };
  const place = (id) => geography.places.find((p) => p.id === id);
  const region = (id) => geography.regions.find((r) => r.id === id);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- projection: Equal Earth (Šavrič, Patterson & Jenny 2018) ---------- */

  const { lon0, scale, xMax, yMax } = data.projection;
  const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
  function toCanvas(lon, lat) {
    const lam = ((((lon - lon0 + 540) % 360) + 360) % 360 - 180) * Math.PI / 180;
    const theta = Math.asin(M * Math.sin(lat * Math.PI / 180));
    const t2 = theta * theta, t6 = t2 * t2 * t2;
    const x = (lam * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
    const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
    return [(x + xMax) * scale, (yMax - y) * scale];
  }

  /* ---------- the map: land, relief (part one's region), lakes ---------- */

  const camera = make("g", { class: "world-camera" }, svg);
  make("path", { class: "world-land", d: data.land }, camera);
  const r = data.relief;
  make("image", { class: "world-relief", href: r.href, x: r.x, y: r.y, width: r.width, height: r.height, preserveAspectRatio: "none" }, camera);
  make("path", { class: "world-coast", d: data.land }, camera);
  make("path", { class: "world-lakes", d: data.lakes }, camera);

  /* ---------- camera ---------- */

  const at = (item) => [item.lon, item.lat];
  // the stages of part four drawn on this map (the others are the 3D terrain around the caves)
  const worldStages = {
    america: () => [at(place("mogao")), at(place("harvard")), at(place("philadelphia"))],
    beijing: () => [at(place("mogao")), at(place("beijing")), [80, 30], [125, 46]],
    world: () => [at(place("mogao")), at(place("beijing")), at(place("harvard")), at(place("philadelphia")), [10, 60], [-110, 10]]
  };
  let level = 1;
  let stage = "";
  const listeners = [];
  const active = () => level === 1 || (level === 4 && Boolean(worldStages[stage]));

  function framePoints() {
    if (level === 4 && worldStages[stage]) return { points: worldStages[stage](), fill: 0.74 };
    // part one: the direction of an idea, Greece and India to Gandhara to Dunhuang
    const points = [at(place("mogao")), at(place("gandhara")), at(region("india")), at(region("greece"))];
    if (stage === "west") points.push(at(region("western-regions")));
    return { points, fill: 0.78 };
  }

  let size = { width: 1, height: 1 };
  function viewFor({ points, fill }) {
    const xy = points.map(([lon, lat]) => toCanvas(lon, lat));
    const xs = xy.map(([x]) => x), ys = xy.map(([, y]) => y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const k = Math.min((size.width * fill) / Math.max(right - left, 1e-6), (size.height * fill) / Math.max(bottom - top, 1e-6));
    return { k, cx: (left + right) / 2, cy: (top + bottom) / 2 };
  }
  let current = null;
  let goal = null;

  function project(lon, lat) {
    const [u, v] = toCanvas(lon, lat);
    const x = size.width / 2 + (u - current.cx) * current.k;
    const y = size.height / 2 + (v - current.cy) * current.k;
    const visible = x > -size.width * 0.25 && x < size.width * 1.25 && y > -size.height * 0.25 && y < size.height * 1.25;
    return { x, y, w: 1, visible };
  }
  // north turns across an Equal Earth map: measured at the caves
  function northAngle() {
    const mogao = place("mogao");
    const a = project(mogao.lon, mogao.lat), b = project(mogao.lon, mogao.lat + 1);
    return Math.atan2(b.x - a.x, a.y - b.y);
  }

  function resize() {
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    if (box.width !== size.width || box.height !== size.height) {
      size = { width: box.width, height: box.height };
      svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
      goal = viewFor(framePoints());
      if (!current) current = { ...goal };
    }
    return true;
  }

  function render() {
    window.requestAnimationFrame(render);
    if (!active() || !resize()) return;
    // the zoom eases on a log scale, so the long pull-back to the whole world keeps an even pace
    const amount = reduced() ? 1 : 0.05;
    current.k = Math.exp(Math.log(current.k) + (Math.log(goal.k) - Math.log(current.k)) * amount);
    current.cx += (goal.cx - current.cx) * amount;
    current.cy += (goal.cy - current.cy) * amount;
    camera.setAttribute("transform", `translate(${size.width / 2 - current.cx * current.k} ${size.height / 2 - current.cy * current.k}) scale(${current.k})`);
    listeners.forEach((listener) => listener(project, { terrain: "world", north: northAngle() }));
  }

  window.MOGAO_WORLD_MAP_VIEW = {
    active,
    setView(nextLevel, nextStage) {
      const wasActive = active();
      level = nextLevel;
      stage = nextStage || "";
      document.body.classList.toggle("world-on", active());
      if (!active()) return;
      resize();
      goal = viewFor(framePoints());
      // coming from a 3D part, the map starts on its own frame rather than flying in from the last visit
      if (!wasActive || !current) current = { ...goal };
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("world-on");
  window.requestAnimationFrame(render);
})();
