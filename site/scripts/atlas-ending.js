/* All currently available readings, rather than unpublished chapter placeholders. */
(() => {
  'use strict';
  const stories=window.ATLAS_STORIES;if(!stories?.length||!window.ATLAS_JOURNEY)return;
  const key='bittersweet-journey:atlas-finale:v1',signature=stories.map(s=>s.id).sort().join('|');
  const dialog=document.createElement('dialog');dialog.className='atlas-finale';dialog.setAttribute('aria-labelledby','atlas-finale-title');
  dialog.innerHTML='<p class="finale-kicker"></p><h2 id="atlas-finale-title"></h2><p class="finale-message"></p><div class="finale-seals"></div><button class="finale-return" type="button"></button>';
  document.body.append(dialog);
  let timer=null,animating=false,previousFocus=null;
  const complete=()=>stories.every(s=>{try{return localStorage.getItem(s.storageKey)==='true';}catch{return false;}});
  const seen=()=>{try{return localStorage.getItem(key)===signature;}catch{return false;}};
  function localize(){
    const en=document.body.dataset.language==='en';
    dialog.querySelector('.finale-kicker').textContent=en?'THE SELECTED JOURNEY IS COMPLETE':'選讀終卷';
    dialog.querySelector('h2').textContent=en?'Every page read. Every landscape alight.':'選讀已畢，山河俱明';
    dialog.querySelector('.finale-message').textContent=en?`Congratulations. You have completed all ${stories.length} selected chapters, collected every seal, and illuminated the atlas.`:`恭喜完成全部 ${stories.length} 個選讀章節，集齊所有圖章，點亮整幅山河。`;
    dialog.querySelector('button').textContent=en?'Wander the landscapes again →':'重遊山河 →';
    dialog.querySelector('.finale-seals').replaceChildren(...stories.map(story=>{
      const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
      img.src=story.seal;img.alt='';caption.textContent=story.title[en?'en':'zh'];figure.append(img,caption);return figure;
    }));
  }
  function close(){dialog.close();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  function attempt(){
    clearTimeout(timer);timer=null;
    if(!complete()){
      try{localStorage.removeItem(key);}catch{}
      animating=false;if(dialog.open)close();return;
    }
    if(seen()||animating||dialog.open)return;
    const returning=document.body.dataset.returningStory;
    if(document.readyState!=='complete'||document.hidden||document.documentElement.matches('.land-arriving, .land-in-transit')||document.querySelector('.stamp-overlay.is-visible')||(returning&&document.body.dataset.sealCollection!=='collected')){
      timer=setTimeout(attempt,150);return;
    }
    animating=true;window.ATLAS_CAMERA.reset();
    window.dispatchEvent(new Event('atlas-illuminate'));
  }
  window.addEventListener('atlas-map-illuminated',()=>{
    if(!animating||!complete())return;
    animating=false;previousFocus=document.activeElement;localize();dialog.showModal();
    try{localStorage.setItem(key,signature);}catch{}
    dialog.querySelector('button').focus({preventScroll:true});
  });
  window.addEventListener('atlas-progress-change',attempt);
  window.addEventListener('storage',attempt);
  window.addEventListener('pageshow',attempt);
  window.addEventListener('load',attempt,{once:true});
  window.addEventListener('pagehide',()=>{clearTimeout(timer);animating=false;});
  new MutationObserver(localize).observe(document.body,{attributes:true,attributeFilter:['data-language']});
  localize();attempt();
})();
