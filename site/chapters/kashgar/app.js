(() => {
  'use strict';
  const chapter = window.KASHGAR_CHAPTER;
  const source = window.KASHGAR_GEOGRAPHY;
  const $ = s => document.querySelector(s);
  const svgNS = 'http://www.w3.org/2000/svg';
  const mobile = () => matchMedia('(max-width:760px)').matches;
  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  const saved = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  if (['zh','en'].includes(requestedLanguage)) save('bittersweet-journey:language', requestedLanguage);
  const wasCompleted = saved('bittersweet-journey:kashgar:complete') === 'true';
  const lastScene = Math.max(1, Math.min(16, Number(saved('bittersweet-journey:kashgar:scene')) || 1));
  const state = { opened:false, maxScene:wasCompleted?16:1, lang: saved('bittersweet-journey:language') === 'en' ? 'en' : 'zh', scene: 1, selected: null, follow: true, returnTo: null, camera: null };
  const copy = {
    zh: {chapter:'西域喀什',places:'本文地名',expand:'展开地图',collapse:'收起地图',following:'地图随文浏览',exploring:'正在探索地图',resume:'继续随文浏览 ↗',data:'地图来源与精度 ↗',dataTitle:'地图来源与精度',loading:'正在展开西域地理…',instruction:'点击文中地名，在地图上找到它；点击地图，回到相关原文。',start:'开始阅读 ↓',source:'余秋雨《文化苦旅》',finish:'完成本章 · 返回总图 ↗',sections:'原文',return:'返回刚才阅读处 ↩',choose:'选择地点',section:'原文第',paragraph:'段',references:'相关原文',none:'本篇通过相关地名提及此处。',cross:'在《道士塔》中继续阅读喀什 ↗',point:'地点',river:'河流',mountain:'山地',desert:'沙漠',basin:'盆地',lake:'水域',unlocated:'位置待核实',introNote:'点击下方片段，返回原文。'},
    en: {chapter:'Kashgar',places:'Places',expand:'Expand map',collapse:'Collapse map',following:'Following the text',exploring:'Exploring the map',resume:'Follow the text ↗',data:'Sources & accuracy ↗',dataTitle:'Sources & accuracy',loading:'Unfolding the geography…',instruction:'Select a place in the text to find it on the map. Select the map to return to its passages.',start:'Begin reading ↓',source:'Yu Qiuyu · A Bittersweet Journey Through Culture',finish:'Complete chapter · Return to atlas ↗',sections:'Sections',return:'Back to reading ↩',choose:'Choose a place',section:'Section ',paragraph:'paragraph',references:'Passages',none:'This location appears through related place names.',cross:'Read about Kashgar in The Taoist Priest’s Tower ↗',point:'Place',river:'River',mountain:'Mountains',desert:'Desert',basin:'Basin',lake:'Water',unlocated:'Location unverified',introNote:'Select a passage to return to the original text.'}
  };
  Object.assign(copy.zh,{invitation:'有人把来世，选在这里。',question1:'如果生命能够重来一次，',question2:'你愿意生在何处？',openBook:'循着远方，开卷 →',continueBook:'继续上次阅读 ↗',replay:'重看开场',closing:'远方，在这里有了归宿。',revealed:'一处山河已经显影',fullTitle:'西域喀什',memorySaved:'这枚印记，将留在总图上。',carryBack:'将这片山河带回总图 →',stayReading:'留在此页',backAtlas:'← 返回总图',finish:'让这片山河显影 →'});
  Object.assign(copy.en,{invitation:'Someone chose this place for another life.',question1:'If you could live once more,',question2:'where would you choose to be born?',openBook:'Follow the distance →',continueBook:'Continue reading ↗',replay:'Replay the opening',closing:'Here, the distant finds a home.',revealed:'One landscape brought to light',fullTitle:'Kashgar in the Western Regions',memorySaved:'This seal will remain on the atlas.',carryBack:'Carry this landscape back to the atlas →',stayReading:'Stay with the text',backAtlas:'← Return to atlas',finish:'Bring this landscape to light →'});
  Object.assign(copy.zh,{inPassage:'本段地点',allPlaces:'全部地点',exploring:'临时查看 · 滚动正文继续',resume:'回到本段 ↗',instruction:'点击地名查看地图，继续滚动即可回到随文浏览。'});
  Object.assign(copy.en,{inPassage:'In this passage',allPlaces:'All places',exploring:'Preview · scroll text to resume',resume:'Back to this passage ↗',instruction:'Select a place to look closer. Keep scrolling the text to return to the story.'});
  const t = k => copy[state.lang][k] || k;
  const places = new Map((source?.places || []).map(p => [p.id, p]));
  let refs = new Map(), anchors = [], paragraphs = [], scrollFrame = 0, animation = 0, mapSize = {w:900,h:760}, cameraFrame = 0;
  const mercator = ([lon,lat]) => [lon * Math.PI / 180, Math.log(Math.tan(Math.PI / 4 + Math.max(-80, Math.min(80,lat)) * Math.PI / 360))];
  const inverse = ([x,y]) => [x * 180 / Math.PI, (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI];
  const boundsOf = coordinates => {
    const points=[];
    const walk = c => typeof c[0] === 'number' ? points.push(mercator(c)) : c.forEach(walk);
    walk(coordinates);
    return points.reduce((b,p) => [Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])],[Infinity,Infinity,-Infinity,-Infinity]);
  };
  const region = boundsOf([[72,34.5],[94,44.2]]);
  const city = boundsOf([[75.947,39.435],[76.045,39.505]]);
  const features = (source?.geojson.features || []).map(f => ({...f, bounds:boundsOf(f.geometry.coordinates)}));
  const revealAt = new Map();
  chapter.scenes.forEach(s=>s.places.forEach(id=>{if(!revealAt.has(id))revealAt.set(id,s.id);}));
  const byPlace = new Map();
  features.forEach(f => { if (f.properties.place) { const list=byPlace.get(f.properties.place)||[]; list.push(f); byPlace.set(f.properties.place,list); } });
  function node(tag, attrs={}, text) { const el=document.createElementNS(svgNS,tag); Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); if(text!==undefined)el.textContent=text; return el; }
  function announce(text){$('#announcement').textContent=text;}
  function safeText(tag, text, cls){const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;}
  function viewport(){
    const heading=$('.map-heading'),stage=$('.map-stage');
    const top=Math.ceil(heading.getBoundingClientRect().bottom-stage.getBoundingClientRect().top)+(mobile()?15:26);
    return {left:mobile()?28:50,right:mobile()?47:58,top,bottom:mobile()?73:105};
  }
  function cameraFor(bounds){
    const v=viewport(),w=Math.max(110,mapSize.w-v.left-v.right),h=Math.max(95,mapSize.h-v.top-v.bottom);
    return {x:(bounds[0]+bounds[2])/2,y:(bounds[1]+bounds[3])/2,scale:Math.min(w/Math.max(.0001,bounds[2]-bounds[0]),h/Math.max(.0001,bounds[3]-bounds[1]))*.88};
  }
  function project(coord){const [x,y]=mercator(coord),v=viewport(),c=state.camera;return [(x-c.x)*c.scale+(mapSize.w+v.left-v.right)/2,(c.y-y)*c.scale+(mapSize.h+v.top-v.bottom)/2];}
  function unproject([x,y]){const v=viewport(),c=state.camera;return inverse([(x-(mapSize.w+v.left-v.right)/2)/c.scale+c.x,c.y-(y-(mapSize.h+v.top-v.bottom)/2)/c.scale]);}
  function pathFor(geometry){
    const line=c=>c.map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(2)).join(',')}`).join('');
    switch(geometry.type){case'LineString':return line(geometry.coordinates);case'MultiLineString':return geometry.coordinates.map(line).join('');case'Polygon':return geometry.coordinates.map(c=>line(c)+'Z').join('');case'MultiPolygon':return geometry.coordinates.map(p=>p.map(c=>line(c)+'Z').join('')).join('');default:return '';}
  }
  function isVisible(f){const c=state.camera,s=c.scale;return f.bounds[2]>c.x-mapSize.w/s&&f.bounds[0]<c.x+mapSize.w/s&&f.bounds[3]>c.y-mapSize.h/s&&f.bounds[1]<c.y+mapSize.h/s;}
  function activate(el,id){el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',`${places.get(id)?.[state.lang]} · ${t('references')}`);el.dataset.place=id;el.addEventListener('click',e=>{e.stopPropagation();if(!dragged)selectPlace(id,'map');});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPlace(id,'map');}});}
  function drawMap(){
    if(!state.camera)return;
    const geography=$('#geography'),labels=$('#map-labels'),grid=$('#grid');geography.replaceChildren();labels.replaceChildren();grid.replaceChildren();
    const close=state.camera.scale>35000,focus=new Set(chapter.scenes[state.scene-1].places);
    const corners=[unproject([0,0]),unproject([mapSize.w,mapSize.h])];
    const span=Math.abs(corners[1][0]-corners[0][0]),step=span>60?20:span>15?5:span>3?1:span>.3?.1:.02;
    for(let lon=Math.ceil(corners[0][0]/step)*step;lon<corners[1][0];lon+=step){const x=project([lon,0])[0];grid.append(node('path',{d:`M${x},0V${mapSize.h}`,class:'grid-line'}));grid.append(node('text',{x:x+4,y:mapSize.h-47,class:'grid-label'},`${+lon.toFixed(2)}°E`));}
    for(let lat=Math.ceil(corners[1][1]/step)*step;lat<corners[0][1];lat+=step){const y=project([0,lat])[1];grid.append(node('path',{d:`M0,${y}H${mapSize.w}`,class:'grid-line'}));if(y>230&&y<mapSize.h-90)grid.append(node('text',{x:9,y:y-5,class:'grid-label'},`${+lat.toFixed(2)}°N`));}
    features.filter(f=>f.geometry.type!=='Point'&&isVisible(f)&&(!f.properties.local||close)).forEach(f=>{
      const p=f.properties,id=p.place,selected=state.selected===id,context=focus.has(id),d=pathFor(f.geometry);
      const discovered=!state.follow||selected||(id&&(revealAt.get(id)||15)<=state.maxScene);
      const opacity=discovered?1:p.kind==='land'?1:['mountain','basin','desert'].includes(p.kind)?(state.maxScene>=12?.6:.15):(state.maxScene>=10?.48:.08);
      const el=node('path',{d,class:`geo-feature geo-${p.kind}${context?' is-context':''}${selected?' is-selected':''}${p.kind==='city-water'&&f.geometry.type.includes('Polygon')?' area':''}`,'fill-rule':'evenodd'});
      el.style.opacity=opacity;el.dataset.revealed=String(discovered);
      if(id&&places.has(id)){el.dataset.place=id;el.addEventListener('click',e=>{e.stopPropagation();if(!dragged)selectPlace(id,'map');});}
      geography.append(el);
      if(['mountain','desert'].includes(p.kind))geography.append(node('path',{d,class:`geo-${p.kind} ${p.kind==='mountain'?'hatch':'grain'}`,'fill-rule':'evenodd',opacity}));
      if(p.kind==='river'&&id&&discovered){const hit=node('path',{d,class:'geo-hit'});hit.addEventListener('click',e=>{e.stopPropagation();if(!dragged)selectPlace(id,'map');});geography.append(hit);}
    });
    const occupied=[];
    [...places.values()].filter(p=>p.center&&byPlace.has(p.id)).sort((a,b)=>(b.id===state.selected?100:focus.has(b.id)?50:b.priority||0)-(a.id===state.selected?100:focus.has(a.id)?50:a.priority||0)).forEach(p=>{
      const selected=p.id===state.selected,context=focus.has(p.id);if(state.follow&&!selected&&(revealAt.get(p.id)||15)>state.maxScene)return;if(close&&!p.local&&p.id!=='kashgar'&&!selected)return;
      if(!close&&p.local&&!selected)return;
      const [x,y]=project(p.center),v=viewport();if(x<12||x>mapSize.w-18||y<v.top-25||y>mapSize.h-v.bottom+20)return;
      const regionLabel=['mountain','desert','basin'].includes(p.kind),name=p[state.lang];
      const textW=Math.min(180,name.length*(state.lang==='zh'?14:7));
      let dx=regionLabel?0:10,dy=regionLabel?0:-8;
      const candidates=regionLabel?[[0,0]]:[[10,-8],[10,22],[-textW-12,-8],[-textW-12,22]];
      let box;
      const fits=candidates.some(([cx,cy])=>{const b=regionLabel?[x-textW/2-8,y+cy-22,x+textW/2+8,y+cy+18]:[x+Math.min(-18,cx-6),y+Math.min(-18,cy-22),x+Math.max(18,cx+textW+8),y+Math.max(18,cy+18)];if(b[0]<8||b[2]>mapSize.w-10)return false;if(!selected&&occupied.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return false;dx=cx;dy=cy;box=b;return true;});
      if(!fits&&!selected)return;if(box)occupied.push(box);
      const g=node('g',{transform:`translate(${x},${y})`,class:`map-label ${regionLabel?'region':''} ${selected||context?'active':''}`});activate(g,p.id);
      if(!regionLabel){if(selected||p.id==='kashgar')g.append(node('circle',{r:selected?18:12,class:'halo'}));g.append(node('circle',{r:selected?5:context?3.8:2.8,class:'core'}));}
      if(box)g.append(node('rect',{x:box[0]-x,y:box[1]-y,width:box[2]-box[0],height:box[3]-box[1],class:'hit-box'}));
      const txt=node('text',{x:dx,y:dy,'text-anchor':regionLabel?'middle':'start'},name);g.append(txt);
      labels.append(g);
    });
    const scale=$('#scale');scale.replaceChildren();
    const lat=inverse([state.camera.x,state.camera.y])[1],kmPerPx=6371*Math.cos(lat*Math.PI/180)/state.camera.scale;
    const target=90*kmPerPx,power=10**Math.floor(Math.log10(target)),distance=[1,2,5,10].map(x=>x*power).filter(x=>x<=target).pop()||power;
    const width=distance/kmPerPx,x=mapSize.w-145,y=mapSize.h-53;
    scale.append(node('path',{d:`M${x},${y-4}V${y}H${x+width}V${y-4}`,fill:'none',stroke:'#67725f','stroke-width':1}));
    scale.append(node('text',{x,y:y-9,class:'grid-label'},distance<1?`${Math.round(distance*1000)} m`:`${+distance.toPrecision(2)} km`));
    $('#extent-label').textContent=`WGS 84 · ${close?(state.lang==='zh'?'喀什市区':'KASHGAR'):'GEOJSON'}`;
  }
  function moveCamera(target,animate=true){cancelAnimationFrame(animation);if(!state.camera||!animate||reduced()){state.camera=target;drawMap();return;}const from={...state.camera},start=performance.now();function tick(now){const f=Math.min(1,(now-start)/480),q=1-(1-f)**3;state.camera={x:from.x+(target.x-from.x)*q,y:from.y+(target.y-from.y)*q,scale:Math.exp(Math.log(from.scale)+(Math.log(target.scale)-Math.log(from.scale))*q)};drawMap();if(f<1)animation=requestAnimationFrame(tick);}animation=requestAnimationFrame(tick);}
  function fitPlace(id){const p=places.get(id),ff=byPlace.get(id);if(!ff?.length)return;
    if(p.local||id==='kashgar'){const c=cameraFor(city);if(!mobile()){const v=viewport(),point=mercator(p.center);c.x=point[0]-(mapSize.w*.73-(mapSize.w+v.left-v.right)/2)/c.scale;}moveCamera(c);return;}
    let b=ff.reduce((b,f)=>[Math.min(b[0],f.bounds[0]),Math.min(b[1],f.bounds[1]),Math.max(b[2],f.bounds[2]),Math.max(b[3],f.bounds[3])],[Infinity,Infinity,-Infinity,-Infinity]);
    if(p.kind==='point'){const [lon,lat]=p.center;b=boundsOf([[lon-1.4,lat-1],[lon+1.4,lat+1]]);}moveCamera(cameraFor(b));
  }
  function sceneCamera(){const scene=chapter.scenes[state.scene-1];if(scene.view==='city')return cameraFor(city);
    if(state.scene===13)return cameraFor(boundsOf([[73.4,34.8],[79,40.6]]));
    if(state.scene===14)return cameraFor(boundsOf([[73,32],[112,45]]));
    return cameraFor(region);
  }
  function setFollow(value){
    state.follow=value;
    if(!value)state.explorationScrollY=window.scrollY;
    $('#resume').hidden=value;$('#mode-status').textContent=t(value?'following':'exploring');
  }
  function resumeReading(animate=true){
    state.selected=null;hideCard();setFollow(true);$('.place-index').open=false;
    document.querySelectorAll('.text-place.is-selected').forEach(el=>el.classList.remove('is-selected'));
    renderContextPlaces();moveCamera(sceneCamera(),animate);
  }
  function makePlaceButton(id){
    const p=places.get(id),button=safeText('button',p[state.lang],'place-link');
    button.dataset.place=id;button.title=p[state.lang];button.setAttribute('aria-pressed',String(state.selected===id));
    button.addEventListener('click',()=>selectPlace(id,'index'));return button;
  }
  function renderContextPlaces(){
    const ids=chapter.scenes[state.scene-1].places.filter(id=>places.has(id)&&refs.has(id));
    $('#context-places').replaceChildren(...ids.slice(0,2).map(makePlaceButton));
    $('.context-places').hidden=!ids.length;
    document.querySelectorAll('#place-directory .place-link').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.place===state.selected)));
  }
  function hideCard(){ $('#place-card').hidden=true; }
  function selectPlace(id,origin){
    const p=places.get(id);if(!p)return;state.selectionOrigin=currentReading();state.selected=id;setFollow(false);$('.place-index').open=false;renderContextPlaces();
    document.querySelectorAll('.text-place').forEach(el=>el.classList.toggle('is-selected',el.dataset.place===id));
    fitPlace(id);drawMap();renderCard();announce(`${p[state.lang]} · ${t('references')}`);
    $('#close-card').focus({preventScroll:true});
  }
  function renderCard(){
    const p=places.get(state.selected);if(!p)return;
    $('#place-kind').textContent=p.center?`${t(p.kind)} · WGS 84`:t('unlocated');
    $('#place-title').textContent=p[state.lang];
    const note=p.note?.[state.lang]||t('introNote');$('#place-note').textContent=note;
    const container=$('#place-passages');container.replaceChildren();const list=refs.get(p.id)||[];
    list.forEach(ref=>{const button=safeText('button','', 'passage-link');const para=chapter[state.lang].sections[ref.section].paragraphs[ref.paragraph];
      const label=state.lang==='zh'?`第 ${chapter.zh.sections[ref.section].label} 节 · 第 ${ref.paragraph+1} 段`:`Section ${chapter.en.sections[ref.section].label} · paragraph ${ref.paragraph+1}`;
      button.append(safeText('small',label),document.createTextNode(excerpt(para,p)));
      button.addEventListener('click',()=>jumpTo(ref));container.append(button);
    });
    if(!list.length)container.append(safeText('p',t('none')));
    $('#cross-chapter').hidden=p.id!=='kashgar';$('#cross-chapter').textContent=t('cross');$('#place-card').hidden=false;$('#place-card').scrollTop=0;
  }
  function excerpt(text,p){const terms=p.aliases[state.lang]||[];const hits=terms.map(x=>text.indexOf(x)).filter(x=>x>=0);const i=hits.length?Math.min(...hits):0;const start=Math.max(0,i-(state.lang==='zh'?12:30)),length=state.lang==='zh'?52:115;return `${start?'…':''}${text.slice(start,start+length)}${text.length>start+length?'…':''}`;}
  function currentReading(){const threshold=readingTop()+45;let p=paragraphs[0];paragraphs.forEach(el=>{if(el.getBoundingClientRect().top<=threshold)p=el;});return p?{section:+p.dataset.section,paragraph:+p.dataset.paragraph,scene:+p.querySelector('[data-scene]').dataset.scene,offset:p.getBoundingClientRect().top-readingTop()}:null;}
  function readingTop(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))+(mobile()&&innerHeight>550?$('.map-stage').getBoundingClientRect().height:0);}
  function scrollToParagraph(ref,highlight=true){const el=$(`#p-${ref.section}-${ref.paragraph}`);if(!el)return;el.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});if(highlight){document.querySelectorAll('.is-target').forEach(x=>x.classList.remove('is-target'));el.classList.add('is-target');el.setAttribute('tabindex','-1');el.focus({preventScroll:true});} }
  function jumpTo(ref){if(!state.returnTo)state.returnTo=state.selectionOrigin||currentReading();$('#return-reading').hidden=!state.returnTo;resumeReading(false);collapseMap();requestAnimationFrame(()=>scrollToParagraph(ref));}
  function collapseMap(){document.body.classList.remove('map-expanded');updateExpand();resizeMap(false);}
  function updateExpand(){const expanded=document.body.classList.contains('map-expanded');$('#toggle-map').setAttribute('aria-expanded',String(expanded));$('#toggle-map').textContent=t(expanded?'collapse':'expand');}
  function renderReading(){
    const root=$('#reading'), fragment=document.createDocumentFragment();refs=new Map();
    const aliases=[...places.values()].flatMap(p=>(p.aliases[state.lang]||[]).map(term=>({term,id:p.id}))).sort((a,b)=>b.term.length-a.term.length);
    const escaped=aliases.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const regex=new RegExp(escaped.join('|'),'g');const lookup=new Map(aliases.map(a=>[a.term,a.id]));
    chapter[state.lang].sections.forEach((section,si)=>{
      const element=safeText('section','','reading-section');element.id=`section-${si+1}`;const heading=safeText('h2',section.label,'section-heading');heading.append(safeText('span',`${String(si+1).padStart(2,'0')} / 05`));element.append(heading);
      section.paragraphs.forEach((text,pi)=>{
        const p=safeText('p','');p.id=`p-${si}-${pi}`;p.dataset.section=si;p.dataset.paragraph=pi;
        if(text.startsWith('（')||text.startsWith('—'))p.className='quote-credit';const mentioned=new Set();
        section.anchors[pi].forEach(part=>{const span=safeText('span','');span.dataset.scene=part.scene;let cursor=0;
          for(const match of part.text.matchAll(regex)){const at=match.index,term=match[0],id=lookup.get(term);
            if(state.lang==='en'&&(/[A-Za-z]/.test(part.text[at-1]||'')||/[A-Za-z]/.test(part.text[at+term.length]||'')))continue;
            span.append(document.createTextNode(part.text.slice(cursor,at)));const button=safeText('button',term,'text-place');button.dataset.place=id;button.setAttribute('aria-label',`${term} · ${state.lang==='zh'?'查看地图':'Show on map'}`);button.addEventListener('click',()=>selectPlace(id,'text'));span.append(button);mentioned.add(id);cursor=at+term.length;
          }
          span.append(document.createTextNode(part.text.slice(cursor)));p.append(span);
        });
        mentioned.forEach(id=>{const list=refs.get(id)||[];list.push({section:si,paragraph:pi});refs.set(id,list);});element.append(p);
      });fragment.append(element);
    });
    root.replaceChildren(fragment);
    anchors=[...root.querySelectorAll('[data-scene]')];paragraphs=[...root.querySelectorAll('p')];
    const nav=$('#section-nav');nav.replaceChildren();chapter[state.lang].sections.forEach((s,i)=>{const b=safeText('button',s.label);b.setAttribute('aria-label',`${state.lang==='zh'?'原文第':'Section '}${s.label}${state.lang==='zh'?'节':''}`);b.addEventListener('click',()=>{resumeReading(false);collapseMap();requestAnimationFrame(()=>$('#section-'+(i+1)).scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'}));});nav.append(b);});
    $('#place-directory').replaceChildren(...[...places.keys()].filter(id=>refs.has(id)).map(makePlaceButton));renderContextPlaces();
  }
  function renderLanguage(){document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';document.body.dataset.language=state.lang;document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=t(el.dataset.copy));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===state.lang)));renderReading();document.title=state.opened?'山河显影 · '+t('fullTitle'):'山河显影 · '+t('invitation');updateExpand();setFollow(state.follow);renderProgress();renderSources();}
  function renderProgress(){const scene=chapter.scenes[state.scene-1];[...$('#section-nav').children].forEach((b,i)=>b.setAttribute('aria-current',String(i===scene.section-1)));$('#anchor-count').textContent=`${String(state.scene).padStart(2,'0')} / 16`;$('#progress').style.width=`${state.scene/16*100}%`;renderContextPlaces();}
  function updateScroll(){
    scrollFrame=0;if(!state.opened||$('#completion').open)return;
    const threshold=readingTop()+(mobile()?55:window.innerHeight*.22);let scene=1;
    anchors.forEach(el=>{if(el.getBoundingClientRect().top<=threshold)scene=+el.dataset.scene;});
    const changed=scene!==state.scene;
    if(changed){state.scene=scene;state.maxScene=Math.max(state.maxScene,scene);save('bittersweet-journey:kashgar:scene',String(scene));renderProgress();}
    // Looking at a place is temporary: text scrolling always regains the narrative camera.
    if(!state.follow&&(changed||Math.abs(window.scrollY-state.explorationScrollY)>48))resumeReading();
    else if(changed&&state.follow)moveCamera(sceneCamera());
  }

  function resizeMap(animate=false){const rect=$('#map').getBoundingClientRect();mapSize={w:rect.width,h:rect.height};$('#map').setAttribute('viewBox',`0 0 ${mapSize.w} ${mapSize.h}`);if(state.follow||!state.camera)moveCamera(sceneCamera(),animate);else drawMap();}
  function changeLanguage(lang){if(lang===state.lang)return;const reading=state.opened?currentReading():null,selected=state.selected;state.lang=lang;save('bittersweet-journey:language',lang);renderLanguage();drawMap();
    if(reading){const target=anchors.find(a=>+a.dataset.scene===reading.scene);if(target){const sceneAnchors=anchors.filter(a=>+a.dataset.scene===reading.scene),oldCount=chapter[lang==='zh'?'en':'zh'].sections[reading.section].paragraphs.length,newCount=chapter[lang].sections[reading.section].paragraphs.length;
      // I–III are manually checked one-to-one; IV and V contain merged paragraphs.
      let pi=reading.paragraph;if(reading.section===3&&pi>=9)pi=lang==='en'?9:9;
      if(reading.section===4&&pi>=6){if(lang==='en')pi=pi===6||pi===7?6:pi-1;else pi=pi===6?6:pi+1;}
      pi=Math.min(pi,newCount-1);const el=$(`#p-${reading.section}-${pi}`)||sceneAnchors[0];requestAnimationFrame(()=>{const absolute=window.scrollY+el.getBoundingClientRect().top;window.scrollTo({top:absolute-readingTop()-(reading.offset||0),behavior:'instant'});});
    }}
    if(selected){document.querySelectorAll('.text-place').forEach(el=>el.classList.toggle('is-selected',el.dataset.place===selected));if(!$('#place-card').hidden)renderCard();}
    // Return anchors use semantic scene IDs across languages, never raw indices.
    if(state.returnTo){const r=state.returnTo;let pi=r.paragraph;if(r.section===3&&pi>=9)pi=9;if(r.section===4&&pi>=6)pi=lang==='en'?(pi<=7?6:pi-1):(pi===6?6:pi+1);r.paragraph=pi;}
  }
  function renderSources(){const zh=state.lang==='zh';const content=zh?[
    '地物来自 GeoJSON，经 Web Mercator 投影绘制。地图没有手绘河道、山脉轮廓或推测的旅行路线。',
    '区域河流、湖泊和自然地理区来自 Natural Earth 1:10m。山系、盆地与沙漠多边形是该数据集的概化范围，适合区域阅读，不是精密地形或边界测绘。',
    '喀什城市道路和水系来自 OpenStreetMap，部分峰顶与遗址定位点来自 Wikidata（CC0）。城市街道表示数据获取时的现代地理，不作为十九世纪街道复原。地点卡中的历史关联来自本文，不能据此认定现代城市范围等同于古城范围。',
    '尚无可靠位置对应的称谓会显示“位置待核实”，保留原文入口而不放置猜测坐标。相邻地点不能替代冰川、遗址或历史建筑。',
    '中文与英文保留所供 EPUB 原文；五个原文分节下设 16 个语义阅读锚点，无新增小标题。年代、人物与考古归属沿用原文叙述，地图只标注其地理对应，不把文学叙述转成已核证的历史路线。',
    `数据获取：${source?.generated||'2026-09-18'}。GeoJSON 与离线脚本来自同一构建结果；每个要素保留来源及原始对象标识。`
  ]:[
    'All geographic shapes are projected from GeoJSON using Web Mercator. No river courses, mountain outlines or travel routes are hand drawn.',
    'Regional rivers, lakes and physical regions come from Natural Earth at 1:10m. Mountain, basin and desert polygons are generalized physical-region extents, not surveyed terrain or precise boundaries.',
    'Kashgar streets and waterways come from OpenStreetMap; selected summit and site coordinates come from Wikidata (CC0). The city layer depicts modern geography, not a reconstruction of nineteenth-century streets. A modern city anchor does not define an ancient city’s extent.',
    'Names without a reliable geographic match retain passage links and a location-unverified note; no speculative coordinates are plotted. Nearby peaks or villages do not stand in for glaciers or ruins.',
    'Both supplied EPUB texts are preserved. Sixteen semantic anchors sit within the five original sections, without added headings. Historical claims remain attributed to the essay; no historical itinerary is inferred from them.',
    `Retrieved ${source?.generated||'2026-09-18'}. The downloadable GeoJSON and offline bundle share the same build. Features retain source identifiers.`
  ];$('#data-description').replaceChildren(...content.map(x=>safeText('p',x)));}

  // Opening and completion share the same real geographic backdrop and chapter seal.
  function renderCeremonyGeography(){
    const b=boundsOf([[69,30],[98,47]]),scale=Math.min(1120/(b[2]-b[0]),620/(b[3]-b[1]));
    const projected=c=>{const [x,y]=mercator(c);return [(x-(b[0]+b[2])/2)*scale+600,((b[1]+b[3])/2-y)*scale+455];};
    const line=c=>c.map((p,i)=>`${i?'L':'M'}${projected(p).map(n=>n.toFixed(2)).join(',')}`).join('');
    document.querySelectorAll('.ceremony-landforms').forEach(group=>{
      group.replaceChildren();features.filter(f=>['tian-shan','kunlun','pamir','taklamakan','tarim','yarkand-river'].includes(f.properties.place)).forEach(f=>{
        const g=f.geometry;let d='';
        if(g.type==='Polygon')d=g.coordinates.map(c=>line(c)+'Z').join('');
        if(g.type==='MultiPolygon')d=g.coordinates.map(p=>p.map(c=>line(c)+'Z').join('')).join('');
        if(g.type==='LineString')d=line(g.coordinates);
        if(g.type==='MultiLineString')d=g.coordinates.map(line).join('');
        group.append(node('path',{d,class:'ceremony-'+f.properties.kind,'fill-rule':'evenodd','data-source-place':f.properties.place}));
      });
    });
  }
  function enterReading(scene=1){
    document.body.classList.remove('is-unopened');
    state.opened=true;state.scene=scene;state.maxScene=Math.max(state.maxScene,scene);state.selected=null;setFollow(true);
    save('bittersweet-journey:kashgar:started','true');document.title='山河显影 · '+t('fullTitle');renderProgress();resizeMap(false);
    requestAnimationFrame(()=>{
      if(scene>1){const anchor=anchors.find(a=>+a.dataset.scene===scene);anchor?.closest('p').scrollIntoView({block:'start',behavior:'instant'});}
      else window.scrollTo({top:0,behavior:'instant'});
      $('#reading').setAttribute('tabindex','-1');$('#reading').focus({preventScroll:true});
    });
  }
  function completeChapter(){
    if($('#completion').open)return;
    save('bittersweet-journey:kashgar:complete','true');state.maxScene=16;
    hideCard();drawMap();$('#completion').showModal();announce(t('revealed')+' · '+t('fullTitle'));
  }
  $('#stay-reading').addEventListener('click',()=>$('#completion').close());
  renderCeremonyGeography();

  $('#close-card').addEventListener('click',()=>{resumeReading();$('.place-index summary').focus({preventScroll:true});});
  $('#resume').addEventListener('click',()=>{resumeReading();$('.place-index summary').focus({preventScroll:true});});
  $('#reset-map').addEventListener('click',()=>{state.selected=null;hideCard();setFollow(false);moveCamera(cameraFor(region));});
  $('#toggle-map').addEventListener('click',()=>{document.body.classList.toggle('map-expanded');updateExpand();});
  $('#return-reading').addEventListener('click',()=>{const ref=state.returnTo;if(!ref)return;state.returnTo=null;$('#return-reading').hidden=true;resumeReading(false);collapseMap();requestAnimationFrame(()=>{const el=$(`#p-${ref.section}-${ref.paragraph}`);if(el){window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-readingTop()-(ref.offset||0),behavior:reduced()?'instant':'smooth'});}});});
  $('#zoom-in').addEventListener('click',()=>zoom(1.55));$('#zoom-out').addEventListener('click',()=>zoom(1/1.55));
  function zoom(factor){setFollow(false);const scale=Math.max(250,Math.min(1800000,state.camera.scale*factor));moveCamera({...state.camera,scale});}
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>changeLanguage(b.dataset.language)));
  $('#data-button').addEventListener('click',()=>$('#data-dialog').showModal());$('#close-data').addEventListener('click',()=>$('#data-dialog').close());
  $('#finish').addEventListener('click',completeChapter);
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
  const mapObserver=new ResizeObserver(()=>{cancelAnimationFrame(cameraFrame);cameraFrame=requestAnimationFrame(()=>resizeMap(false));});
  mapObserver.observe($('#map'));mapObserver.observe($('.map-heading'));
  let pointer=null,dragged=false;
  $('#map').addEventListener('pointerdown',e=>{if(e.button!==0)return;cancelAnimationFrame(animation);pointer={x:e.clientX,y:e.clientY,camera:{...state.camera}};dragged=false;});
  $('#map').addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>5){dragged=true;setFollow(false);$('#map').setPointerCapture(e.pointerId);state.camera={...pointer.camera,x:pointer.camera.x-dx/pointer.camera.scale,y:Math.max(-2.3,Math.min(2.3,pointer.camera.y+dy/pointer.camera.scale))};drawMap();}});
  const endPointer=()=>{pointer=null;setTimeout(()=>dragged=false,0);};$('#map').addEventListener('pointerup',endPointer);$('#map').addEventListener('pointercancel',endPointer);
  $('#map').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY<0?1.2:1/1.2);}},{passive:false});
  $('#map').addEventListener('keydown',e=>{if(e.target!==$('#map'))return;if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.4);}else if(e.key==='-'){e.preventDefault();zoom(1/1.4);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setFollow(false);const c={...state.camera},d=60/c.scale;c.x+=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0;c.y+=e.key==='ArrowUp'?d:e.key==='ArrowDown'?-d:0;moveCamera(c);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#place-card').hidden){resumeReading();$('.place-index summary').focus({preventScroll:true});}else if($('.place-index').open){$('.place-index').open=false;$('.place-index summary').focus({preventScroll:true});}}});
  document.addEventListener('click',e=>{if(!e.target.closest('.place-index'))$('.place-index').open=false;});
  if(!source){$('#map-loading').textContent='地理数据未加载 / Geographic data unavailable';return;}
  renderLanguage();resizeMap(false);$('#map-loading').hidden=true;
  document.documentElement.classList.add('reader-ready');
  window.CHAPTER_OPENING.mount({
    background: '#kashgar-opening-landscape',
    copy: () => ({language: state.lang, number: state.lang === 'zh' ? '第九章' : 'Chapter 09',
      title: t('fullTitle'), line: t('invitation'), action: t('openBook')}),
    language: changeLanguage, enter: () => enterReading(1), sections: '#reading .reading-section'
  });
  window.KASHGAR_LANDSCAPE?.mount(document.querySelector('#chapter-leaf'));
  // Public read-only diagnostics for content and geometry verification.
  window.KASHGAR_READER={getState:()=>({...state}),getReferenceCounts:()=>Object.fromEntries([...refs].map(([id,list])=>[id,list.length]))};
})();
