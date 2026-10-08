/* All currently available readings, rather than unpublished chapter placeholders. */
(() => {
  'use strict';
  const stories=window.ATLAS_STORIES;if(!stories?.length||!window.ATLAS_JOURNEY)return;
  const key='bittersweet-journey:atlas-finale:v1',signature=stories.map(s=>s.id).sort().join('|');
  const dialog=document.createElement('dialog');dialog.className='atlas-finale';dialog.setAttribute('aria-labelledby','atlas-finale-title');
  document.body.append(dialog);
  let timer=null,animating=false,previousFocus=null;
  const complete=()=>stories.every(s=>{try{return localStorage.getItem(s.storageKey)==='true';}catch{return false;}});
  const seen=()=>{try{return localStorage.getItem(key)===signature;}catch{return false;}};
  const credits=window.createAtlasCredits(dialog,stories,close);
  const replay=document.createElement('button');replay.type='button';replay.className='credits-replay';
  document.querySelector('.atlas-footer-source').append(replay);
  function localize(){credits.render();replay.textContent=document.body.dataset.language==='en'?'End credits':'旅程谢幕';}
  function show(){if(!complete())return;previousFocus=document.activeElement;credits.open();}
  replay.addEventListener('click',show);
  function close(){dialog.close();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}

  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  function attempt(){
    clearTimeout(timer);timer=null;
    const finished=complete();
    replay.hidden=!finished;
    document.body.classList.toggle('atlas-readings-complete',finished);
    if(!finished){
      try{localStorage.removeItem(key);}catch{}
      animating=false;if(dialog.open)close();return;
    }
    if(seen()||animating||dialog.open)return;
    const returning=document.body.dataset.returningStory;
    if(document.readyState!=='complete'||document.hidden||document.documentElement.matches('.land-in-transit')||document.querySelector('.stamp-overlay.is-visible')||(returning&&document.body.dataset.sealCollection!=='collected')){
      timer=setTimeout(attempt,150);return;
    }
    animating=true;window.ATLAS_CAMERA.reset();
    window.dispatchEvent(new Event('atlas-illuminate'));
  }
  window.addEventListener('atlas-map-illuminated',()=>{
    if(!animating||!complete())return;
    animating=false;window.SITE_HEADER?.refresh();show();
    try{localStorage.setItem(key,signature);}catch{}

  });
  window.addEventListener('atlas-progress-change',attempt);
  window.addEventListener('storage',attempt);
  window.addEventListener('pageshow',attempt);
  window.addEventListener('load',attempt,{once:true});
  window.addEventListener('pagehide',()=>{clearTimeout(timer);animating=false;});
  new MutationObserver(localize).observe(document.body,{attributes:true,attributeFilter:['data-language']});
  localize();
  if(new URLSearchParams(location.search).get('credits')==='1') {
    const url=new URL(location.href);url.searchParams.delete('credits');history.replaceState({},'',url);
    show();
  }
  attempt();
})();
