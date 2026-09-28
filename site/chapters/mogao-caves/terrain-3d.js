/*
  莫高窟 - WebGL terrain from Copernicus DEM (tools/build_mogao_geodata.py).
  Three terrains: "wide" (Greece to the Hexi Corridor, part 1), "local" (Dunhuang, Echoing Sand Hill and the
  Daquan valley, parts 2 and 4) and "cliff" (the cave cliff at 30 m, part 3). Based on the 鱼尾山屋 renderer;
  kept separate on purpose.
  Exposes window.MOGAO_TERRAIN_RENDERER:
    setState(level)        1-4: terrain + camera for the reading part
    setStage(name, t)      the paragraph-level stage the reader is at (see app.js); t is 0-1 along part three
    onFrame(callback)      callback(project, view) every frame
                           project(lon, lat, liftMetres) -> {x, y, w, visible}
                           view = { terrain, north, night, shown }
*/
(() => {
  "use strict";

  const data = window.MOGAO_TERRAIN;
  const geography = window.MOGAO_GEOGRAPHY;
  const canvas = document.querySelector(".terrain-canvas");
  if (!data || !geography || !canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) {
    document.body.classList.add("webgl-fallback");
    return;
  }

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const place = (id) => geography.places.find((p) => p.id === id);

  /* ---------- shaders ---------- */

  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aHeightKm;
    uniform mat4 uMvp;
    uniform float uWidthRatio;
    varying vec3 vNormal;
    varying float vHeightKm;
    varying float vDepth;
    varying float vEdge;
    void main() {
      vec4 projected = uMvp * vec4(aPosition, 1.0);
      gl_Position = projected;
      vNormal = aNormal;
      vHeightKm = aHeightKm;
      vDepth = projected.w;
      vEdge = max(abs(aPosition.x) / uWidthRatio, abs(aPosition.z));
    }
  `;
  // Light colours throughout (the site rule since 阳关雪). The desert terrains ramp pale sand to dune ochre
  // over their own height range; the wide terrain keeps the green-to-sand-to-snow ramp.
  const fragmentShader = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vHeightKm;
    varying float vDepth;
    varying float vEdge;
    uniform float uFade;
    uniform float uSea;
    uniform float uEdgeStart;
    uniform float uDesert;
    uniform vec2 uRamp;
    uniform float uNight;
    uniform vec2 uFog;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 light = normalize(vec3(-0.6, 0.55, -0.45));
      float diffuse = max(dot(normal, light), 0.0);
      float h = smoothstep(uRamp.x, uRamp.y, vHeightKm);
      vec3 wide = mix(mix(vec3(0.80, 0.85, 0.76), vec3(0.90, 0.87, 0.80), smoothstep(0.9, 2.2, vHeightKm)),
                      vec3(0.97, 0.975, 0.98), smoothstep(4.8, 5.4, vHeightKm));
      vec3 desert = mix(vec3(0.93, 0.90, 0.83), vec3(0.88, 0.80, 0.66), h);
      vec3 color = mix(wide, desert, uDesert) * (0.8 + diffuse * 0.26);
      if (vHeightKm < uSea) color = vec3(0.84, 0.88, 0.90);
      // Part two, after the caves close: dusk, then moonlight.
      color = mix(color, vec3(0.22, 0.25, 0.34) * (0.62 + diffuse * 0.5), uNight * 0.74);
      float fog = smoothstep(uFog.x, uFog.y, vDepth);
      color = mix(color, mix(vec3(0.91, 0.90, 0.88), vec3(0.26, 0.29, 0.36), uNight), fog * 0.7);
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
    mvp: uniform("uMvp"), widthRatio: uniform("uWidthRatio"), fade: uniform("uFade"), sea: uniform("uSea"),
    edgeStart: uniform("uEdgeStart"), desert: uniform("uDesert"), ramp: uniform("uRamp"),
    night: uniform("uNight"), fog: uniform("uFog")
  };
  const attributes = ["aPosition", "aNormal", "aHeightKm"].map((name) => gl.getAttribLocation(program, name));
  attributes.forEach((location) => gl.enableVertexAttribArray(location));

  /* ---------- terrain meshes ---------- */

  function buildTerrain(source, { exaggeration, edgeStart, sea, desert, ramp }) {
    const binary = window.atob(source.heights);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const heights = new Uint16Array(bytes.buffer); // metres above baseMetres, little-endian
    const { columns, rows, bounds } = source;
    const base = source.baseMetres;
    const widthRatio = ((columns - 1) * source.cellSizeMetres.x) / ((rows - 1) * source.cellSizeMetres.y);
    const halfDepth = ((rows - 1) * source.cellSizeMetres.y) / 2;
    const metres = (column, row) => {
      const c = Math.max(0, Math.min(columns - 1, column));
      const r = Math.max(0, Math.min(rows - 1, row));
      return heights[r * columns + c];
    };
    const toY = (m) => (m / halfDepth) * exaggeration;

    // Model space: x east, z south, both scaled so the north-south extent spans -1..1.
    function toModel(lon, lat, lift = 0) {
      const fc = (lon - bounds.west) / (bounds.east - bounds.west);
      const fr = (bounds.north - lat) / (bounds.north - bounds.south);
      const column = fc * (columns - 1);
      const row = fr * (rows - 1);
      const c0 = Math.floor(column), r0 = Math.floor(row);
      const tc = column - c0, tr = row - r0;
      const h = (metres(c0, r0) * (1 - tc) + metres(c0 + 1, r0) * tc) * (1 - tr) +
        (metres(c0, r0 + 1) * (1 - tc) + metres(c0 + 1, r0 + 1) * tc) * tr;
      return [(fc - 0.5) * 2 * widthRatio, toY(h + lift), (fr - 0.5) * 2];
    }

    const positions = [], normals = [], heightKm = [];
    const dxModel = (2 * widthRatio) / (columns - 1);
    const dzModel = 2 / (rows - 1);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const m = metres(column, row);
        positions.push((column / (columns - 1) - 0.5) * 2 * widthRatio, toY(m), (row / (rows - 1) - 0.5) * 2);
        heightKm.push((m + base) / 1000);
        const gx = (toY(metres(column + 1, row)) - toY(metres(column - 1, row))) / (2 * dxModel);
        const gz = (toY(metres(column, row + 1)) - toY(metres(column, row - 1))) / (2 * dzModel);
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
      bounds, widthRatio, toModel, edgeStart, desert, ramp,
      sea: sea ? 0.001 : -1,
      buffers: [[buffer(positions), 3], [buffer(normals), 3], [buffer(heightKm), 1]],
      indexBuffer,
      count: indices.length
    };
  }

  const range = (key) => data[key].realRangeMetres.map((m) => m / 1000);
  const terrains = {
    wide: buildTerrain(data.wide, { exaggeration: 30, edgeStart: 0.92, sea: true, desert: 0, ramp: [0, 1] }),
    local: buildTerrain(data.local, { exaggeration: 3, edgeStart: 0.86, sea: false, desert: 1, ramp: range("local") }),
    cliff: buildTerrain(data.cliff, { exaggeration: 2.2, edgeStart: 0.8, sea: false, desert: 1, ramp: range("cliff") })
  };

  /* ---------- camera ---------- */

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const r = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * r, -1, 0, 0, near * far * r * 2, 0];
  }
  function lookAt(eye, center) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let length = Math.hypot(zx, zy, zz);
    zx /= length; zy /= length; zz /= length;
    let xx = zz, xy = 0, xz = -zx; // up = (0, 1, 0)
    length = Math.hypot(xx, xy, xz);
    xx /= length; xy /= length; xz /= length;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1];
  }
  function multiply(a, b) {
    const out = new Array(16).fill(0);
    for (let column = 0; column < 4; column += 1)
      for (let row = 0; row < 4; row += 1)
        for (let k = 0; k < 4; k += 1) out[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
    return out;
  }
  function clip(matrix, [x, y, z]) {
    return [
      matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
      matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
      matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
    ];
  }

  const aspectNow = () => Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight));

  // North-up view from high above that keeps every point inside the frame (as in 阳关雪 and 鱼尾山屋).
  function fitNorthUp(terrainKey, points, { tilt = 0.34, fov = 40, fog = [4, 9], margin = [0.72, 0.68] } = {}) {
    const terrain = terrains[terrainKey];
    const model = points.map(([lon, lat]) => terrain.toModel(lon, lat));
    const xs = model.map((p) => p[0]), zs = model.map((p) => p[2]);
    const span = Math.max(0.08, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)));
    const mid = [(Math.max(...xs) + Math.min(...xs)) / 2, 0, (Math.max(...zs) + Math.min(...zs)) / 2];
    const aspect = aspectNow();
    const build = (distance) => ({ eye: [mid[0], distance * 0.94, mid[2] + distance * tilt], target: [mid[0], 0, mid[2] - span * 0.02] });
    const fits = (distance) => {
      const { eye, target } = build(distance);
      const matrix = multiply(perspective((fov * Math.PI) / 180, aspect, 0.01, 30), lookAt(eye, target));
      return model.every((point) => {
        const [cx, cy, cw] = clip(matrix, point);
        return cw > 0 && Math.abs(cx / cw) < margin[0] && Math.abs(cy / cw) < margin[1];
      });
    };
    let low = span * 0.2, high = span * 4;
    for (let step = 0; step < 24; step += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) high = middle; else low = middle;
    }
    return { terrain: terrainKey, ...build(high), fov, fade: 1, fog };
  }
  const lonlat = (p) => [p.lon, p.lat];
  const region = (id) => { const r = geography.regions.find((item) => item.id === id); return [r.lon, r.lat]; };

  // Part three: along the cave cliff (OpenStreetMap natural=cliff), from the north end to the south as the
  // essay walks from the earliest caves to the latest. The camera stands above the Daquan valley to the east.
  const cliffPoints = geography.local.cliffs.flatMap((c) => c.points).sort((a, b) => b[1] - a[1]);
  function cliffCamera(t) {
    const terrain = terrains.cliff;
    const index = Math.round(Math.max(0, Math.min(1, t)) * (cliffPoints.length - 1));
    const [lon, lat] = cliffPoints[index];
    const target = terrain.toModel(lon - 0.0006, lat, 20);
    return {
      terrain: "cliff",
      eye: [target[0] + 0.3, target[1] + 0.12, target[2] + 0.2],
      target, fov: 42, fade: 1, fog: [1.2, 3.2]
    };
  }

  // The villagers' fifteen kilometres: a box around the circle, so the whole circle fits.
  function circleBox() {
    const mogao = place("mogao");
    const dLat = geography.villagersKm / 110.574;
    const dLon = geography.villagersKm / (111.32 * Math.cos((mogao.lat * Math.PI) / 180));
    return [[mogao.lon - dLon, mogao.lat - dLat], [mogao.lon + dLon, mogao.lat + dLat], lonlat(mogao)];
  }

  let level = 1;
  let stage = "";
  let stageT = 0;
  function cameraFor() {
    const mogao = lonlat(place("mogao"));
    if (level === 1) {
      const points = [mogao, lonlat(place("gandhara")), region("india"), region("greece")];
      if (stage === "west") points.push(region("western-regions"));
      return fitNorthUp("wide", points, { margin: [0.7, 0.62] });
    }
    if (level === 2) {
      return fitNorthUp("local", [mogao, lonlat(place("dunhuang")), lonlat(place("mingsha"))], { tilt: 0.55, margin: [0.62, 0.56] });
    }
    if (level === 3) return cliffCamera(stageT);
    // part four
    if (stage === "villagers") return fitNorthUp("local", circleBox(), { tilt: 0.4, margin: [0.8, 0.76] });
    const camera = fitNorthUp("local", [mogao, [mogao[0] + 0.03, mogao[1] + 0.02], [mogao[0] - 0.03, mogao[1] - 0.02]], { tilt: 0.6, margin: [0.5, 0.45] });
    if (stage !== "russians") camera.fade = 0; // the globe is drawn over the map
    return camera;
  }
  const copyCamera = (camera) => ({ ...camera, eye: [...camera.eye], target: [...camera.target], fog: [...camera.fog] });

  let fittedAspect = aspectNow();
  let current = copyCamera(cameraFor());
  let goal = copyCamera(current);
  let mvp = null;
  let night = 0;
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
      if (Math.abs(aspect - fittedAspect) / aspect > 0.02) {
        fittedAspect = aspect;
        goal = copyCamera(cameraFor());
      }
    }
  }

  function project(lon, lat, lift = 0) {
    if (!mvp) return { x: 0, y: 0, w: 0, visible: false };
    const [cx, cy, cw] = clip(mvp, terrains[current.terrain].toModel(lon, lat, lift));
    if (cw <= 0.02) return { x: 0, y: 0, w: cw, visible: false };
    const nx = cx / cw, ny = cy / cw;
    return {
      x: (nx * 0.5 + 0.5) * canvas.clientWidth,
      y: (0.5 - ny * 0.5) * canvas.clientHeight,
      w: cw,
      visible: Math.abs(nx) < 1.25 && Math.abs(ny) < 1.25
    };
  }

  function northAngle() {
    const t = terrains[current.terrain];
    const anchor = place("mogao");
    const span = t.bounds.north - t.bounds.south;
    const a = project(anchor.lon, anchor.lat, 0);
    const b = project(anchor.lon, anchor.lat + span * 0.04, 0);
    return Math.atan2(b.x - a.x, a.y - b.y);
  }

  const approach = (from, to, amount) => from + (to - from) * amount;

  function render() {
    resize();
    if (goal.terrain !== current.terrain) current = { ...copyCamera(goal), fade: 0 };
    const amount = reduced() ? 1 : 0.055;
    current.eye = current.eye.map((value, index) => approach(value, goal.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, goal.target[index], amount));
    current.fov = approach(current.fov, goal.fov, amount);
    current.fade = approach(current.fade, goal.fade, reduced() ? 1 : 0.07);
    current.fog = current.fog.map((value, index) => approach(value, goal.fog[index], amount));
    night = approach(night, level === 2 && stage === "dusk" ? 1 : 0, reduced() ? 1 : 0.03);

    const terrain = terrains[current.terrain];
    mvp = multiply(perspective((current.fov * Math.PI) / 180, canvas.width / canvas.height, 0.002, 30), lookAt(current.eye, current.target));

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
    gl.uniform1f(u.fade, current.fade);
    gl.uniform1f(u.sea, terrain.sea);
    gl.uniform1f(u.edgeStart, terrain.edgeStart);
    gl.uniform1f(u.desert, terrain.desert);
    gl.uniform2f(u.ramp, terrain.ramp[0], terrain.ramp[1]);
    gl.uniform1f(u.night, night);
    gl.uniform2f(u.fog, current.fog[0], current.fog[1]);
    gl.drawElements(gl.TRIANGLES, terrain.count, gl.UNSIGNED_SHORT, 0);

    const view = { terrain: current.terrain, north: northAngle(), night, shown: current.fade > 0.05 && goal.fade > 0 };
    listeners.forEach((listener) => listener(project, view));
    window.requestAnimationFrame(render);
  }

  window.MOGAO_TERRAIN_RENDERER = {
    setState(next) {
      level = next;
      stage = "";
      stageT = 0;
      goal = copyCamera(cameraFor());
    },
    setStage(name, t = 0) {
      if (name === stage && Math.abs(t - stageT) < 0.001) return;
      stage = name;
      stageT = t;
      goal = copyCamera(cameraFor());
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("webgl-ready");
  window.requestAnimationFrame(render);
})();
