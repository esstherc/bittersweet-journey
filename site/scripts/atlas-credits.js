/* A native scroll surface: pause on reader input, resume only by explicit choice. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.createAtlasCredits = (dialog, stories, close) => {
    dialog.classList.add('cinema-credits');
    dialog.innerHTML = '<nav class="credits-controls"><button type="button" class="credits-play"></button><button type="button" class="finale-return"></button></nav><div class="credits-viewport" tabindex="0"><div class="credits-roll"><section class="credits-opening"><h2 id="atlas-finale-title"></h2><p class="finale-message"></p><div class="finale-seals"></div><p class="credits-scroll-hint"></p></section><section class="credits-library"><h3></h3><p class="credits-legend"></p><ol class="credits-titles"></ol></section><section class="credits-attribution"><h3></h3><dl></dl></section><section class="credits-coda"><h3></h3><p></p><button type="button" class="credits-end"></button></section></div></div>';
    const viewport = dialog.querySelector('.credits-viewport');
    const play = dialog.querySelector('.credits-play');
    let running = false, frame = 0, previous = 0, position = 0, startsAt = 0;
    const en = () => document.body.dataset.language === 'en';
    const set = (selector, text) => { dialog.querySelector(selector).textContent = text; };
    function control() {
      play.textContent = en() ? (running ? 'Pause credits' : 'Play credits') : (running ? '暫停字幕' : '播放字幕');
      play.setAttribute('aria-pressed', String(running));
    }
    function stop() { running = false; cancelAnimationFrame(frame); control(); }
    function tick(now) {
      if (!running || !dialog.open || document.hidden) { stop(); return; }
      if (now >= startsAt) {
        position += Math.min(now - previous, 80) * .06;
        viewport.scrollTop = position;
        if (viewport.scrollTop >= viewport.scrollHeight - viewport.clientHeight - 1) { stop(); return; }
      }
      previous = now; frame = requestAnimationFrame(tick);
    }
    function start(delay = 0) {
      cancelAnimationFrame(frame); running = true; position = viewport.scrollTop;
      previous = performance.now(); startsAt = previous + delay; control(); frame = requestAnimationFrame(tick);
    }
    play.addEventListener('click', () => running ? stop() : start());
    dialog.querySelector('.finale-return').addEventListener('click', close);
    dialog.querySelector('.credits-end').addEventListener('click', close);
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => viewport.addEventListener(type, stop, {passive:true}));
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reduce.addEventListener('change', () => { if (reduce.matches) stop(); });
    dialog.addEventListener('close', stop);
    window.addEventListener('pagehide', stop);
    function render() {
      const english = en(), lang = english ? 'en' : 'zh';
      const completed = stories.every(s => { try { return localStorage.getItem(s.storageKey) === 'true'; } catch { return false; } });
      set('h2', english ? 'The journey continues' : '旅程，仍在繼續');
      set('.finale-message', english
        ? (completed ? `You have read all ${stories.length} selected chapters, collected every seal, and illuminated the atlas. Beyond these pages, more journeys await.` : 'These landscapes are only a beginning. Beyond this atlas, more stories await in the book.')
        : (completed ? `你已完成 ${stories.length} 篇選讀，集齊圖章，點亮山河。書頁之外，仍有更多故事等待相遇。` : '這些山河，只是起點。地圖之外，《文化苦旅》還有更多值得探索的故事。'));
      dialog.querySelector('.finale-seals').replaceChildren(...stories.map(story => {
        const figure = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption');
        img.src = story.seal; img.alt = ''; caption.textContent = story.title[lang];
        figure.append(img, caption); return figure;
      }));
      set('.credits-scroll-hint', english ? 'Scroll at your own pace · Pause whenever a title calls to you' : '可以隨時捲動、停留，讓一個篇名帶你走向下一段旅程');
      set('.credits-library h3', english ? 'Beyond this atlas' : '地圖之外，還有山河');
      set('.credits-legend', english ? 'All 26 essays in the 2014 Chinese edition. Gold titles and seals mark the nine atlas selections. Chinese-only titles are absent from the 2015 English selection.' : '依 2014 年中文版篇序列出全書 26 篇。暖金篇名與圖章標示本故事地圖的 9 篇選讀。');
      dialog.querySelector('.credits-titles').replaceChildren(...window.BOOK_CONTENTS.map((chapter, index) => {
        const item = document.createElement('li'), title = document.createElement('span');
        const story = stories.find(s => s.title.zh === chapter.zh);
        title.textContent = `${String(index + 1).padStart(2, '0')} · ${english ? chapter.en || chapter.zh : chapter.zh}`;
        item.append(title);
        if (!chapter.en) {
          const note = document.createElement('small');
          note.className = 'credits-untranslated';
          note.textContent = english ? 'Not included in the English edition' : '未收錄於英譯本';
          item.append(note);
        }
        if (story) {
          item.className = 'credits-selected';
          const img = document.createElement('img'); img.src = story.seal; img.alt = english ? 'Atlas selection' : '地圖選讀';
          item.prepend(img);
        }
        return item;
      }));
      set('.credits-attribution h3', english ? 'Words, maps & the people behind them' : '文字、山河與幕後的人');
      const credits = [
        [english ? 'Original author' : '原著作者', english ? 'Yu Qiuyu · 余秋雨' : '余秋雨'],
        [english ? 'Chinese edition' : '中文版本', '文化苦旅 · 長江文藝出版社 · 2014'],
        [english ? 'English edition' : '英譯版本', 'A Bittersweet Journey Through Culture · CN Times Books · 2015'],
        [english ? 'English translator' : '英譯本譯者', english ? 'CN Times Books team' : 'CN Times Books 團隊'],
        [english ? 'Story map' : '故事地圖作者', 'Yanbing Chen · Eugenie Huang'],
        [english ? 'Map data' : '地圖資料', 'Natural Earth', 'https://www.naturalearthdata.com/']
      ];
      dialog.querySelector('dl').replaceChildren(...credits.flatMap(([role, name, url]) => {
        const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = role;
        if (url) { const a = document.createElement('a'); a.href = url; a.textContent = name; a.target = '_blank'; a.rel = 'noopener'; dd.append(a); }
        else dd.textContent = name;
        return [dt, dd];
      }));
      set('.credits-coda h3', english ? 'The map ends here.\nThe journey does not.' : '地圖至此，\n旅程未完。');
      set('.credits-coda p', english ? 'Open the book again. Let the next story take you somewhere new.' : '再次翻開《文化苦旅》，讓下一篇故事，帶你走向未曾抵達的遠方。');
      set('.credits-end', english ? 'Return to the landscapes →' : '重返山河 →');
      set('.finale-return', english ? 'Back to the atlas' : '返回地圖');
      viewport.setAttribute('aria-label', english ? 'Book contents and credits' : '全書篇目與製作名錄');
      control();
    }
    return {render, stop, open() {render();viewport.scrollTop = 0;dialog.showModal();play.focus({preventScroll:true});if (!reduce.matches) start(3600);}};
  };
})();
