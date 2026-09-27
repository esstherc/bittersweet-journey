/*
  阳关雪 - WebGL terrain from Copernicus DEM GLO-90 (tools/build_yangguan_geodata.py).
  Two terrains: "wide" (the pass to Suzhou, ~8 km cells) for part one, where the poetic sites
  named in the essay sit at their real places; "local" (around the pass, ~325 m cells) for parts 3-5.
  Exposes window.YANGGUAN_TERRAIN_RENDERER:
    setState(level)        1-5, terrain + camera + snow cover for the reading part
    setProgress(p)         0-1 through the current part
    onFrame(callback)      callback(project, view) every frame
                           project(lon, lat, liftMetres) -> {x, y, w, visible}
                           view = { terrain: "wide" | "local", north: screen angle of north in radians }
*/
(() => {
  "use strict";

  const geography = window.YANGGUAN_GEOGRAPHY;
  const canvas = document.querySelector(".terrain-canvas");
  if (!window.YANGGUAN_TERRAIN || !window.YANGGUAN_TERRAIN_WIDE || !geography || !canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) {
    document.body.classList.add("webgl-fallback");
    return;
  }

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- shaders ---------- */

  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aElevation;
    attribute float aGrain;
    uniform mat4 uMvp;
    uniform float uWidthRatio;
    varying vec3 vNormal;
    varying float vElevation;
    varying float vGrain;
    varying float vDepth;
    varying float vEdge;
    void main() {
      vec4 projected = uMvp * vec4(aPosition, 1.0);
      gl_Position = projected;
      vNormal = aNormal;
      vElevation = aElevation;
      vGrain = aGrain;
      vDepth = projected.w;
      vEdge = max(abs(aPosition.x) / uWidthRatio, abs(aPosition.z));
    }
  `;
  const fragmentShader = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vElevation;
    varying float vGrain;
    varying float vDepth;
    varying float vEdge;
    uniform float uSnow;
    uniform float uLight;
    uniform float uFade;
    uniform float uSea;
    uniform float uEdgeStart;
    uniform vec2 uFog;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 light = normalize(vec3(-0.7 + uLight, 0.5, -0.5));
      float diffuse = max(dot(normal, light), 0.0);
      float flatness = smoothstep(0.55, 0.95, normal.y);
      // Light ground so the dark-blue rivers and the red route stay readable on top of it.
      vec3 gobi = mix(vec3(0.86, 0.82, 0.74), vec3(0.93, 0.90, 0.84), smoothstep(0.1, 0.5, vElevation));
      vec3 snowLit = vec3(0.98, 0.98, 0.98);
      vec3 snowShade = vec3(0.80, 0.83, 0.87);
      // Snow melts first on low, flat ground; it stays on the heights and the mountains.
      float mountainSnow = smoothstep(0.62, 0.8, vElevation);
      float cover = clamp(uSnow * 1.35 - vGrain * 0.7 + flatness * 0.12 + vElevation * 0.4, 0.0, 1.0);
      cover = max(smoothstep(0.35, 0.6, cover), mountainSnow);
      vec3 ground = gobi * (0.84 + diffuse * 0.2);
      vec3 snow = mix(snowShade, snowLit, smoothstep(0.2, 0.9, diffuse));
      vec3 color = mix(ground, snow, cover);
      if (vElevation < uSea) color = vec3(0.84, 0.88, 0.90);
      float fog = smoothstep(uFog.x, uFog.y, vDepth);
      color = mix(color, vec3(0.90, 0.91, 0.92), fog * 0.7);
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
    mvp: uniform("uMvp"), widthRatio: uniform("uWidthRatio"), snow: uniform("uSnow"), light: uniform("uLight"),
    fade: uniform("uFade"), sea: uniform("uSea"), edgeStart: uniform("uEdgeStart"), fog: uniform("uFog")
  };
  const attributes = ["aPosition", "aNormal", "aElevation", "aGrain"].map((name) => gl.getAttribLocation(program, name));
  attributes.forEach((location) => gl.enableVertexAttribArray(location));

  /* ---------- terrain meshes ---------- */

  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const smoothNoise = (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const top = hash(x0, y0) * (1 - sx) + hash(x0 + 1, y0) * sx;
    const bottom = hash(x0, y0 + 1) * (1 - sx) + hash(x0 + 1, y0 + 1) * sx;
    return top * (1 - sy) + bottom * sy;
  };

  function buildTerrain(data, { exaggeration, edgeStart, sea }) {
    const binary = window.atob(data.heights);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const heights = new Uint16Array(bytes.buffer); // decimetres, little-endian
    const { columns, rows, bounds } = data;
    const widthRatio = ((columns - 1) * data.cellSizeMetres.x) / ((rows - 1) * data.cellSizeMetres.y);
    const halfDepth = ((rows - 1) * data.cellSizeMetres.y) / 2;
    let maxHeight = 0;
    for (let index = 0; index < heights.length; index += 1) maxHeight = Math.max(maxHeight, heights[index]);
    const metres = (column, row) => {
      const c = Math.max(0, Math.min(columns - 1, column));
      const r = Math.max(0, Math.min(rows - 1, row));
      return heights[r * columns + c] / 10;
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

    const positions = [], normals = [], elevation = [], grain = [];
    const dxModel = (2 * widthRatio) / (columns - 1);
    const dzModel = 2 / (rows - 1);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const m = metres(column, row);
        positions.push((column / (columns - 1) - 0.5) * 2 * widthRatio, toY(m), (row / (rows - 1) - 0.5) * 2);
        elevation.push(m / (maxHeight / 10));
        grain.push(smoothNoise(column / 7, row / 7) * 0.75 + smoothNoise(column / 2.5, row / 2.5) * 0.25);
        // normals from a two-cell stencil: softer facets on the coarse grid
        const gx = (toY(metres(column + 2, row)) - toY(metres(column - 2, row))) / (4 * dxModel);
        const gz = (toY(metres(column, row + 2)) - toY(metres(column, row - 2))) / (4 * dzModel);
        const length = Math.hypot(gx, 1, gz);
        normals.push(-gx / length, 1 / length, -gz / length);
      }
    }
    const indices = [];
    for (let row = 0; row < rows - 1; row += 1) {
      for (let column = 0; column < columns - 1; column += 1) {
        const a = row * columns + column;
        const b = a + 1;
        const c = a + columns;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
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
      // sea: cells at 0 m are sea (or ocean with no DEM tile)
      sea: sea ? 0.5 / (maxHeight / 10) : -1,
      buffers: [[buffer(positions), 3], [buffer(normals), 3], [buffer(elevation), 1], [buffer(grain), 1]],
      indexBuffer,
      count: indices.length
    };
  }

  const terrains = {
    local: buildTerrain(window.YANGGUAN_TERRAIN, { exaggeration: 8, edgeStart: 0.8, sea: false }),
    wide: buildTerrain(window.YANGGUAN_TERRAIN_WIDE, { exaggeration: 22, edgeStart: 0.9, sea: true })
  };

  /* ---------- camera ---------- */

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const range = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * range, -1, 0, 0, near * far * range * 2, 0];
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

  const passPoint = geography.points.pass;
  const local = terrains.local;
  const pass = local.toModel(passPoint.lon, passPoint.lat);
  const at = (dx, dy, dz) => [pass[0] + dx, pass[1] + dy, pass[2] + dz];

  // Part one: from high above, north up. The distance is fitted so the pass and all three sites stay
  // inside the view at any panel shape.
  const wideStops = [passPoint, ...geography.local.farSites].map((p) => terrains.wide.toModel(p.lon, p.lat));
  function wideCamera(aspect) {
    const xs = wideStops.map((s) => s[0]), zs = wideStops.map((s) => s[2]);
    const span = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
    const forward = [0, -1]; // model z points south, so looking along -z puts north at the top
    const mid = [(Math.max(...xs) + Math.min(...xs)) / 2, 0.04, (Math.max(...zs) + Math.min(...zs)) / 2];
    const fov = 40;
    const build = (distance) => {
      // ~70° down from the horizon: nearly overhead, still showing relief
      const eye = [mid[0] - forward[0] * distance * 0.34, distance * 0.94, mid[2] - forward[1] * distance * 0.34];
      const target = [mid[0] + forward[0] * span * 0.02, 0, mid[2] + forward[1] * span * 0.02];
      return { eye, target };
    };
    const fits = (distance) => {
      const { eye, target } = build(distance);
      const matrix = multiply(perspective((fov * Math.PI) / 180, aspect, 0.01, 20), lookAt(eye, target));
      return wideStops.every((point) => {
        const [cx, cy, cw] = clip(matrix, point);
        // leave room for the labels written beside the dots
        return cw > 0 && Math.abs(cx / cw) < 0.72 && Math.abs(cy / cw) < 0.7;
      });
    };
    let low = span * 0.3, high = span * 3;
    for (let step = 0; step < 24; step += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) high = middle; else low = middle;
    }
    return { terrain: "wide", ...build(high), fov, snow: 0, fade: 1, fog: [4, 9] };
  }

  const localCamera = (eye, target, fov, snow) => ({ terrain: "local", eye, target, fov, snow, fade: 1, fog: [0.9, 3.4] });
  // Part three follows the walk: from above and behind the start of the path, looking along it to the pass.
  const route = geography.local.route;
  const routeStart = local.toModel(route[0][0], route[0][1]);
  const routeEnd = local.toModel(route[route.length - 1][0], route[route.length - 1][1]);
  const along = [routeEnd[0] - routeStart[0], routeEnd[2] - routeStart[2]];
  const walkEye = [routeStart[0] - along[0] * 0.2, routeStart[1] + 0.26, routeStart[2] - along[1] * 0.2];
  const walkTarget = [routeStart[0] + along[0] * 0.7, routeEnd[1], routeStart[2] + along[1] * 0.7];
  const cameras = {
    3: localCamera(walkEye, walkTarget, 44, 0.3),
    4: localCamera(at(0.05, 0.07, -0.34), at(0, 0.0, 0.25), 48, 0.72),
    5: localCamera(at(0.26, 0.12, 0.02), at(-0.6, 0.0, 0.0), 50, 0.72)
  };
  const aspectNow = () => Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight));
  // Level 2 shows the regional map; the wide terrain stays underneath while it fades out.
  const cameraFor = (level) => (level <= 2 ? wideCamera(aspectNow()) : cameras[level] || cameras[3]);
  const copyCamera = (camera) => ({ ...camera, eye: [...camera.eye], target: [...camera.target], fog: [...camera.fog] });

  let level = 1;
  let fittedAspect = 0;
  let current = copyCamera(cameraFor(1));
  let goal = copyCamera(current);
  let progress = 0;
  let mvp = null;
  const listeners = [];

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      // refit the overview only when the panel shape really changes
      const aspect = aspectNow();
      if (level <= 2 && Math.abs(aspect - fittedAspect) / aspect > 0.02) {
        fittedAspect = aspect;
        goal = copyCamera(cameraFor(level));
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

  // Screen direction of north at the pass (0 = straight up, clockwise positive).
  function northAngle() {
    const span = terrains[current.terrain].bounds.north - terrains[current.terrain].bounds.south;
    const a = project(passPoint.lon, passPoint.lat, 0);
    const b = project(passPoint.lon, passPoint.lat + span * 0.04, 0);
    return Math.atan2(b.x - a.x, a.y - b.y);
  }

  const approach = (from, to, amount) => from + (to - from) * amount;

  function render(time = 0) {
    resize();
    // Changing terrain means changing model space: jump there, then fade the new terrain in.
    if (goal.terrain !== current.terrain) current = { ...copyCamera(goal), fade: 0 };
    const amount = reduced() ? 1 : 0.055;
    current.eye = current.eye.map((value, index) => approach(value, goal.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, goal.target[index], amount));
    current.fov = approach(current.fov, goal.fov, amount);
    current.snow = approach(current.snow, goal.snow, amount * 0.6);
    current.fade = approach(current.fade, goal.fade, amount);
    current.fog = current.fog.map((value, index) => approach(value, goal.fog[index], amount));

    const terrain = terrains[current.terrain];
    const drift = reduced() ? 0 : Math.sin(time * 0.00012) * 0.012;
    const eye = [current.eye[0] + drift, current.eye[1], current.eye[2]];
    mvp = multiply(
      perspective((current.fov * Math.PI) / 180, canvas.width / canvas.height, 0.01, 20),
      lookAt(eye, current.target)
    );

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
    gl.uniform1f(u.snow, current.snow);
    gl.uniform1f(u.light, Math.sin(time * 0.0001) * 0.08 + progress * 0.06);
    gl.uniform1f(u.fade, current.fade);
    gl.uniform1f(u.sea, terrain.sea);
    gl.uniform1f(u.edgeStart, terrain.edgeStart);
    gl.uniform2f(u.fog, current.fog[0], current.fog[1]);
    gl.drawElements(gl.TRIANGLES, terrain.count, gl.UNSIGNED_SHORT, 0);

    const view = { terrain: current.terrain, north: northAngle() };
    listeners.forEach((listener) => listener(project, view));
    window.requestAnimationFrame(render);
  }

  window.YANGGUAN_TERRAIN_RENDERER = {
    setState(next) {
      level = next;
      goal = copyCamera(cameraFor(next));
    },
    setProgress(value) {
      progress = Math.max(0, Math.min(1, value));
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("webgl-ready");
  window.requestAnimationFrame(render);
})();
