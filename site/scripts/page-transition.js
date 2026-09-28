(() => {
  'use strict';
  const root = document.documentElement;
  const base = new URL('../', document.currentScript.src);
  const key = 'bittersweet-journey:page-curtain';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supported = typeof HTMLDialogElement !== 'undefined' && !!Element.prototype.animate;
  // Let the browser retain the old document until the new one is ready. Running
  // our two curtain animations as well would produce a second visible refresh.
  const nativeNavigation = 'onpagereveal' in window &&
    typeof document.startViewTransition === 'function' && /^https?:$/.test(base.protocol);
  const pages = new Set(['index.html', ...['dujiangyan', 'secret-spring', 'taoist-tower', 'mountain-resort', 'yangguan', 'kashgar', 'fish-tail-lodge', 'mogao-caves'].map(name => `chapters/${name}/index.html`)]);
  let curtain, busy = false, incoming = false, animation, rescue;
  const removePending = () => { try { sessionStorage.removeItem(key); } catch {} };
  try {
    const pending = JSON.parse(sessionStorage.getItem(key) || 'null');
    incoming = !!(!nativeNavigation && supported && !reduced() && pending && pending.url === location.href && Date.now() - pending.time < 15000);
    removePending();
  } catch {}
  // Run in the head, before the target document can paint uncovered content.
  if (incoming) {
    root.classList.add('land-arriving');
  }
  function getCurtain() {
    if (curtain) return curtain;
    curtain = document.createElement('dialog');
    curtain.id = 'land-curtain';
    curtain.tabIndex = -1;
    curtain.setAttribute('aria-label', '山河显影 · 页面切换 / Changing page');
    curtain.addEventListener('cancel', event => event.preventDefault());
    document.body.append(curtain);
    return curtain;
  }
  function clearCurtain() {
    clearTimeout(rescue);
    // Close before releasing animation styles; never repaint a full sheet on exit.
    curtain?.close();
    animation?.cancel();
    animation = null;
    if (curtain) curtain.style.clipPath = 'inset(0% 100% 0% 0%)';
    root.classList.remove('land-arriving', 'land-in-transit');
    busy = false;
  }
  function showCurtain(clip) {
    const paper = getCurtain();
    // Establish the first frame before promoting the sheet to the top layer.
    paper.style.clipPath = clip;
    if (!paper.open) paper.showModal();
  }
  async function sweep(from, to) {
    const paper = getCurtain();
    paper.style.clipPath = from;
    animation?.cancel();
    const current = paper.animate([{clipPath: from}, {clipPath: to}], {
      duration: 660, easing: 'cubic-bezier(.37, 0, .63, 1)', fill: 'forwards'
    });
    animation = current;
    try { await current.finished; } catch {}
    if (animation === current) {
      // Commit the end frame, then remove this animation before starting another.
      // A filled cover animation must never remain underneath the uncover.
      paper.style.clipPath = to;
      current.cancel();
      animation = null;
    }
  }
  const painted = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  function eligible(href) {
    const url = new URL(href, location.href);
    return url.origin === base.origin && url.pathname.startsWith(base.pathname) && pages.has(url.pathname.slice(base.pathname.length)) && url.pathname !== location.pathname;
  }
  async function navigate(href) {
    if (busy) return;
    const url = new URL(href, location.href);
    if (eligible(url.href) && !url.searchParams.has('lang')) {
      url.searchParams.set('lang', document.body.dataset.language === 'en' ? 'en' : 'zh');
    }
    if (!supported || reduced() || !eligible(url.href)) { location.assign(url.href); return; }
    busy = true;
    if (nativeNavigation) {
      removePending();
      location.assign(url.href);
      rescue = setTimeout(clearCurtain, 5000);
      return;
    }
    root.classList.add('land-in-transit');
    showCurtain('inset(0% 0% 0% 100%)');
    await sweep('inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)');
    try { sessionStorage.setItem(key, JSON.stringify({url: url.href, time: Date.now()})); } catch {}
    location.assign(url.href);
    // Recover if navigation is cancelled or a destination cannot be opened.
    rescue = setTimeout(clearCurtain, 5000);
  }
  // Use the same paper motion for opening a chapter without navigating away.
  async function turnPage(reveal) {
    if (busy) return false;
    busy = true;
    try {
      if (!supported || reduced()) { reveal(); return true; }
      root.classList.add('land-in-transit');
      showCurtain('inset(0% 0% 0% 100%)');
      await sweep('inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)');
      // Swap title for reading only while the opaque paper fully covers both.
      reveal();
      await painted();
      await sweep('inset(0% 0% 0% 0%)', 'inset(0% 100% 0% 0%)');
      return true;
    } finally {
      clearCurtain();
    }
  }
  window.LAND_TRANSITION = Object.freeze({navigate, turnPage});
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.hasAttribute('data-no-transition')) return;
    if (!eligible(link.href)) return;
    event.preventDefault();
    navigate(link.href);
  });
  document.addEventListener('DOMContentLoaded', async () => {
    if (!incoming) return;
    busy = true;
    root.classList.add('land-in-transit');
    try {
      // The chapter has mounted its intro by now. Keep the paper opaque while
      // the browser lays it out, rather than exposing an intermediate frame.
      showCurtain('inset(0% 0% 0% 0%)');
      root.classList.remove('land-arriving');
      await painted();
      await sweep('inset(0% 0% 0% 0%)', 'inset(0% 100% 0% 0%)');
    } finally {
      clearCurtain();
    }
  }, {once: true});
  window.addEventListener('pageshow', event => { if (event.persisted) { removePending(); clearCurtain(); } });
  window.addEventListener('pagereveal', event => {
    if (!event.viewTransition) return;
    if (reduced()) event.viewTransition.skipTransition();
    // Prevent an early Begin click from overlapping the document transition.
    busy = true;
    event.viewTransition.finished.finally(clearCurtain);
  });
})();
