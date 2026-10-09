/* Browser regression: PLAYWRIGHT_MODULE may point to an existing Playwright install. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const output=path.join(os.tmpdir(),'bittersweet-atlas-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(bytes);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    await page.addInitScript(()=>localStorage.setItem('bittersweet-journey:my-hometown:started','true'));
    page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/site/index.html`;
    await page.goto(url);await page.waitForFunction(()=>window.ATLAS_CAMERA);await page.waitForTimeout(500);
    await page.screenshot({path:path.join(output,'desktop.png')});
    assert.equal(await page.locator('.physical-atlas .atlas-land').count(),1);
    const anchors = () => page.locator('.story-point .point-core').evaluateAll(nodes => nodes.map(core => {
      const svg = core.ownerSVGElement, group = core.parentElement;
      const world = new DOMPoint(core.cx.baseVal.value, core.cy.baseVal.value).matrixTransform(core.getCTM()).matrixTransform(svg.getCTM().inverse());
      const projected = window.ATLAS_CAMERA.project(Number(group.dataset.longitude), Number(group.dataset.latitude));
      return {id:group.dataset.story, x:world.x, y:world.y, expected:projected};
    }));
    const fixedAnchors = await anchors();
    fixedAnchors.forEach(p => assert(Math.hypot(p.x-p.expected[0],p.y-p.expected[1])<.001, p.id+' uses geographic projection'));
    assert.equal(await page.locator('.question-accent').innerText(), 'illuminate');
    const before=await page.evaluate(()=>window.ATLAS_CAMERA.state);
    const originalSize=await page.locator('[data-story="dujiangyan"] .point-core').boundingBox();
    const initialFrame=await page.locator('.china-map').evaluate(svg=>({width:svg.viewBox.baseVal.width,scale:svg.getScreenCTM().a}));
    assert(initialFrame.width<944,'default framing is tighter than the former 944-unit view');
    for(const dot of await page.locator('.story-point.available .point-core').all()) {
      const b=await dot.boundingBox();assert(b.x>=0&&b.x+b.width<=1440&&b.y>=72&&b.y+b.height<=872,'desktop overview includes each available chapter');
    }
    await page.locator('[data-camera="in"]').click();await page.locator('[data-camera="in"]').click();
    await page.waitForFunction(()=>document.querySelector('.china-map').dataset.detail==='2');
    const atRegion=await page.locator('.physical-label:visible').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).visibility==='visible').length);
    await page.locator('[data-camera="in"]').click();await page.locator('[data-camera="in"]').click();
    await page.waitForFunction(()=>document.querySelector('.china-map').dataset.detail==='3');
    assert.equal(await page.locator('.atlas-intro h1').isVisible(),true,'heading stays visible when zoomed');
    assert.equal(await page.locator('.cta-callout').isVisible(),true,'callout stays visible when zoomed');
    await page.evaluate(()=>document.body.classList.add('all-revealed'));
    assert.equal(await page.locator('.cta-callout').isVisible(),true,'completion does not hide callout');
    await page.evaluate(()=>document.body.classList.remove('all-revealed'));
    assert.equal(await page.locator('.atlas-stream[data-level="3"]').first().isVisible(),true);
    await page.screenshot({path:path.join(output,'detail.png')});
    (await anchors()).forEach((p,i) => assert(Math.hypot(p.x-fixedAnchors[i].x,p.y-fixedAnchors[i].y)<.001,p.id+' remains fixed through zoom'));
    const k=await page.evaluate(()=>window.ATLAS_CAMERA.state.k);assert(k>before.k);
    const enlargedSize=await page.locator('[data-story="dujiangyan"] .point-core').boundingBox();
    assert(Math.abs(originalSize.width-enlargedSize.width)<.2,'chapter dots retain screen size');
    await page.mouse.move(850,620);await page.mouse.down();await page.mouse.move(1000,640,{steps:8});await page.mouse.up();
    const dragged=await page.evaluate(()=>window.ATLAS_CAMERA.state);assert.notEqual(dragged.x,before.x);
    await page.reload();await page.waitForFunction(()=>window.ATLAS_CAMERA);assert.equal(await page.evaluate(()=>window.ATLAS_CAMERA.state.k),k);
    await page.locator('[data-camera="home"]').click();assert.equal(await page.evaluate(()=>window.ATLAS_CAMERA.state.k),1);
    const fixedPoint=()=>page.evaluate(()=>new DOMPoint(820,420).matrixTransform(document.querySelector('.china-map').getScreenCTM().inverse()).toJSON());
    const cursorBefore=await fixedPoint();await page.mouse.move(820,420);await page.mouse.wheel(0,-150);await page.waitForTimeout(100);
    const cursorAfter=await fixedPoint();assert(Math.hypot(cursorBefore.x-cursorAfter.x,cursorBefore.y-cursorAfter.y)<.01,'wheel zoom anchors at cursor');
    await page.locator('[data-camera="home"]').click();
    await page.locator('.china-map').focus();await page.keyboard.press('+');assert((await page.evaluate(()=>window.ATLAS_CAMERA.state.k))>1);
    await page.keyboard.press('Home');
    await page.locator('button[data-language="zh"]').click();
    assert.equal(await page.locator('.question-accent').innerText(), '\u7167\u4eae');
    await page.locator('button[data-language="en"]').click();await page.waitForTimeout(100);
    assert.equal(await page.locator('.question-accent').innerText(),'illuminate');
    assert.equal(await page.locator('[data-camera="home"]').textContent(),'All');
    assert.equal(await page.locator('.atlas-zoom-controls button').count(),3);
    assert.equal(await page.locator('.atlas-gesture-hint').count(),0);
    assert.equal(await page.locator('.atlas-footer-source .atlas-notes-toggle').count(),1);
    await page.locator('.atlas-notes-toggle').click();
    assert.equal(await page.locator('.atlas-notes-toggle').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('.atlas-geography-notes').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.atlas-geography-notes').isVisible(),false);
    assert.equal(await page.locator('.atlas-notes-toggle').evaluate(n=>n===document.activeElement),true);
    for(const point of await page.locator('.story-point').all()) {
      assert.equal(await point.locator('.point-pulse').count(),1);
      assert.equal(await point.locator('.point-orbit,.point-archive-mark').count(),0);
    }
    assert.equal(await page.locator('[data-story="kashgar"] .point-pulse').evaluate(n=>getComputedStyle(n).animationName),'atlas-pulse');
    await page.evaluate(()=>document.body.classList.add('kashgar-complete'));
    assert.equal(await page.locator('[data-story="kashgar"] .point-pulse').isVisible(),false);
    await page.evaluate(()=>document.body.classList.remove('kashgar-complete'));
    await page.screenshot({path:path.join(output,'english.png')});
    // A drag starting on a chapter is not a chapter click.
    const dot=await page.locator('[data-story="dujiangyan"] .point-core').boundingBox();
    await page.mouse.move(dot.x+dot.width/2,dot.y+dot.height/2);await page.mouse.down();await page.mouse.move(dot.x+90,dot.y+30,{steps:5});await page.mouse.up();
    await page.waitForTimeout(150);assert(page.url().includes('/site/index.html'));
    await page.locator('[data-camera="home"]').click();
    await page.waitForTimeout(550);
    await page.locator('[data-story="dujiangyan"] .point-core').click();
    await page.waitForURL('**/chapters/dujiangyan/**');
    await page.goBack();await page.waitForFunction(()=>window.ATLAS_CAMERA);
    assert.equal(await page.evaluate(()=>window.ATLAS_CAMERA.state.k),1,'chapter round trip restores camera');
    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url);await mobile.waitForFunction(()=>window.ATLAS_CAMERA);await mobile.waitForTimeout(200);
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await mobile.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
    assert.equal(await mobile.locator('.site-progress').isVisible(),true,'mobile collection target is visible');
    const introY=await mobile.locator('.atlas-intro').evaluate(n=>n.getBoundingClientRect().top);
    await mobile.evaluate(()=>window.scrollTo(0,100));
    assert.equal(await mobile.locator('.atlas-intro').evaluate(n=>n.getBoundingClientRect().top),introY,'mobile intro is fixed');
    await mobile.evaluate(()=>window.scrollTo(0,0));
    const m=await mobile.locator('.china-map').boundingBox();
    const session=await mobile.context().newCDPSession(mobile);
    const touch=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id,radiusX:2,radiusY:2,force:1}))});
    await touch('touchStart',[[150,m.y+210,1],[235,m.y+210,2]]);
    await touch('touchMove',[[100,m.y+210,1],[285,m.y+210,2]]);
    await touch('touchEnd',[]);await mobile.waitForTimeout(100);
    assert((await mobile.evaluate(()=>window.ATLAS_CAMERA.state.k))>1.5,'pinch zoom changes scale');
    await mobile.screenshot({path:path.join(output,'mobile-detail.png'),fullPage:true});
    await mobile.locator('[data-camera="home"]').click();await mobile.waitForTimeout(100);
    for(const dot of await mobile.locator('.story-point.available .point-core').all()) {
      const b=await dot.boundingBox();assert(b.x>=0&&b.x+b.width<=390,'mobile All includes each chapter longitude');
    }
    await mobile.screenshot({path:path.join(output,'mobile-all.png'),fullPage:true});
    await mobile.locator('[data-camera="home"]').click();await mobile.waitForTimeout(550);
    await mobile.evaluate(()=>{
      window.thoughtAnimations=[];
      const animate=Element.prototype.animate;
      Element.prototype.animate=function(frames,options){
        if(this.matches('.thought-trail circle'))window.thoughtAnimations.push({radius:+this.getAttribute('r'),delay:options.delay,duration:options.duration});
        return animate.call(this,frames,options);
      };
    });
    await mobile.locator('[data-story="dujiangyan"] .point-core').tap();
    await mobile.waitForTimeout(350);
    assert.equal(await mobile.locator('.chapter-preview').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
    assert.equal(await mobile.locator('.thought-trail circle').count(),3);
    const circles=await mobile.locator('.thought-trail circle').evaluateAll(nodes=>nodes.map(n=>({x:+n.getAttribute('cx'),y:+n.getAttribute('cy'),r:+n.getAttribute('r')})));
    for(let i=1;i<circles.length;i++)assert(Math.hypot(circles[i].x-circles[i-1].x,circles[i].y-circles[i-1].y)-circles[i].r-circles[i-1].r>=8,'thought circles have clear space between their edges');
    assert(parseFloat(await mobile.locator('.chapter-preview').evaluate(el=>getComputedStyle(el).borderTopLeftRadius))<=18,'thought card has restrained rectangular corners');
    const thoughts=await mobile.evaluate(()=>window.thoughtAnimations);
    assert.equal(thoughts.length,3,'one fade per thought circle');
    assert(thoughts[0].radius<thoughts[1].radius&&thoughts[1].radius<thoughts[2].radius,'bubbles grow from the point toward the card');
    assert(thoughts[0].delay<thoughts[1].delay&&thoughts[1].delay<thoughts[2].delay,'circles appear in sequence');
    assert(thoughts.every(a=>a.duration>0&&a.delay+a.duration<=200),'the entire sequence finishes within 200 ms');
    await mobile.screenshot({path:path.join(output,'touch-preview.png'),fullPage:true});
    assert(mobile.url().includes('/site/index.html'),'first touch opens preview');
    await mobile.locator('.chapter-preview.is-visible .enter-story').tap();
    await mobile.waitForURL('**/chapters/dujiangyan/**');
    // Every completion return sends that chapter's seal from its point to the collector.
    const chapters=['dujiangyan','secret-spring','taoist-tower','mountain-resort','yangguan','kashgar','fish-tail-lodge','mogao-caves'];
    await page.evaluate(ids=>{ids.forEach(id=>localStorage.setItem(`bittersweet-journey:${id}:complete`,'true'));localStorage.setItem('bittersweet-journey:atlas-finale:v1',window.ATLAS_STORIES.map(s=>s.id).sort().join('|'));},chapters);
    for(const id of chapters){
      const reveal=id==='mountain-resort'?'chengde':id;
      await page.goto(url+'?revealed='+reveal,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.body.dataset.sealCollection==='flying');
      assert((await page.locator('.flying-collection-seal').getAttribute('src')).includes('seal-'+id+'.svg'));
      if(id==='dujiangyan')await page.screenshot({path:path.join(output,'seal-flight.png')});
      await page.waitForFunction(()=>document.body.dataset.sealCollection==='collected');
      assert.equal(await page.locator('.flying-collection-seal').count(),0);
    }
    await mobile.locator('.chapter-leaf-enter').tap();
    await mobile.locator('.finish-chapter').tap();
    await mobile.waitForURL('**/site/index.html**');
    await mobile.waitForFunction(()=>document.body.dataset.sealCollection==='flying');
    assert.equal(await mobile.locator('html').evaluate(el=>el.matches('.land-in-transit')),false,'collection waits until the return curtain clears');
    await mobile.screenshot({path:path.join(output,'mobile-seal-flight.png'),fullPage:true});
    await mobile.waitForFunction(()=>document.body.dataset.sealCollection==='collected');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>localStorage.removeItem('bittersweet-journey:dujiangyan:seal-reveal-seen'));
    await page.goto(url+'?revealed=dujiangyan');
    await page.waitForFunction(()=>document.body.dataset.sealCollection==='collected');
    assert.equal(await page.locator('.flying-collection-seal').count(),0,'reduced motion skips flight');
    await page.reload();assert.equal(await page.locator('body').getAttribute('data-seal-collection'),null,'reload does not repeat collection');
    await page.locator('[data-story="dujiangyan"] .point-core').hover();
    assert.equal(await page.locator('.thought-trail').evaluate(el=>el.getAnimations({subtree:true}).length),0,'reduced motion skips thought fades');
    assert.deepEqual(errors,[]);console.log('PASS: physical layers, camera, persistent intro, rapid sequential thought bubbles, footer notes, uniform symbols, all eight seal flights, mobile completion, reduced motion and replay prevention.');
    console.log(JSON.stringify({screenshots:output,regionLabels:atRegion}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
