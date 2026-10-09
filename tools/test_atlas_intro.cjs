const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('site/scripts/atlas-intro.js','utf8');
function setup(entries={},search=''){
 const values=new Map(Object.entries(entries)),visits=[],events=new Map();
 const localStorage={get length(){return values.size;},key:index=>[...values.keys()][index],getItem:key=>values.get(key)||null};
 const window={addEventListener:(name,handler)=>events.set(name,handler)};
 const document={currentScript:{src:'https://example.org/repo/site/scripts/atlas-intro.js'},documentElement:{style:{}}};
 const location={search,replace:href=>visits.push(href)};
 vm.runInNewContext(source,{window,document,location,localStorage,URL,URLSearchParams});
 return {values,visits,events,api:window.ATLAS_INTRO};
}
for(const entries of [{},{'bittersweet-journey:language':'zh'},{'bittersweet-journey:my-hometown:intro-seen':'true'},{'bittersweet-journey:dujiangyan:complete':'false'}]){
 const state=setup(entries);assert.equal(state.visits.length,1);const url=new URL(state.visits[0]);assert.equal(url.pathname,'/repo/site/chapters/my-hometown/index.html');assert.equal(url.searchParams.get('tour'),'1');state.events.get('pageshow')();assert.equal(state.visits.length,1);
}
for(const entries of [{'bittersweet-journey:dujiangyan:complete':'true'},{'bittersweet-journey:mountain-resort:started':'true'},{'bittersweet-journey:kashgar:scene':'3'}]){
 const state=setup(entries);assert.equal(state.visits.length,0);state.values.clear();state.events.get('pageshow')();assert.equal(state.visits.length,1);
}
assert.equal(new URL(setup({'bittersweet-journey:language':'en'},'?lang=zh').visits[0]).searchParams.get('lang'),'zh');
console.log('PASS: empty traces, stale intro flag, completed and partial reading, restored pages, language and project paths.');
