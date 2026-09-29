const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'bittersweet-journey-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const pixel=(page,x,y)=>page.locator('.journey-fog').evaluate((c,p)=>{const rect=c.getBoundingClientRect();return c.getContext('2d').getImageData(Math.floor(p.x*c.width/rect.width),Math.floor(p.y*c.height/rect.height),1,1).data[3];},{x,y});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/site/index.html`;
    await page.goto(url);await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    assert.equal(await pixel(page,20,20),191,'unexplored map starts under a translucent brown veil');
    assert.equal(await page.locator('.journey-fog').getAttribute('data-completed'),'0');
    await page.screenshot({path:path.join(output,'dark-start.png')});
    const box=await page.locator('.atlas-map-stage').boundingBox();
    const before=await page.evaluate(()=>window.ATLAS_JOURNEY.state.position);
    await page.mouse.move(box.x+box.width*.72,box.y+box.height*.55);
    await page.waitForTimeout(50);
    const lit=await page.evaluate(()=>window.ATLAS_JOURNEY.state.light);
    assert.equal(await pixel(page,lit.x,lit.y),0,'cursor center reveals the paper');
    assert.equal(await pixel(page,20,20),191,'distant unexplored map retains a 75% veil');
    await page.waitForTimeout(850);
    const after=await page.evaluate(()=>window.ATLAS_JOURNEY.state.position);
    assert(Math.hypot(after.x-before.x,after.y-before.y)>10,'traveler slowly follows the pointer');
    await page.screenshot({path:path.join(output,'lantern.png')});
    await page.evaluate(()=>{localStorage.setItem('bittersweet-journey:dujiangyan:complete','true');window.dispatchEvent(new Event('atlas-progress-change'));});
    await page.mouse.move(10,20);await page.waitForTimeout(60);
    const center=async()=>page.locator('[data-story="dujiangyan"] .point-core').evaluate(el=>{const a=el.getBoundingClientRect(),b=document.querySelector('.atlas-map-stage').getBoundingClientRect();return {x:a.x+a.width/2-b.x,y:a.y+a.height/2-b.y};});
    let p=await center();assert.equal(await pixel(page,p.x,p.y),0,'completed chapter stays lit without the cursor');
    await page.reload();await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    assert.equal(await page.locator('.journey-fog').getAttribute('data-completed'),'1','completion light survives reload');
    await page.locator('[data-camera="in"]').click();await page.waitForTimeout(80);
    p=await center();assert.equal(await pixel(page,p.x,p.y),0,'completed light follows the zoomed chapter');
    await page.locator('[data-camera="home"]').click();
    await page.locator('[data-story="kashgar"]').focus();await page.waitForTimeout(50);
    assert(await page.evaluate(()=>window.ATLAS_JOURNEY.state.light!==null),'keyboard focus carries the light');
    await page.screenshot({path:path.join(output,'collected-and-focused.png')});
    await page.evaluate(()=>{
      window.navigationCalls=[];
      window.LAND_TRANSITION={navigate(url){window.navigationCalls.push({url,state:window.ATLAS_JOURNEY.state,time:performance.now()});}};
    });
    await page.locator('[data-story="kashgar"]').press('Enter');
    await page.waitForFunction(()=>window.ATLAS_JOURNEY.state.running);
    assert.equal(await page.evaluate(()=>window.navigationCalls.length),0,'chapter does not open before arrival');
    await page.locator('[data-story="kashgar"]').dispatchEvent('click');
    await page.waitForFunction(()=>window.navigationCalls.length===1);
    const result=await page.evaluate(()=>{
      const c=window.navigationCalls[0],core=document.querySelector('[data-story="kashgar"] .point-core').getBoundingClientRect();
      const at=new DOMPoint(c.state.position.x,c.state.position.y).matrixTransform(document.querySelector('.china-map').getScreenCTM());
      return {url:c.url,distance:Math.hypot(at.x-core.x-core.width/2,at.y-core.y-core.height/2),count:window.navigationCalls.length};
    });
    assert(result.url.includes('/chapters/kashgar/'));assert(result.distance<1,'traveler arrives at the chapter before navigation');assert.equal(result.count,1);
    await page.locator('.reset-progress').click();await page.waitForTimeout(50);
    assert.equal(await page.locator('.journey-fog').getAttribute('data-completed'),'0','reset also clears permanent lights');
    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(url);await mobile.waitForFunction(()=>window.ATLAS_JOURNEY);
    await mobile.locator('[data-camera="home"]').tap();
    await mobile.locator('[data-story="dujiangyan"] .point-core').tap();await mobile.waitForTimeout(50);
    assert(await mobile.evaluate(()=>window.ATLAS_JOURNEY.state.light!==null),'touch creates a lantern');
    assert.equal(await mobile.locator('.chapter-preview').isVisible(),true,'first touch keeps the thought preview');
    await mobile.screenshot({path:path.join(output,'mobile.png')});
    await mobile.locator('.enter-story').tap();await mobile.waitForURL('**/chapters/dujiangyan/**');
    // All eight available readings count; the unpublished ninth slot is not required.
    await page.reload();await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    await page.evaluate(()=>{window.ATLAS_STORIES.slice(0,-1).forEach(s=>localStorage.setItem(s.storageKey,'true'));window.dispatchEvent(new Event('atlas-progress-change'));});
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.atlas-finale').isVisible(),false,'seven chapters do not finish the journey');
    await page.evaluate(()=>{localStorage.setItem(window.ATLAS_STORIES.at(-1).storageKey,'true');document.body.dataset.returningStory='last';document.body.dataset.sealCollection='flying';window.dispatchEvent(new Event('atlas-progress-change'));});
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.atlas-finale').isVisible(),false,'ending waits for the last seal to reach the collection');
    await page.evaluate(()=>document.body.dataset.sealCollection='collected');
    await page.locator('.atlas-finale').waitFor({state:'visible'});
    assert.equal(await page.locator('.finale-seals img').count(),8);
    assert.equal(await pixel(page,20,20),0,'the whole map is illuminated');
    await page.screenshot({path:path.join(output,'finale.png')});
    await page.locator('.finale-return').click();
    await page.reload();await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    assert.equal(await page.locator('.atlas-finale').isVisible(),false,'ending does not repeat on reload');
    assert.equal(await pixel(page,20,20),0,'complete map stays illuminated');
    await page.locator('.reset-progress').click();await page.waitForTimeout(50);
    assert.equal(await pixel(page,20,20),191,'reset restores the brown veil');
    assert.equal(await page.evaluate(()=>localStorage.getItem('bittersweet-journey:atlas-finale:v1')),null);
    assert.deepEqual(errors,[]);
    console.log('PASS: dark start, local cursor light, slow traveler, persistent/zoomed completion buffers, keyboard and touch light, arrival before single navigation, reset, reduced motion.');console.log(output);
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
