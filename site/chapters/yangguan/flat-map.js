/*
  阳关雪 parts one and two: one flat map in one projection, as 道士塔's first map.
  The standard map of China (Albers equal-area conic, CM 110°E, SP 25°N / 47°N, Krassovsky) on paper;
  part one frames the pass and the three poetic sites, part two moves the same camera in to Dunhuang
  and the pass, where the regional relief, roads and Han wall line appear.
  Data: flat-map-data.js (tools/build_yangguan_flat_map.py). The projection below is the builder's, so
  labels drawn by app.js land on the map.
  Exposes window.YANGGUAN_FLAT_MAP_VIEW:
    active()               true while parts one and two are shown
    setState(level)        1-5
    onFrame(callback)      callback(project, view) every frame while active;
                           project(lon, lat) -> {x, y, w, visible} in panel pixels;
                           view = { terrain: "flat", north: screen angle of north (radians) }
*/
(() => {
  "use strict";

  const data = window.YANGGUAN_FLAT_MAP;
  const geography = window.YANGGUAN_GEOGRAPHY;
  const svg = document.querySelector(".flat-map");
  if (!data || !geography || !svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attributes, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- projection: Albers equal-area conic on the Krassovsky ellipsoid (Snyder 1987, §14) ---------- */

  const P = data.projection;
  const rad = Math.PI / 180;
  const A = 6378245, F = 1 / 298.3;
  const e2 = 2 * F - F * F, e = Math.sqrt(e2);
  const q = (phi) => {
    const s = Math.sin(phi);
    return (1 - e2) * (s / (1 - e2 * s * s) - (1 / (2 * e)) * Math.log((1 - e * s) / (1 + e * s)));
  };
  const m = (phi) => Math.cos(phi) / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
  const m1 = m(P.lat1 * rad), m2 = m(P.lat2 * rad);
  const n = (m1 * m1 - m2 * m2) / (q(P.lat2 * rad) - q(P.lat1 * rad));
  const C = m1 * m1 + n * q(P.lat1 * rad);
  const rho0 = (A * Math.sqrt(C - n * q(P.lat0 * rad))) / n;
  function toCanvas(lon, lat) {
    const rho = (A * Math.sqrt(C - n * q(lat * rad))) / n;
    const theta = n * (lon - P.lon0) * rad;
    const east = rho * Math.sin(theta), north = rho0 - rho * Math.cos(theta);
    return [P.a * east + P.c, -P.a * north + P.d];
  }

  /* ---------- the map ---------- */

  const camera = make("g", { class: "flat-camera" }, svg);
  make("path", { class: "china-outline", d: data.china.outlinePath }, camera);
  make("path", { class: "china-provinces", d: data.china.provincePath }, camera);
  make("path", { class: "province-highlight gansu", d: data.china.gansu }, camera);

  // part two: the regional relief (its own frame, turned into this projection), roads and the Han wall line
  const regional = make("g", { class: "flat-regional" }, camera);
  const [iw, ih] = data.regional.imageSize;
  const defs = make("defs", {}, svg);
  const feather = make("filter", { id: "flat-feather", x: "-10%", y: "-10%", width: "120%", height: "120%" }, defs);
  make("feGaussianBlur", { stdDeviation: Math.min(iw, ih) * 0.06 }, feather);
  const mask = make("mask", { id: "flat-relief-mask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: iw, height: ih }, defs);
  const inset = Math.min(iw, ih) * 0.1;
  make("rect", { x: inset, y: inset, width: iw - 2 * inset, height: ih - 2 * inset, fill: "#fff", filter: "url(#flat-feather)" }, mask);
  const relief = make("g", { transform: `matrix(${data.regional.matrix.join(" ")})` }, regional);
  make("image", { class: "flat-relief", href: data.regional.image, x: 0, y: 0, width: iw, height: ih, mask: "url(#flat-relief-mask)", preserveAspectRatio: "none" }, relief);
  const roads = make("g", { class: "flat-roads" }, regional);
  data.regional.roads.forEach((d) => make("path", { d }, roads));
  const wall = make("g", { class: "flat-wall" }, regional);
  data.regional.wall.forEach((d) => make("path", { d }, wall));

  /* ---------- camera ---------- */

  const points = geography.points;
  const local = geography.local;
  let level = 1;
  const listeners = [];

  // each part's frame: lon/lat points and how much of the panel they may fill
  function frameFor() {
    const pass = [points.pass.lon, points.pass.lat];
    if (level === 2) {
      return { places: [pass, [points.dunhuang.lon, points.dunhuang.lat], [93.98, 39.86], [94.74, 40.2]], fill: 0.72 };
    }
    // part one: the pass and the poetic sites, with the rest of China around them
    // on a narrow panel the sites need all the width they can get for their names
    const sites = [pass, ...local.farSites.map((s) => [s.lon, s.lat])];
    if (size.width < 520) return { places: [...sites, [92.5, 34]], fill: 0.86 };
    return { places: [...sites, [86, 44], [122, 28]], fill: 0.92 };
  }

  let size = { width: 1, height: 1 };
  function viewFor(frame) {
    const xy = frame.places.map(([lon, lat]) => toCanvas(lon, lat));
    const xs = xy.map(([x]) => x), ys = xy.map(([, y]) => y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const k = Math.min((size.width * frame.fill) / Math.max(right - left, 1e-6), (size.height * frame.fill) / Math.max(bottom - top, 1e-6));
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

  // north on a conic map turns with longitude: measured at the middle of the view
  function northAngle() {
    const east = (current.cx - P.c) / P.a, north = -(current.cy - P.d) / P.a;
    const theta = Math.atan2(east, rho0 - north);
    return -theta;
  }

  function resize() {
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    if (box.width !== size.width || box.height !== size.height) {
      size = { width: box.width, height: box.height };
      svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
      goal = viewFor(frameFor());
      if (!current) current = { ...goal };
    }
    return true;
  }

  const active = () => level <= 2;
  function render() {
    window.requestAnimationFrame(render);
    if (!active() || !resize()) return;
    // the zoom eases on a log scale, so a 30x zoom-in does not rush its last stretch
    const amount = reduced() ? 1 : 0.05;
    current.k = Math.exp(Math.log(current.k) + (Math.log(goal.k) - Math.log(current.k)) * amount);
    current.cx += (goal.cx - current.cx) * amount;
    current.cy += (goal.cy - current.cy) * amount;
    camera.setAttribute("transform", `translate(${size.width / 2 - current.cx * current.k} ${size.height / 2 - current.cy * current.k}) scale(${current.k})`);
    listeners.forEach((listener) => listener(project, { terrain: "flat", north: northAngle() }));
  }

  window.YANGGUAN_FLAT_MAP_VIEW = {
    active,
    toCanvas,
    setState(next) {
      const entering = !active() && next <= 2;
      level = next;
      document.body.classList.toggle("flat-on", active());
      if (!active()) return;
      resize();
      goal = viewFor(frameFor());
      // back from the 3D parts, the map starts on its frame instead of flying in from the last visit
      if (entering || !current) current = { ...goal };
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("flat-on");
  window.requestAnimationFrame(render);
})();
