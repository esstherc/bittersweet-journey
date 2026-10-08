/* One masthead stays mounted as the title leaf gives way to the reading view. */
(() => {
  'use strict';
  const atlas = new URL('../index.html', document.currentScript.src);
  const chapterIds = ['my-hometown', 'dujiangyan', 'secret-spring', 'taoist-tower', 'mountain-resort', 'yangguan', 'kashgar', 'fish-tail-lodge', 'mogao-caves'];
  function refresh() {
    const header = document.querySelector('.site-masthead');
    if (!header) return;
    const english = document.body.dataset.language === 'en';
    const url = new URL(atlas);
    url.searchParams.set('lang', english ? 'en' : 'zh');
    const brand = header.querySelector('.site-wordmark');
    brand.href = url.href;
    brand.setAttribute('aria-label', english ? 'Land, Made Visible — back to the atlas' : '山河显影，返回中国总地图');
    header.querySelector('[data-site-title]').textContent = english ? 'Land, Made Visible' : '山河显影';
    const progress = header.querySelector('.site-progress');
    progress.setAttribute('aria-label', english ? 'View the collected seals' : '查看已显影的图章');
    header.querySelector('[data-site-progress-label]').textContent = english ? 'My Seals' : '我的印章';
    let count = 0;
    try { count = chapterIds.filter(id => localStorage.getItem(`bittersweet-journey:${id}:complete`) === 'true').length; } catch {}
    header.querySelector('[data-site-progress-count]').textContent = String(count);
    const total=header.querySelector('[data-site-progress-total]');
    if(total)total.textContent=String(chapterIds.length);
    if (progress.tagName === 'A') {
      url.searchParams.set('stamps', '1');
      progress.href = url.href;
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    new MutationObserver(refresh).observe(document.body, {attributes: true, attributeFilter: ['data-language']});
  }, {once: true});
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  window.SITE_HEADER = Object.freeze({refresh});
})();
