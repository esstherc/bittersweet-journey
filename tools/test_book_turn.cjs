const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(os.tmpdir(),'bittersweet-book-check');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(p)]||'application/octet-stream');res.end(data);});});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.route('https://fonts.gstatic.com/**',route=>route.abort());
    const base=`http://127.0.0.1:${server.address().port}/site/`;
    async function inspectFade(){
      await page.waitForFunction(()=>document.getAnimations().some(a=>a.animationName==='page-fade-out'));
      const state=await page.evaluate(()=>{
        const animations=document.getAnimations();
        const fade=animations.find(a=>a.animationName==='page-fade-out');fade.pause();fade.currentTime=140;
        const style=getComputedStyle(document.documentElement,'::view-transition-old(root)');
        const result={book:animations.some(a=>a.animationName?.startsWith('book-')),opacity:Number(style.opacity),transform:style.transform};
        fade.play();return result;
      });
      assert.equal(state.book,false);assert(state.opacity>0&&state.opacity<1);assert.equal(state.transform,'none');
      await page.waitForFunction(()=>!document.documentElement.classList.contains('land-in-transit'));
    }
    async function inspect(name,direction,duration=1800){
      await page.waitForFunction(d=>document.getAnimations().some(a=>a.animationName==='book-leaf-'+d),direction);
      const details=await page.evaluate(()=>{const a=document.getAnimations().filter(a=>a.animationName?.startsWith('book-'));a.forEach(a=>{a.pause();a.currentTime=800;});return a.map(a=>({name:a.animationName,duration:a.effect.getTiming().duration}));});
      assert(details.some(a=>a.name==='book-leaf-'+direction&&a.duration===duration));
      const zoomPhases=await page.evaluate(duration=>{
        const animations=document.getAnimations().filter(a=>a.animationName?.startsWith('book-'));
        const phases=[['old',.12],['new',.85]].map(([side,fraction])=>{
          animations.forEach(a=>a.currentTime=duration*fraction);
          const style=getComputedStyle(document.documentElement,`::view-transition-${side}(root)`);
          const matrix=new DOMMatrixReadOnly(style.transform);
          return {opacity:style.opacity,filter:style.filter,flat:[matrix.m12,matrix.m13,matrix.m21,matrix.m23,matrix.m31,matrix.m32].every(n=>Math.abs(n)<.00001)};
        });
        animations.forEach(a=>a.currentTime=duration*.24);
        const size=new DOMMatrixReadOnly(getComputedStyle(document.documentElement,'::view-transition-old(root)').transform).a;
        const background=getComputedStyle(document.documentElement,'::view-transition').backgroundImage;
        animations.forEach(a=>a.currentTime=duration*.27);
        return {phases,size,background,header:getComputedStyle(document.querySelector('.site-masthead')).viewTransitionName};
      },duration);
      assert.equal(zoomPhases.header,'none','Masthead should scale with the page, without a separate fade');
      assert(Math.abs(zoomPhases.size-.63)<.001,'Book page is 1.5 times the original .42 scale');
      assert(zoomPhases.background.includes('/transition-book.svg'));
      zoomPhases.phases.forEach(phase=>{
        assert.equal(phase.opacity,'1','Entrance and exit zoom must stay opaque');
        assert(['none','brightness(1)'].includes(phase.filter),'Zoom must not brighten or fade');
        assert(phase.flat,'Entrance and exit should scale without turning');
      });
      await page.waitForTimeout(100);
      const session=await page.context().newCDPSession(page);
      const shot=await session.send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(shot.data,'base64'));await session.detach();
      if(name==='file-preview-entry'){
        await page.evaluate(duration=>document.getAnimations().filter(a=>a.animationName?.startsWith('book-')).forEach(a=>a.currentTime=duration*.72),duration);
        assert.equal(await page.locator('.book-destination').evaluate(e=>getComputedStyle(e).visibility),'visible');
        await page.waitForTimeout(100);
        const client=await page.context().newCDPSession(page);
        const next=await client.send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(out,name+'-destination.png'),Buffer.from(next.data,'base64'));await client.detach();
      }
      await page.evaluate(()=>document.getAnimations().filter(a=>a.animationName?.startsWith('book-')).forEach(a=>a.play()));
      await page.waitForFunction(()=>!document.getAnimations().some(a=>a.animationName?.startsWith('book-')));
    }
    await page.goto(base+'index.html');await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    await page.locator('[data-story="kashgar"]').press('Enter');
    await page.waitForURL('**/chapters/kashgar/**',{waitUntil:'commit'});await inspect('enter-chapter','forward');
    await page.locator('.chapter-leaf-enter').click();
    await inspectFade();
    assert.equal(await page.locator('#chapter-leaf').evaluate(e=>e.open),false);
    assert.equal(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName?.startsWith('book-'))),false);
    await page.locator('.back-atlas').click();await page.waitForURL('**/site/index.html*',{waitUntil:'commit'});await inspectFade();
    assert.equal(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName?.startsWith('book-'))),false);
    await page.locator('button[data-language="en"]').click();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.waitForTimeout(200);
    await page.evaluate(()=>window.LAND_TRANSITION.navigate('./chapters/kashgar/index.html'));
    await page.waitForURL('**/chapters/kashgar/**',{waitUntil:'commit'});await inspect('english-entry','forward');
    await page.locator('.chapter-leaf-back').click();await page.waitForURL('**/site/index.html*',{waitUntil:'commit'});await inspectFade();
    assert.equal(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName?.startsWith('book-'))),false);
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>window.LAND_TRANSITION.navigate('./chapters/kashgar/index.html'));
    await page.waitForURL('**/chapters/kashgar/**',{waitUntil:'commit'});await inspect('mobile-enter','forward',1450);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.chapter-leaf-enter').click();
    await page.waitForFunction(()=>!document.documentElement.classList.contains('land-in-transit'));
    assert.equal(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName?.startsWith('book-'))),false);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:1440,height:900});
    await page.goto(require('node:url').pathToFileURL(path.join(root,'site/index.html')).href);
    await page.waitForFunction(()=>window.LAND_TRANSITION);
    await page.evaluate(()=>{window.LAND_TRANSITION.navigate('./chapters/kashgar/index.html');});
    await inspect('file-preview-entry','forward');
    await page.waitForURL('**/chapters/kashgar/**');
    assert.equal(await page.locator('#chapter-leaf').evaluate(e=>e.open),true);
    assert.deepEqual(errors,[]);console.log('PASS: real atlas activation, book on entry, fade on reading and both return links, shared blank book in both languages, mobile, reduced motion and file-preview fallback.');console.log(out);
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

