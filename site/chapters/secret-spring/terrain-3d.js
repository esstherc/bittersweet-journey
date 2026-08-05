(() => {
  "use strict";

  const terrain = window.SECRET_SPRING_TERRAIN;
  const canvas = document.querySelector(".terrain-canvas");
  if (!terrain || !canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true
  });
  if (!gl) {
    document.body.classList.add("webgl-fallback");
    return;
  }

  const decode = (encoded) => {
    const binary = window.atob(encoded);
    const values = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      values[index] = binary.charCodeAt(index);
    }
    return values;
  };

  const heights = decode(terrain.heights);
  const mask = decode(terrain.mask);
  const columns = terrain.columns;
  const rows = terrain.rows;
  const widthRatio = ((columns - 1) * terrain.cellSizeMetres) /
    ((rows - 1) * terrain.cellSizeMetres);
  const verticalScale = 0.32;

  const heightAt = (column, row) => {
    const safeColumn = Math.max(0, Math.min(columns - 1, column));
    const safeRow = Math.max(0, Math.min(rows - 1, row));
    return heights[safeRow * columns + safeColumn] / 255;
  };

  const positions = [];
  const normals = [];
  const elevation = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const x = ((column / (columns - 1)) - 0.5) * 2 * widthRatio;
      const z = ((row / (rows - 1)) - 0.5) * 2;
      const y = heights[index] / 255 * verticalScale;
      positions.push(x, y, z);
      elevation.push(heights[index] / 255);

      const dx = heightAt(column + 1, row) - heightAt(column - 1, row);
      const dz = heightAt(column, row + 1) - heightAt(column, row - 1);
      const nx = -dx * 8.5;
      const ny = 1;
      const nz = -dz * 8.5;
      const length = Math.hypot(nx, ny, nz);
      normals.push(nx / length, ny / length, nz / length);
    }
  }

  const indices = [];
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const a = row * columns + column;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      if (mask[a] && mask[b] && mask[c] && mask[d]) {
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aElevation;
    uniform mat4 uMvp;
    varying vec3 vNormal;
    varying float vElevation;
    varying float vDistance;
    varying float vEdge;

    void main() {
      vec4 projected = uMvp * vec4(aPosition, 1.0);
      gl_Position = projected;
      vNormal = aNormal;
      vElevation = aElevation;
      vDistance = projected.z / projected.w;
      vEdge = max(abs(aPosition.x) / 0.97, abs(aPosition.z));
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vElevation;
    varying float vDistance;
    varying float vEdge;
    uniform float uLightShift;

    void main() {
      vec3 light = normalize(vec3(-0.48 + uLightShift, 0.78, 0.38));
      float diffuse = max(dot(normalize(vNormal), light), 0.0);
      float ridge = smoothstep(0.38, 0.9, vElevation);
      vec3 lowSand = vec3(0.47, 0.38, 0.27);
      vec3 highSand = vec3(0.84, 0.73, 0.54);
      vec3 color = mix(lowSand, highSand, ridge);
      color *= 0.58 + diffuse * 0.58;
      float fog = smoothstep(0.1, 0.98, vDistance);
      color = mix(color, vec3(0.91, 0.87, 0.78), fog * 0.48);
      float edgeAlpha = 1.0 - smoothstep(0.80, 1.0, vEdge);
      gl_FragColor = vec4(color, 0.94 * edgeAlpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Shader link failed");
  }
  gl.useProgram(program);

  function bindAttribute(name, values, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  bindAttribute("aPosition", positions, 3);
  bindAttribute("aNormal", normals, 3);
  bindAttribute("aElevation", elevation, 1);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const mvpLocation = gl.getUniformLocation(program, "uMvp");
  const lightShiftLocation = gl.getUniformLocation(program, "uLightShift");

  function perspective(fieldOfView, aspect, near, far) {
    const f = 1 / Math.tan(fieldOfView / 2);
    const range = 1 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * range, -1,
      0, 0, near * far * range * 2, 0
    ];
  }

  function lookAt(eye, center, up) {
    let zx = eye[0] - center[0];
    let zy = eye[1] - center[1];
    let zz = eye[2] - center[2];
    let length = Math.hypot(zx, zy, zz);
    zx /= length; zy /= length; zz /= length;

    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    length = Math.hypot(xx, xy, xz);
    xx /= length; xy /= length; xz /= length;

    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;
    return [
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ];
  }

  function multiply(a, b) {
    const output = new Array(16).fill(0);
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        for (let index = 0; index < 4; index += 1) {
          output[column * 4 + row] += a[index * 4 + row] * b[column * 4 + index];
        }
      }
    }
    return output;
  }

  const cameras = [
    { eye: [1.45, 1.05, 2.05], target: [-0.12, 0.12, 0.02], fov: 39 },
    { eye: [0.15, 2.55, 2.8], target: [0, 0.12, 0], fov: 42 },
    { eye: [0.65, 1.22, 1.28], target: [0.02, 0.08, 0.02], fov: 43 },
    { eye: [-0.42, 0.87, 1.04], target: [0.01, 0.05, -0.02], fov: 46 }
  ];
  let current = JSON.parse(JSON.stringify(cameras[0]));
  let target = JSON.parse(JSON.stringify(cameras[0]));
  let sectionProgress = 0;
  let requestedFrame = null;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function approach(currentValue, targetValue, amount) {
    return currentValue + (targetValue - currentValue) * amount;
  }

  function render(time = 0) {
    requestedFrame = null;
    resize();
    const amount = 0.065;
    current.eye = current.eye.map((value, index) => approach(value, target.eye[index], amount));
    current.target = current.target.map((value, index) => approach(value, target.target[index], amount));
    current.fov = approach(current.fov, target.fov, amount);

    const drift = Math.sin(time * 0.00016) * 0.018;
    const eye = [current.eye[0] + drift, current.eye[1], current.eye[2]];
    const projection = perspective(
      current.fov * Math.PI / 180,
      canvas.width / canvas.height,
      0.05,
      10
    );
    const view = lookAt(eye, current.target, [0, 1, 0]);
    const mvp = multiply(projection, view);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix4fv(mvpLocation, false, new Float32Array(mvp));
    gl.uniform1f(lightShiftLocation, Math.sin(time * 0.00011) * 0.16 + sectionProgress * 0.08);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestedFrame = window.requestAnimationFrame(render);
  }

  const renderer = {
    setState(level) {
      const index = Math.max(0, Math.min(cameras.length - 1, level - 1));
      target = JSON.parse(JSON.stringify(cameras[index]));
      if (requestedFrame === null) requestedFrame = window.requestAnimationFrame(render);
    },
    setProgress(progress) {
      sectionProgress = Math.max(0, Math.min(1, progress));
    }
  };

  window.SECRET_SPRING_TERRAIN_RENDERER = renderer;
  document.body.classList.add("webgl-ready");
  renderer.setState(1);
  window.addEventListener("resize", resize);
})();
