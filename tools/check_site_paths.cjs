/* GitHub Pages uses case-sensitive paths and must publish _shared unchanged. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(path.join(root,'site')),exact=new Set(files.map(p=>path.relative(root,p).split(path.sep).join('/')));
exact.add('index.html');let checked=0;
for(const file of [...files,path.join(root,'index.html')].filter(p=>/(?:index\.html|\.css)$/.test(p))){
  const source=fs.readFileSync(file,'utf8');
  const refs=[...source.matchAll(/(?:src|href|data-src)=["']([^"']+)["']|url\(\s*["']?([^\s"')]+)["']?\s*\)/g)].map(m=>m[1]||m[2]);
  for(const ref of refs){
    if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;
    assert(!ref.startsWith('/'),`Origin-root path breaks repository hosting: ${file}: ${ref}`);
    const clean=decodeURIComponent(ref.split(/[?#]/)[0]);if(!clean)continue;
    let target=path.resolve(path.dirname(file),clean);if(clean.endsWith('/'))target=path.join(target,'index.html');
    const relative=path.relative(root,target).split(path.sep).join('/');
    assert(exact.has(relative),`Missing or incorrectly cased asset: ${file}: ${ref}`);checked++;
  }
}
assert(fs.existsSync(path.join(root,'.nojekyll')),'Root branch publishing must bypass Jekyll');
assert(fs.existsSync(path.join(root,'site/.nojekyll')),'Publishing site/ must also preserve _shared');
console.log(`PASS: ${checked} local HTML/CSS references resolve with exact case and repository-relative paths; both publication roots preserve _shared.`);
