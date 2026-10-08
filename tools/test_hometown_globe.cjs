const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'bittersweet-journey-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});

(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/site/chapters/my-hometown/index.html?open=1&lang=zh');
 await page.waitForFunction(()=>window.HOMETOWN_GLOBE);await page.waitForTimeout(600);
 assert.equal(await page.locator('.map-tools,.journey-map-tools').count(),0);
 for(const scene of ['earth','eurasia','sealed','earth-return']){
 await page.evaluate(scene=>window.HOMETOWN_GLOBE.set(scene,document.body.dataset.language),scene);await page.waitForTimeout(200);
 assert.equal(await page.locator('.earth-scene').isVisible(),true);
 assert.equal(await page.evaluate(()=>document.querySelector('.earth-orb canvas').getContext('webgl').getError()),0);
 if(viewport.width===1440||scene==='sealed')await page.screenshot({path:path.join(output,'hometown-'+viewport.width+'-'+scene+'.png')});
 }
 await page.evaluate(()=>{const el=document.querySelector('[data-map-section="2"][data-map-paragraph="0"]');el.scrollIntoView({block:'start'});});await page.waitForTimeout(300);
 assert.equal(await page.locator('.earth-scene').isVisible(),false);
 await page.locator('.language-switch [data-language="en"]').click();await page.waitForTimeout(200);
 await page.evaluate(()=>window.HOMETOWN_GLOBE.set('sealed','en'));await page.waitForTimeout(200);
 assert.match(await page.locator('.earth-context').textContent(),/Pacific/);
 if(viewport.width===844)await page.screenshot({path:path.join(output,'hometown-844-sealed-en.png')});
 if(viewport.width===1440){await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>window.HOMETOWN_GLOBE.set('earth','en'));await page.waitForTimeout(100);const a=await page.locator('.earth-orb canvas').screenshot();await page.waitForTimeout(400);const b=await page.locator('.earth-orb canvas').screenshot();assert(!a.equals(b),'Globe should rotate');}
 assert.deepEqual(errors,[]);await page.close();
}console.log('PASS: globe scenes, language-aware labels, map transition, removed controls and WebGL on desktop/mobile.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());