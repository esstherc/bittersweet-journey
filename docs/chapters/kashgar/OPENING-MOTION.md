# Kashgar opening — painted atmosphere

The opening uses an original generated mineral-pigment/watercolor landscape and a local WebGL shader. It replaces the earlier inline geometric SVG. The composition evokes the snowy mountains, desert and poplars of the Kashgar chapter; it is an atmospheric illustration, not a geographical reconstruction.

## Assets and implementation

- Built-in `imagegen` generated the original artwork; no third-party reference media was copied.
- Delivered image: `site/chapters/kashgar/assets/opening-pamir.jpg`, 1672 × 941, 397,885 bytes. JPEG encoding quality 88; source image retained at its generated location.
- Renderer: `site/chapters/kashgar/opening-landscape.js`.
- Responsive composition: `site/chapters/kashgar/opening-landscape.css`.
- Uses native WebGL, not Three.js. One full-screen plane and a fragment shader are sufficient; no CDN/runtime dependency.
- Three-octave procedural noise creates two drifting fog layers and elongated sand veils. Restrained foliage displacement and smoothed pointer parallax add depth. The sky and typography remain still.
- Cap rendering at 30 fps, with pixel ratio capped at 1.5 on desktop and 1 on mobile.
- Stop rendering when paused, hidden or the opening dialog closes. Preserve elapsed time on resume.
- Reduced-motion users see the original still image, with no GPU initialization on a cold load.
- Context loss falls back to the still image; restoration rebuilds the renderer. A real page unload releases GPU resources; BFCache pauses/resumes the same scene.
- The shared chapter header, language controls, Begin action and map transition remain shared with the other chapters.

## Final generation prompt

Create a finished museum-quality cinematic painted landscape background for a literary travel website about Kashgar, western China. Ultra wide landscape aspect ratio 16:9, highest available detail. This is a background only: absolutely NO text, letters, logo, frame or interface. The composition must leave the entire upper 58 percent and the central middle region luminous warm ivory parchment sky, softly atmospheric, nearly empty for overlay typography. In the bottom 42 percent, render an exquisitely detailed naturalistic Chinese mineral-pigment and watercolor panorama: distant Pamir-like jagged snow peaks on the far LEFT horizon, small hazy teal-grey mountain ridges fading toward an open center, sunlit ochre sand dunes gently unfurling across the foreground, a tiny pale jade stream curving subtly into the far distance, a handful of slender mature golden desert poplar trees in the far RIGHT lower corner with intricate twisting dark trunks and thousands of delicately painted leaves, a smaller tree cluster in lower left. An asymmetric masterfully composed landscape, immense open space and silence. Restrained palette: warm ivory #eee7d8 and cream, slate teal #657e79, muted honey-gold and raw sienna. Sophisticated fine brushwork, granular pigment texture, translucent atmospheric depth, warm soft morning light, subtle luminous fog between mountain layers. Detailed painterly realism with the refinement of an illustrated fine art travel book, NOT cartoon, NOT vector art, NOT flat geometric shapes, NOT polygon mountains, NOT 3D render, NOT fantasy, NOT oversaturated, no orange sunset. The terrain blends softly into blank sky; no hard horizontal division. Keep darkest details at the lower outer edges. Calm elegant contemplative fine art.

## Validation

- Ego browser: shader compiled and rendered; WebGL error 0.
- Animation frame count advances while running and remains unchanged while paused or reduced motion is enabled.
- Cold reduced-motion load: zero rendered frames, still image loaded.
- At 390 × 844, Chinese/English titles and action fit without horizontal overflow.
- Entering the text closes the dialog, stops rendering and returns the shared header to the body.
- Simulated context loss displays the still image; context restoration resumes rendering.
- Dujiangyan retains its plain title leaf and has no landscape controls.
- `node tools/test_page_transition.cjs` and `python3 tools/verify_kashgar.py` pass; both complete original texts and all geographic source/geometry checks are preserved.
