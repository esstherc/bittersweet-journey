/*
  山庄背影 sections 1 and 5: one flat map in the standard map's projection (as 阳关雪 and 道士塔's first maps).
  Section one frames the northern-tour axis, Beijing to Mulan; section five moves the same camera to Chengde and
  the Summer Palace in Beijing. The Yan Mountains are real shaded relief.
  Data: flat-map-data.js (tools/build_mountain_resort_flat_map.py). The Albers formula below is the builder's,
  so labels drawn by app.js land on the map.
  Exposes window.MOUNTAIN_RESORT_FLAT_MAP_VIEW:
    active()               true while sections 1 and 5 are shown
    setState(level)        1-5
    onFrame(callback)      callback(project, view) every frame while active;
                           project(lon, lat) -> {x, y, w, visible} in panel pixels;
                           view = { terrain: "flat", north, metresPerPixel }
*/
(() => {
  "use strict";

  const data = window.MOUNTAIN_RESORT_FLAT_MAP;
  const geography = window.MOUNTAIN_RESORT_GEOGRAPHY;
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

  /* ---------- the map: provinces and outline over the relief ---------- */

  const camera = make("g", { class: "flat-camera" }, svg);
  make("path", { class: "flat-land", d: data.china.outlinePath }, camera);
  const r = data.relief;
  make("image", { class: "flat-relief", href: r.href, x: r.x, y: r.y, width: r.width, height: r.height, preserveAspectRatio: "none" }, camera);
  make("path", { class: "flat-provinces", d: data.china.provincePath }, camera);
  make("path", { class: "flat-outline", d: data.china.outlinePath }, camera);

  /* ---------- camera ---------- */

  const place = (id) => geography.regional.places.find((p) => p.id === id).coordinates;
  const mulan = geography.regional.mulanRange;
  let level = 1;
  const listeners = [];
  const active = () => level === 1 || level === 5;

  function framePoints() {
    if (level === 5) return [place("summer-palace"), place("beijing"), place("chengde"), [116.1, 39.8], [118.2, 41.15]];
    return [place("beijing"), place("gubeikou"), place("chengde"), [mulan.west, mulan.north], [mulan.east, mulan.north], [116.2, 39.75]];
  }

  let size = { width: 1, height: 1 };
  function viewFor(points) {
    const xy = points.map(([lon, lat]) => toCanvas(lon, lat));
    const xs = xy.map(([x]) => x), ys = xy.map(([, y]) => y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const fill = size.width < 600 ? 0.8 : 0.74;
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
  // north turns with the meridians on a conic map: measured at the middle of the view
  function measure() {
    const east = (current.cx - P.c) / P.a, north = -(current.cy - P.d) / P.a;
    return { north: -Math.atan2(east, rho0 - north), metresPerPixel: 1 / (P.a * current.k) };
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
    const amount = reduced() ? 1 : 0.05;
    current.k = Math.exp(Math.log(current.k) + (Math.log(goal.k) - Math.log(current.k)) * amount);
    current.cx += (goal.cx - current.cx) * amount;
    current.cy += (goal.cy - current.cy) * amount;
    camera.setAttribute("transform", `translate(${size.width / 2 - current.cx * current.k} ${size.height / 2 - current.cy * current.k}) scale(${current.k})`);
    listeners.forEach((listener) => listener(project, { terrain: "flat", ...measure() }));
  }

  window.MOUNTAIN_RESORT_FLAT_MAP_VIEW = {
    active,
    toCanvas,
    setState(next) {
      const entering = !active() && (next === 1 || next === 5);
      level = next;
      document.body.classList.toggle("flat-on", active());
      if (!active()) return;
      resize();
      goal = viewFor(framePoints());
      if (entering || !current) current = { ...goal };
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("flat-on");
  window.requestAnimationFrame(render);
})();
