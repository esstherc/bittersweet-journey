const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'bittersweet-journey-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 try{
  const url='http://127.0.0.1:'+server.address().port+'/site/index.html';
  for(const mobile of [false,true]){
   const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},reducedMotion:mobile?'reduce':'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'?credits=1&lang='+(mobile?'zh':'en'));
   await page.waitForFunction(()=>window.ATLAS_STORIES && document.querySelector('.credits-replay'));
   assert.equal(await page.locator('.cinema-credits').isVisible(),false,'query cannot bypass completion');
   assert.equal(await page.locator('.credits-replay').isVisible(),false);
   assert.equal(await page.locator('.cta-callout').isVisible(),true);
   await page.evaluate(()=>{window.ATLAS_STORIES.slice(0,-1).forEach(s=>localStorage.setItem(s.storageKey,'true'));window.dispatchEvent(new Event('atlas-progress-change'));});
   await page.waitForTimeout(200);assert.equal(await page.locator('.cinema-credits').isVisible(),false);
   await page.evaluate(()=>{localStorage.setItem(window.ATLAS_STORIES.at(-1).storageKey,'true');document.body.dataset.returningStory='last';document.body.dataset.sealCollection='flying';window.dispatchEvent(new Event('atlas-progress-change'));});
   await page.waitForTimeout(200);assert.equal(await page.locator('.cinema-credits').isVisible(),false);
   await page.evaluate(()=>document.body.dataset.sealCollection='collected');
   await page.locator('.cinema-credits').waitFor({state:'visible'});
   assert.equal(await page.locator('.credits-replay').isVisible(),true);
   assert.equal(await page.locator('.cta-callout').isVisible(),false);
   assert.equal(await page.locator('.credits-untranslated').count(),6);
   assert((await page.locator('.credits-titles li').first().textContent()).startsWith('01'));
   assert((await page.locator('.credits-titles li').last().textContent()).startsWith('26'));
   assert((await page.locator('.credits-attribution').textContent()).includes('Yanbing Chen'));
   assert((await page.locator('.credits-attribution').textContent()).includes('Eugenie Huang'));
   assert((await page.locator('.credits-attribution').textContent()).includes('CN Times Books'));

   assert.equal(await page.locator('.credits-titles li').count(),26);
   assert.equal(await page.locator('.credits-selected').count(),9);
   assert.equal(await page.locator('.finale-seals img').count(),9);
   await page.screenshot({path:path.join(output,mobile?'credits-mobile.png':'credits-desktop.png')});
   const view=page.locator('.credits-viewport');
   if(mobile){await page.waitForTimeout(400);assert.equal(await view.evaluate(n=>n.scrollTop),0);}
   else{await page.waitForFunction(()=>document.querySelector('.credits-viewport').scrollTop>5);await page.locator('.credits-play').click();const at=await view.evaluate(n=>n.scrollTop);await page.waitForTimeout(250);assert.equal(await view.evaluate(n=>n.scrollTop),at);}
   await view.evaluate(n=>n.scrollTop=document.querySelector('.credits-library').offsetTop-100);
   await page.screenshot({path:path.join(output,mobile?'credits-titles-mobile.png':'credits-titles-desktop.png')});
   assert(await view.evaluate(n=>n.scrollWidth<=n.clientWidth+1),'no horizontal overflow');
   await page.keyboard.press('Escape');assert.equal(await page.locator('.cinema-credits').isVisible(),false);
   await page.locator('.credits-replay').click();assert(await page.locator('.cinema-credits').isVisible());
   await page.locator('.finale-return').click();assert.equal(await view.evaluate(n=>n.getAnimations().length),0);
   assert(await page.locator('.finale-message').textContent().then(t=>t.includes('9')));
   await page.reload();
   assert.equal(await page.locator('.cinema-credits').isVisible(),false,'automatic finale plays only once');
   await page.goto(url.replace('/site/index.html','/site/chapters/dujiangyan/index.html'));
   assert.equal(await page.locator('.chapter-credits-link').count(),0);
   await page.goto(url);
   await page.evaluate(()=>{window.ATLAS_STORIES.forEach(s=>localStorage.removeItem(s.storageKey));window.dispatchEvent(new Event('atlas-progress-change'));});
   assert.equal(await page.locator('.credits-replay').isVisible(),false);
   assert.equal(await page.locator('.cta-callout').isVisible(),true);
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: bilingual credits, 26 ordered titles, nine highlighted selections, auto-scroll/pause, reduced motion, completion-only replay, no chapter links, reset and responsive overflow.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
