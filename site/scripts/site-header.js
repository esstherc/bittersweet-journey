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
  let sourceDialog;
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
  function refresh() {
    refreshSources();
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
