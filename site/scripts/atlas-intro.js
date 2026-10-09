/* The introduction belongs to an empty reading journey, not an old tour flag. */
(() => {
  'use strict';
  const base = new URL('../', document.currentScript.src);
  let redirecting = false;
  function hasReadingTrace() {
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index), value = localStorage.getItem(key);
        if (/^bittersweet-journey:[^:]+:(complete|started)$/.test(key) && value === 'true') return true;
        if (key === 'bittersweet-journey:kashgar:scene' && Number(value) > 0) return true;
      }
      return false;
    } catch { return true; /* Keep the atlas usable when storage cannot be read. */ }
  }
  function enterIfEmpty() {
    if (redirecting) return true;
    if (hasReadingTrace()) return false;
    const query = new URLSearchParams(location.search);
    let language = query.get('lang');
    if (!['zh', 'en'].includes(language)) {
      try { language = localStorage.getItem('bittersweet-journey:language'); } catch {}
    }
    const destination = new URL('chapters/my-hometown/index.html', base);
    destination.searchParams.set('tour', '1');
    destination.searchParams.set('lang', language === 'zh' ? 'zh' : 'en');
    document.documentElement.style.visibility = 'hidden';
    redirecting = true;
    location.replace(destination.href);
    return true;
  }
  window.ATLAS_INTRO = Object.freeze({hasReadingTrace, enterIfEmpty});
  window.addEventListener('pageshow', enterIfEmpty);
  enterIfEmpty();
})();
