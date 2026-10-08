(() => {
  'use strict';
  const chapter = window.KASHGAR_CHAPTER;
  const source = window.KASHGAR_GEOGRAPHY;
  const $ = s => document.querySelector(s);
  const svgNS = 'http://www.w3.org/2000/svg';
  const mobile = () => matchMedia('(max-width:900px)').matches;
  const readerScroll = $('.reader-scroll');
  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  const saved = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const params = new URLSearchParams(location.search);
  const requestedLanguage = params.get('lang');
  const requestedSection = Math.max(1, Math.min(5, Number(params.get('section')) || 1));
  if (['zh','en'].includes(requestedLanguage)) save('bittersweet-journey:language', requestedLanguage);
  const wasCompleted = saved('bittersweet-journey:kashgar:complete') === 'true';
  const lastScene = Math.max(1, Math.min(16, Number(saved('bittersweet-journey:kashgar:scene')) || 1));
  const state = { opened:false, maxScene:wasCompleted?16:1, lang: saved('bittersweet-journey:language') === 'zh' ? 'zh' : 'en', scene: 1, cameraParagraph: null, selected: null, follow: true, returnTo: null, camera: null };
  const copy = {
    zh: {chapter:'西域喀什',places:'本文地名',expand:'展开地图',collapse:'收起地图',following:'地图随文浏览',exploring:'正在探索地图',resume:'继续随文浏览 ↗',loading:'正在展开西域地理…',instruction:'点击文中地名，在地图上找到它；点击地图，回到相关原文。',start:'开始阅读 ↓',source:'余秋雨《文化苦旅》',finish:'完成本章 · 返回总图 ↗',sections:'原文章节',return:'返回刚才阅读处 ↩',choose:'选择地点',section:'原文第',paragraph:'段',references:'相关原文',none:'本篇通过相关地名提及此处。',cross:'在《道士塔》中继续阅读喀什 ↗',point:'地点',river:'河流',mountain:'山地',desert:'沙漠',basin:'盆地',lake:'水域',unlocated:'位置待核实',introNote:'点击下方片段，返回原文。'},
    en: {chapter:'Kashgar',places:'Places',expand:'Expand map',collapse:'Collapse map',following:'Following the text',exploring:'Exploring the map',resume:'Follow the text ↗',loading:'Unfolding the geography…',instruction:'Select a place in the text to find it on the map. Select the map to return to its passages.',start:'Begin reading ↓',source:'Yu Qiuyu · A Bittersweet Journey Through Culture',finish:'Complete chapter · Return to atlas ↗',sections:'Sections',return:'Back to reading ↩',choose:'Choose a place',section:'Section ',paragraph:'paragraph',references:'Passages',none:'This location appears through related place names.',cross:'Read about Kashgar in The Taoist Priest’s Tower ↗',point:'Place',river:'River',mountain:'Mountains',desert:'Desert',basin:'Basin',lake:'Water',unlocated:'Location unverified',introNote:'Select a passage to return to the original text.'}
  };
  Object.assign(copy.zh,{invitation:'有人把来世，选在这里。',question1:'如果生命能够重来一次，',question2:'你愿意生在何处？',openBook:'循着远方，开卷 →',continueBook:'继续上次阅读 ↗',replay:'重看开场',closing:'远方，在这里有了归宿。',revealed:'一处山河已经显影',fullTitle:'西域喀什',memorySaved:'这枚印记，将留在总图上。',carryBack:'将这片山河带回总图 →',stayReading:'留在此页',backAtlas:'← 返回总图',finish:'让这片山河显影 →'});
  Object.assign(copy.en,{invitation:'Someone chose to be reborn here.',question1:'If life could begin again,',question2:'where would you choose to be born?',openBook:'Follow the far horizon →',continueBook:'Continue reading ↗',replay:'Replay the opening',closing:'Here, the faraway comes home.',revealed:'One landscape brought to light',fullTitle:'Kashgar in the Western Regions',memorySaved:'This seal will remain on the atlas.',carryBack:'Carry this landscape back to the atlas →',stayReading:'Stay with the text',backAtlas:'← Return to atlas',finish:'Bring this landscape to light →'});
  Object.assign(copy.zh,{inPassage:'本段地点',allPlaces:'全部地点',exploring:'临时查看 · 滚动正文继续',resume:'回到本段 ↗',instruction:'点击地名查看地图，继续滚动即可回到随文浏览。'});
  Object.assign(copy.en,{inPassage:'In this passage',allPlaces:'All places',exploring:'Preview · scroll text to resume',resume:'Back to this passage ↗',instruction:'Select a place to look closer. Keep scrolling the text to return to the story.'});
  const t = k => copy[state.lang][k] || k;
  // Short section titles (as the other chapters); the essay itself has numbers only.
  const sectionTitles = {
    zh: ['汤因比的来世', '文明交汇', '中心的中心', '两座领事馆', '白色旗幡'],
    en: ['Toynbee’s next life', 'Where civilizations met', 'The centre of the centre', 'Two consulates', 'The white banner']
  };
  // Shaded relief (tools/build_kashgar_relief.py), in Web Mercator rows: placed by its two corners.
  const RELIEF = {href: './assets/region-relief.jpg?v=1a2d66a354d0', west: 70, east: 100, south: 31, north: 46};
  let reliefImage = null;
  // The English EPUB sets each section opening in capitals; show them in sentence case (as the other chapters).
  const englishOpenings = [['NO MATTER HOW FAR', 'No matter how far'], ['EVERY TIME I GO TO XINJIANG,', 'Every time I go to Xinjiang,'],
    ['WHEN ZHANG QIAN OPENED', 'When Zhang Qian opened'], ['IN APRIL 1881,', 'In April 1881,'], ['AMONG MANY “ANCESTORS”', 'Among many “ancestors”']];
  const sentenceCase = text => { const hit = englishOpenings.find(([caps]) => text.startsWith(caps)); return hit ? hit[1] + text.slice(hit[0].length) : text; };
  Object.assign(copy.zh, {source:'文本：余秋雨《文化苦旅》', backAtlas:'← 总地图', finish:'完成本章 · 返回总图'});
  Object.assign(copy.en, {backAtlas:'← Atlas', finish:'Complete chapter · Return to atlas'});
  Object.assign(copy.zh, {north:'北'});
  Object.assign(copy.en, {north:'N'});
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
    let reliefPlaced=false;
    const placeRelief=()=>{
      if(reliefPlaced)return;reliefPlaced=true;
      if(!reliefImage)reliefImage=node('image',{href:RELIEF.href,class:'geo-relief',preserveAspectRatio:'none'});
      const [x0,y0]=project([RELIEF.west,RELIEF.north]),[x1,y1]=project([RELIEF.east,RELIEF.south]);
      Object.entries({x:x0,y:y0,width:x1-x0,height:y1-y0}).forEach(([k,v])=>reliefImage.setAttribute(k,v.toFixed(1)));
      // about 3 km cells: it fades out as the camera comes down to the city
      reliefImage.style.opacity=String(Math.max(0,Math.min(1,(40000-state.camera.scale)/25000)));
      geography.append(reliefImage);
    };
    features.filter(f=>f.geometry.type!=='Point'&&isVisible(f)&&(!f.properties.local||close)).forEach(f=>{
      if(f.properties.kind!=='land')placeRelief();
      const p=f.properties,id=p.place,selected=state.selected===id,context=focus.has(id),d=pathFor(f.geometry);
      const discovered=!state.follow||selected||(id&&(revealAt.get(id)||15)<=state.maxScene);
      const opacity=discovered?1:p.kind==='land'?1:['mountain','basin','desert'].includes(p.kind)?(state.maxScene>=12?.6:.15):(state.maxScene>=10?.48:.08);
      const el=node('path',{d,class:`geo-feature geo-${p.kind}${context?' is-context':''}${selected?' is-selected':''}${p.kind==='city-water'&&f.geometry.type.includes('Polygon')?' area':''}`,'fill-rule':'evenodd'});
      el.style.opacity=opacity;el.dataset.revealed=String(discovered);
      if(id&&places.has(id)){el.dataset.place=id;el.addEventListener('click',e=>{e.stopPropagation();if(!dragged)selectPlace(id,'map');});}
      geography.append(el);
      if(p.kind==='river'&&id&&discovered){const hit=node('path',{d,class:'geo-hit'});hit.addEventListener('click',e=>{e.stopPropagation();if(!dragged)selectPlace(id,'map');});geography.append(hit);}
    });
    placeRelief();
    const occupied=[];
    [...places.values()].filter(p=>p.center&&byPlace.has(p.id)).sort((a,b)=>(b.id===state.selected?100:focus.has(b.id)?50:b.priority||0)-(a.id===state.selected?100:focus.has(a.id)?50:a.priority||0)).forEach(p=>{
      const selected=p.id===state.selected,context=focus.has(p.id);if(state.follow&&!selected&&(revealAt.get(p.id)||15)>state.maxScene)return;if(close&&!p.local&&p.id!=='kashgar'&&!selected)return;
      if(!close&&p.local&&!selected)return;
      const [x,y]=project(p.center),v=viewport();if(x<12||x>mapSize.w-18||y<v.top-25||y>mapSize.h-v.bottom+20)return;
      const regionLabel=['mountain','desert','basin'].includes(p.kind),name=p[state.lang];
      const zh=state.lang==='zh',fs=regionLabel?(mobile()?17:20):(mobile()?(zh?20:18):(zh?24:22));
      const textW=name.length*(zh?fs*(regionLabel?1.3:1.14):fs*0.5);
      let dx=regionLabel?0:10,dy=regionLabel?0:-8;
      const candidates=regionLabel?[[0,0]]:[[10,-6],[10,fs+2],[-textW-10,-6],[-textW-10,fs+2]];
      let box;
      const fits=candidates.some(([cx,cy])=>{const b=regionLabel?[x-textW/2-6,y+cy-fs*0.85,x+textW/2+6,y+cy+fs*0.3]:[x+Math.min(-7,cx-4),y+Math.min(-7,cy-fs*0.9),x+Math.max(7,cx+textW+4),y+Math.max(7,cy+fs*0.3)];if(b[0]<8||b[2]>mapSize.w-10)return false;if(!selected&&occupied.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return false;dx=cx;dy=cy;box=b;return true;});
      if(!fits&&!selected)return;if(box)occupied.push(box);
      const g=node('g',{transform:`translate(${x},${y})`,class:`map-label ${regionLabel?'region':''} ${selected||context?'active':''}`});activate(g,p.id);
      if(!regionLabel){if(selected||p.id==='kashgar')g.append(node('circle',{r:selected?18:12,class:'halo'}));g.append(node('circle',{r:selected?5:context?3.8:2.8,class:'core'}));}
      if(box)g.append(node('rect',{x:box[0]-x,y:box[1]-y,width:box[2]-box[0],height:box[3]-box[1],class:'hit-box'}));
      const txt=node('text',{x:dx,y:dy,'text-anchor':regionLabel?'middle':'start'},name);g.append(txt);
      labels.append(g);
    });
    const scale=$('#scale');
    if(!scale.firstElementChild){
      scale.append(node('path',{fill:'none',stroke:'#67725f','stroke-width':1}));
      scale.append(node('text',{class:'grid-label','text-anchor':'end'}));
    }
    const lat=inverse([state.camera.x,state.camera.y])[1],kmPerPx=6371*Math.cos(lat*Math.PI/180)/state.camera.scale;
    const width=90,distance=width*kmPerPx,x=mapSize.w-145,y=mapSize.h-53;
    const [bar,label]=scale.children;
    bar.setAttribute('d',`M${x},${y-4}V${y}H${x+width}V${y-4}`);
    label.setAttribute('x',x+width);label.setAttribute('y',y-9);
    const value=distance<1?`${+((distance*1000).toPrecision(2))} m`:`${+distance.toPrecision(2)} km`;
    if(label.textContent!==value)label.textContent=value;
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
    if(!value)state.explorationScrollY=readerScroll.scrollTop;
    // no on-map status caption (removed 2026-10-08, as in the other chapters): scrolling the text or closing
    // the place card is what brings the map back to the passage
  }
  function resumeReading(animate=true,move=true){
    state.selected=null;hideCard();setFollow(true);
    document.querySelectorAll('.text-place.is-selected').forEach(el=>el.classList.remove('is-selected'));
    renderContextPlaces();if(move)moveCamera(sceneCamera(),animate);
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
  }
  function hideCard(){ $('#place-card').hidden=true; }
  function selectPlace(id,origin){
    const p=places.get(id);if(!p)return;state.selectionOrigin=currentReading();state.selected=id;setFollow(false);renderContextPlaces();
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
  function readingAnchorAt(threshold){
    let anchor=anchors[0];
    anchors.forEach(el=>{if(el.getBoundingClientRect().top<=threshold)anchor=el;});
    // A section begins at its heading, even when its first paragraph is below the reading line.
    document.querySelectorAll('#reading .reading-section').forEach(section=>{
      const first=section.querySelector('[data-scene]');
      if(first&&section.getBoundingClientRect().top<=threshold&&first.getBoundingClientRect().top>threshold)anchor=first;
    });
    return anchor;
  }
  function currentReading(){const anchor=readingAnchorAt(readingTop()+45),p=anchor?.closest('p');return p?{section:+p.dataset.section,paragraph:+p.dataset.paragraph,scene:+anchor.dataset.scene,offset:p.getBoundingClientRect().top-readingTop()}:null;}
  function readingTop(){return readerScroll.getBoundingClientRect().top;}
  function scrollToParagraph(ref,highlight=true){const el=$(`#p-${ref.section}-${ref.paragraph}`);if(!el)return;el.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});if(highlight){document.querySelectorAll('.is-target').forEach(x=>x.classList.remove('is-target'));el.classList.add('is-target');el.setAttribute('tabindex','-1');el.focus({preventScroll:true});} }
  function jumpTo(ref){if(!state.returnTo)state.returnTo=state.selectionOrigin||currentReading();$('#return-reading').hidden=!state.returnTo;resumeReading(false);collapseMap();requestAnimationFrame(()=>scrollToParagraph(ref));}
  function collapseMap(){document.body.classList.remove('map-expanded');updateExpand();resizeMap(false);}
  function updateExpand(){const expanded=document.body.classList.contains('map-expanded');$('#toggle-map').setAttribute('aria-expanded',String(expanded));$('#toggle-map').textContent=t(expanded?'collapse':'expand');}
  function renderReading(){
    const root=$('#reading'), fragment=document.createDocumentFragment();refs=new Map();
    const aliases=[...places.values()].flatMap(p=>(p.aliases[state.lang]||[]).map(term=>({term,id:p.id}))).sort((a,b)=>b.term.length-a.term.length);
    const escaped=aliases.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const regex=new RegExp(escaped.join('|'),'g');const lookup=new Map(aliases.map(a=>[a.term,a.id]));
    chapter[state.lang].sections.forEach((section,si)=>{
      const element=safeText('section','','reading-section');element.id=`section-${si+1}`;
      // the shared reader's heading: number · short title, then a rule (no "01 / 05" counter)
      const header=safeText('header','','reader-header section-heading');const wrap=document.createElement('div');
      wrap.append(safeText('h2',`${section.label} · ${sectionTitles[state.lang][si]}`,'reader-section-label'));header.append(wrap);
      const rule=safeText('div','','reader-rule');rule.setAttribute('aria-hidden','true');element.append(header,rule);
      section.paragraphs.forEach((text,pi)=>{
        const p=safeText('p','');p.id=`p-${si}-${pi}`;p.dataset.section=si;p.dataset.paragraph=pi;
        if(text.startsWith('（')||text.startsWith('—'))p.className='quote-credit';const mentioned=new Set();
        // 一, 二, 三 … are bare strokes: as a drop cap they read as a rule (as in the shared reader)
        if(pi===0&&/^[一二三四五六七八九十〇]/.test(text))p.classList.add('no-dropcap');
        section.anchors[pi].forEach((part,ai)=>{const span=safeText('span','');span.dataset.scene=part.scene;let cursor=0;
          if(state.lang==='en'&&pi===0&&ai===0)part={...part,text:sentenceCase(part.text)};
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
    const nav=$('#section-nav');nav.replaceChildren();chapter[state.lang].sections.forEach((s,i)=>{const b=safeText('button',String(i+1).padStart(2,'0'),'section-button');b.setAttribute('aria-label',`${state.lang==='zh'?'原文第':'Section '}${s.label}${state.lang==='zh'?'节':''}`);b.addEventListener('click',()=>{resumeReading(false);collapseMap();requestAnimationFrame(()=>$('#section-'+(i+1)).scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'}));});nav.append(b);});
    renderContextPlaces();
  }
  function renderLanguage(){document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';document.body.dataset.language=state.lang;document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=t(el.dataset.copy));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===state.lang)));renderReading();document.querySelectorAll('.back-atlas').forEach(link=>{const url=new URL(link.href);url.searchParams.set('lang',state.lang);link.href=url.href;});document.title='山河显影 · '+t('fullTitle');updateExpand();setFollow(state.follow);renderProgress();}
  function renderProgress(){const scene=chapter.scenes[state.scene-1];[...$('#section-nav').children].forEach((b,i)=>b.setAttribute('aria-current',String(i===scene.section-1)));$('#anchor-count').textContent=`${String(state.scene).padStart(2,'0')} / 16`;$('#progress').style.width=`${state.scene/16*100}%`;renderContextPlaces();}
  function updateScroll(){
    scrollFrame=0;if(!state.opened||document.body.classList.contains('is-completing'))return;
    const threshold=readingTop()+Math.min(150,readerScroll.clientHeight*.22);
    const anchor=readingAnchorAt(threshold);
    const scene=+(anchor?.dataset.scene||1);
    const paragraph=anchor?.closest('p');
    const paragraphKey=paragraph?`${paragraph.dataset.section}:${paragraph.dataset.paragraph}`:`scene:${scene}`;
    const paragraphChanged=paragraphKey!==state.cameraParagraph;
    state.cameraParagraph=paragraphKey;
    const changed=scene!==state.scene;
    if(changed){state.scene=scene;state.maxScene=Math.max(state.maxScene,scene);save('bittersweet-journey:kashgar:scene',String(scene));renderProgress();}
    // Looking at a place is temporary: text scrolling always regains the narrative camera.
    if(!state.follow&&(paragraphChanged||Math.abs(readerScroll.scrollTop-state.explorationScrollY)>48))resumeReading(true,paragraphChanged);
    else if(changed&&paragraphChanged&&state.follow)moveCamera(sceneCamera());
  }

  function resizeMap(animate=false){const rect=$('#map').getBoundingClientRect();mapSize={w:rect.width,h:rect.height};$('#map').setAttribute('viewBox',`0 0 ${mapSize.w} ${mapSize.h}`);if(state.follow||!state.camera)moveCamera(sceneCamera(),animate);else drawMap();}
  function changeLanguage(lang){if(lang===state.lang)return;const reading=state.opened?currentReading():null,selected=state.selected;state.lang=lang;save('bittersweet-journey:language',lang);renderLanguage();drawMap();
    if(reading){const target=anchors.find(a=>+a.dataset.scene===reading.scene);if(target){const sceneAnchors=anchors.filter(a=>+a.dataset.scene===reading.scene),oldCount=chapter[lang==='zh'?'en':'zh'].sections[reading.section].paragraphs.length,newCount=chapter[lang].sections[reading.section].paragraphs.length;
      // I–III are manually checked one-to-one; IV and V contain merged paragraphs.
      let pi=reading.paragraph;if(reading.section===3&&pi>=9)pi=lang==='en'?9:9;
      if(reading.section===4&&pi>=6){if(lang==='en')pi=pi===6||pi===7?6:pi-1;else pi=pi===6?6:pi+1;}
      pi=Math.min(pi,newCount-1);const el=$(`#p-${reading.section}-${pi}`)||sceneAnchors[0];requestAnimationFrame(()=>{const absolute=readerScroll.scrollTop+el.getBoundingClientRect().top;readerScroll.scrollTo({top:absolute-readingTop()-(reading.offset||0),behavior:'instant'});});
    }}
    if(selected){document.querySelectorAll('.text-place').forEach(el=>el.classList.toggle('is-selected',el.dataset.place===selected));if(!$('#place-card').hidden)renderCard();}
    // Return anchors use semantic scene IDs across languages, never raw indices.
    if(state.returnTo){const r=state.returnTo;let pi=r.paragraph;if(r.section===3&&pi>=9)pi=9;if(r.section===4&&pi>=6)pi=lang==='en'?(pi<=7?6:pi-1):(pi===6?6:pi+1);r.paragraph=pi;}
  }
  function enterReading(scene=1){
    document.body.classList.remove('is-unopened');
    document.body.classList.add('is-open');
    state.opened=true;state.scene=scene;state.cameraParagraph=null;state.maxScene=Math.max(state.maxScene,scene);state.selected=null;setFollow(true);
    save('bittersweet-journey:kashgar:started','true');document.title='山河显影 · '+t('fullTitle');renderProgress();resizeMap(false);
    requestAnimationFrame(()=>{
      if(scene>1){const anchor=anchors.find(a=>+a.dataset.scene===scene);anchor?.closest('p').scrollIntoView({block:'start',behavior:'instant'});}
      else readerScroll.scrollTo({top:0,behavior:'instant'});
      $('#reading').setAttribute('tabindex','-1');$('#reading').focus({preventScroll:true});
    });
  }
  let completionTimer=null;
  function completeChapter(){
    if(document.body.classList.contains('is-completing'))return;
    window.JOURNEY_AUDIO?.play('complete', .58);
    save('bittersweet-journey:kashgar:complete','true');state.maxScene=16;
    hideCard();
    document.body.classList.add('is-completing');
    $('#completion').setAttribute('aria-hidden','false');
    document.querySelectorAll('.chapter-layout, .site-masthead, .bottom-bar').forEach(el=>el.inert=true);
    completionTimer=setTimeout(()=>{
      const destination=`../../index.html?revealed=kashgar&lang=${state.lang}`;
      if(window.LAND_TRANSITION)window.LAND_TRANSITION.navigate(destination);
      else location.href=destination;
    },window.JOURNEY_AUDIO?.enabled?4200:1400);
  }
  window.addEventListener('pagehide',()=>clearTimeout(completionTimer));
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    clearTimeout(completionTimer);
    document.body.classList.remove('is-completing');
    $('#completion').setAttribute('aria-hidden','true');
    document.querySelectorAll('.chapter-layout, .site-masthead, .bottom-bar').forEach(el=>el.inert=false);
  });

  $('#close-card').addEventListener('click',()=>{resumeReading();$('#map').focus({preventScroll:true});});
  $('#toggle-map').addEventListener('click',()=>{document.body.classList.toggle('map-expanded');updateExpand();});
  $('#return-reading').addEventListener('click',()=>{const ref=state.returnTo;if(!ref)return;state.returnTo=null;$('#return-reading').hidden=true;resumeReading(false);collapseMap();requestAnimationFrame(()=>{const el=$(`#p-${ref.section}-${ref.paragraph}`);if(el){readerScroll.scrollTo({top:readerScroll.scrollTop+el.getBoundingClientRect().top-readingTop()-(ref.offset||0),behavior:reduced()?'instant':'smooth'});}});});
  function zoom(factor){setFollow(false);const scale=Math.max(250,Math.min(1800000,state.camera.scale*factor));moveCamera({...state.camera,scale});}
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>changeLanguage(b.dataset.language)));
  $('#finish').addEventListener('click',completeChapter);
  readerScroll.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
  const mapObserver=new ResizeObserver(()=>{cancelAnimationFrame(cameraFrame);cameraFrame=requestAnimationFrame(()=>resizeMap(false));});
  mapObserver.observe($('#map'));mapObserver.observe($('.map-heading'));
  let pointer=null,dragged=false;
  $('#map').addEventListener('pointerdown',e=>{if(e.button!==0)return;cancelAnimationFrame(animation);pointer={x:e.clientX,y:e.clientY,camera:{...state.camera}};dragged=false;});
  $('#map').addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>5){dragged=true;setFollow(false);$('#map').setPointerCapture(e.pointerId);state.camera={...pointer.camera,x:pointer.camera.x-dx/pointer.camera.scale,y:Math.max(-2.3,Math.min(2.3,pointer.camera.y+dy/pointer.camera.scale))};drawMap();}});
  const endPointer=()=>{pointer=null;setTimeout(()=>dragged=false,0);};$('#map').addEventListener('pointerup',endPointer);$('#map').addEventListener('pointercancel',endPointer);
  $('#map').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY<0?1.2:1/1.2);}},{passive:false});
  $('#map').addEventListener('keydown',e=>{if(e.target!==$('#map'))return;if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.4);}else if(e.key==='-'){e.preventDefault();zoom(1/1.4);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setFollow(false);const c={...state.camera},d=60/c.scale;c.x+=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0;c.y+=e.key==='ArrowUp'?d:e.key==='ArrowDown'?-d:0;moveCamera(c);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#place-card').hidden){resumeReading();$('#map').focus({preventScroll:true});}}});
  if(!source){$('#map-loading').textContent='地理数据未加载 / Geographic data unavailable';return;}
  renderLanguage();resizeMap(false);$('#map-loading').hidden=true;
  document.documentElement.classList.add('reader-ready');
  window.CHAPTER_OPENING.mount({
    background: '#kashgar-opening-landscape',
    copy: () => ({language: state.lang, number: state.lang === 'zh' ? '第 09 章' : 'Chapter 09',
      title: t('fullTitle'), line: t('invitation'), action: t('openBook')}),
    language: changeLanguage, sections: '#reading .reading-section',
    preview: params.get('open') === '1',
    enter: () => enterReading(chapter.scenes.find(s => s.section === requestedSection)?.id || 1)
  });
  window.KASHGAR_LANDSCAPE?.mount(document.querySelector('#chapter-leaf'));
  // Public read-only diagnostics for content and geometry verification.
  window.KASHGAR_READER={getState:()=>({...state}),getReferenceCounts:()=>Object.fromEntries([...refs].map(([id,list])=>[id,list.length]))};
})();
