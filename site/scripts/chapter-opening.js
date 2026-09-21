/* A chapter title leaf, followed by one deliberate page turn into reading. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let options, dialog, sheet, turning = false, reading = false, sectionsObserver, contentObserver;
  let header, headerHome;
  const seenSections = new Set();
  const root = document.documentElement;
  // Set before body parsing so a cold load cannot paint the reading spread first.
  root.classList.add('chapter-entry-pending');
  document.addEventListener('DOMContentLoaded', () => {
    // Failed chapter initialization still exposes the complete static-text fallback.
    root.classList.remove('chapter-entry-pending');
  }, {once: true});
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  function refresh() {
    if (!dialog) return;
    const copy = options.copy();
    dialog.lang = copy.language === 'en' ? 'en' : 'zh-CN';
    dialog.querySelector('.chapter-leaf-number').textContent = copy.number;
    dialog.querySelector('.chapter-leaf-title').textContent = copy.title;
    dialog.querySelector('.chapter-leaf-line').textContent = copy.line;
    dialog.querySelector('.chapter-leaf-enter span').textContent = copy.action.replace(/\s*[→↗]\s*$/, '');
    const back = dialog.querySelector('.chapter-leaf-back');
    back.textContent = copy.language === 'en' ? '← Return to atlas' : '← 返回总图';
    back.href = `../../index.html?lang=${copy.language}`;
    window.SITE_HEADER?.refresh();
  }
  function observeSections() {
    if (!options.sections || !('IntersectionObserver' in window)) return;
    sectionsObserver?.disconnect();
    const sections = [...document.querySelectorAll(options.sections)];
    sectionsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || !reading) return;
        const section = entry.target.closest('.reading-section');
        const key = section.dataset.sectionIndex || section.id || String(sections.indexOf(section));
        sectionsObserver.unobserve(entry.target);
        if (seenSections.has(key)) return;
        seenSections.add(key);
        // Animate only the section's opening. The rest of the original is always visible.
        if (!reduced()) {
          const firstParagraph = section.querySelector('.reading-section-body p, :scope > p');
          [entry.target, firstParagraph].filter(Boolean).forEach((element, index) => {
            element.animate?.([
              {opacity: .25, transform: 'translateY(12px)'},
              {opacity: 1, transform: 'translateY(0)'}
            ], {duration: 520, delay: index * 55, easing: 'cubic-bezier(.2,.65,.3,1)'});
          });
        }
      });
    }, {rootMargin: '-80px 0px -8% 0px', threshold: 0});
    sections.forEach(section => {
      const heading = section.querySelector('.section-heading, .reader-header');
      if (heading) sectionsObserver.observe(heading);
    });
  }
  function startReading() {
    reading = true;
    const first = document.querySelector(options.sections || '.reading-section');
    if (first) seenSections.add(first.dataset.sectionIndex || first.id || '0');
    observeSections();
    const reader = document.querySelector('#reading, .reading-copy');
    if (reader && !contentObserver) {
      contentObserver = new MutationObserver(observeSections);
      contentObserver.observe(reader, {childList: true});
    }
  }
  async function enter() {
    if (turning || !dialog.open) return;
    turning = true;
    const action = dialog.querySelector('.chapter-leaf-enter');
    action.disabled = true;
    let entered = false;
    const revealReading = () => {
      options.enter();
      window.scrollTo({top: 0, behavior: 'instant'});
      restoreHeader();
      dialog.close();
      root.classList.remove('chapter-gate-open');
      entered = true;
    };
    try {
      if (window.LAND_TRANSITION?.turnPage) {
        await window.LAND_TRANSITION.turnPage(revealReading);
      } else {
        revealReading();
      }
    } finally {
      turning = false;
      action.disabled = false;
      if (entered) {
        startReading();
        const reader = document.querySelector('#reading, .reader-panel');
        reader?.setAttribute('tabindex', '-1');
        reader?.focus({preventScroll: true});
      }
    }
  }
  function restoreHeader() {
    if (header && headerHome) headerHome.after(header);
  }
  function mount(config) {
    options = config;
    root.classList.add('has-chapter-opening');
    dialog = make('dialog', 'chapter-leaf');
    dialog.id = 'chapter-leaf';
    dialog.setAttribute('aria-labelledby', 'chapter-leaf-title');
    sheet = make('div', 'chapter-leaf-paper');
    // Reparent the real header so its styles, language handlers and focus state
    // remain identical on the atlas, title leaf and reading spread.
    header = document.querySelector('.site-masthead');
    if (header) {
      headerHome = document.createComment('shared chapter header');
      header.before(headerHome);
    }
    const content = make('div', 'chapter-leaf-content');
    const title = make('h1', 'chapter-leaf-title');
    title.id = 'chapter-leaf-title';
    title.tabIndex = -1;
    const action = make('button', 'chapter-leaf-enter');
    action.type = 'button';
    const arrow = make('i', '', '⟶');
    arrow.setAttribute('aria-hidden', 'true');
    action.append(make('span', ''), arrow);
    action.addEventListener('click', enter);
    content.append(make('p', 'chapter-leaf-number'), title, make('p', 'chapter-leaf-line'), action);
    sheet.append(content, make('a', 'chapter-leaf-back'));
    if (header && !config.preview) sheet.prepend(header);
    dialog.append(sheet);
    dialog.addEventListener('cancel', event => { event.preventDefault(); if (!turning) enter(); });
    document.body.append(dialog);
    new MutationObserver(refresh).observe(document.body, {attributes: true, attributeFilter: ['data-language']});
    refresh();
    // Explicit development deep-links retain their existing reading preview behavior.
    if (config.preview) { config.enter(); root.classList.remove('chapter-entry-pending'); startReading(); return; }
    root.classList.add('chapter-gate-open');
    dialog.showModal();
    root.classList.remove('chapter-entry-pending');
    title.focus({preventScroll: true});
  }
  window.CHAPTER_OPENING = Object.freeze({mount, refresh});
})();
