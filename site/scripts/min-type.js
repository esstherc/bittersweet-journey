/*
  Minimum type size for map labels drawn in SVG.

  SVG maps scale with their panel, so a label sized in map units can render far smaller than its CSS
  says (a phone shrinks the homepage map to about 0.6x). This keeps every visible SVG label at 10pt
  (13.33 px) or more on screen: it measures the label's CSS size times the SVG's on-screen scale and,
  where that falls short, sets an inline size that reaches 13.5 px. HTML text is sized in the style
  sheets and is not touched.

  An element (or an ancestor) with data-min-type="off" is left alone.
*/
(() => {
  "use strict";

  const MIN_PX = 13.5;
  const FLAG = "minType";

  // On-screen scale of an SVG element; a hidden element falls back to its <svg>'s scale.
  function scaleOf(node) {
    const own = node.getScreenCTM && node.getScreenCTM();
    if (own && (own.a || own.b)) return Math.hypot(own.a, own.b);
    const svg = node.ownerSVGElement;
    const outer = svg && svg.getScreenCTM && svg.getScreenCTM();
    return outer && (outer.a || outer.b) ? Math.hypot(outer.a, outer.b) : 0;
  }

  function adjust(node) {
    if (node.closest("[data-min-type='off']")) return;
    const ours = node.dataset[FLAG] === "1";
    if (ours) node.style.removeProperty("font-size"); // measure the style sheet's size, not ours
    const css = parseFloat(window.getComputedStyle(node).fontSize);
    const scale = scaleOf(node);
    if (!css || !scale) return;
    if (css * scale < MIN_PX - 0.05) {
      node.style.setProperty("font-size", `${(MIN_PX / scale).toFixed(2)}px`);
      node.dataset[FLAG] = "1";
    } else if (ours) {
      delete node.dataset[FLAG];
    }
  }

  function run() {
    scheduled = false;
    // <text> carries the size; a <tspan>/<textPath> is checked only when its style sheet sizes it itself
    document.querySelectorAll("svg text").forEach(adjust);
    document.querySelectorAll("svg tspan[class], svg textPath[class]").forEach(adjust);
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(run);
  };

  function start() {
    run();
    window.addEventListener("resize", schedule);
    // new labels, and layer or language switches that change what is shown
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["class", "data-language", "data-reading-level"] });
    // late layout changes (fonts, transitions) settle within a few seconds
    [400, 1200, 3000].forEach((delay) => window.setTimeout(schedule, delay));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
