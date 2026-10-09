const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,new URL(req.url,'http://localhost').pathname.replace(/^\/repo\//,''));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch();
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const atlas=`http://127.0.0.1:${server.address().port}/repo/site/index.html?lang=zh`;
  await page.goto(atlas);await page.waitForURL('**/chapters/my-hometown/index.html?tour=1&lang=zh');
  await page.locator('.journey').waitFor({state:'visible'});
  await page.evaluate(()=>localStorage.setItem('bittersweet-journey:my-hometown:intro-seen','true'));
  await page.goto(atlas);await page.waitForURL('**/chapters/my-hometown/index.html?tour=1&lang=zh');
  await page.locator('.journey').waitFor({state:'visible'});
  await page.locator('[data-skip-tour]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('bittersweet-journey:my-hometown:started')),'true');
  await page.goto(atlas);await page.waitForFunction(()=>window.ATLAS_STORIES);
  assert.equal(new URL(page.url()).pathname,'/repo/site/index.html');
  await page.evaluate(()=>document.querySelector('.reset-progress').click());
  await page.waitForURL('**/chapters/my-hometown/index.html?tour=1&lang=zh');
  await page.locator('.journey').waitFor({state:'visible'});
  await page.evaluate(()=>localStorage.setItem('bittersweet-journey:dujiangyan:complete','true'));
  await page.goto(atlas);await page.waitForFunction(()=>window.ATLAS_STORIES);
  assert.equal(new URL(page.url()).pathname,'/repo/site/index.html');
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS ${width}: first entry, stale tour flag, intro-to-reading trace, map return, reset and completed reading.`);
 }}finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
