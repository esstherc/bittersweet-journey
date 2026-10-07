const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'bittersweet-journey-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});

(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();try{for(const mobile of [false,true]){const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));for(let section=1;section<=5;section++){await page.goto('http://127.0.0.1:'+server.address().port+'/site/chapters/taoist-tower/index.html?open=1&section='+section);await page.waitForTimeout(900);assert.equal(await page.locator('.reader-location,.reader-progress').count(),0);assert.equal(await page.locator('.geo-legend,.projection-label,.china-projection-label,#node-wudang').count(),0);await page.screenshot({path:path.join(output,'taoist-'+(mobile?'mobile':'desktop')+'-'+section+'.png')});}await page.locator('button[data-language="zh"]').click();
assert.equal(await page.locator('.reader-location,.reader-progress').count(),0);
assert.equal(await page.locator('#node-germany-two,#node-hungary-three,#node-britain-three,#node-india-three').count(),4);
assert.equal(await page.locator('#node-paris-four,#node-petersburg-four,.pressure-route').count(),0);
assert(await page.locator('#node-britain-three .label-en').textContent().then(t=>t.includes('British Museum')));
assert(await page.locator('#notes-drawer').textContent().then(t=>t.includes('Albers')));
assert.deepEqual(errors,[]);await page.close();}console.log('PASS: five chapter maps desktop/mobile with no script errors or removed annotations.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());