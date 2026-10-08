/*
  山庄背影 - WebGL terrain from Copernicus DEM GLO-30 (tools/build_mountain_resort_geodata.py): the Mountain
  Resort, the hills behind it and the Outlying Temples, about 24 x 21 km so the land runs past every panel edge.
  Sections 2-4 (sections 1 and 5 are the flat map, flat-map.js). Based on the 沙原隐泉 renderer; kept separate on
  purpose.
  Exposes window.MOUNTAIN_RESORT_TERRAIN_RENDERER:
    active()               true while sections 2-4 are shown
    setState(level)        1-5: camera for the reading section
    onFrame(callback)      callback(project, view) every frame while active
                           project(lon, lat, liftMetres) -> {x, y, w, visible}
                           view = { terrain: "resort", north, metresPerPixel }
*/
(() => {
  "use strict";

  const data = window.MOUNTAIN_RESORT_TERRAIN;
  const features = window.MOUNTAIN_RESORT_FEATURES;
  const canvas = document.querySelector(".terrain-canvas");
  if (!data || !features || !canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) {
    document.body.classList.add("webgl-fallback");
    return;
  }

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- shaders: wooded hills and a pale valley, kept light so the lines read ---------- */

  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aHeight;
    uniform mat4 uMvp;
    uniform float uWidthRatio;
    varying vec3 vNormal;
    varying float vHeight;
    varying float vDepth;
    varying float vEdge;
    void main() {
      vec4 projected = uMvp * vec4(aPosition, 1.0);
      gl_Position = projected;
      vNormal = aNormal;
      vHeight = aHeight;
      vDepth = projected.w;
      vEdge = max(abs(aPosition.x) / uWidthRatio, abs(aPosition.z));
    }
  `;
  const fragmentShader = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vHeight;
    varying float vDepth;
    varying float vEdge;
    uniform float uFade;
    uniform vec2 uFog;
    uniform float uEdgeStart;
    uniform float uDusk;
    void main() {
      vec3 light = normalize(vec3(-0.5, 0.78, 0.36));
      float diffuse = max(dot(normalize(vNormal), light), 0.0);
      float slope = 1.0 - normalize(vNormal).y;
      float height = smoothstep(0.02, 0.55, vHeight);
      vec3 valley = vec3(0.86, 0.85, 0.78);
      vec3 hill = vec3(0.67, 0.71, 0.60);
      vec3 color = mix(valley, hill, clamp(height * 0.8 + slope * 2.2, 0.0, 1.0));
      color *= 0.74 + diffuse * 0.36;
      color = mix(color, color * vec3(0.62, 0.62, 0.7), uDusk);
      float fog = smoothstep(uFog.x, uFog.y, vDepth);
      color = mix(color, vec3(0.9, 0.89, 0.85), fog * 0.6);
      float edgeAlpha = 1.0 - smoothstep(uEdgeStart, 1.0, vEdge);
      gl_FragColor = vec4(color, edgeAlpha * uFade);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader");
    return shader;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link");
  gl.useProgram(program);
  const uniform = (name) => gl.getUniformLocation(program, name);
  const u = {
    mvp: uniform("uMvp"), widthRatio: uniform("uWidthRatio"), fade: uniform("uFade"),
    fog: uniform("uFog"), edgeStart: uniform("uEdgeStart"), dusk: uniform("uDusk")
  };
  const attributes = ["aPosition", "aNormal", "aHeight"].map((name) => gl.getAttribLocation(program, name));
  attributes.forEach((location) => gl.enableVertexAttribArray(location));

  /* ---------- mesh ---------- */

  function buildTerrain(source, { exaggeration, edgeStart }) {
    const binary = window.atob(source.heights);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const heights = new Uint16Array(bytes.buffer); // metres above baseMetres
    const { columns, rows, bounds } = source;
    const widthRatio = ((columns - 1) * source.cellSizeMetres.x) / ((rows - 1) * source.cellSizeMetres.y);
    const halfDepth = ((rows - 1) * source.cellSizeMetres.y) / 2;
    const range = Math.max(1, source.realRangeMetres[1] - source.realRangeMetres[0]);
    const metres = (column, row) => heights[Math.max(0, Math.min(rows - 1, row)) * columns + Math.max(0, Math.min(columns - 1, column))];
    const toY = (m) => (m / halfDepth) * exaggeration;

    // Model space: x east, z south, the north-south extent spans -1..1.
    function toModel(lon, lat, lift = 0) {
      const fc = (lon - bounds.west) / (bounds.east - bounds.west);
      const fr = (bounds.north - lat) / (bounds.north - bounds.south);
      const column = fc * (columns - 1), row = fr * (rows - 1);
      const c0 = Math.floor(column), r0 = Math.floor(row), tc = column - c0, tr = row - r0;
      const h = (metres(c0, r0) * (1 - tc) + metres(c0 + 1, r0) * tc) * (1 - tr) +
        (metres(c0, r0 + 1) * (1 - tc) + metres(c0 + 1, r0 + 1) * tc) * tr;
      return [(fc - 0.5) * 2 * widthRatio, toY(h + lift), (fr - 0.5) * 2];
    }

    const positions = [], normals = [], height = [];
    const dx = (2 * widthRatio) / (columns - 1), dz = 2 / (rows - 1);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const m = metres(column, row);
        positions.push((column / (columns - 1) - 0.5) * 2 * widthRatio, toY(m), (row / (rows - 1) - 0.5) * 2);
        height.push(m / range);
        const gx = (toY(metres(column + 1, row)) - toY(metres(column - 1, row))) / (2 * dx);
        const gz = (toY(metres(column, row + 1)) - toY(metres(column, row - 1))) / (2 * dz);
        const length = Math.hypot(gx, 1, gz);
        normals.push(-gx / length, 1 / length, -gz / length);
      }
    }
    const indices = [];
    for (let row = 0; row < rows - 1; row += 1) {
      for (let column = 0; column < columns - 1; column += 1) {
        const a = row * columns + column;
        indices.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
      }
    }
    const buffer = (values) => {
      const handle = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, handle);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
      return handle;
    };
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return {
      bounds, widthRatio, toModel, edgeStart,
      buffers: [[buffer(positions), 3], [buffer(normals), 3], [buffer(height), 1]],
      indexBuffer, count: indices.length
    };
  }

  // the hills rise only some 400 m above the valley: heights are exaggerated three times (stated in the notes)
  const terrain = buildTerrain(data, { exaggeration: 3, edgeStart: 0.9 });

  /* ---------- camera ---------- */

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), r = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * r, -1, 0, 0, near * far * r * 2, 0];
  }
  function lookAt(eye, center) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let length = Math.hypot(zx, zy, zz);
    zx /= length; zy /= length; zz /= length;
    let xx = zz, xy = 0, xz = -zx;
    length = Math.hypot(xx, xy, xz);
    xx /= length; xy /= length; xz /= length;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]), -(yx * eye[0] + yy * eye[1] + yz * eye[2]), -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1];
  }
  function multiply(a, b) {
    const out = new Array(16).fill(0);
    for (let column = 0; column < 4; column += 1)
      for (let row = 0; row < 4; row += 1)
        for (let k = 0; k < 4; k += 1) out[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
    return out;
  }
  const clip = (m, [x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[3] * x + m[7] * y + m[11] * z + m[15]];
  const aspectNow = () => Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight));

  // A view from the south (north up the screen) that keeps every given point inside the frame. `tilt` sets how
  // low the eye is: larger is lower, looking across the land toward the hills rather than down on it.
  function fitFromSouth(points, { tilt = 0.5, fov = 40, fog = [3, 8], margin = [0.7, 0.62] } = {}) {
    const model = points.map(([lon, lat]) => terrain.toModel(lon, lat));
    const xs = model.map((p) => p[0]), zs = model.map((p) => p[2]);
    const span = Math.max(0.03, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)));
    const mid = [(Math.max(...xs) + Math.min(...xs)) / 2, 0, (Math.max(...zs) + Math.min(...zs)) / 2];
    const aspect = aspectNow();
    const build = (distance) => ({ eye: [mid[0], distance * 0.94, mid[2] + distance * tilt], target: [mid[0], 0.02, mid[2]] });
    const fits = (distance) => {
      const { eye, target } = build(distance);
      const matrix = multiply(perspective((fov * Math.PI) / 180, aspect, 0.005, 30), lookAt(eye, target));
      return model.every((p) => { const [cx, cy, cw] = clip(matrix, p); return cw > 0 && Math.abs(cx / cw) < margin[0] && Math.abs(cy / cw) < margin[1]; });
    };
    let low = span * 0.1, high = span * 8;
    for (let step = 0; step < 24; step += 1) { const middle = (low + high) / 2; if (fits(middle)) high = middle; else low = middle; }
    return { ...build(high), fov, fade: 1, fog };
  }

  const resortRing = features.resort[0];
  const anchors = features.anchors;
  const lonlat = (p) => [p.lon, p.lat];
  const temples = Object.values(features.temples).map((t) => t.centre);
  function cameraFor(level) {
    if (level === 3) {
      // the resort with the temples ringed around it to the north and east
      return fitFromSouth([...resortRing, ...temples], { tilt: 0.62, margin: [0.74, 0.66], fog: [3, 9] });
    }
    if (level === 4) {
      // low at the main gate, looking north into the closed palace
      const gate = lonlat(anchors.gate);
      return fitFromSouth([gate, [gate[0] - 0.006, gate[1] + 0.006], [gate[0] + 0.006, gate[1] + 0.006], [gate[0], gate[1] - 0.002]],
        { tilt: 0.95, margin: [0.6, 0.5], fov: 42, fog: [1.5, 5] });
    }
    // two: from the south, low, so the hills north and west of the resort stand up behind it like a chair back
    // the ridge north of the resort is included so it stands at the top of the frame
    const north = [features.ridge.lon, Math.max(...resortRing.map(([, lat]) => lat)) + 0.012];
    return fitFromSouth([...resortRing, lonlat(features.ridge), north], { tilt: 1.7, margin: [0.74, 0.66], fov: 38, fog: [2.5, 8] });
  }
  const copyCamera = (camera) => ({ ...camera, eye: [...camera.eye], target: [...camera.target], fog: [...camera.fog] });

  let level = 1;
  let fittedAspect = aspectNow();
  let current = copyCamera(cameraFor(2));
  let goal = copyCamera(current);
  let mvp = null;
  let swayEye = null;
  let dusk = 0;
  const listeners = [];

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      const aspect = aspectNow();
      if (Math.abs(aspect - fittedAspect) / aspect > 0.02) { fittedAspect = aspect; goal = copyCamera(cameraFor(level)); }
    }
  }

  function project(lon, lat, lift = 0) {
    if (!mvp) return { x: 0, y: 0, w: 0, visible: false };
    const [cx, cy, cw] = clip(mvp, terrain.toModel(lon, lat, lift));
    if (cw <= 0.02) return { x: 0, y: 0, w: cw, visible: false };
    const nx = cx / cw, ny = cy / cw;
    return { x: (nx * 0.5 + 0.5) * canvas.clientWidth, y: (0.5 - ny * 0.5) * canvas.clientHeight, w: cw, visible: Math.abs(nx) < 1.2 && Math.abs(ny) < 1.2 };
  }

  // Where north points (the camera's heading, as on 3D maps) and how many metres a pixel spans at the view's middle.
  function measure() {
    const b = terrain.bounds;
    const lon = b.west + ((current.target[0] / terrain.widthRatio) / 2 + 0.5) * (b.east - b.west);
    const lat = b.north - (current.target[2] / 2 + 0.5) * (b.north - b.south);
    const a = project(lon, lat);
    const e = project(lon + 500 / (111320 * Math.cos((lat * Math.PI) / 180)), lat);
    const eye = swayEye || current.eye;
    const heading = Math.atan2(current.target[0] - eye[0], -(current.target[2] - eye[2]));
    return { north: -heading, metresPerPixel: 500 / Math.max(0.5, Math.hypot(e.x - a.x, e.y - a.y)) };
  }

  const approach = (from, to, amount) => from + (to - from) * amount;
  const active = () => level >= 2 && level <= 4;

  function render(time = 0) {
    window.requestAnimationFrame(render);
    resize();
    const amount = reduced() ? 1 : 0.05;
    current.eye = current.eye.map((value, index) => approach(value, goal.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, goal.target[index], amount));
    current.fov = approach(current.fov, goal.fov, amount);
    current.fog = current.fog.map((value, index) => approach(value, goal.fog[index], amount));
    dusk = approach(dusk, level === 4 ? 1 : 0, reduced() ? 1 : 0.03);
    if (!active()) return;

    // a slow sway: the eye circles a few degrees around the target and back (as in 沙原隐泉)
    const sway = reduced() ? 0 : Math.sin(time * 0.00014) * 0.04;
    const ox = current.eye[0] - current.target[0], oz = current.eye[2] - current.target[2];
    const eye = [current.target[0] + ox * Math.cos(sway) - oz * Math.sin(sway), current.eye[1], current.target[2] + ox * Math.sin(sway) + oz * Math.cos(sway)];
    swayEye = eye;
    mvp = multiply(perspective((current.fov * Math.PI) / 180, canvas.width / canvas.height, 0.005, 30), lookAt(eye, current.target));

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    terrain.buffers.forEach(([handle, size], index) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, handle);
      gl.vertexAttribPointer(attributes[index], size, gl.FLOAT, false, 0, 0);
    });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain.indexBuffer);
    gl.uniformMatrix4fv(u.mvp, false, new Float32Array(mvp));
    gl.uniform1f(u.widthRatio, terrain.widthRatio);
    gl.uniform1f(u.fade, 1);
    gl.uniform2f(u.fog, current.fog[0], current.fog[1]);
    gl.uniform1f(u.edgeStart, terrain.edgeStart);
    gl.uniform1f(u.dusk, dusk * 0.55);
    gl.drawElements(gl.TRIANGLES, terrain.count, gl.UNSIGNED_SHORT, 0);

    const view = { terrain: "resort", ...measure() };
    listeners.forEach((listener) => listener(project, view));
  }

  window.MOUNTAIN_RESORT_TERRAIN_RENDERER = {
    active,
    setState(next) {
      const entering = !active() && next >= 2 && next <= 4;
      level = next;
      if (!active()) return;
      goal = copyCamera(cameraFor(level));
      // coming from the flat map, start on the frame instead of flying in from the last visit
      if (entering) current = copyCamera(goal);
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("webgl-ready");
  window.requestAnimationFrame(render);
})();
