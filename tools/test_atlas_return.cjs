const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix='/bittersweet-journey/',out=path.join(os.tmpdir(),'bittersweet-return-check');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!url.startsWith(prefix)){res.writeHead(404).end();return;}
  let rel=url.slice(prefix.length);if(!rel||rel.endsWith('/'))rel+='index.html';
  const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  // Like Linux hosting: reject case mismatches even when run on Windows.
  let dir=root;for(const part of rel.split('/')){if(!fs.existsSync(dir)||!fs.readdirSync(dir).includes(part)){res.writeHead(404).end();return;}dir=path.join(dir,part);}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
  try{
    const base=`http://127.0.0.1:${server.address().port}${prefix}`,errors=[],missing=[];
    const context=await browser.newContext();
    await context.route('https://fonts.googleapis.com/**',r=>r.abort());await context.route('https://fonts.gstatic.com/**',r=>r.abort());
    context.on('page',page=>{page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});});
    await context.addInitScript(()=>localStorage.setItem('bittersweet-journey:my-hometown:started','true'));
    const page=await context.newPage();await page.setViewportSize({width:1440,height:900});
    await page.goto(base);await page.waitForURL('**/site/index.html');await page.waitForFunction(()=>window.ATLAS_JOURNEY);
    assert.equal(await page.locator('.kashgar-memory').count(),0);
    for(const [name,viewport,reduced] of [['desktop',{width:1440,height:900},false],['mobile',{width:390,height:844},false],['reduced',{width:390,height:844},true]]){
      await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
      await page.evaluate(()=>{localStorage.clear();localStorage.setItem('bittersweet-journey:kashgar:complete','true');});
      await page.goto(base+'site/index.html?revealed=kashgar');
      if(!reduced){
        await page.waitForFunction(()=>document.body.dataset.sealCollection==='lighting');
        assert.equal(await page.locator('[data-seal="kashgar"]').evaluate(e=>getComputedStyle(e).opacity),'0');
        const light=await page.evaluate(()=>{
          const canvas=document.querySelector('.journey-fog'),c=canvas.getBoundingClientRect(),dot=document.querySelector('[data-story="kashgar"] .point-core').getBoundingClientRect();
          const ctx=canvas.getContext('2d'),scale=canvas.width/c.width;
          const x=(dot.left+dot.width/2-c.left)*scale,y=(dot.top+dot.height/2-c.top)*scale;
          const sample=()=>ctx.getImageData(Math.round(x+28*scale),Math.round(y),1,1).data[3];
          const first=sample();return new Promise(resolve=>setTimeout(()=>resolve({first,later:sample()}),680));
        });
        assert(light.first>light.later,'buffer opens from center toward its edge');
        await page.screenshot({path:path.join(out,name+'-light.png')});
        await page.waitForFunction(()=>document.body.dataset.sealCollection==='stamping');
        assert(await page.locator('[data-seal="kashgar"]').evaluate(e=>e.getAnimations().length>0));
        await page.screenshot({path:path.join(out,name+'-stamp.png')});
        await page.waitForFunction(()=>document.body.dataset.sealCollection==='flying');
      }
      await page.waitForFunction(()=>document.body.dataset.sealCollection==='collected');
      assert.equal(await page.locator('.flying-collection-seal').count(),0);
      await page.reload();await page.waitForFunction(()=>window.ATLAS_JOURNEY);
      assert.equal(await page.locator('body').getAttribute('data-seal-collection'),null);
    }
    // Every chapter must boot under a repository prefix, including _shared assets.
    const ids=await page.evaluate(()=>window.ATLAS_STORIES.map(s=>s.id));
    for(const id of ids){
      const directory=id==='chengde'?'mountain-resort':id;
      await page.goto(base+`site/chapters/${directory}/index.html`);
      if(id==='my-hometown')await page.locator('.scene-question .opening-link').waitFor();
      else await page.locator('#chapter-leaf[open]').waitFor();
    }
    assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
    console.log('PASS: light -> stamp -> collection, no replay/watermark, reduced motion, desktop/mobile, all chapter paths under a case-sensitive repository prefix.');console.log(out);
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
