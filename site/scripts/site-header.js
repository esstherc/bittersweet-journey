/* One masthead stays mounted as the title leaf gives way to the reading view. */
(() => {
  'use strict';
  const atlas = new URL('../index.html', document.currentScript.src);
  const chapterIds = ['my-hometown', 'dujiangyan', 'secret-spring', 'taoist-tower', 'mountain-resort', 'yangguan', 'kashgar', 'fish-tail-lodge', 'mogao-caves'];
  const mapDataSources = Object.freeze([
    Object.freeze({name:'Natural Earth',url:'https://www.naturalearthdata.com/'}),
    Object.freeze({name:'Copernicus DEM',url:'https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM'}),
    Object.freeze({name:'OpenStreetMap',url:'https://www.openstreetmap.org/copyright'}),
    Object.freeze({name:'Wikidata',url:'https://www.wikidata.org/'})
  ]);
  const projectInfoCopy = Object.freeze({
    zh: Object.freeze({
      label:'阅读我们的创作动机',close:'关闭创作说明',title:'我们为什么创作这件作品',
      body1:'当文学与它所描写的真实地理相遇时，会产生怎样一种新的数字人文体验？阅读能否变得更具视觉性、空间感与沉浸感——不再只是翻动书页，而更像走进一片风景？',
      body2Before:'我们从余秋雨的',book:'《文化苦旅》',
      body2After:'出发。余秋雨写的是行走中国的旅程，但地点从来不是唯一的主题。一条河、一处遗址或一座古城，都会成为进入历史与文化记忆的入口。景观与思考之间的这种紧密联系，让这本书自然成为我们的起点。',
      body3:'我们不想把这些散文做成一部常规的数字版本，而是想创造一个读者可以在其中移动的世界。地图不只是标出每一章的位置，也塑造旅程、揭示联系，让故事在探索中展开。它既是阅读体验，也是地图集和游戏——是我们对数字人文可能性的一次小小实验。',
      reveal:'完成全部章节后，旅程的终点会出现一份隐藏菜单！',signature:'Yanbing Chen & Eugenie Huang'
    }),
    en: Object.freeze({
      label:'Read why we made this project',close:'Close project note',title:'Why We Made This',
      body1:'What new kind of digital humanities experience becomes possible when literature meets the real geography it describes? Can reading become more visual, spatial, and immersive, less like turning pages, and more like stepping into a landscape?',
      body2Before:'We began with Yu Qiuyu’s ',book:'A Bittersweet Journey Through Culture',
      body2After:'. Yu writes about journeys across China, but his subject is never place alone. A river, a ruin, or an ancient city becomes a way into history and cultural memory. This close relationship between landscape and reflection made the book a natural starting point for us.',
      body3:'Rather than turning the essays into a conventional digital edition, we wanted to create a world that readers could move through. The map does more than locate each chapter. It shapes the journey, reveals connections, and allows the story to unfold through exploration. The result is part reading experience, part atlas, and part game—a small experiment in what digital humanities can make possible.',
      reveal:'Complete every chapter, and a hidden menu will appear at the end of your journey!',signature:'Yanbing Chen & Eugenie Huang'
    })
  });
  let sourceDialog;
  let projectInfoDialog;
  let projectInfoTrigger;
  function english(){return document.body.dataset.language==='en';}
  function sourceText(){return english()?'Data Sources':'数据来源';}
  function makeSourceList(){
    const list=document.createElement('ol');list.className='site-data-sources-list';
    mapDataSources.forEach((source,index)=>{
      const item=document.createElement('li'),number=document.createElement('span'),link=document.createElement('a');
      number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
      link.href=source.url;link.target='_blank';link.rel='noopener';link.textContent=source.name;
      item.append(number,link);list.append(item);
    });
    return list;
  }
  function ensureSourceDialog(){
    if(sourceDialog?.isConnected)return sourceDialog;
    sourceDialog=document.createElement('dialog');sourceDialog.className='site-data-sources';
    const close=document.createElement('button');close.type='button';close.className='site-data-sources-close';close.textContent='×';
    const title=document.createElement('h2');title.id='site-data-sources-title';
    sourceDialog.setAttribute('aria-labelledby',title.id);sourceDialog.append(close,title,makeSourceList());document.body.append(sourceDialog);
    close.addEventListener('click',()=>sourceDialog.close());
    sourceDialog.addEventListener('click',event=>{if(event.target===sourceDialog)sourceDialog.close();});
    return sourceDialog;
  }
  function prepareSourceTriggers(){
    document.querySelectorAll('.atlas-map-source,.map-source-credit,.notes-button').forEach(node=>{
      let trigger=node;
      if(node.tagName!=='BUTTON'){
        trigger=document.createElement('button');trigger.type='button';trigger.className=node.className;node.replaceWith(trigger);
      }
      trigger.classList.add('site-data-sources-trigger');trigger.removeAttribute('data-copy');trigger.removeAttribute('aria-controls');
      trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-label',sourceText());trigger.textContent=sourceText();
    });
  }
  function refreshSources(){
    prepareSourceTriggers();
    if(!sourceDialog?.isConnected)return;
    sourceDialog.querySelector('h2').textContent=sourceText();
    const close=sourceDialog.querySelector('.site-data-sources-close');close.setAttribute('aria-label',english()?'Close data sources':'关闭数据来源');
    document.querySelectorAll('.site-data-sources-trigger').forEach(trigger=>{trigger.textContent=sourceText();trigger.setAttribute('aria-label',sourceText());});
  }
  function openSources(){
    const dialog=ensureSourceDialog();refreshSources();if(!dialog.open)dialog.showModal();dialog.querySelector('.site-data-sources-close').focus();
  }
  function icon(className,path){
    const span=document.createElement('span');span.className=className;span.setAttribute('aria-hidden','true');
    span.innerHTML=`<svg viewBox="0 0 20 20" focusable="false"><circle cx="10" cy="10" r="8.5"/><path d="M7.7 7.2a2.55 2.55 0 1 1 3.8 2.22c-.92.62-1.5 1.05-1.5 2.08"/><circle class="dot" cx="10" cy="14.3" r=".7"/>${path||''}</svg>`;
    return span;
  }
  function closeIcon(){
    const span=document.createElement('span');span.setAttribute('aria-hidden','true');
    span.innerHTML='<svg viewBox="0 0 20 20" focusable="false"><path d="M5 5l10 10M15 5L5 15"/></svg>';
    return span;
  }
  function makeProjectInfoDialog(){
    const dialog=document.createElement('dialog');dialog.className='project-info-dialog';dialog.id='project-info';
    const close=document.createElement('button');close.type='button';close.className='project-info-close';close.append(closeIcon());
    const title=document.createElement('h2');title.id='project-info-title';title.dataset.projectInfo='title';
    const body1=document.createElement('p');body1.dataset.projectInfo='body1';
    const body2=document.createElement('p');
    const before=document.createElement('span');before.dataset.projectInfo='body2Before';
    const book=document.createElement('cite');book.dataset.projectInfo='book';
    const after=document.createElement('span');after.dataset.projectInfo='body2After';body2.append(before,book,after);
    const body3=document.createElement('p');body3.dataset.projectInfo='body3';
    const reveal=document.createElement('p');reveal.className='project-info-reveal';reveal.dataset.projectInfo='reveal';
    const signature=document.createElement('p');signature.className='project-info-signature';signature.dataset.projectInfo='signature';
    dialog.setAttribute('aria-labelledby',title.id);dialog.append(close,title,body1,body2,body3,reveal,signature);document.body.append(dialog);
    const closeDialog=()=>{if(!dialog.open)return;dialog.close();window.JOURNEY_AUDIO?.play('close',.42);};
    close.addEventListener('click',closeDialog);
    dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
    return dialog;
  }
  function prepareProjectInfo(){
    if(projectInfoTrigger?.isConnected)return projectInfoTrigger;
    const credit=document.querySelector('.bottom-bar .credit, .atlas-footer .atlas-citation');if(!credit)return null;
    if(credit.matches('button'))projectInfoTrigger=credit;
    else{
      projectInfoTrigger=document.createElement('button');projectInfoTrigger.type='button';projectInfoTrigger.className=`${credit.className} credit-info-trigger`;
      const label=document.createElement('span');label.className='credit-info-label';label.textContent=credit.textContent;
      if(credit.dataset.copy)label.dataset.copy=credit.dataset.copy;
      credit.replaceWith(projectInfoTrigger);projectInfoTrigger.append(label,icon('credit-info-mark'));
    }
    projectInfoTrigger.classList.add('credit-info-trigger');projectInfoTrigger.setAttribute('aria-haspopup','dialog');projectInfoTrigger.setAttribute('aria-controls','project-info');
    projectInfoDialog=document.querySelector('#project-info')||makeProjectInfoDialog();
    projectInfoTrigger.addEventListener('click',event=>{event.stopPropagation();if(!projectInfoDialog.open)projectInfoDialog.showModal();window.JOURNEY_AUDIO?.play('click',.32);});
    return projectInfoTrigger;
  }
  function refreshProjectInfo(){
    const trigger=prepareProjectInfo();if(!trigger)return;
    const copy=projectInfoCopy[english()?'en':'zh'];trigger.setAttribute('aria-label',copy.label);
    projectInfoDialog.querySelector('.project-info-close').setAttribute('aria-label',copy.close);
    projectInfoDialog.querySelectorAll('[data-project-info]').forEach(node=>{node.textContent=copy[node.dataset.projectInfo];});
  }
  function refresh() {
    refreshSources();
    refreshProjectInfo();
    const header = document.querySelector('.site-masthead');
    if (!header) return;
    const english = document.body.dataset.language === 'en';
    const url = new URL(atlas);
    url.searchParams.set('lang', english ? 'en' : 'zh');
    const brand = header.querySelector('.site-wordmark');
    brand.href = url.href;
    brand.setAttribute('aria-label', english ? 'Land, Made Visible — back to the atlas' : '山河显影，返回中国总地图');
    header.querySelector('[data-site-title]').textContent = english ? 'Land, Made Visible' : '山河显影';
    const progress = header.querySelector('.site-progress');
    progress.setAttribute('aria-label', english ? 'View the collected seals' : '查看已显影的图章');
    header.querySelector('[data-site-progress-label]').textContent = english ? 'My Seals' : '我的印章';
    let count = 0;
    try { count = chapterIds.filter(id => localStorage.getItem(`bittersweet-journey:${id}:complete`) === 'true').length; } catch {}
    header.querySelector('[data-site-progress-count]').textContent = String(count);
    const total=header.querySelector('[data-site-progress-total]');
    if(total)total.textContent=String(chapterIds.length);
    if (progress.tagName === 'A') {
      url.searchParams.set('stamps', '1');
      progress.href = url.href;
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    document.addEventListener('click',event=>{
      if(!event.target.closest('.site-data-sources-trigger'))return;
      event.preventDefault();event.stopImmediatePropagation();openSources();
    },true);
    new MutationObserver(refresh).observe(document.body, {attributes: true, attributeFilter: ['data-language']});
  }, {once: true});
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  window.MAP_DATA_SOURCES=mapDataSources;
  window.SITE_HEADER = Object.freeze({refresh,openSources});
})();
