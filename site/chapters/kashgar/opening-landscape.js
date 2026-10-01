/* GPU atmosphere over an original painting; no external runtime dependency. */
(() => {
  'use strict';
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
  `;
  const fragment = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 uv;
    uniform sampler2D painting;
    uniform vec2 crop;
    uniform vec2 pointer;
    uniform float time;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1.,0.)), f.x),
                 mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y);
    }
    float cloud(vec2 p) {
      return .57 * noise(p) + .28 * noise(p * 2.03 + 13.) + .15 * noise(p * 4.07 + 31.);
    }
    void main() {
      vec2 p = (vec2(uv.x, 1. - uv.y) - .5) * crop + .5;
      float depth = smoothstep(.38, 1., p.y);
      p = (p - .5) * .991 + .5;
      p += (pointer * .002 + vec2(sin(time * .065), cos(time * .048)) * .0007) * depth;
      vec3 base = texture2D(painting, vec2(p.x, 1. - p.y)).rgb;
      // The breeze moves warm foliage at the margins, leaving rocks still.
      float gold = smoothstep(.06, .22, base.r - base.b);
      float edge = smoothstep(.73, .94, p.x) + 1. - smoothstep(.04, .15, p.x);
      float leaves = gold * edge * (1. - smoothstep(.52, .96, p.y)) * smoothstep(.28, .48, p.y);
      p.x += sin(time * .82 + p.y * 18.) * sin(p.y * 9. + time * .23) * .0028 * leaves;
      base = texture2D(painting, vec2(p.x, 1. - p.y)).rgb;
      // Distinct banks translate across the ridges, rather than merely changing
      // the brightness of an almost-white valley. Wrap only beyond the artwork.
      float fog = 0.;
      for (int i = 0; i < 3; i++) {
        float n = float(i);
        float travel = fract(time * (.019 + n * .003) + .19 + n * .31);
        float center = travel * 1.8 - .4;
        float localX = p.x - center;
        float ridge = .655 + n * .045 + .024 * sin(p.x * 6. + n * 2.);
        float billow = cloud(vec2(localX * 12. + n * 17., p.y * 31. + time * .035));
        float height = .012 + billow * .022;
        float ribbon = exp(-pow((p.y - ridge + (billow - .5) * .024) / height, 2.));
        float envelope = exp(-pow(localX / .19, 2.));
        fog += ribbon * envelope * (.45 + billow * .55);
      }
      base = mix(base, vec3(.97, .955, .90), min(.70, fog * .85));
      // Sunlit spindrift: long, tapered gusts skim the foreground dunes.
      // Each has a moving head and a softer trailing plume, with no loop seam.
      float sandWind = 0.;
      for (int i = 0; i < 4; i++) {
        float n = float(i);
        float head = fract(time * (.046 + n * .004) + n * .27 + .15) * 1.8 - .4;
        float dx = p.x - head;
        float trailWidth = dx < 0. ? .18 : .065;
        float envelope = exp(-pow(dx / trailWidth, 2.));
        float line = .835 + n * .032 + .012 * sin(p.x * 9. + n * 2.);
        float grain = noise(vec2(p.x * 20. - time * 1.2, p.y * 160. + n));
        float spread = .003 + .004 * grain + max(0., -dx) * .022;
        float plume = exp(-pow((p.y - line) / spread, 2.));
        sandWind += envelope * plume * (.55 + .45 * grain);
      }
      float sandMask = smoothstep(.025, .13, p.x) * (1. - smoothstep(.67, .85, p.x));
      base = mix(base, vec3(1., .935, .76), min(.66, sandWind * .75) * sandMask);
      float light = sin(p.x * 4. + time * .12) * sin(p.y * 3. - time * .08);
      base += vec3(.010, .008, .004) * light * depth;
      gl_FragColor = vec4(base, 1.);
    }
  `;
  function mount(dialog) {
    const stage = dialog?.querySelector('.kashgar-painting');
    if (!stage || stage.dataset.mounted) return;
    stage.dataset.mounted = 'true';
    const image = stage.querySelector('img');
    const canvas = stage.querySelector('canvas');
    const leafCanvas = document.createElement('canvas');
    leafCanvas.className = 'kashgar-leaf-motion';
    stage.parentElement.append(leafCanvas);
    const leafContext = leafCanvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let gl, program, buffer, texture, uniforms, frame = 0, last = 0, elapsed = 0;
    let ready = false, failed = false, disposed = false, frames = 0;
    let leafWidth = 0, leafHeight = 0;
    const aim = {x: 0, y: 0}, cursor = {x: 0, y: 0};
    function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
    function active() {
      return ready && !failed && !disposed && dialog.open && !document.hidden &&
        !reduced.matches && !dialog.classList.contains('is-motion-paused');
    }
    function resize() {
      if (!ready) return;
      const width = stage.clientWidth, height = stage.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio || 1, innerWidth < 761 ? 1 : 1.5);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      leafWidth = stage.parentElement.clientWidth; leafHeight = stage.parentElement.clientHeight;
      leafCanvas.width = Math.round(leafWidth * ratio); leafCanvas.height = Math.round(leafHeight * ratio);
      leafContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const viewAspect = width / height, imageAspect = image.naturalWidth / image.naturalHeight;
      gl.uniform2f(uniforms.crop, Math.min(1, viewAspect / imageAspect), Math.min(1, imageAspect / viewAspect));
      draw();
    }
    function draw() {
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform2f(uniforms.pointer, cursor.x, cursor.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      drawLeaves(); frames++;
    }
    function drawLeaves() {
      if (!leafContext) return;
      const ctx = leafContext, mobile = leafWidth < 761;
      ctx.clearRect(0, 0, leafWidth, leafHeight);
      // Sparse, independently tumbling poplar leaves stay beside the trees.
      // They share the shader clock, so pause/resume never resets their paths.
      for (let i = 0; i < (mobile ? 5 : 8); i++) {
        const duration = 15 + (i * 7 % 11);
        const phase = (elapsed / duration + i * .173) % 1;
        const side = i % 4 === 0 ? -1 : 1;
        const fade = Math.min(1, phase / .12, (1 - phase) / .22);
        const drift = phase * (mobile ? 48 : 100) + Math.sin(phase * 7 + i) * 13;
        const x = side > 0 ? leafWidth * (.96 - (i % 3) * .022) - drift : leafWidth * .035 + drift * .6;
        const y = leafHeight * (side < 0 ? .79 : mobile ? .73 : .52 + (i % 3) * .045)
          + phase * leafHeight * (mobile ? .2 : .34) + Math.sin(phase * 10 + i) * 8;
        const size = (mobile ? 2.2 : 2.8) + (i % 3) * .65;
        ctx.save(); ctx.translate(x, y);
        ctx.rotate(Math.sin(phase * 9 + i) * .8 + phase * 3);
        ctx.scale(.3 + .7 * Math.abs(Math.cos(phase * 12 + i)), 1);
        ctx.globalAlpha = fade * .68;
        ctx.fillStyle = i % 2 ? '#b88a3f' : '#d1a34e';
        ctx.beginPath(); ctx.moveTo(0, size);
        ctx.bezierCurveTo(-size * 1.7, 0, -size * .9, -size * 1.5, 0, -size);
        ctx.bezierCurveTo(size * 1.2, -size * 1.3, size * 1.6, 0, 0, size);
        ctx.fill();
        ctx.strokeStyle = '#796442'; ctx.lineWidth = .45;
        ctx.beginPath(); ctx.moveTo(0, -size * .7); ctx.lineTo(0, size * 1.4); ctx.stroke();
        ctx.restore();
      }
    }
    function tick(now) {
      frame = 0;
      if (!active()) { last = 0; return; }
      // A 30 fps ceiling is enough for slow atmospheric motion.
      if (!last || now - last >= 32) {
        const dt = last ? Math.min((now - last) / 1000, .1) : 0;
        elapsed += dt; last = now;
        cursor.x += (aim.x - cursor.x) * .035;
        cursor.y += (aim.y - cursor.y) * .035;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function fallback() {
      failed = true; stop(); stage.classList.remove('is-rendered');
      leafContext?.clearRect(0, 0, leafWidth, leafHeight);
      dialog.classList.add('has-static-landscape');
    }
    function release() {
      if (!gl) return;
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      texture = buffer = program = null; ready = false;
    }
    function initialize() {
      if (ready || failed || disposed || reduced.matches || !image.naturalWidth) return;
      try {
        gl = canvas.getContext('webgl', {alpha: false, antialias: false, depth: false, powerPreference: 'low-power'});
        if (!gl) { fallback(); return; }
        const shader = (type, source) => {
          const item = gl.createShader(type);
          gl.shaderSource(item, source); gl.compileShader(item);
          if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
            gl.deleteShader(item); throw new Error('Landscape shader unavailable');
          }
          return item;
        };
        const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
        program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs);
        gl.linkProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Landscape program unavailable');
        gl.useProgram(program);
        buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        uniforms = Object.fromEntries(['time', 'crop', 'pointer'].map(name => [name, gl.getUniformLocation(program, name)]));
        gl.uniform1i(gl.getUniformLocation(program, 'painting'), 0);
        ready = true; resize(); stage.classList.add('is-rendered');
        dialog.classList.remove('has-static-landscape');
      } catch { release(); fallback(); }
    }
    function sync() {
      if (disposed) return;
      if (!ready && dialog.open && !document.hidden) initialize();
      if (active()) { if (!frame) frame = requestAnimationFrame(tick); }
      else stop();
    }
    const observer = new MutationObserver(sync);
    observer.observe(dialog, {attributes: true, attributeFilter: ['open', 'class']});
    const sizing = new ResizeObserver(resize); sizing.observe(stage);
    const move = event => {
      if (event.pointerType !== 'mouse' || !active()) return;
      aim.x = event.clientX / innerWidth * 2 - 1; aim.y = event.clientY / innerHeight * 2 - 1;
    };
    const leave = () => { aim.x = aim.y = 0; };
    dialog.addEventListener('pointermove', move, {passive: true});
    dialog.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    image.addEventListener('load', sync, {once: true});
    image.addEventListener('error', fallback, {once: true});
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); ready = false; fallback();
    });
    canvas.addEventListener('webglcontextrestored', () => { failed = false; sync(); });
    // BFCache freezes/resumes the scene; a real unload releases GPU resources.
    window.addEventListener('pagehide', event => {
      stop();
      if (event.persisted) return;
      disposed = true; observer.disconnect(); sizing.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
      dialog.removeEventListener('pointermove', move); dialog.removeEventListener('pointerleave', leave);
      release();
    });
    window.addEventListener('pageshow', sync);
    window.KASHGAR_LANDSCAPE.status = () => ({ready, running: !!frame, elapsed, frames, failed,
      reduced: reduced.matches, resolution: [canvas.width, canvas.height]});
    sync();
  }
  window.KASHGAR_LANDSCAPE = {mount};
})();
