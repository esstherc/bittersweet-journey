/*
  鱼尾山屋 parts 2-4: one flat map in one projection, from the Mediterranean to the Pacific (as 道士塔).
  Each part and each place named in the text only moves the camera over the same map; labels are drawn
  by app.js in screen pixels, so they keep their size at every zoom.
  Data: wide-map-data.js (tools/build_fish_tail_wide_map.py) - spherical Albers equal-area conic,
  CM 66.5°E, SP 20°N / 45°N; the formula below is the builder's, so labels sit on the relief.
  Exposes window.FISHTAIL_WIDE_MAP_VIEW, with the same calls as the 3D renderer:
    setState(level), setWideFocus(ids), setProgress(p), onFrame(callback)
    callback(project, view) runs every frame while parts 2-4 are shown;
    project(lon, lat) -> {x, y, w, visible} in panel pixels; view = { terrain: "wide", north, zoomedToNepal }
*/
(() => {
  "use strict";

  const data = window.FISHTAIL_WIDE_MAP;
  const geography = window.FISHTAIL_GEOGRAPHY;
  const svg = document.querySelector(".wide-map");
  if (!data || !geography || !svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attributes, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  };
  const place = (id) => geography.places.find((p) => p.id === id);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- projection: lon/lat -> canvas units ---------- */

  const { lon0, lat0, lat1, lat2, radiusKm: R } = data.projection;
  const rad = Math.PI / 180;
  const n = (Math.sin(lat1 * rad) + Math.sin(lat2 * rad)) / 2;
  const C = Math.cos(lat1 * rad) ** 2 + 2 * n * Math.sin(lat1 * rad);
  const rho0 = (R * Math.sqrt(C - 2 * n * Math.sin(lat0 * rad))) / n;
  const { minX, maxY, unitsPerKm } = data.canvas;
  function toCanvas(lon, lat) {
    const rho = (R * Math.sqrt(C - 2 * n * Math.sin(lat * rad))) / n;
    const theta = n * (lon - lon0) * rad;
    return [(rho * Math.sin(theta) - minX) * unitsPerKm, (maxY - (rho0 - rho * Math.cos(theta))) * unitsPerKm];
  }

  /* ---------- the map: relief image, lakes, coastline ---------- */

  const camera = make("g", { class: "wide-camera" }, svg);
  make("image", { href: data.relief.href, x: 0, y: 0, width: data.relief.width, height: data.relief.height, preserveAspectRatio: "none" }, camera);
  // a sharper relief for Nepal and the Himalayan front (part four's close-up); its edges fade into the map
  if (data.detail) {
    const { href, x, y, width, height } = data.detail;
    make("image", { href, x, y, width, height, preserveAspectRatio: "none" }, camera);
  }
  make("path", { class: "wide-lakes", d: data.lakes }, camera);
  make("path", { class: "wide-coast", d: data.land }, camera);

  /* ---------- camera: each part's region ---------- */

  const sites = geography.places.filter((p) => p.section);
  let level = 2;
  let progress = 0;
  let focusIds = [];
  let zoomed = false;
  const listeners = [];

  // a frame is a set of lon/lat points; the camera fits their canvas box into the panel, with room for labels
  function frameOf(points, margin) {
    const xy = points.map(([lon, lat]) => toCanvas(lon, lat));
    const xs = xy.map(([x]) => x), ys = xy.map(([, y]) => y);
    return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys), margin };
  }
  // a box around places, padded in degrees as the 3D camera did (at least ~4° across, a third more each way)
  function paddedFrame(ids) {
    const chosen = ids.map(place).filter(Boolean);
    const lons = chosen.map((p) => p.lon), lats = chosen.map((p) => p.lat);
    const west = Math.min(...lons), east = Math.max(...lons), south = Math.min(...lats), north = Math.max(...lats);
    const lonPad = Math.max(3.8, (east - west) * 0.24), latPad = Math.max(2.8, (north - south) * 0.34);
    const corners = [];
    for (let i = 0; i <= 4; i += 1) {
      const lon = west - lonPad + ((east - west + 2 * lonPad) * i) / 4;
      corners.push([lon, south - latPad], [lon, north + latPad]);
    }
    return frameOf(corners, 0.86);
  }
  function frameFor() {
    if (level === 2 || level === 3) {
      return paddedFrame(focusIds.length ? focusIds : sites.filter((p) => p.section === level).map((p) => p.id));
    }
    const lodge = [place("lodge").lon, place("lodge").lat];
    if (zoomed) {
      // the day trip to Lumbini, closing part four: Nepal against the Himalayan front (an 11 km relief
      // grid blurs any closer)
      return frameOf([lodge, [place("lumbini").lon, place("lumbini").lat], [place("kathmandu").lon, place("kathmandu").lat],
        [79.5, 25.2], [89.5, 31.2]], 0.92);
    }
    const w = geography.wide;
    return frameOf([lodge, ...w.regions.map((r) => r.label), ...w.seas.map((s) => s.label), [76, 50], [92, 20]], 0.88);
  }

  let size = { width: 1, height: 1 };
  function viewFor(frame) {
    const k = Math.min((size.width * frame.margin) / Math.max(frame.right - frame.left, 1), (size.height * frame.margin) / Math.max(frame.bottom - frame.top, 1));
    return { k, cx: (frame.left + frame.right) / 2, cy: (frame.top + frame.bottom) / 2 };
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
    const u = current.cx, v = current.cy;
    const lonAt = lon0 + Math.atan2(u / unitsPerKm + minX, rho0 - (maxY - v / unitsPerKm)) / n / rad;
    return -n * (lonAt - lon0) * rad;
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

  const active = () => level >= 2 && level <= 4;
  function render() {
    window.requestAnimationFrame(render);
    if (!active() || !resize()) return;
    // the same easing as the 3D cameras; the zoom eases on a log scale so near and far feel alike
    const amount = reduced() ? 1 : 0.06;
    current.k = Math.exp(Math.log(current.k) + (Math.log(goal.k) - Math.log(current.k)) * amount);
    current.cx += (goal.cx - current.cx) * amount;
    current.cy += (goal.cy - current.cy) * amount;
    camera.setAttribute("transform", `translate(${size.width / 2 - current.cx * current.k} ${size.height / 2 - current.cy * current.k}) scale(${current.k})`);
    const view = { terrain: "wide", north: northAngle(), night: 0, glow: 0, zoomedToNepal: zoomed };
    listeners.forEach((listener) => listener(project, view));
  }

  const aim = () => { goal = viewFor(frameFor()); };

  window.FISHTAIL_WIDE_MAP_VIEW = {
    active,
    setState(next) {
      const entering = !active() && next >= 2 && next <= 4;
      level = next;
      zoomed = false;
      focusIds = [];
      document.body.classList.toggle("flat-wide", active());
      if (!active()) return;
      resize();
      aim();
      // arriving from the 3D parts, the map starts on its own frame rather than flying in from the last visit
      if (entering || !current) current = { ...goal };
    },
    setWideFocus(ids) {
      if (level !== 2 && level !== 3) return;
      const next = [...new Set(ids)].filter((id) => place(id)?.section === level);
      if (next.length === focusIds.length && next.every((id, index) => id === focusIds[index])) return;
      focusIds = next;
      aim();
    },
    setProgress(value) {
      progress = Math.max(0, Math.min(1, value));
      const zoom = level === 4 && progress > 0.8;
      if (zoom !== zoomed) {
        zoomed = zoom;
        aim();
      }
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  window.requestAnimationFrame(render);
})();
