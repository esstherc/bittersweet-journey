/* Chapter entry opens the book; all other transitions use a short fade. */
(() => {
  'use strict';
  const root=document.documentElement, base=new URL('../',document.currentScript.src);
  const key='bittersweet-journey:page-curtain';
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const snapshots=typeof document.startViewTransition==='function';
  const nativeNavigation='onpagereveal' in window&&snapshots&&/^https?:$/.test(base.protocol);
  const chapterNames=new Set(['dujiangyan','secret-spring','taoist-tower','mountain-resort','yangguan','kashgar','fish-tail-lodge','mogao-caves']);
  const relative=url=>url.origin===base.origin&&url.pathname.startsWith(base.pathname)?url.pathname.slice(base.pathname.length).replace(/index\.html$/,'').replace(/\/$/,''):null;
  const isAtlas=url=>relative(url)==='';
  const isChapter=url=>{const parts=relative(url)?.split('/');return parts?.length===2&&parts[0]==='chapters'&&chapterNames.has(parts[1]);};
  const eligible=url=>(isAtlas(url)||isChapter(url))&&url.pathname!==new URL(location.href).pathname;
  let busy=false,rescue,frame,fadeAnimation,incoming=null,outgoing=null;
  function takePending(){
    try{
      const pending=JSON.parse(sessionStorage.getItem(key)||'null');
      sessionStorage.removeItem(key);
      if(pending&&Date.now()-pending.time<15000&&relative(new URL(pending.url))===relative(new URL(location.href)))return pending.mode;
    }catch{}
    return null;
  }
  function remember(url,mode){try{sessionStorage.setItem(key,JSON.stringify({url:url.href,time:Date.now(),mode}));}catch{}}
  incoming=takePending();
  root.dataset.transitionMode=incoming==='entry'?'entry':'fade';
  function clear(){
    clearTimeout(rescue);fadeAnimation?.cancel();fadeAnimation=null;frame?.remove();frame=null;
    root.classList.remove('land-in-transit');busy=false;outgoing=null;incoming=null;
  }
  async function fade(reveal,useSnapshots=true){
    if(reduced()){await reveal();return;}
    root.dataset.transitionMode='fade';
    if(snapshots&&useSnapshots){
      const transition=document.startViewTransition(reveal);
      await transition.updateCallbackDone;await transition.finished;return;
    }
    const page=document.querySelector('dialog[open]')||document.body;
    fadeAnimation=page.animate?.([{opacity:1},{opacity:0}],{duration:260,easing:'ease-out',fill:'forwards'});
    if(fadeAnimation)try{await fadeAnimation.finished;}catch{}
    await reveal();
  }
  // File previews and browsers without cross-document snapshots still get the
  // same book: prepare the destination in a frame and capture it in this document.
  async function prepareDestination(url){
    frame=document.createElement('iframe');frame.className='book-destination';frame.title='Chapter preview';
    frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');frame.style.opacity='0';
    const preview=frame;
    const loaded=new Promise(resolve=>{preview.onload=()=>resolve(true);preview.onerror=()=>resolve(false);});
    preview.src=url.href;document.body.append(preview);
    // Do not impose a five-second limit: cold GitHub Pages image requests can
    // take longer. The frame's own load/error and decoded artwork determine readiness.
    const ready=await loaded;
    if(ready){
      try{await preview.contentWindow.CHAPTER_OPENING?.ready;}
      catch{ /* File previews can give local frames opaque origins; retain load fallback. */ }
    }
    return ready;
  }
  async function bookBeforeNavigation(url){
    const ready=await prepareDestination(url);
    const preview=frame;
    if(ready&&frame===preview){
      root.dataset.transitionMode='entry';
      const transition=document.startViewTransition(()=>{preview.style.opacity='1';});
      await transition.updateCallbackDone;await transition.finished;
    }
    outgoing='handled';remember(url,'handled');location.assign(url.href);
    rescue=setTimeout(clear,5000);
  }
  async function navigate(href){
    if(busy)return;
    const url=new URL(href,location.href);
    if(eligible(url)&&!url.searchParams.has('lang'))url.searchParams.set('lang',document.body.dataset.language==='en'?'en':'zh');
    if(!eligible(url)||reduced()){outgoing='handled';remember(url,'handled');location.assign(url.href);return;}
    busy=true;root.classList.add('land-in-transit');
    outgoing=isAtlas(new URL(location.href))&&isChapter(url)?'entry':'fade';
    root.dataset.transitionMode=outgoing;
    if(outgoing==='entry'&&nativeNavigation){
      try{await prepareDestination(url);}catch{ /* Navigation still offers the static fallback. */ }
    }
    if(nativeNavigation){remember(url,outgoing);location.assign(url.href);rescue=setTimeout(clear,5000);return;}
    try{
      if(outgoing==='entry'&&snapshots){await bookBeforeNavigation(url);return;}
      await fade(()=>{},false);
      outgoing='handled';remember(url,'handled');location.assign(url.href);rescue=setTimeout(clear,5000);
    }catch{clear();location.assign(url.href);}
  }
  async function turnPage(reveal){
    if(busy)return false;
    busy=true;root.classList.add('land-in-transit');
    try{await fade(reveal);return true;}finally{clear();}
  }
  window.LAND_TRANSITION=Object.freeze({navigate,turnPage});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');
    if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self')||link.hasAttribute('data-no-transition')||!eligible(new URL(link.href)))return;
    event.preventDefault();navigate(link.href);
  });
  window.addEventListener('pageswap',event=>{
    if(!event.viewTransition)return;
    if(reduced()||outgoing==='handled'){event.viewTransition.skipTransition();return;}
    // Browser history uses a fade, never an extra book turn.
    root.dataset.transitionMode=outgoing==='entry'?'entry':'fade';
  });
  window.addEventListener('pagereveal',event=>{
    if(!event.viewTransition)return;
    const mode=takePending()||incoming;
    if(reduced()||mode==='handled'){event.viewTransition.skipTransition();clear();return;}
    const activation=window.navigation?.activation;
    const from=activation?.from?.url;
    const entry=mode==='entry'||(mode===null&&activation?.navigationType!=='traverse'&&from&&isAtlas(new URL(from))&&isChapter(new URL(location.href)));
    root.dataset.transitionMode=entry?'entry':'fade';
    busy=true;root.classList.add('land-in-transit');
    event.viewTransition.finished.then(clear,clear);
  });
  window.addEventListener('pageshow',event=>{
    if(event.persisted){const pending=takePending();clear();incoming=pending;root.dataset.transitionMode=pending==='entry'?'entry':'fade';}
  });
})();
