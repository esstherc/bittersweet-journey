/* Build the physical atlas in the existing story map's coordinate system.
   Run: node tools/build_atlas_geography.cjs. Downloads are cached in OS temp. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const readWindow = file => {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  return Object.values(context.window)[0];
};
const existing = readWindow('site/data/real-geography.js');
const rad = Math.PI / 180;
const n = (Math.sin(25 * rad) + Math.sin(47 * rad)) / 2;
const C = Math.cos(25 * rad) ** 2 + 2 * n * Math.sin(25 * rad);
function raw(lon, lat) {
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * rad)) / n;
  const theta = n * (lon - 105) * rad;
  return [rho * Math.sin(theta), -rho * Math.cos(theta), 1];
}
const anchors = {kashgar:[75.9898,39.4704],dunhuang:[94.662,40.142],
  dujiangyan:[103.617,30.988],chengdu:[104.0665,30.5728],
  chengde:[117.962,40.954],shanghai:[121.4737,31.2304]};
function solve(matrix, vector) {
  const a = matrix.map((r,i) => [...r,vector[i]]);
  for(let i=0;i<3;i++) {
    let pivot=i;for(let j=i+1;j<3;j++)if(Math.abs(a[j][i])>Math.abs(a[pivot][i]))pivot=j;
    [a[i],a[pivot]]=[a[pivot],a[i]];
    const d=a[i][i];a[i]=a[i].map(v=>v/d);
    for(let j=0;j<3;j++)if(j!==i){const f=a[j][i];a[j]=a[j].map((v,k)=>v-f*a[i][k]);}
  }
  return a.map(r=>r[3]);
}
const rows=Object.entries(anchors).map(([id,ll])=>({r:raw(...ll),p:existing.global.places[id]}));
const matrix=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>rows.reduce((s,{r})=>s+r[i]*r[j],0)));
const coeff= ['x','y'].map(axis=>solve(matrix,Array.from({length:3},(_,i)=>rows.reduce((s,{r,p})=>s+r[i]*p[axis],0))));
const project=(lon,lat)=>coeff.map(c=>c.reduce((s,v,i)=>s+v*raw(lon,lat)[i],0));
const maxResidual=Math.max(...rows.map(({r,p})=>Math.hypot(...coeff.map((c,j)=>c.reduce((s,v,i)=>s+v*r[i],0)-p[['x','y'][j]]))));
if(maxResidual>2)throw Error('Projection registration exceeds 2 map units: '+maxResidual);
const bounds=[45,5,155,65];
const inside=([x,y])=>x>=bounds[0]&&x<=bounds[2]&&y>=bounds[1]&&y<=bounds[3];
const xy=p=>project(...p).map(v=>v.toFixed(2)).join(',');
function clipRing(input) {
  let pts=input;
  for(const [axis,value,sign]of [[0,bounds[0],1],[0,bounds[2],-1],[1,bounds[1],1],[1,bounds[3],-1]]) {
    const out=[];if(!pts.length)return out;
    let a=pts.at(-1),ain=(a[axis]-value)*sign>=0;
    for(const b of pts){const bin=(b[axis]-value)*sign>=0;
      if(ain!==bin){const t=(value-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
      if(bin)out.push(b);a=b;ain=bin;
    }pts=out;
  }return pts;
}
function geometryPath(g, polygon=true) {
  if(!g)return '';
  const lines=g.type==='Polygon'?g.coordinates:g.type==='MultiPolygon'?g.coordinates.flat():g.type==='LineString'?[g.coordinates]:g.coordinates;
  return lines.map(line=>{
    if(polygon){const pts=clipRing(line);return pts.length>2?'M'+pts.map(xy).join('L')+'Z':'';}
    let pen=false,d='';for(const p of line){if(!inside(p)){pen=false;continue;}d+=(pen?'L':'M')+xy(p);pen=true;}return d;
  }).join('');
}
async function source(name) {
  const dir=path.join(os.tmpdir(),'bittersweet-atlas-natural-earth');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,name+'.geojson');
  if(!fs.existsSync(file)) {
    const r=await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'+name+'.geojson');
    if(!r.ok)throw Error(name+': '+r.status);fs.writeFileSync(file,await r.text());
  }
  return JSON.parse(fs.readFileSync(file,'utf8'));
}
function labelPoint(g) {
  const rings=g.type==='Polygon'?[g.coordinates[0]]:g.coordinates.map(p=>p[0]);
  const ring=rings.map(clipRing).sort((a,b)=>b.length-a.length)[0];
  const ys=ring.map(p=>p[1]),y=(Math.min(...ys)+Math.max(...ys))/2;
  const crossings=[];
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length];
    if((a[1]>y)!==(b[1]>y))crossings.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
  }
  crossings.sort((a,b)=>a-b);let pair=[ring[0][0],ring[0][0]];
  for(let i=0;i+1<crossings.length;i+=2)if(crossings[i+1]-crossings[i]>pair[1]-pair[0])pair=[crossings[i],crossings[i+1]];
  return project((pair[0]+pair[1])/2,y);
}
async function main(){
  const [land,rivers,lakes,regions]=await Promise.all(['ne_50m_land','ne_10m_rivers_lake_centerlines','ne_10m_lakes','ne_10m_geography_regions_polys'].map(source));
  const regionNames={
    'HIMALAYAS':['喜马拉雅山脉','mountain',1], 'KUNLUN MOUNTAINS':['昆仑山脉','mountain',1],
    'TIAN SHAN':['天山','mountain',1], 'ALTAY MOUNTAINS':['阿尔泰山脉','mountain',2],
    'PAMIRS':['帕米尔','mountain',2], 'QUILIAN MOUNTAINS':['祁连山脉','mountain',2],
    'Qinling Mountains':['秦岭','mountain',2], 'KARAKORAM RA.':['喀喇昆仑山脉','mountain',2],
    'TAKLIMAKAN DESERT':['塔克拉玛干沙漠','desert',1], 'GOBI DESERT':['戈壁','desert',1],
    'PLATEAU OF TIBET':['青藏高原','plateau',1], 'TARIM BASIN':['塔里木盆地','basin',2],
    'SICHUAN BASIN':['四川盆地','basin',2], 'Loess Plateau':['黄土高原','plateau',2],
    'Hexi Corridor':['河西走廊','basin',2], 'YUNGUI PLATEAU':['云贵高原','plateau',2],
    'GREATER KHINGAN RANGE':['大兴安岭','mountain',2], 'Taihang Mts.':['太行山','mountain',3],
    'Nan Ling Mts.':['南岭','mountain',3], 'Wuyi Mts.':['武夷山','mountain',3]
  };
  const features=[];
  for(const f of regions.features){const name=f.properties.NAME,meta=regionNames[name];if(!meta)continue;
    const d=geometryPath(f.geometry);if(!d)continue;
    features.push({en:f.properties.NAME_EN||name,zh:meta[0],kind:meta[1],level:meta[2],d,at:labelPoint(f.geometry)});
  }
  const lakeNames={'Qinghai Hu':'青海湖','Dongting Hu':'洞庭湖','Poyang Hu':'鄱阳湖','Tai Hu':'太湖','Bosten Hu':'博斯腾湖','Nam Co':'纳木错','Issyk Kul':'伊塞克湖','Balkhash':'巴尔喀什湖'};
  const water=lakes.features.map(f=>{const p=f.properties,d=geometryPath(f.geometry);return {d,en:p.name,zh:lakeNames[p.name]||p.name_zh,level:Number(p.scalerank)<3?1:2,at:d?labelPoint(f.geometry):null};}).filter(f=>f.d);
  const streams=rivers.features.map(f=>({d:geometryPath(f.geometry,false),en:f.properties.name,level:Number(f.properties.scalerank)<5?2:3})).filter(f=>f.d);
  // Slope hachures follow the gradient of the existing Copernicus wide DEM.
  // No invented mountain icons; one short stroke per sufficiently sloping cell.
  const dem=readWindow('site/chapters/fish-tail-lodge/terrain-data.js').wide;
  const bytes=Buffer.from(dem.heights,'base64'), w=dem.columns,h=dem.rows;
  const z=(x,y)=>bytes.readUInt16LE((y*w+x)*2)+dem.baseMetres;
  const hachures=[[],[],[]];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const lon=dem.bounds.west+x/(w-1)*(dem.bounds.east-dem.bounds.west);
    const lat=dem.bounds.north-y/(h-1)*(dem.bounds.north-dem.bounds.south);
    if(!inside([lon,lat]))continue;
    const dx=z(x+1,y)-z(x-1,y),dy=z(x,y+1)-z(x,y-1),s=Math.hypot(dx,dy);
    if(s<240||z(x,y)<350)continue;
    const [px,py]=project(lon,lat),[qx,qy]=project(lon+dx/s*.13,lat-dy/s*.13);
    const len=Math.hypot(qx-px,qy-py),factor=Math.min(1.7,0.65+s/1800);
    const ex=(qx-px)/len*factor,ey=(qy-py)/len*factor;
    hachures[Math.min(2,Math.floor(s/1100))].push(`M${px.toFixed(2)},${py.toFixed(2)}l${ex.toFixed(2)},${ey.toFixed(2)}`);
  }
  const contours=[];
  for(const altitude of [1000,2000,3000,4000,5000]){
    const segments=[];
    for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++){
      const ll=(cx,cy)=>[dem.bounds.west+cx/(w-1)*(dem.bounds.east-dem.bounds.west),dem.bounds.north-cy/(h-1)*(dem.bounds.north-dem.bounds.south)];
      if(!inside(ll(x,y)))continue;
      const corners=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]],hits=[];
      for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],za=z(...a),zb=z(...b);
        if((za<altitude)===(zb<altitude))continue;
        const t=(altitude-za)/(zb-za);hits.push(ll(a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])));
      }
      for(let i=0;i+1<hits.length;i+=2)segments.push('M'+xy(hits[i])+'L'+xy(hits[i+1]));
    }contours.push({altitude,d:segments.join('')});
  }
  const result={source:{naturalEarth:'https://www.naturalearthdata.com/downloads/10m-physical-vectors/',retrieved:new Date().toISOString().slice(0,10),terrain:dem.source,projection:'Spherical Albers 25/47, fitted affine registration to existing chapter anchors',maxResidual},projection:{n,C,coeff},land:land.features.map(f=>geometryPath(f.geometry)).join(''),regions:features,lakes:water,rivers:streams,hachures:hachures.map(a=>a.join('')),contours};
  fs.writeFileSync(path.join(root,'site/data/atlas-physical.js'),'/* Generated by tools/build_atlas_geography.cjs; Natural Earth public domain; terrain attribution in docs/atlas-physical.md. */\nwindow.ATLAS_PHYSICAL = '+JSON.stringify(result)+';\n');
  console.log(JSON.stringify({maxResidual,regions:features.map(f=>f.en),lakes:water.length,rivers:streams.length,hachures:hachures.map(a=>a.length)}));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={project,maxResidual,clipRing,geometryPath};
