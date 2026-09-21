#!/usr/bin/env python3
"""Build provenance-carrying GeoJSON, plus an identical file://-safe JS bundle.

Inputs: cached Natural Earth GeoJSON, Overpass city response, Wikidata response.
No invented geographic geometry. Requires shapely.
"""
import hashlib
import json
from pathlib import Path
from shapely.geometry import box, shape, mapping

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'work/kashgar'
OUT = ROOT / 'site/chapters/kashgar'
NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
features, places = [], []
world_clip = box(-12, 10, 119, 66)
regional_clip = box(63, 28, 111, 49)


def read(name):
    return json.loads((CACHE / name).read_text())


def place(pid, zh, en, kind, zh_aliases, en_aliases, priority=10, note=None, local=False):
    p = dict(id=pid, zh=zh, en=en, kind=kind, aliases=dict(zh=zh_aliases, en=en_aliases), priority=priority, local=local)
    if note:
        p['note'] = dict(zh=note[0], en=note[1])
    places.append(p)
    return p


def add(geometry, properties):
    features.append(dict(type='Feature', geometry=geometry, properties=properties))


def ne_features(name, kind, selectors=None, clip=regional_clip):
    for f in read(name + '.geojson')['features']:
        p = f['properties']; original = p.get('NAME', p.get('name'))
        g = shape(f['geometry'])
        selected = selectors.get(original) if selectors else None
        if not g.intersects(clip) and not selected:
            continue
        if kind == 'region' and p.get('FEATURECLA') not in ['Range/mtn', 'Desert', 'Basin', 'Plateau', 'Valley']:
            continue
        if kind == 'point' and not selected:
            continue
        # Selected physical features retain their full source geometry.
        result = g if selected else g.intersection(clip)
        if result.is_empty:
            continue
        result = result.simplify(.005 if kind != 'point' else 0, preserve_topology=True)
        k = kind
        if kind == 'region':
            k = {'Range/mtn':'mountain','Desert':'desert','Basin':'basin','Plateau':'mountain','Valley':'basin'}[p['FEATURECLA']]
        props = dict(kind=k, source=NE+name+'.geojson', source_id=p.get('NE_ID', p.get('ne_id',original)), source_name=original, license='Public domain')
        if selected:
            props['place'] = selected
        add(mapping(result),props)


region_names = {
    'TIAN SHAN':'tian-shan','KUNLUN MOUNTAINS':'kunlun','PAMIRS':'pamir',
    'TARIM BASIN':'tarim-basin','TAKLIMAKAN DESERT':'taklamakan','HINDU KUSH':'hindu-kush'
}
river_names = {'Tarim':'tarim','Yarkant':'yarkand-river','Amu  Darya':'amu-darya','Jordan':'jordan','Rhine':'rhine'}
city_names = {'Kashgar':'kashgar','Shache':'shache','Kuqa':'kuqa','Hotan':'hotan','Ürümqi':'urumqi','Xian':'changan'}
ne_features('ne_110m_land','land',clip=world_clip)
ne_features('ne_10m_geography_regions_polys','region',region_names)
ne_features('ne_10m_lakes','lake')
ne_features('ne_10m_rivers_lake_centerlines','river',river_names)
ne_features('ne_10m_populated_places','point',city_names)

place('kashgar','喀什','Kashgar','point',['喀什噶尔','喀什','疏勒'],['Kashgar','Shule'],100,
      ('使用现代喀什城市定位点。原文中的“疏勒”与“喀什噶尔”关联至此，不表示古代城址或喀什地区的行政范围。','A modern Kashgar city anchor. Shule and Kashgar are linked as used in this essay, not as an ancient-city footprint or prefectural boundary.'))
place('shache','莎车','Shache / Yarkand','point',['莎车'],['Shache','Yarkand County'],35)
place('kuqa','库车','Kuqa','point',['库车','龟兹'],['Kuqa','Qiuci'],20,
      ('“龟兹”按原文关联至现代库车定位点，不代表历史国土范围。','Qiuci is associated with modern Kuqa in the essay; the point does not depict the historical kingdom.'))
place('hotan','和田','Hotan','point',['和田','于阗'],['Hotan','Khotan'],20)
place('urumqi','乌鲁木齐','Ürümqi','point',['乌鲁木齐'],['Urumchi'],5)
place('changan','长安／西安','Chang’an / Xi’an','point',['长安'],['Chang’an'],5,
      ('现代西安城市定位点，用于原文中对长安乐舞的跨城联想，不代表唐代城墙范围。','A modern Xi’an city anchor for the essay’s reference to Chang’an music, not the Tang city footprint.'))
place('tarim','塔里木河','Tarim River','river',['塔里木河'],['Tarim River'],40)
place('yarkand-river','叶尔羌河','Yarkand River','river',['叶尔羌河'],['Yarkand River'],40)
place('tian-shan','天山','Tian Shan','mountain',['天山'],['Mount Tianshan','Tianshan'],35)
place('kunlun','昆仑山','Kunlun Mountains','mountain',['昆仑山'],['Mount Kunlun','Kunlun Mountain'],35)
place('pamir','帕米尔高原','Pamir Mountains','mountain',['帕米尔高原','帕米尔'],['Pamir'],30)
place('taklamakan','塔克拉玛干','Taklamakan Desert','desert',['塔克拉玛干大沙漠','塔克拉玛干'],['Taklimakan Desert','Takla Makan Desert','Taklimakan'],40)
place('tarim-basin','塔里木盆地','Tarim Basin','basin',['塔里木盆地'],['Tarim Basin'],10)
place('hindu-kush','兴都库什山','Hindu Kush','mountain',['兴都库什山'],['Hindu Kush'],5)
place('amu-darya','阿姆河','Amu Darya','river',['阿姆河'],['Amu Darya'],5)
place('jordan','约旦河','Jordan River','river',['约旦河'],['Jordan River'],0,
      ('显示河流几何，原文提及的整个流域尚未绘制。','River geometry is shown; the full basin referenced in the essay is not mapped.'))
place('rhine','莱茵河','Rhine','river',['莱茵河'],['Rhine Valley'],0,
      ('显示莱茵河河道，不能将其等同于整个流域或河谷范围。','The river course is shown, not a polygon of the entire basin or valley.'))

# Modern city geometries are not used to reconstruct historical streets.
for e in read('city-osm.json')['elements']:
    coords = [[p['lon'],p['lat']] for p in e.get('geometry',[]) if 'lon' in p]
    if len(coords)<2:
        continue
    tags=e.get('tags',{});water=bool(tags.get('waterway') or tags.get('natural')=='water')
    polygon=tags.get('natural')=='water' and coords[0]==coords[-1]
    geometry=dict(type='Polygon' if polygon else 'LineString',coordinates=[coords] if polygon else coords)
    add(geometry,dict(kind='city-water' if water else 'road',local=True,source=f'https://www.openstreetmap.org/{e["type"]}/{e["id"]}',source_id=f'{e["type"]}/{e["id"]}',source_name=tags.get('name'),license='ODbL 1.0'))

wd=read('wikidata.json')['entities']
specs=[
 ('dandan','丹丹乌里克','Dandan Oilik',['丹丹乌里克'],['Dandan Oilik'],'Q1159394'),
 ('miran','米兰遗址','Miran',['米兰'],['Milan'],'Q1192991'),
 ('gaochang','高昌故城','Gaochang',['高昌'],['Gaochang'],'Q877381'),
 ('jiaohe','交河故城','Jiaohe',['交河'],['Jiaohe'],'Q1330939'),
 ('k2','乔戈里峰','K2 / Chogori',['乔戈里峰'],['Chogori'],'Q43512'),
 ('muztagh','慕士塔格峰','Muztagh Ata',[],['Muztagata Mountain'],'Q630579'),
 ('lop-nur','罗布泊','Lop Nur',['罗布泊'],['Lop Nur'],'Q319412'),
 ('loulan','楼兰','Loulan',['楼兰'],['Loulan'],'Q1057551'),
]
for pid,zh,en,za,ea,q in specs:
    statements=[s for s in wd[q]['claims'].get('P625',[]) if s['rank']!='deprecated' and 'datavalue' in s['mainsnak']]
    if not statements:
        continue
    c=statements[0]['mainsnak']['datavalue']['value']
    coord=[c['longitude'],c['latitude']]
    p=place(pid,zh,en,'point',za,ea,15,('Wikidata 地理坐标记录；用于区域定位，不代表地物边界。','A Wikidata coordinate record for regional location, not a surveyed feature boundary.'))
    if pid=='lop-nur':
        p['note']=dict(zh='罗布泊区域的资料定位点，不表示现今或历史湖岸线。',en='A reference point for the Lop Nur area, not a modern or historical shoreline.')
    if pid=='muztagh':
        p['note']=dict(zh='此点为慕士塔格峰。英文原文提及山峰；中文原文写“慕士塔格冰川”，其冰川边界尚未核实，另列为未定位条目。',en='This is the mountain named in the English edition. The Chinese edition instead names glaciers; no glacier boundary is inferred from this summit.')
    add(dict(type='Point',coordinates=coord),dict(kind='point',place=pid,source='https://www.wikidata.org/wiki/'+q,source_id=q,license='CC0',coordinate_precision=c.get('precision')))

unlocated=[
 ('niya','尼雅遗址','Niya ruins',['尼雅'],['Niya'],'可用资料的坐标存在分歧，待核对遗址范围后再落点。','Available coordinate records disagree; the archaeological site must be checked before plotting.'),
 ('oytag','奥依塔克冰川','Oytag Glacier',['奥依塔克冰川'],['Oytag Glacier'],'尚未取得能够明确对应原文所指冰川的几何数据。','No source geometry has yet been matched to the glacier named in the essay.'),
 ('muztagh-glaciers','慕士塔格冰川','Muztagh glaciers',['慕士塔格冰川'],[],'原文所称冰川范围尚未核实，不用慕士塔格峰的坐标替代。','The glacier extent has not been verified; the summit is not substituted.'),
 ('khunjerab','红其拉甫口岸','Khunjerab Pass / Port',['红其拉甫口岸'],['Khunjerab Pass'],'中英文分别提及口岸与山口；已取得山口坐标，但口岸具体落点仍需区分核实。','The English edition names the pass and Chinese edition the port. Their geographic identities need to be distinguished before plotting a shared anchor.'),
 ('beacon','亚克艾日克烽火台','Yakeailike beacon tower',['亚克艾日克烽火台'],['Yakeailike beacon tower'],'尚未取得可核实的遗址坐标。','A verified coordinate for this named beacon has not yet been established.'),
 ('russian-consulate','俄国驻喀什领事馆','Russian consulate in Kashgar',['俄国驻喀什领事馆','俄国领事馆'],['Russian consulate in Kashgar','Russian consulate'],'旧址坐标尚未核实。保留本文关联，不使用宾馆或城市中心的猜测点位。','The historical site coordinate is unverified. No hotel or city-centre coordinate is substituted.'),
 ('british-consulate','英国驻喀什领事馆','British consulate in Kashgar',['英国驻喀什总领事馆','大英帝国驻喀什领事馆'],['British consulate general in Kashgar','British consulate in Kashgar'],'旧址坐标尚未核实。城市近景仅展示现代道路与水系。','The historical site coordinate is unverified. The city view shows modern streets and watercourses only.')
]
for pid,zh,en,za,ea,nz,ne in unlocated:
    place(pid,zh,en,'unlocated',za,ea,0,(nz,ne))

for p in places:
    match=[f for f in features if f['properties'].get('place')==p['id']]
    if not match:
        continue
    geometry=shape(match[0]['geometry'])
    center=geometry if geometry.geom_type=='Point' else geometry.representative_point()
    p['center']=[center.x,center.y]
    p['sources']=list(dict.fromkeys(f['properties']['source'] for f in match))
    # Feature cardinality stays faithful: river lines and area polygons are retained.

geojson=dict(type='FeatureCollection',name='Kashgar reading geography',features=features)
encoded=json.dumps(geojson,ensure_ascii=False,separators=(',',':'))
(OUT/'data/geography.geojson').write_text(encoded+'\n')
payload=dict(generated='2026-09-18',geojson=geojson,places=places)
(OUT/'geography-data.js').write_text('/* Generated from real GeoJSON. Offline mirror of data/geography.geojson. */\nwindow.KASHGAR_GEOGRAPHY = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
manifest={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in CACHE.glob('*.geojson')}
for name in ['city-osm.json','wikidata.json']:
    manifest[name]=hashlib.sha256((CACHE/name).read_bytes()).hexdigest()
(OUT/'data/source-manifest.json').write_text(json.dumps(dict(generated='2026-09-18',sha256=manifest),indent=2)+'\n')
print(f'Built {len(features)} GeoJSON features; {sum("center" in p for p in places)} located / {len(places)} place records; {len(encoded):,} bytes.')
