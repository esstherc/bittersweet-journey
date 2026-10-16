/* Phones/tablets enter the experience only in landscape; desktop windows are unrestricted. */
(() => {
  'use strict';
  const portrait = matchMedia('(max-width: 900px) and (orientation: portrait) and (pointer: coarse)');
  let gate;
  function refresh(bringForward = false) {
    if (!gate) return;
    const english = document.body.dataset.language === 'en';
    gate.lang = english ? 'en' : 'zh-CN';
    gate.querySelector('h2').textContent = english ? 'Turn the page sideways' : '请横向握持设备';
    gate.querySelector('p').textContent = english ? 'Rotate your device to explore the landscapes and read the book side by side.' : '请将设备旋转为横向，让地图与正文并排展开。';
    if (!portrait.matches) { if (gate.open) gate.close(); return; }
    if (bringForward && gate.open) gate.close();
    if (!gate.open) {
      const playback = document.querySelector('.cinema-credits[open] .credits-play[aria-pressed="true"]');
      playback?.click();
      gate.showModal();
    }
  }
  function mount() {
    gate = document.createElement('dialog'); gate.className = 'mobile-orientation';
    gate.setAttribute('aria-labelledby', 'orientation-title'); gate.setAttribute('aria-describedby', 'orientation-description');
    gate.innerHTML = '<svg viewBox="0 0 96 96" aria-hidden="true"><rect x="24" y="13" width="48" height="70" rx="5" transform="rotate(25 48 48)"/><path d="M39 70l14 6M17 31A34 34 0 0 1 66 14M65 6l2 9-9 2M79 65A34 34 0 0 1 30 82M31 90l-2-9 9-2"/></svg><h2 id="orientation-title"></h2><p id="orientation-description"></p>';
    gate.addEventListener('cancel', event => event.preventDefault());
    document.body.append(gate);
    new MutationObserver(records => {
      const otherModalOpened = records.some(record => record.target !== gate && record.target instanceof HTMLDialogElement && record.target.open);
      refresh(otherModalOpened);
    }).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open', 'data-language']});
    portrait.addEventListener('change', () => refresh());
    window.addEventListener('pageshow', () => refresh());
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true}); else mount();
})();
