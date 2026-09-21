/* Regression checks for paper coverage and animation cleanup; no browser dependencies. */
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(process.argv[2] || 'site/scripts/page-transition.js', 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup({incoming=false, reduced=false, native=false}={}) {
  const active = new Set(), animations = [], frames = [], events = new Map(), timers = [];
  const classes = new Set(), values = new Map(), roots = [];
  const location = {href:'http://localhost/site/chapters/kashgar/index.html',assign(url){this.href=url;}};
  if (incoming) values.set('bittersweet-journey:page-curtain', JSON.stringify({url:location.href,time:Date.now()}));
  const classList = {add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));}};
  let paper;
  const document = {
    currentScript:{src:'http://localhost/site/scripts/page-transition.js'},
    documentElement:{classList},
    body:{dataset:{language:'en'},append(node){paper=node;}},
    createElement(){return {style:{},open:false,setAttribute(){},addEventListener(){},
      showModal(){this.open=true;roots.push({event:'show',clip:this.style.clipPath});},
      close(){this.open=false;roots.push({event:'close',active:active.size,clip:this.style.clipPath});},
      animate(keyframes){let finish,reject;const finished=new Promise((resolve,no)=>{finish=resolve;reject=no;});
        const a={finished,keyframes,finish,cancel(){active.delete(a);reject(new Error('cancelled'));}};
        animations.push(a);active.add(a);return a;
      }};},
    addEventListener(name,fn){events.set(name,fn);}
  };
  const window = {addEventListener(name, fn){events.set(name, fn);}};
  if (native) {
    window.onpagereveal = null;
    document.startViewTransition = () => { throw Error('Cross-document navigation must not start a second transition'); };
  }
  runInNewContext(source,{window,document,location,URL,Date,Promise,
    sessionStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},
    matchMedia:()=>({matches:reduced}),HTMLDialogElement:function(){},Element:{prototype:{animate(){}}},
    requestAnimationFrame:fn=>frames.push(fn),setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout(){}});
  return {window,location,values,active,animations,frames,events,timers,classes,roots,get paper(){return paper;}};
}
async function paint(env) { env.frames.splice(0).forEach(f=>f());await flush(); }
(async()=>{
  const env=setup();let reveals=0;
  const operation=env.window.LAND_TRANSITION.turnPage(()=>{assert.equal(env.paper.style.clipPath,'inset(0% 0% 0% 0%)');reveals++;});
  assert.equal(reveals,0,'Reading must stay behind the title until fully covered');
  assert.equal(env.roots[0].clip,'inset(0% 0% 0% 100%)','First cover frame must be set before showing');
  env.animations[0].finish();await flush();
  assert.equal(reveals,1);
  assert.equal(env.active.size,0,'No filled cover may remain under the next animation');
  await paint(env);assert.equal(env.animations.length,1,'Wait for destination layout before uncovering');
  await paint(env);assert.equal(env.animations.length,2);
  assert.equal(env.active.size,1,'Only one paper animation may be active');
  env.animations[1].finish();await operation;
  assert.equal(env.paper.open,false);assert.equal(env.active.size,0);
  assert.equal(env.paper.style.clipPath,'inset(0% 100% 0% 0%)');
  assert.equal(env.classes.has('land-in-transit'),false);
  // Reusing the same sheet must not revive any filled animation from the previous turn.
  const again=env.window.LAND_TRANSITION.turnPage(()=>{});
  assert.equal(env.active.size,1);
  env.animations[2].finish();await flush();await paint(env);await paint(env);
  env.animations[3].finish();await again;assert.equal(env.active.size,0);
  console.log('PASS: opaque handoff, one animation per phase, no revived covers on reuse');

  const incoming=setup({incoming:true});
  assert.equal(incoming.classes.has('land-arriving'),true);
  assert.equal(incoming.timers.length,0,'Slow resources must not trigger premature reveal');
  const arrival=incoming.events.get('DOMContentLoaded')();
  assert.equal(incoming.paper.style.clipPath,'inset(0% 0% 0% 0%)');
  assert.equal(incoming.animations.length,0);
  await paint(incoming);await paint(incoming);
  incoming.animations[0].finish();await arrival;
  assert.equal(incoming.paper.open,false);assert.equal(incoming.active.size,0);
  console.log('PASS: incoming navigation holds opaque paper through destination layout');

  const quiet=setup({reduced:true});let entered=false;
  await quiet.window.LAND_TRANSITION.turnPage(()=>{entered=true;});
  assert.equal(entered,true);assert.equal(quiet.animations.length,0);
  const failure=setup({reduced:true});
  await assert.rejects(failure.window.LAND_TRANSITION.turnPage(()=>{throw Error('failed update');}));
  assert.equal(failure.classes.has('land-in-transit'),false);
  console.log('PASS: reduced motion and failed updates release navigation locks');

  const native=setup({native:true,incoming:true});
  assert.equal(native.classes.has('land-arriving'),false,'A stale curtain must not hide the native destination');
  assert.equal(native.values.has('bittersweet-journey:page-curtain'),false);
  await native.window.LAND_TRANSITION.navigate('../../index.html');
  assert.equal(native.location.href,'http://localhost/site/index.html?lang=en');
  assert.equal(native.animations.length,0,'Native navigation must not run either paper sweep');
  assert.equal(native.paper,undefined,'Native navigation must not flash an extra dialog');
  const firstDestination=native.location.href;
  await native.window.LAND_TRANSITION.navigate('./chapters/dujiangyan/index.html');
  assert.equal(native.location.href,firstDestination,'Ignore double clicks during navigation');
  native.events.get('pageshow')({persisted:true});
  await native.window.LAND_TRANSITION.navigate('./chapters/dujiangyan/index.html');
  assert.match(native.location.href,/dujiangyan\/index.html\?lang=en$/,'History restoration releases the navigation lock');
  console.log('PASS: one native navigation, no duplicate curtain, language preserved, history restored');

  const arrivalNative=setup({native:true});
  let finishNative;
  arrivalNative.events.get('pagereveal')({viewTransition:{finished:new Promise(resolve=>finishNative=resolve)}});
  let overlapped=false;
  assert.equal(await arrivalNative.window.LAND_TRANSITION.turnPage(()=>{overlapped=true;}),false);
  assert.equal(overlapped,false,'Do not open reading while the document is still transitioning');
  finishNative();await flush();
  const reducedNative=setup({native:true,reduced:true});
  let skipped=false;
  reducedNative.events.get('pagereveal')({viewTransition:{skipTransition(){skipped=true;},finished:Promise.resolve()}});
  await flush();assert.equal(skipped,true);
  await reducedNative.window.LAND_TRANSITION.navigate('../../index.html');
  assert.equal(reducedNative.animations.length,0);
  console.log('PASS: native arrival avoids overlapping animations and respects reduced motion');
})().catch(error=>{console.error(error);process.exitCode=1;});
