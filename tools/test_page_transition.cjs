const {readFileSync}=require('node:fs'),{runInNewContext}=require('node:vm'),assert=require('node:assert/strict');
const source=readFileSync('site/scripts/page-transition.js','utf8');
function setup({atlas=false,incoming=false,reduced=false,native=true,frameReady=Promise.resolve()}={}){
 const events=new Map(),values=new Map(),classes=new Set(),transitions=[];
 const location={href:'http://localhost/site/'+(atlas?'index.html':'chapters/kashgar/index.html'),assign(url){this.href=url;}};
 if(incoming)values.set('bittersweet-journey:page-curtain',JSON.stringify({url:location.href,time:Date.now(),mode:'entry'}));
 const document={currentScript:{src:'http://localhost/site/scripts/page-transition.js'},documentElement:{dataset:{},classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));}}},body:{dataset:{language:'en'},animate(){return{finished:Promise.resolve(),cancel(){}};}},querySelector(){return null;},addEventListener(n,f){events.set(n,f);}};
 const window={addEventListener(n,f){events.set(n,f);}};
 document.createElement=()=>({style:{},setAttribute(){},remove(){},contentWindow:{CHAPTER_OPENING:{ready:frameReady}}});
 document.body.append=frame=>frame.onload();
 if(native){window.onpagereveal=null;document.startViewTransition=fn=>{transitions.push(document.documentElement.dataset.transitionMode);fn();return{updateCallbackDone:Promise.resolve(),finished:Promise.resolve()};};}
 runInNewContext(source,{window,document,location,URL,Date,Promise,sessionStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},matchMedia:()=>({matches:reduced}),setTimeout:()=>1,clearTimeout(){}});
 return{events,values,classes,location,document,transitions,api:window.LAND_TRANSITION};
}
(async()=>{
 for(const native of [true,false]){
  const chapter=setup({native});let entered=false;await chapter.api.turnPage(()=>entered=true);assert(entered);assert.equal(chapter.classes.size,0);if(native)assert.deepEqual(chapter.transitions,['fade']);
  await chapter.api.navigate('../../index.html');assert.equal(chapter.location.href,'http://localhost/site/index.html?lang=en');assert.equal(JSON.parse([...chapter.values.values()][0]).mode,native?'fade':'handled');
 }
 const atlas=setup({atlas:true});await atlas.api.navigate('./chapters/kashgar/index.html');assert.equal(JSON.parse([...atlas.values.values()][0]).mode,'entry');assert.equal(new URL(atlas.location.href).searchParams.get('lang'),'en');
 let decode;const delayed=setup({atlas:true,frameReady:new Promise(resolve=>decode=resolve)});
 const navigation=delayed.api.navigate('./chapters/dujiangyan/index.html');
 await Promise.resolve();await Promise.resolve();
 assert.equal(delayed.location.href,'http://localhost/site/index.html','entry must wait for decoded artwork');
 decode();await navigation;assert.equal(new URL(delayed.location.href).pathname,'/site/chapters/dujiangyan/index.html');
 const first=atlas.location.href;await atlas.api.navigate('./chapters/dujiangyan/index.html');assert.equal(atlas.location.href,first);
 const arriving=setup({incoming:true});let finish;arriving.events.get('pagereveal')({viewTransition:{finished:new Promise(r=>finish=r),skipTransition(){throw Error('Entry must animate');}}});assert.equal(arriving.document.documentElement.dataset.transitionMode,'entry');assert.equal(await arriving.api.turnPage(()=>{}),false);finish();await Promise.resolve();
 // Returning a cached chapter must read the new entry marker instead of clearing it.
 arriving.values.set('bittersweet-journey:page-curtain',JSON.stringify({url:arriving.location.href,time:Date.now(),mode:'entry'}));
 arriving.events.get('pageshow')({persisted:true});arriving.events.get('pagereveal')({viewTransition:{finished:Promise.resolve(),skipTransition(){throw Error('Cached entry must animate');}}});assert.equal(arriving.document.documentElement.dataset.transitionMode,'entry');
 const history=setup();history.events.get('pagereveal')({viewTransition:{finished:Promise.resolve(),skipTransition(){throw Error('History should fade');}}});assert.equal(history.document.documentElement.dataset.transitionMode,'fade');
 const quiet=setup({incoming:true,reduced:true});let skipped=false;quiet.events.get('pagereveal')({viewTransition:{skipTransition(){skipped=true;}}});assert(skipped);
 console.log('PASS: book entry, cached entry restoration, fades for reading/return/history, fallback fade, language and reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1;});
