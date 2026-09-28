/* Reader-frame regression: real scroll, language, geographic links and footer. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'bittersweet-kashgar-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try {
    const base=`http://127.0.0.1:${server.address().port}/site`,errors=[];
    for(const [name,width,height] of [['desktop',1440,900],['tablet',850,1000],['mobile',390,844],['landscape',740,430]]){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:name==='desktop'?'no-preference':'reduce'});
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'/chapters/kashgar/index.html');
      await page.locator('.chapter-leaf-enter').click();
      await page.waitForFunction(()=>window.KASHGAR_READER?.getState().opened);
      const bounds=await page.evaluate(()=>{
        const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
        return {header:box('.site-masthead'),frame:box('.chapter-layout'),reader:box('.reader-panel'),rail:box('.reading-rail'),footer:box('.bottom-bar'),doc:document.documentElement.scrollWidth};
      });
      assert.equal(bounds.doc,width,`${name}: no horizontal overflow`);
      assert(Math.abs(bounds.header.bottom-bounds.frame.top)<1,`${name}: frame starts at header`);
      assert(Math.abs(bounds.frame.bottom-bounds.footer.top)<1,`${name}: frame ends at footer`);
      assert(Math.abs(bounds.rail.bottom-bounds.reader.bottom)<1,`${name}: reading rail stays inside reader`);
      assert(bounds.reader.height>100,`${name}: reading area remains usable`);
      await page.locator('#section-nav button').nth(3).click();
      await page.waitForFunction(()=>window.KASHGAR_READER.getState().scene>1);
      assert.equal(await page.evaluate(()=>window.scrollY),0,'window never scrolls');
      assert(await page.locator('.reader-scroll').evaluate(el=>el.scrollTop)>100,'reader scrolls independently');
      const section=await page.locator('#section-nav [aria-current=true]').textContent();
      await page.locator('[data-language=en]').click();
      await page.waitForTimeout(80);
      assert.equal(await page.locator('#section-nav [aria-current=true]').textContent(),'IV','language keeps the fourth section');
      assert(section,'active section exists');
      assert((await page.locator('.back-atlas').getAttribute('href')).includes('lang=en'),'footer preserves language');
      await page.locator('#data-button').click();
      await page.locator('#data-dialog').waitFor({state:'visible'});
      assert.equal(await page.locator('#data-dialog').isVisible(),true);
      assert.equal(await page.locator('#data-button').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      await page.locator('#data-dialog').waitFor({state:'hidden'});
      assert.equal(await page.locator('#data-dialog').isVisible(),false);
      await page.locator('#section-nav button').first().click();
      await page.locator('.text-place[data-place="tarim"]').first().click();
      assert.equal(await page.locator('#place-card').isVisible(),true,'text place still opens geographic card');
      await page.locator('#close-card').click();
      await page.screenshot({path:path.join(output,name+'.png')});
      if(name==='mobile'||name==='desktop'){
        await page.locator('#finish').click();
        await page.locator('#completion').waitFor({state:'visible'});
        assert.equal(await page.locator('#completion').isVisible(),true);
        assert.equal(await page.evaluate(()=>localStorage.getItem('bittersweet-journey:kashgar:complete')),'true');
        assert.equal(await page.locator('#completion').getAttribute('aria-hidden'),'false');
        assert.equal(await page.locator('#completion .seal-l img').count(),1,'completion uses the shared seal component');
        await page.waitForFunction(()=>[...document.querySelectorAll('#completion .seal, #completion p, #completion strong')].every(el=>+getComputedStyle(el).opacity>.99));
        await page.screenshot({path:path.join(output,name+'-completion.png')});
        await page.waitForURL('**/site/index.html*');
        await page.waitForFunction(()=>document.body?.dataset.sealCollection==='collected');
      }
      await page.close();
    }
    assert.deepEqual(errors,[]);console.log('PASS: Kashgar frame at four sizes, inner scrolling, section/language position, notes, geographic links and stamp return.');
    console.log(output);
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
