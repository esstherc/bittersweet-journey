const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(os.tmpdir(),'bittersweet-mogao-cliff');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();try{
 for(const [width,height]of [[1440,900],[844,390],[667,375]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  for(const lang of ['zh','en']){
   await page.goto(`http://127.0.0.1:${server.address().port}/site/chapters/mogao-caves/index.html?open=1&section=3&lang=${lang}`);await page.locator('.cliff-panel').waitFor({state:'visible'});await page.waitForTimeout(650);
   const paragraphs=page.locator('.reading-section').nth(2).locator('p');const count=await paragraphs.count();const stages=new Set();
   for(let i=0;i<count;i++){
    await paragraphs.nth(i).evaluate(n=>{const s=document.querySelector('.reader-scroll');s.scrollTop+=n.getBoundingClientRect().top-s.getBoundingClientRect().top-s.clientHeight*.4+2;});await page.waitForTimeout(45);
    const result=await page.evaluate(()=>{const panel=document.querySelector('.cliff-panel'),svg=panel.querySelector('svg'),p=panel.getBoundingClientRect(),map=document.querySelector('.map-stage').getBoundingClientRect();return{stage:document.body.dataset.stage,overflow:panel.scrollWidth>panel.clientWidth+1,inside:p.left>=map.left&&p.right<=map.right+1&&p.bottom<=map.bottom+1,viewWidth:svg.viewBox.baseVal.width,width:svg.clientWidth,niches:svg.querySelectorAll('.niche').length,bad:[...svg.querySelectorAll('.niche path')].some(n=>{const b=n.getBBox();return !Number.isFinite(b.width)||b.width<=0||b.height<=0;}),captionOverflow:[...panel.querySelectorAll('.cliff-caption-copy p')].some(n=>n.scrollWidth>n.clientWidth+1)};});
    stages.add(result.stage);assert(!result.overflow&&!result.captionOverflow&&result.inside,JSON.stringify(result));assert.equal(result.viewWidth,result.width);assert.equal(result.niches,31);assert(!result.bad);
   }
   assert(stages.size>=7,'dynasty stages remain available');await page.screenshot({path:path.join(out,`${width}-${lang}.png`)});console.log('PASS cliff',width,lang,stages.size,'stages');
  }assert.deepEqual(errors,[]);await page.close();
 }
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
