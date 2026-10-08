/*
  沙原隐泉 - WebGL terrain from Copernicus DEM (tools/build_secret_spring_3d.py).
  Two terrains on lon/lat grids: "local" (Mingsha Mountain and Crescent Spring: sections one, three, four)
  and "regional" (Dunhuang to the Yulin Caves: section two). Every point can be projected, so the labels,
  the north arrow and the scale bar follow the camera.
  Exposes window.SECRET_SPRING_TERRAIN_RENDERER:
    setState(level)        1-4: terrain + camera for the reading section
    setProgress(p)         0-1 through the section (a slow light drift)
    onFrame(callback)      callback(project, view) every frame
                           project(lon, lat, liftMetres) -> {x, y, w, visible}
                           view = { terrain, north, metresPerPixel }
*/
(() => {
  "use strict";

  const data = window.SECRET_SPRING_TERRAIN;
  const geography = window.SECRET_SPRING_GEOGRAPHY;
  const canvas = document.querySelector(".terrain-canvas");
  if (!data || !geography || !canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) {
    document.body.classList.add("webgl-fallback");
    return;
  }

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const place = (id) => geography.places[id];

  /* ---------- shaders: the original warm sand palette, kept light ---------- */

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
    uniform float uLightShift;
    uniform float uFade;
    uniform vec2 uFog;
    uniform float uEdgeStart;
    void main() {
      vec3 light = normalize(vec3(-0.48 + uLightShift, 0.78, 0.38));
      float diffuse = max(dot(normalize(vNormal), light), 0.0);
      float ridge = smoothstep(0.15, 0.95, vHeight);
      vec3 color = mix(vec3(0.74, 0.65, 0.50), vec3(0.93, 0.85, 0.69), ridge);
      color *= 0.72 + diffuse * 0.38;
      float fog = smoothstep(uFog.x, uFog.y, vDepth);
      color = mix(color, vec3(0.93, 0.90, 0.83), fog * 0.6);
      float edgeAlpha = uEdgeStart >= 1.0 ? 1.0 : 1.0 - smoothstep(uEdgeStart, 1.0, vEdge);
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
    mvp: uniform("uMvp"), widthRatio: uniform("uWidthRatio"), lightShift: uniform("uLightShift"),
    fade: uniform("uFade"), fog: uniform("uFog"), edgeStart: uniform("uEdgeStart")
  };
  const attributes = ["aPosition", "aNormal", "aHeight"].map((name) => gl.getAttribLocation(program, name));
  attributes.forEach((location) => gl.enableVertexAttribArray(location));

  /* ---------- meshes ---------- */

  function buildTerrain(source, { exaggeration, edgeStart }) {
    const binary = window.atob(source.heights);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const heights = new Uint16Array(bytes.buffer); // metres above baseMetres
    const { columns, rows, bounds } = source;
    const base = source.baseMetres;
    // Keep the existing camera/model frame while actual DEM coverage grows around it.
    const modelBounds = source.modelBounds || bounds;
    const core = source.coreGrid || {columns, rows};
    const widthRatio = ((core.columns - 1) * source.cellSizeMetres.x) / ((core.rows - 1) * source.cellSizeMetres.y);
    const halfDepth = ((core.rows - 1) * source.cellSizeMetres.y) / 2;
    const longitudes = source.longitudeSamples || Array.from({length:columns},(_,i)=>bounds.west+i/(columns-1)*(bounds.east-bounds.west));
    const latitudes = source.latitudeSamples || Array.from({length:rows},(_,i)=>bounds.north-i/(rows-1)*(bounds.north-bounds.south));
    const modelX = lon => ((lon-modelBounds.west)/(modelBounds.east-modelBounds.west)-.5)*2*widthRatio;
    const modelZ = lat => ((modelBounds.north-lat)/(modelBounds.north-modelBounds.south)-.5)*2;
    const xs = longitudes.map(modelX), zs = latitudes.map(modelZ);
    function sampleIndex(values, value, direction=1) {
      const target=value*direction;
      if(target<=values[0]*direction)return 0;
      if(target>=values.at(-1)*direction)return values.length-1;
      let lo=0,hi=values.length-1;
      while(hi-lo>1){const mid=(lo+hi)>>1;if(values[mid]*direction<=target)lo=mid;else hi=mid;}
      return lo+(value-values[lo])/(values[hi]-values[lo]);
    }
    const metres = (column, row) => {
      const c = Math.max(0, Math.min(columns - 1, column));
      const r = Math.max(0, Math.min(rows - 1, row));
      return heights[r * columns + c];
    };
    const toY = (m) => ((m + base - (source.modelBaseMetres ?? base)) / halfDepth) * exaggeration;

    // Model space: x east, z south, both scaled so the north-south extent spans -1..1.
    function toModel(lon, lat, lift = 0) {
      const column = sampleIndex(longitudes,lon);
      const row = sampleIndex(latitudes,lat,-1);
      const c0 = Math.floor(column), r0 = Math.floor(row);
      const tc = column - c0, tr = row - r0;
      const h = (metres(c0, r0) * (1 - tc) + metres(c0 + 1, r0) * tc) * (1 - tr) +
        (metres(c0, r0 + 1) * (1 - tc) + metres(c0 + 1, r0 + 1) * tc) * tr;
      return [modelX(lon), toY(h + lift), modelZ(lat)];
    }

    const range = Math.max(1, (source.coreRangeMetres || source.realRangeMetres)[1] - (source.coreRangeMetres || source.realRangeMetres)[0]);
    const positions = [], normals = [], height = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const m = metres(column, row);
        positions.push(xs[column], toY(m), zs[row]);
        height.push((m + base - (source.modelBaseMetres ?? base)) / range);
        const gx = (toY(metres(column + 1, row)) - toY(metres(column - 1, row))) / (xs[Math.min(columns-1,column+1)]-xs[Math.max(0,column-1)]);
        const gz = (toY(metres(column, row + 1)) - toY(metres(column, row - 1))) / (zs[Math.min(rows-1,row+1)]-zs[Math.max(0,row-1)]);
        const length = Math.hypot(gx, 1, gz);
        normals.push(-gx / length, 1 / length, -gz / length);
      }
    }
    // Row strips keep every index within WebGL 1's unsigned-short limit.
    const chunks = [];
    const stripRows = Math.floor(65536 / columns) - 1;
    for (let first = 0; first < rows - 1; first += stripRows) {
      const indices = [];
      const last = Math.min(rows - 1, first + stripRows);
      for (let row = first; row < last; row++) {
        for (let column = 0; column < columns - 1; column++) {
          const a = (row - first) * columns + column;
          indices.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
        }
      }
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      chunks.push({indexBuffer, count: indices.length, offset: first * columns});
    }
    const buffer = (values) => {
      const handle = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, handle);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
      return handle;
    };
    return {
      bounds: modelBounds, widthRatio, toModel, edgeStart, metresPerModel: halfDepth,
      buffers: [[buffer(positions), 3], [buffer(normals), 3], [buffer(height), 1]],
      chunks
    };
  }

  const terrains = {
    local: buildTerrain(data.local, { exaggeration: 2.2, edgeStart: 0.82 }),
    regional: buildTerrain(data.regional, { exaggeration: 2.6, edgeStart: 1 })
  };

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

  // North-up view that keeps every given point inside the frame.
  function fitNorthUp(key, points, { tilt = 0.4, fov = 40, fog = [3, 8], margin = [0.7, 0.62] } = {}) {
    const terrain = terrains[key];
    const model = points.map(([lon, lat]) => terrain.toModel(lon, lat));
    const xs = model.map((p) => p[0]), zs = model.map((p) => p[2]);
    const span = Math.max(0.08, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)));
    const mid = [(Math.max(...xs) + Math.min(...xs)) / 2, 0, (Math.max(...zs) + Math.min(...zs)) / 2];
    const aspect = aspectNow();
    const build = (distance) => ({ eye: [mid[0], distance * 0.94, mid[2] + distance * tilt], target: [mid[0], 0, mid[2]] });
    const fits = (distance) => {
      const { eye, target } = build(distance);
      const matrix = multiply(perspective((fov * Math.PI) / 180, aspect, 0.01, 30), lookAt(eye, target));
      return model.every((p) => { const [cx, cy, cw] = clip(matrix, p); return cw > 0 && Math.abs(cx / cw) < margin[0] && Math.abs(cy / cw) < margin[1]; });
    };
    let low = span * 0.2, high = span * 6;
    for (let step = 0; step < 24; step += 1) { const middle = (low + high) / 2; if (fits(middle)) high = middle; else low = middle; }
    return { terrain: key, ...build(high), fov, fade: 1, fog };
  }
  // An oblique view from a compass bearing (degrees, 0 = from the south looking north) at a given distance.
  function oblique(key, [lon, lat], { bearing = 0, distance = 1.4, height = 0.7, fov = 40, fog = [1.5, 4] }) {
    const target = terrains[key].toModel(lon, lat);
    const a = (bearing * Math.PI) / 180;
    return { terrain: key, eye: [target[0] - Math.sin(a) * distance, target[1] + height, target[2] + Math.cos(a) * distance], target, fov, fade: 1, fog };
  }
  const lonlat = (p) => [p.lon, p.lat];
  let level = 1;
  let progress = 0;

  // Section one climbs with the reader: the camera walks the footprint route, a little behind and above,
  // looking ahead up the slope. `t` is how far through the section the reader is (0-1).
  const route = geography.features.route;
  const routeAt = (t) => {
    const at = Math.max(0, Math.min(1, t)) * (route.length - 1), i = Math.floor(at), f = at - i;
    const a = route[i], b = route[Math.min(route.length - 1, i + 1)];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  function climbCamera(t) {
    const terrain = terrains.local;
    const s = 0.08 + Math.max(0, Math.min(1, t)) * 0.84;
    const here = terrain.toModel(...routeAt(s));
    const ahead = terrain.toModel(...routeAt(Math.min(1, s + 0.16)));
    const back = terrain.toModel(...routeAt(Math.max(0, s - 0.08)));
    let dx = ahead[0] - back[0], dz = ahead[2] - back[2];
    const length = Math.hypot(dx, dz) || 1;
    dx /= length; dz /= length;
    return {
      terrain: "local",
      eye: [here[0] - dx * 0.42, here[1] + 0.3, here[2] - dz * 0.42],
      target: [ahead[0] + dx * 0.1, ahead[1] + 0.02, ahead[2] + dz * 0.1],
      fov: 46, fade: 1, fog: [1.1, 3.2]
    };
  }
  function cameraFor(level) {
    const peak = lonlat(place("peak")), spring = lonlat(place("spring"));
    if (level === 2) {
      // a box around Dunhuang, the spring, Mogao and Yulin, with room above and below so the relief fills the panel
      return fitNorthUp("regional", [[94.5, 39.8], [96.02, 39.8], [94.5, 40.32], [96.02, 40.32]], { tilt: 0.45, margin: [0.86, 0.8] });
    }
    // one: the dune field from the south-east; three: down toward the spring; four: low beside the water
    if (level === 3) return oblique("local", [(peak[0] + spring[0]) / 2, (peak[1] + spring[1]) / 2], { bearing: -25, distance: 0.8, height: 0.55, fov: 40, fog: [1, 3] });
    if (level === 4) return oblique("local", spring, { bearing: 20, distance: 0.42, height: 0.28, fov: 44, fog: [0.6, 2] });
    return climbCamera(progress);
  }
  const copyCamera = (camera) => ({ ...camera, eye: [...camera.eye], target: [...camera.target], fog: [...camera.fog] });

  let fittedAspect = aspectNow();
  let current = copyCamera(cameraFor(1));
  let goal = copyCamera(current);
  let mvp = null;
  let swayEye = null;
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
    const [cx, cy, cw] = clip(mvp, terrains[current.terrain].toModel(lon, lat, lift));
    if (cw <= 0.02) return { x: 0, y: 0, w: cw, visible: false };
    const nx = cx / cw, ny = cy / cw;
    return { x: (nx * 0.5 + 0.5) * canvas.clientWidth, y: (0.5 - ny * 0.5) * canvas.clientHeight, w: cw, visible: Math.abs(nx) < 1.2 && Math.abs(ny) < 1.2 };
  }

  // Where north points on screen, and how many metres one pixel spans, measured at the middle of the view.
  function measure() {
    const t = terrains[current.terrain];
    const b = t.bounds;
    // the terrain point under the screen centre is approximated by the camera target
    const lon = b.west + ((current.target[0] / t.widthRatio) / 2 + 0.5) * (b.east - b.west);
    const lat = b.north - (current.target[2] / 2 + 0.5) * (b.north - b.south);
    const a = project(lon, lat);
    const metresPerDegreeLon = 111320 * Math.cos((lat * Math.PI) / 180);
    const dLon = 500 / metresPerDegreeLon;
    const e = project(lon + dLon, lat);
    // The arrow shows the camera's heading (the usual convention for 3D maps): looking north-west, north is
    // up and to the right. The projected direction of north is misleading in a low oblique view.
    const eye = swayEye || current.eye;
    const heading = Math.atan2(current.target[0] - eye[0], -(current.target[2] - eye[2]));
    return {
      north: -heading,
      metresPerPixel: 500 / Math.max(0.5, Math.hypot(e.x - a.x, e.y - a.y)),
      centre: a
    };
  }

  const approach = (from, to, amount) => from + (to - from) * amount;

  function render(time = 0) {
    resize();
    if (goal.terrain !== current.terrain) current = { ...copyCamera(goal), fade: 0 };
    const amount = reduced() ? 1 : 0.06;
    current.eye = current.eye.map((value, index) => approach(value, goal.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, goal.target[index], amount));
    current.fov = approach(current.fov, goal.fov, amount);
    current.fade = approach(current.fade, goal.fade, reduced() ? 1 : 0.07);
    current.fog = current.fog.map((value, index) => approach(value, goal.fog[index], amount));

    const terrain = terrains[current.terrain];
    // The slow sway of the first version: the eye circles a few degrees around the target and back.
    // Labels, the north arrow and the scale bar are projected with the same matrix, so they sway with it.
    const sway = reduced() ? 0 : Math.sin(time * 0.00016) * (current.terrain === "regional" ? 0.025 : 0.06);
    const ox = current.eye[0] - current.target[0], oz = current.eye[2] - current.target[2];
    const eye = [current.target[0] + ox * Math.cos(sway) - oz * Math.sin(sway), current.eye[1], current.target[2] + ox * Math.sin(sway) + oz * Math.cos(sway)];
    swayEye = eye;
    mvp = multiply(perspective((current.fov * Math.PI) / 180, canvas.width / canvas.height, 0.005, 30), lookAt(eye, current.target));

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniformMatrix4fv(u.mvp, false, new Float32Array(mvp));
    gl.uniform1f(u.widthRatio, terrain.widthRatio);
    gl.uniform1f(u.lightShift, (reduced() ? 0 : Math.sin(time * 0.00011) * 0.16) + progress * 0.08);
    gl.uniform1f(u.fade, current.fade);
    gl.uniform2f(u.fog, current.fog[0], current.fog[1]);
    gl.uniform1f(u.edgeStart, terrain.edgeStart);
    for (const chunk of terrain.chunks) {
      terrain.buffers.forEach(([handle, size], index) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, handle);
        gl.vertexAttribPointer(attributes[index], size, gl.FLOAT, false, 0, chunk.offset * size * 4);
      });
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indexBuffer);
      gl.drawElements(gl.TRIANGLES, chunk.count, gl.UNSIGNED_SHORT, 0);
    }

    const view = { terrain: current.terrain, ...measure() };
    listeners.forEach((listener) => listener(project, view));
    window.requestAnimationFrame(render);
  }

  window.SECRET_SPRING_TERRAIN_RENDERER = {
    setState(next) {
      level = Math.max(1, Math.min(4, next));
      goal = copyCamera(cameraFor(level));
    },
    setProgress(value) {
      progress = Math.max(0, Math.min(1, value));
      if (level === 1) goal = copyCamera(cameraFor(1));
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("webgl-ready");
  window.addEventListener("resize", resize);
  window.requestAnimationFrame(render);
})();
