#!/usr/bin/env python3
"""Check text preservation, semantic coverage and provenance of the reading map."""
import json
import hashlib
import re
from html.parser import HTMLParser
from pathlib import Path
from shapely.geometry import shape

root=Path(__file__).resolve().parents[1]
def bundle(file,variable):
    return json.loads(file.read_text().split(variable+' = ',1)[1].rstrip(';\n'))

chapter=bundle(root/'site/chapters/kashgar/chapter-data.js','window.KASHGAR_CHAPTER')
geography=bundle(root/'site/chapters/kashgar/geography-data.js','window.KASHGAR_GEOGRAPHY')
original=next(c for c in json.loads((root/'content/bilingual-corpus.json').read_text())['chapters'] if c['number']==9)
for lang in ['zh','en']:
    seen=[]
    assert len(chapter[lang]['sections'])==5
    for expected,actual in zip(original[lang]['sections'],chapter[lang]['sections']):
        assert expected['label']==actual['label']
        assert expected['paragraphs']==actual['paragraphs']
        assert [''.join(p['text'] for p in parts) for parts in actual['anchors']]==expected['paragraphs']
        seen.extend(p['scene'] for parts in actual['anchors'] for p in parts)
    assert set(seen)==set(range(1,17))
    assert seen==sorted(seen)
    print(lang, 'original text preserved;',sum(len(s['paragraphs']) for s in chapter[lang]['sections']),'paragraphs; 16 ordered anchors')

assert geography['geojson']==json.loads((root/'site/chapters/kashgar/data/geography.geojson').read_text())
ids={p['id'] for p in geography['places']}
for f in geography['geojson']['features']:
    assert f['type']=='Feature'
    g=shape(f['geometry'])
    assert g.is_valid and not g.is_empty
    assert -180<=g.bounds[0]<=g.bounds[2]<=180 and -90<=g.bounds[1]<=g.bounds[3]<=90
    assert f['properties'].get('source') and f['properties'].get('license')
    if f['properties'].get('place'):
        assert f['properties']['place'] in ids
for p in geography['places']:
    fs=[f for f in geography['geojson']['features'] if f['properties'].get('place')==p['id']]
    assert bool(fs)==bool(p.get('center'))
    if p['kind']=='unlocated':
        assert not fs and not p.get('center')
    if p['kind']=='river':
        assert all(f['geometry']['type'] in ['LineString','MultiLineString'] for f in fs)
    if p['kind'] in ['mountain','basin','desert']:
        assert all(f['geometry']['type'] in ['Polygon','MultiPolygon'] for f in fs)
for scene in chapter['scenes']:
    assert all(pid in ids for pid in scene['places'])
print('All geographic features valid and sourced; lines/areas retained; unresolved names have no invented coordinates.')
print('Downloadable GeoJSON equals offline bundle.')

# Verify actual shipped fallback text, not only the JavaScript data bundle.
class StaticText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.language = None
        self.paragraph = None
        self.texts = {'zh': [], 'en': []}
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'div' and attrs.get('class') == 'fallback-reading':
            self.language = attrs['lang']
        if tag == 'p' and self.language:
            self.paragraph = ''
    def handle_data(self, data):
        if self.paragraph is not None:
            self.paragraph += data
    def handle_endtag(self, tag):
        if tag == 'p' and self.paragraph is not None:
            self.texts[self.language].append(self.paragraph)
            self.paragraph = None
        if tag == 'div':
            self.language = None

markup = (root/'site/chapters/kashgar/index.html').read_text()
static = StaticText()
static.feed(markup)
for lang in ['zh', 'en']:
    assert static.texts[lang] == [p for s in original[lang]['sections'] for p in s['paragraphs']]
for asset in ['styles.css', 'chapter-data.js', 'geography-data.js', 'app.js']:
    digest = hashlib.sha256((root/'site/chapters/kashgar'/asset).read_bytes()).hexdigest()[:12]
    assert f'./{asset}?v={digest}' in markup, f'Rebuild versioned assets: {asset}'
print('Static HTML preserves both complete originals; all chapter assets have current content hashes.')
