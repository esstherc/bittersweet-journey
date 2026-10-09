/* Five-scene lantern journey; native scrolling, completion gating owned by atlas-ending.js. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.createAtlasCredits = (dialog, stories, close) => {
    dialog.classList.add('cinema-credits');
    dialog.innerHTML = `
      <div class="credits-world" aria-hidden="true">${window.CREDITS_LANDSCAPE || ''}<div class="credits-chapter-sky"></div><div class="credits-chapter-sky"></div><div class="credits-road-lamps"></div><div class="credits-cursor-lamp"></div></div>
      <nav class="credits-controls"><span class="credits-wordmark"></span><button type="button" class="credits-play credits-icon"></button><button type="button" class="credits-sound credits-icon"></button><button type="button" class="finale-return"></button></nav>
      <div class="credits-viewport" tabindex="0"><div class="credits-roll">
        <section class="credits-opening" data-ending-scene="1"><div class="credits-map-wrap"><div class="credits-map-snapshot"></div><div class="credits-last-light"></div><img class="credits-last-seal" alt=""/></div><h2 id="atlas-finale-title"></h2><p class="finale-message"></p><p class="credits-scroll-hint"></p></section>
        <section class="credits-departure" data-ending-scene="2"><div class="credits-book" aria-hidden="true"><div class="credits-book-left"></div><div class="credits-book-right"><span class="credits-page-origin"></span><span class="credits-page-threshold"></span></div></div><h3></h3><p></p></section>
        <section class="credits-library" data-ending-scene="3"><h3></h3><p class="credits-legend"></p><ol class="credits-titles"></ol><p class="credits-beyond"></p></section>
        <section class="credits-attribution" data-ending-scene="4"><h3></h3><dl></dl></section>
        <section class="credits-coda" data-ending-scene="5"><h3></h3><p></p><div class="credits-travel-book"><div class="finale-seals"></div><p class="credits-record"></p></div><div class="credits-coda-actions"><button type="button" class="credits-end"></button><button type="button" class="credits-again"></button></div></section>
      </div></div><div class="credits-route" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
    const viewport=dialog.querySelector('.credits-viewport'),play=dialog.querySelector('.credits-play');
    const sound=dialog.querySelector('.credits-sound');
    const chapters=()=>[...dialog.querySelectorAll('.credits-selected')];
    const sections=[...dialog.querySelectorAll('[data-ending-scene]')];
    let running=false,frame=0,previous=0,position=0,startsAt=0,openingStampPending=false,activeStory='',activeScene=0,voice=null;
    const en=()=>document.body.dataset.language==='en';
    const set=(selector,text)=>{dialog.querySelector(selector).textContent=text;};
    const landscapeFor=id=>{
      const story=stories.find(story=>story.id===id);if(!story)return '';
      const chapter=new URL(story.href,location.href);
      if(chapter.pathname.includes('/my-hometown/'))return '';
      return new URL(`./assets/${chapter.pathname.includes('/kashgar/')?'opening-pamir':'opening-landscape'}.jpg`,chapter).href;
    };
    const lamps=dialog.querySelector('.credits-road-lamps');
    lamps.innerHTML=stories.map(()=>'<i><span></span></i>').join('');
    // Use the atlas artwork itself so the same traveller continues into the ending.
    const atlasTraveler=document.querySelector('.journey-traveler');
    if(atlasTraveler){
      const traveler=atlasTraveler.cloneNode(true);
      traveler.setAttribute('class','credits-traveler');traveler.removeAttribute('style');
      traveler.querySelector('.journey-facing')?.removeAttribute('style');
      const lantern=document.createElementNS('http://www.w3.org/2000/svg','g');
      lantern.setAttribute('class','credits-carried-lantern');
      lantern.innerHTML='<circle cx="76" cy="45" r="21" fill="url(#end-lamp)"/><path d="M71 32l5 3v3" fill="none" stroke="#d3bd8e"/><rect x="72" y="38" width="8" height="12" rx="2" fill="#f2cc85" stroke="#82532b" stroke-width=".8"/><path d="M72 40h8m-8 8h8m-4-9v9m0 2v3" stroke="#82532b" stroke-width=".6"/>';
      traveler.querySelector('.journey-rider').append(lantern);
      // The traveller crosses in front of the page, rather than behind its layer.
      dialog.append(traveler);
    }
    let departureScroll=0;
    function prepareDeparture(){
      const traveler=dialog.querySelector('.credits-traveler');if(!traveler)return;
      const style=getComputedStyle(traveler),bounds=dialog.getBoundingClientRect();
      const width=parseFloat(style.width),height=width*.8;
      const footX=parseFloat(style.left)+width*.5;
      const footY=bounds.height-parseFloat(style.bottom)-height*.12;
      for(const [name,selector] of [['origin','.credits-page-origin'],['edge','.credits-page-threshold']]){
        const point=dialog.querySelector(selector).getBoundingClientRect();
        dialog.style.setProperty(`--departure-${name}-x`,`${point.left-bounds.left-footX}px`);
        dialog.style.setProperty(`--departure-${name}-y`,`${point.top-bounds.top-footY}px`);
      }
      departureScroll=viewport.scrollTop;
      dialog.style.setProperty('--departure-scroll','0px');
    }
    const skies=[...dialog.querySelectorAll('.credits-chapter-sky')];
    let skyIndex=0;
    function snapshot(target,prefix) {
      const source=document.querySelector('.china-map');if(!source)return;
      const clone=source.cloneNode(true);clone.removeAttribute('data-aria');clone.removeAttribute('role');clone.setAttribute('aria-hidden','true');clone.setAttribute('viewBox','46 98 944 590');
      clone.querySelectorAll('a,button').forEach(el=>el.replaceWith(...el.childNodes));
      const ids=[...clone.querySelectorAll('[id]')].map(el=>el.id);
      let markup=clone.outerHTML;for(const id of ids)markup=markup.replaceAll(`id="${id}"`,`id="${prefix}${id}"`).replaceAll(`url(#${id})`,`url(#${prefix}${id})`).replaceAll(`href="#${id}"`,`href="#${prefix}${id}"`);
      target.innerHTML=markup;
    }
    function control(){
      play.innerHTML=running
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7Z"/></svg>';
      play.setAttribute('aria-pressed',String(running));
      play.title=en()?(running?'Pause credits':'Play credits'):(running?'暂停谢幕':'播放谢幕');play.setAttribute('aria-label',play.title);
      sound.textContent='♫';sound.title=en()?(window.JOURNEY_AUDIO?.enabled?'Mute':'Sound on'):(window.JOURNEY_AUDIO?.enabled?'静音':'开启声音');sound.setAttribute('aria-label',sound.title);
      sound.setAttribute('aria-pressed',String(Boolean(window.JOURNEY_AUDIO?.enabled)));
      dialog.classList.toggle('is-playing',running);
    }
    function stop(){running=false;openingStampPending=false;cancelAnimationFrame(frame);frame=0;control();}
    function stopVoice(){if(voice){voice.pause();voice=null;}}
    function cue(name,volume){stopVoice();voice=window.JOURNEY_AUDIO?.play(name,volume)||null;}
    function syncWorld(){
      const y=viewport.scrollTop,max=Math.max(1,viewport.scrollHeight-viewport.clientHeight),anchor=y+viewport.clientHeight*.4;
      let index=0;sections.forEach((section,i)=>{if(section.offsetTop<=anchor)index=i;});
      const scene=index+1;
      dialog.style.setProperty('--journey-progress',(y/max).toFixed(4));
      dialog.style.setProperty('--far-shift',`${-y*.015}px`);dialog.style.setProperty('--middle-shift',`${-y*.04}px`);dialog.style.setProperty('--near-shift',`${-y*.075}px`);
      if(activeScene!==scene){
        activeScene=scene;dialog.dataset.scene=String(scene);
        if(scene===2)prepareDeparture();
        dialog.classList.toggle('is-page-departure',scene===2&&running&&!reduce.matches);
        dialog.querySelectorAll('.credits-route i').forEach((dot,i)=>dot.classList.toggle('is-reached',i<=index));
        if(dialog.open&&running){if(scene===1)cue('stamp',.3);else if(scene===2)cue('dunes',.14);else if(scene===5)cue('bell',.18);}
      }
      if(scene===2)dialog.style.setProperty('--departure-scroll',`${viewport.scrollTop-departureScroll}px`);
      let current=null,count=0;
      chapters().forEach(item=>{const reached=item.offsetTop<=anchor;item.classList.toggle('is-discovered',reached);if(reached){current=item;count++;}});
      [...lamps.children].forEach((lamp,i)=>lamp.classList.toggle('is-lit',scene===5||i<count));
      const next=current?.dataset.story||'';
      if(next!==activeStory){
        activeStory=next;
        const landscape=next?landscapeFor(next):'';
        if(landscape){
          const image=new Image();image.onload=()=>{
            if(activeStory!==next)return;
            const index=1-skyIndex;skies[index].style.backgroundImage=`url("${landscape}")`;
            skies[index].classList.add('is-current');skies[skyIndex].classList.remove('is-current');skyIndex=index;
          };image.src=landscape;
        }else skies.forEach(sky=>sky.classList.remove('is-current'));
        if(current&&scene===3&&running)cue('stamp',.2);
      }
      if(y>=max-1&&running)stop();
    }
    function tick(now){
      if(!running||!dialog.open||document.hidden){stop();return;}
      if(openingStampPending&&now>=startsAt-1400){openingStampPending=false;cue('stamp',.3);}
      if(now>=startsAt){
        const speed=Math.max(45,(viewport.scrollHeight-viewport.clientHeight)/65);
        position+=Math.min(now-previous,80)*speed/1000;
        viewport.scrollTop=position;syncWorld();
      }
      previous=now;if(running)frame=requestAnimationFrame(tick);
    }
    function start(delay=0){
      cancelAnimationFrame(frame);running=true;position=viewport.scrollTop;previous=performance.now();startsAt=previous+delay;
      if(activeScene===2&&!reduce.matches&&!dialog.classList.contains('is-page-departure')){
        prepareDeparture();dialog.classList.add('is-page-departure');
      }
      control();frame=requestAnimationFrame(tick);
    }
    play.addEventListener('click',()=>running?stop():start());
    dialog.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.target.closest('button,a')){e.preventDefault();if(!e.repeat){if(running)stop();else start();}}});
    sound.addEventListener('click',()=>{window.JOURNEY_AUDIO?.setEnabled(!window.JOURNEY_AUDIO.enabled);if(!window.JOURNEY_AUDIO?.enabled)stopVoice();control();});
    dialog.querySelector('.finale-return').addEventListener('click',close);
    dialog.querySelector('.credits-end').addEventListener('click',close);
    dialog.querySelector('.credits-again').addEventListener('click',()=>open());
    ['wheel','touchstart','pointerdown'].forEach(type=>viewport.addEventListener(type,stop,{passive:true}));
    viewport.addEventListener('keydown',e=>{if(e.code!=='Space'&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.code))stop();});
    viewport.addEventListener('scroll',syncWorld,{passive:true});
    dialog.addEventListener('pointermove',e=>{const r=dialog.getBoundingClientRect();dialog.style.setProperty('--lamp-x',`${e.clientX-r.left}px`);dialog.style.setProperty('--lamp-y',`${e.clientY-r.top}px`);dialog.classList.add('has-lantern-cursor');},{passive:true});
    dialog.addEventListener('pointerleave',()=>dialog.classList.remove('has-lantern-cursor'));
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopVoice();}});
    reduce.addEventListener('change',()=>{if(reduce.matches)stop();});
    dialog.addEventListener('close',()=>{stop();stopVoice();dialog.classList.remove('has-lantern-cursor');});
    window.addEventListener('pagehide',()=>{stop();stopVoice();});
    function open(){
      dialog.classList.remove('is-opening');
      stop();stopVoice();render();snapshot(dialog.querySelector('.credits-map-snapshot'),'credits-map-');snapshot(dialog.querySelector('.credits-book-left'),'credits-book-');
      viewport.scrollTop=0;activeScene=0;activeStory='';if(!dialog.open)dialog.showModal();syncWorld();play.focus({preventScroll:true});
      void dialog.offsetWidth;dialog.classList.add('is-opening');
      if(!reduce.matches){start(4200);openingStampPending=true;}
    }
    function render() {
      const english = en(), lang = english ? 'en' : 'zh';
      const completed = stories.every(s => { try { return localStorage.getItem(s.storageKey) === 'true'; } catch { return false; } });
      set('.credits-wordmark',english?'The journey continues':'旅程，仍在继续');
      set('#atlas-finale-title', english ? 'Nine seals. Nine landscapes.' : '九枚图章，九段山河。');
      set('.credits-departure h3', english ? 'Carry the light beyond the page.' : '提起灯，走出这一页。');
      set('.credits-departure p', english ? 'The landscapes become a road. Our traveller continues with you.' : '书中的山河，延伸成脚下的路。旅人与你，继续前行。');
      set('.credits-beyond', english ? 'There are more landscapes in the book, waiting for another departure.' : '书中还有更多山河，等待下一次出发。');
      set('.credits-record', english ? 'Explored 9 / 9 · Seals collected 9 / 9' : '已探索 9 / 9 · 已集齐图章 9 / 9');
      set('.credits-again', english ? 'Watch again' : '重看谢幕');
      const lastStory=stories.find(s=>s.id===document.body.dataset.returningStory)||stories.at(-1);
      dialog.querySelector('.credits-last-seal').src=lastStory.seal;
      dialog.querySelector('.credits-book-right').style.backgroundImage=`url("${landscapeFor(lastStory.id)||landscapeFor('fish-tail-lodge')}")`;
      set('.finale-message', english
        ? (completed ? `You have read all ${stories.length} selected chapters, collected every seal, and illuminated the atlas. Beyond these pages, more journeys await.` : 'These landscapes are only a beginning. Beyond this atlas, more stories await in the book.')
        : (completed ? `你已完成 ${stories.length} 篇选读，集齐图章，点亮山河。书页之外，仍有更多故事等待相遇。` : '这些山河，只是起点。地图之外，《文化苦旅》还有更多值得探索的故事。'));
      dialog.querySelector('.finale-seals').replaceChildren(...stories.map(story => {
        const figure = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption');
        img.src = story.seal; img.alt = ''; caption.textContent = story.title[lang];
        figure.append(img, caption); return figure;
      }));
      set('.credits-scroll-hint', english ? 'Scroll at your own pace · Space to pause or resume' : '随时卷动、停留 · 空白键暂停或继续');
      set('.credits-library h3', english ? 'Beyond this atlas' : '地图之外，还有山河');
      set('.credits-legend', english ? 'All 26 essays in the 2014 Chinese edition. Chinese-only titles are absent from the 2015 English selection.' : '依 2014 年中文版篇序列出全书 26 篇。');
      dialog.querySelector('.credits-titles').replaceChildren(...window.BOOK_CONTENTS.map((chapter, index) => {
        const item = document.createElement('li'), title = document.createElement('span');
        const story = stories.find(s => s.title.zh === chapter.zh);
        title.textContent = `${String(index + 1).padStart(2, '0')} · ${english ? chapter.en || chapter.zh : chapter.zh}`;
        item.append(title);
        if (!chapter.en) {
          const note = document.createElement('small');
          note.className = 'credits-untranslated';
          note.textContent = english ? 'Not included in the English edition' : '未收录於英译本';
          item.append(note);
        }
        if (story) {
          item.className = 'credits-selected';
          item.dataset.story=story.id;
          const img = document.createElement('img'); img.src = story.seal; img.alt = english ? 'Atlas selection' : '地图选读';
          item.prepend(img);
        }
        return item;
      }));
      set('.credits-attribution h3', english ? 'Words, maps & the people behind them' : '文字、山河与幕後的人');
      const sourceCredits=(window.MAP_DATA_SOURCES||[]).map(source=>[english?'Data source':'数据来源',source.name,source.url]);
      const credits = [
        [english ? 'Story map' : '故事地图作者', 'Yanbing Chen · Eugenie Huang'],
        [english ? 'Original author' : '原着作者', english ? 'Yu Qiuyu · 余秋雨' : '余秋雨'],
        [english ? 'Chinese edition' : '中文版本', '文化苦旅 · 长江文艺出版社 · 2014'],
        [english ? 'English edition' : '英译版本', 'A Bittersweet Journey Through Culture · CN Times Books · 2015'],
        [english ? 'English translator' : '英译本译者', english ? 'CN Times Books team' : 'CN Times Books 团队'],
        ...sourceCredits
      ];
      dialog.querySelector('dl').replaceChildren(...credits.flatMap(([role, name, url]) => {
        const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = role;
        if (url) { const a = document.createElement('a'); a.href = url; a.textContent = name; a.target = '_blank'; a.rel = 'noopener'; dd.append(a); }
        else dd.textContent = name;
        return [dt, dd];
      }));
      set('.credits-coda h3', english ? 'Rest here.\nThe journey continues.' : '此卷暂歇，\n旅程未完。');
      set('.credits-coda p', english ? 'Open the book again. Let the next story take you somewhere new.' : '再次翻开《文化苦旅》，让下一篇故事，带你走向未曾抵达的远方。');
      set('.credits-end', english ? 'Return to the landscapes →' : '重返山河 →');
      set('.finale-return', english ? 'Back to the atlas' : '返回地图');
      viewport.setAttribute('aria-label', english ? 'Book contents and credits' : '全书篇目与制作名录');
      control();
      if(dialog.open)syncWorld();
    }

    return {render,stop,open};
  };
})();
