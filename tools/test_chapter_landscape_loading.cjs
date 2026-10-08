const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix='/bittersweet-journey/';
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}
  const file=path.resolve(root,url.pathname.slice(prefix.length));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');
    const send=()=>res.end(data);
    // Cold artwork deliberately arrives later than scripts and title markup.
    if(/opening-.*\.jpg$/.test(file)){res.setHeader('Cache-Control','public, max-age=3600');setTimeout(send,700);}else send();
  });
});
(async()=>{
  assert(fs.existsSync(path.join(root,'.nojekyll')));
  assert(fs.existsSync(path.join(root,'site/.nojekyll')));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  const base=`http://127.0.0.1:${server.address().port}${prefix}site/`;
  try{
    for(const width of [1440,390]){
      const page=await browser.newPage({viewport:{width,height:900}});
      await page.route('https://fonts.googleapis.com/**',route=>route.abort());
      if(width===390)await page.route('**/page-transition.js*',async route=>{
        const response=await route.fetch();
        await route.fulfill({response,body:(await response.text()).replace(/const nativeNavigation=.*?;/,'const nativeNavigation=false;')});
      });
      const errors=[],missing=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)missing.push(response.url());});
      for(const chapter of fs.readdirSync(path.join(root,'site/chapters')).filter(name=>!name.startsWith('_'))){
        await page.goto(base+`chapters/${chapter}/index.html?lang=zh`);
        if(chapter==='my-hometown'){
          await page.waitForFunction(()=>window.HOMETOWN_GLOBE);
          console.log(`PASS ${width} ${chapter}: custom globe opening initialized.`);
          continue;
        }
        await page.waitForFunction(()=>document.querySelector('#chapter-leaf')?.dataset.landscapeReady==='true');
        const images=await page.locator('#chapter-leaf img').evaluateAll(nodes=>nodes.map(image=>({complete:image.complete,width:image.naturalWidth})));
        assert(images.every(image=>image.complete&&image.width>0),chapter+' image missing');
        await page.locator('.chapter-leaf-enter').click();
        await page.waitForFunction(()=>!document.querySelector('#chapter-leaf').open);
        assert.equal(await page.locator('html').evaluate(element=>element.classList.contains('chapter-gate-open')),false);
        console.log(`PASS ${width} ${chapter}: decoded landscape and reading reveal.`);
      }
      // Exercise the real book navigation with a project subdirectory and slow images.
      await page.goto(base+'index.html?lang=zh');
      await page.waitForFunction(()=>window.LAND_TRANSITION);
      await page.evaluate(()=>{void window.LAND_TRANSITION.navigate('./chapters/dujiangyan/index.html');});
      await page.waitForURL('**/chapters/dujiangyan/index.html?lang=zh');
      await page.waitForFunction(()=>document.querySelector('#chapter-leaf')?.dataset.landscapeReady==='true');
      await page.waitForFunction(()=>!document.documentElement.classList.contains('land-in-transit'));
      assert(await page.locator('.chapter-painted-image').evaluate(image=>image.naturalWidth>0));
      // This ignored local token file is optional; local DEM remains the fallback.
      assert.deepEqual(missing.filter(url=>!url.includes('/fish-tail-lodge/mapbox-config.js')),[],'required project paths must resolve');
      assert.deepEqual(errors,[],'chapter initialization must succeed');
      await page.close();
      console.log(`PASS ${width}: nine chapters, cold artwork decode, reading reveal, book navigation and required project paths.`);
    }
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
