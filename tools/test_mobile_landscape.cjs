const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(os.tmpdir(),'bittersweet-mobile-landscape');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 try{
  const base=`http://127.0.0.1:${server.address().port}/site/`,page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.addInitScript(()=>localStorage.setItem('bittersweet-journey:dujiangyan:started','true'));
  page.on('pageerror',e=>errors.push(e.message));
  for(const chapter of fs.readdirSync(path.join(root,'site/chapters')).filter(s=>!s.startsWith('_'))){
   await page.setViewportSize({width:390,height:844});await page.goto(base+`chapters/${chapter}/index.html?open=1&section=2&lang=zh`);
   const gate=page.locator('.mobile-orientation');await gate.waitFor({state:'visible'});assert((await gate.textContent()).includes('\u8bf7\u6a2a\u5411'));
   await page.keyboard.press('Escape');assert(await gate.isVisible());
   if(chapter==='dujiangyan')await page.screenshot({path:path.join(out,'portrait-gate.png')});
   await page.setViewportSize({width:844,height:390});await gate.waitFor({state:'hidden'});await page.waitForTimeout(180);
   const geometry=await page.evaluate(()=>{const a=document.querySelector('.map-stage').getBoundingClientRect(),b=document.querySelector('.reader-panel').getBoundingClientRect(),reader=document.querySelector('.reader-scroll');return{side:a.right<=b.left+2,aligned:Math.abs(a.top-b.top)<2,mapHeight:a.height,readerHeight:reader.clientHeight,overflow:document.documentElement.scrollWidth>innerWidth,scrolls:reader.scrollHeight>reader.clientHeight};});
   assert(geometry.side&&geometry.aligned,chapter+' map/text must be side by side');assert(geometry.mapHeight>200&&geometry.readerHeight>120,chapter+' usable height');assert(!geometry.overflow&&geometry.scrolls,chapter+' scrolling and viewport bounds');
   if(['dujiangyan','my-hometown','kashgar'].includes(chapter))await page.screenshot({path:path.join(out,chapter+'-landscape.png')});
   await page.waitForTimeout(600); // Let the development deep-link alignment finish.
   const scroll=await page.locator('.reader-scroll').evaluate(n=>{n.scrollTop=120;return n.scrollTop;});assert(scroll>0);
   await page.setViewportSize({width:390,height:844});await gate.waitFor({state:'visible'});await page.setViewportSize({width:844,height:390});await gate.waitFor({state:'hidden'});assert.equal(await page.locator('.reader-scroll').evaluate(n=>n.scrollTop),scroll);
   console.log('PASS landscape:',chapter);
  }
  await page.goto(base+'chapters/dujiangyan/index.html?lang=en');await page.setViewportSize({width:390,height:844});await page.locator('.mobile-orientation').waitFor({state:'visible'});assert((await page.locator('.mobile-orientation').textContent()).includes('Turn the page sideways'));assert.equal(await page.locator('#chapter-leaf').evaluate(n=>n.open),true);
  await page.setViewportSize({width:844,height:390});await page.locator('.mobile-orientation').waitFor({state:'hidden'});assert.equal(await page.locator('#chapter-leaf').evaluate(n=>n.open),true);await page.screenshot({path:path.join(out,'curtain-landscape.png')});
  await page.goto(base+'index.html?lang=en');await page.waitForFunction(()=>window.ATLAS_STORIES);
  assert(await page.locator('.atlas-map-stage').evaluate(n=>n.clientHeight>250),'atlas must retain full usable landscape height');
  assert(await page.locator('.atlas-footer').evaluate(n=>n.getBoundingClientRect().bottom<=innerHeight+1),'atlas footer stays visible');
  await page.screenshot({path:path.join(out,'atlas-landscape.png')});
  await page.evaluate(()=>{window.ATLAS_STORIES.forEach(s=>localStorage.setItem(s.storageKey,'true'));localStorage.setItem('bittersweet-journey:atlas-finale:v1',window.ATLAS_STORIES.map(s=>s.id).sort().join('|'));window.dispatchEvent(new Event('atlas-progress-change'));});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.credits-replay').click();await page.setViewportSize({width:390,height:844});await page.locator('.mobile-orientation').waitFor({state:'visible'});assert.equal(await page.locator('.credits-play').getAttribute('aria-pressed'),'false');await page.setViewportSize({width:844,height:390});await page.locator('.mobile-orientation').waitFor({state:'hidden'});assert(await page.locator('.cinema-credits').isVisible());
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'chapters/my-hometown/index.html?tour=1&lang=en');await page.locator('.journey').waitFor({state:'visible'});assert(await page.locator('.scene-question .opening-link').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'intro entry remains within landscape viewport');await page.screenshot({path:path.join(out,'intro-landscape.png')});
  const desktop=await browser.newPage({viewport:{width:390,height:844}});await desktop.addInitScript(()=>localStorage.setItem('bittersweet-journey:dujiangyan:started','true'));await desktop.goto(base+'index.html');assert.equal(await desktop.locator('.mobile-orientation').evaluate(n=>n.open),false);await desktop.setViewportSize({width:1440,height:900});await desktop.screenshot({path:path.join(out,'desktop-atlas.png')});await desktop.close();
  assert.deepEqual(errors,[]);await page.close();console.log('PASS: required touch orientation, preserved reading, localized gate, modal layering and desktop access.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
