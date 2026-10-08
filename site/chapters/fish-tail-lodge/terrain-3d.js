/*
  鱼尾山屋 - WebGL terrain from Copernicus DEM GLO-90 (tools/build_fish_tail_lodge_geodata.py).
  Three terrains: "pokhara" (part 1), "wide" (the Mediterranean to the Pacific, parts 2-4) and
  "border" (Kathmandu to Zhangmu, parts 5-6). Based on the 阳关雪 renderer; kept separate on purpose.
  Exposes window.FISHTAIL_TERRAIN_RENDERER:
    setState(level)        1-6: terrain + camera for the reading part
    setProgress(p)         0-1 through the current part (part 1: evening, night, dawn; part 4: zoom to Nepal)
    onFrame(callback)      callback(project, view) every frame
                           project(lon, lat, liftMetres) -> {x, y, w, visible}
                           view = { terrain, north, night, glow, zoomedToNepal }
*/
(() => {
  "use strict";

  const data = window.FISHTAIL_TERRAIN;
  const geography = window.FISHTAIL_GEOGRAPHY;
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
    uniform vec4 uEdgeBounds;
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
      vec2 edge = abs((aPosition.xz - uEdgeBounds.xy) / uEdgeBounds.zw);
      vEdge = max(edge.x, edge.y);
    }
  `;
  // Light colours throughout, so the dark-blue rivers and red lines stay readable (same rule as 阳关雪).
  const fragmentShader = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vHeightKm;
    varying float vDepth;
    varying float vEdge;
    uniform float uFade;
    uniform float uSea;
    uniform float uEdgeStart;
    uniform float uSnowline;
    uniform float uNight;
    uniform float uGlow;
    uniform vec2 uFog;
    uniform float uWash;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 light = normalize(vec3(-0.6, 0.55, -0.45));
      float diffuse = max(dot(normal, light), 0.0);
      vec3 low = vec3(0.80, 0.85, 0.76);      // valleys and plains: pale green
      vec3 mid = vec3(0.90, 0.87, 0.80);      // hills and plateaus: pale sand
      vec3 snow = vec3(0.97, 0.975, 0.98);
      vec3 base = mix(low, mid, smoothstep(0.9, 2.2, vHeightKm));
      base = mix(base, snow, smoothstep(uSnowline - 0.4, uSnowline + 0.2, vHeightKm));
      vec3 color = base * (0.8 + diffuse * 0.26);
      // Parts two and three: the ancient sites read over a paler land; the sea keeps its tint.
      color = mix(color, vec3(0.975, 0.97, 0.955), uWash);
      if (vHeightKm < uSea) color = vec3(0.84, 0.88, 0.90);
      // Part one: evening, night, then the sunrise that reddens the peaks first.
      float peak = smoothstep(4.6, 6.4, vHeightKm);
      color = mix(color, vec3(0.93, 0.62, 0.52) * (0.75 + diffuse * 0.35), uGlow * peak * 0.85);
      color = mix(color, vec3(0.20, 0.24, 0.33) * (0.6 + diffuse * 0.5), uNight * 0.78);
      float fog = smoothstep(uFog.x, uFog.y, vDepth);
      color = mix(color, mix(vec3(0.90, 0.91, 0.92), vec3(0.26, 0.29, 0.36), uNight), fog * 0.7);
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
    mvp: uniform("uMvp"), edgeBounds: uniform("uEdgeBounds"), fade: uniform("uFade"), sea: uniform("uSea"),
    edgeStart: uniform("uEdgeStart"), snowline: uniform("uSnowline"), night: uniform("uNight"),
    glow: uniform("uGlow"), fog: uniform("uFog"), wash: uniform("uWash")
  };
  const attributes = ["aPosition", "aNormal", "aHeightKm"].map((name) => gl.getAttribLocation(program, name));
  attributes.forEach((location) => gl.enableVertexAttribArray(location));

  /* ---------- terrain meshes ---------- */

  function buildTerrain(source, { exaggeration, edgeStart, sea, snowline }) {
    const binary = window.atob(source.heights);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const heights = new Uint16Array(bytes.buffer); // metres above baseMetres, little-endian
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
    const edgeBounds = [(xs[0]+xs.at(-1))/2,(zs[0]+zs.at(-1))/2,(xs.at(-1)-xs[0])/2,(zs.at(-1)-zs[0])/2];
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

    const positions = [], normals = [], heightKm = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const m = metres(column, row);
        positions.push(xs[column], toY(m), zs[row]);
        heightKm.push((m + base) / 1000);
        const gx = (toY(metres(column + 1, row)) - toY(metres(column - 1, row))) / (xs[Math.min(columns-1,column+1)]-xs[Math.max(0,column-1)]);
        const gz = (toY(metres(column, row + 1)) - toY(metres(column, row - 1))) / (zs[Math.min(rows-1,row+1)]-zs[Math.max(0,row-1)]);
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
      bounds: modelBounds, widthRatio, edgeBounds, toModel, edgeStart, snowline,
      sea: sea ? 0.001 : -1,
      buffers: [[buffer(positions), 3], [buffer(normals), 3], [buffer(heightKm), 1]],
      indexBuffer,
      count: indices.length
    };
  }

  const terrains = {
    pokhara: buildTerrain(data.pokhara, { exaggeration: 1.25, edgeStart: 1, sea: false, snowline: 4.9 }),
    border: buildTerrain(data.border, { exaggeration: 1.6, edgeStart: 1, sea: false, snowline: 5.0 }),
    wide: buildTerrain(data.wide, { exaggeration: 30, edgeStart: 0.92, sea: true, snowline: 5.2 })
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

  const aspectNow = () => Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight));

  // North-up view from high above that keeps every point inside the frame (as in 阳关雪 part one).
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

  // Part one: from high above the south shore, looking north over the lodge and lake to
  // Machhapuchhre and the Annapurna wall (lodge in the lower third, the peaks in the upper).
  const pokhara = terrains.pokhara;
  const lodgeModel = pokhara.toModel(place("lodge").lon, place("lodge").lat);
  const peakModel = pokhara.toModel(place("machhapuchhre").lon, place("machhapuchhre").lat);
  const partOne = {
    terrain: "pokhara",
    eye: [lodgeModel[0] - 0.05, lodgeModel[1] + 0.55, lodgeModel[2] + 0.8],
    target: [(lodgeModel[0] + peakModel[0]) / 2, 0.08, 0.05],
    fov: 44, fade: 1, fog: [1.6, 4.2]
  };

  // Part six: a closer, more oblique look at the gorge around the bridge and Zhangmu (about 25 km across).
  const bridgePlace = place("bridge");
  const gorge = [[-0.12, -0.1], [0.12, -0.1], [-0.12, 0.1], [0.12, 0.1]].map(([dx, dy]) => [bridgePlace.lon + dx, bridgePlace.lat + dy]);

  const sites = geography.places.filter((p) => p.section);
  let wideFocusIds = [];

  function wideCamera(ids, fallback) {
    const chosen = (ids.length ? ids : fallback)
      .map((id) => place(id))
      .filter(Boolean)
      .map(lonlat);
    const lons = chosen.map(([lon]) => lon);
    const lats = chosen.map(([, lat]) => lat);
    const west = Math.min(...lons), east = Math.max(...lons);
    const south = Math.min(...lats), north = Math.max(...lats);
    const lonPad = Math.max(3.8, (east - west) * 0.24);
    const latPad = Math.max(2.8, (north - south) * 0.34);
    const bounds = terrains.wide.bounds;
    const frame = [
      [Math.max(bounds.west, west - lonPad), Math.max(bounds.south, south - latPad)],
      [Math.min(bounds.east, east + lonPad), Math.min(bounds.north, north + latPad)]
    ];
    return fitNorthUp("wide", frame, { tilt: 0.28, margin: [0.72, 0.68] });
  }

  function cameraFor(level, progress) {
    const lodge = lonlat(place("lodge"));
    if (level === 1) return partOne;
    if (level === 2) return wideCamera(wideFocusIds, sites.filter((p) => p.section === 2).map((p) => p.id));
    if (level === 3) return wideCamera(wideFocusIds, sites.filter((p) => p.section === 3).map((p) => p.id));
    if (level === 4) {
      if (progress > 0.8) {
        // the day trip to Lumbini, closing part four
        return fitNorthUp("wide", [lodge, lonlat(place("lumbini")), lonlat(place("kathmandu"))], { margin: [0.25, 0.22] });
      }
      const w = geography.wide;
      return fitNorthUp("wide", [lodge, ...w.regions.map((r) => r.label), ...w.seas.map((s) => s.label)]);
    }
    if (level === 5) return fitNorthUp("border", [lonlat(place("kathmandu")), lonlat(place("bridge"))], { tilt: 0.42 });
    return fitNorthUp("border", [...gorge, lonlat(place("zhangmu"))], { tilt: 0.75, fov: 36, margin: [0.8, 0.8] });
  }
  const copyCamera = (camera) => ({ ...camera, eye: [...camera.eye], target: [...camera.target], fog: [...camera.fog] });

  let level = 1;
  let progress = 0;
  let zoomed = false;
  let fittedAspect = aspectNow();
  let current = copyCamera(cameraFor(1, 0));
  let goal = copyCamera(current);
  let mvp = null;
  let night = 0, glow = 0, wash = 0;
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
        goal = copyCamera(cameraFor(level, progress));
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
    const p = place("lodge");
    const anchor = current.terrain === "border" ? place("bridge") : p;
    const span = t.bounds.north - t.bounds.south;
    const a = project(anchor.lon, anchor.lat, 0);
    const b = project(anchor.lon, anchor.lat + span * 0.04, 0);
    return Math.atan2(b.x - a.x, a.y - b.y);
  }

  // Part one follows the essay's evening, night and dawn (paragraphs 3-8).
  function mood() {
    if (level !== 1) return [0, 0];
    const p = progress;
    const nightTarget = p < 0.18 ? 0 : p < 0.32 ? (p - 0.18) / 0.14 : p < 0.6 ? 1 : p < 0.74 ? 1 - (p - 0.6) / 0.14 : 0;
    const glowTarget = p < 0.58 ? 0 : p < 0.7 ? (p - 0.58) / 0.12 : p < 0.86 ? 1 : Math.max(0, 1 - (p - 0.86) / 0.1);
    return [nightTarget, glowTarget];
  }

  const approach = (from, to, amount) => from + (to - from) * amount;

  function render() {
    resize();
    if (goal.terrain !== current.terrain) current = { ...copyCamera(goal), fade: 0 };
    const amount = reduced() ? 1 : 0.055;
    current.eye = current.eye.map((value, index) => approach(value, goal.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, goal.target[index], amount));
    current.fov = approach(current.fov, goal.fov, amount);
    current.fade = approach(current.fade, goal.fade, amount);
    current.fog = current.fog.map((value, index) => approach(value, goal.fog[index], amount));
    const [nightTarget, glowTarget] = mood();
    night = approach(night, nightTarget, reduced() ? 1 : 0.04);
    glow = approach(glow, glowTarget, reduced() ? 1 : 0.04);
    wash = approach(wash, level === 2 || level === 3 ? 0.38 : 0, reduced() ? 1 : 0.05);

    const terrain = terrains[current.terrain];
    mvp = multiply(perspective((current.fov * Math.PI) / 180, canvas.width / canvas.height, 0.005, 30), lookAt(current.eye, current.target));

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
    gl.uniform4fv(u.edgeBounds, terrain.edgeBounds);
    gl.uniform1f(u.fade, current.fade);
    gl.uniform1f(u.sea, terrain.sea);
    gl.uniform1f(u.edgeStart, terrain.edgeStart);
    gl.uniform1f(u.snowline, terrain.snowline);
    gl.uniform1f(u.night, night);
    gl.uniform1f(u.glow, glow);
    gl.uniform1f(u.wash, wash);
    gl.uniform2f(u.fog, current.fog[0], current.fog[1]);
    gl.drawElements(gl.TRIANGLES, terrain.count, gl.UNSIGNED_SHORT, 0);

    const view = { terrain: current.terrain, north: northAngle(), night, glow, zoomedToNepal: zoomed };
    listeners.forEach((listener) => listener(project, view));
    window.requestAnimationFrame(render);
  }

  window.FISHTAIL_TERRAIN_RENDERER = {
    setState(next) {
      level = next;
      zoomed = false;
      wideFocusIds = [];
      goal = copyCamera(cameraFor(level, 0));
    },
    setWideFocus(ids) {
      if (level !== 2 && level !== 3) return;
      const next = [...new Set(ids)].filter((id) => place(id)?.section === level);
      if (next.length === wideFocusIds.length && next.every((id, index) => id === wideFocusIds[index])) return;
      wideFocusIds = next;
      goal = copyCamera(cameraFor(level, progress));
    },
    setProgress(value) {
      progress = Math.max(0, Math.min(1, value));
      const zoom = level === 4 && progress > 0.8;
      if (zoom !== zoomed) {
        zoomed = zoom;
        goal = copyCamera(cameraFor(level, progress));
      }
    },
    onFrame(listener) {
      listeners.push(listener);
    }
  };
  document.body.classList.add("webgl-ready");
  window.requestAnimationFrame(render);
})();
