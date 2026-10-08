#!/usr/bin/env python3
"""Preserve chapter 09 verbatim; attach 16 bilingual semantic reading anchors."""
import json
import hashlib
import html
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
c = next(x for x in json.loads((ROOT / 'content/bilingual-corpus.json').read_text())['chapters'] if x['number'] == 9)
# Zero-based section / paragraph starts. The two segments of V.5 share a paragraph.
starts = [(0,0),(1,0),(1,6),(1,9),(2,0),(2,3),(2,5),(2,9),(3,0),(3,6),(3,8),(4,0),(4,4),(4,4),(4,5),(4,6)]
focus = [
 ['tarim','yarkand-river'], ['tian-shan','kunlun','tarim-basin'], ['kashgar','pamir','taklamakan'], ['kunlun','kashgar'],
 ['kashgar'], ['kashgar','shache'], ['kashgar'], ['taklamakan','kashgar'], ['kashgar'],
 ['dandan','lop-nur','loulan','tarim'], ['taklamakan'], ['tian-shan','kunlun','taklamakan'],
 ['k2','muztagh','khunjerab','oytag'], ['shache','kuqa','changan'], ['kuqa','hotan','gaochang','jiaohe','loulan','miran','niya'], ['yarkand-river','kunlun']
]
scenes = [{'id':i+1,'section':s+1,'places':focus[i], 'view': 'city' if i==8 else 'regional'} for i,(s,p) in enumerate(starts)]
for lang in ['zh','en']:
 for s,section in enumerate(c[lang]['sections']):
  section['anchors'] = []
  for p,text in enumerate(section['paragraphs']):
   applicable = [i for i,(ss,pp) in enumerate(starts) if (ss,pp)<=(s,p)]
   scene = max(applicable)+1
   if s==4 and p==4:
    split = text.index('我和妻子则') if lang=='zh' else text.index('I and my wife')
    section['anchors'].append([{'scene':13,'text':text[:split]}, {'scene':14,'text':text[split:]}])
   else:
    section['anchors'].append([{'scene':scene,'text':text}])
  assert [''.join(a['text'] for a in row) for row in section['anchors']]==section['paragraphs']
payload = {'number':9,'zh':c['zh'],'en':c['en'],'scenes':scenes}
out=ROOT/'site/chapters/kashgar/chapter-data.js'
out.write_text('/* Generated from supplied EPUBs. No editorial section titles. */\nwindow.KASHGAR_CHAPTER = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
print('Built',out)

# Ship the original text in HTML too: maps and JavaScript enhance reading,
# but are never prerequisites for seeing the essay.
page = out.with_name('index.html')
# Short section titles shown with the numbers (editorial; the original text itself stays verbatim). Keep in step
# with sectionTitles in app.js.
TITLES = {
    'zh': ['汤因比的来世', '文明交汇', '中心的中心', '两座领事馆', '白色旗幡'],
    'en': ['Toynbee’s next life', 'Where civilizations met', 'The centre of the centre', 'Two consulates', 'The white banner'],
}
markup = page.read_text(encoding='utf-8')
blocks = []
for lang in ['zh', 'en']:
    sections = []
    for i, section in enumerate(payload[lang]['sections']):
        # verbatim (tools/verify_kashgar.py checks it); app.js shows the English capitalised openings in sentence case
        paragraphs = ''.join('<p>' + html.escape(text) + '</p>' for text in section['paragraphs'])
        title = TITLES[lang][i]
        sections.append(f'<section class="reading-section"><h2 class="section-heading">{html.escape(section["label"])} · {html.escape(title)}</h2>{paragraphs}</section>')
    blocks.append(f'<div class="fallback-reading" lang="{lang}">' + ''.join(sections) + '</div>')
static_reading = '\n<!-- BEGIN GENERATED ORIGINAL TEXT -->\n' + '\n'.join(blocks) + '\n<!-- END GENERATED ORIGINAL TEXT -->\n</div>'
# the container keeps whatever attributes the page gives it (e.g. class="reading-copy")
markup, count = re.subn(r'(<div id="reading"[^>]*>)(?:\s*<!-- BEGIN GENERATED ORIGINAL TEXT -->.*?<!-- END GENERATED ORIGINAL TEXT -->\s*)?</div>', lambda m: m[1] + static_reading, markup, flags=re.S)
assert count == 1, 'Expected exactly one generated reading container'
# Content hashes invalidate old cached assets after a page update, including file:// use.
for asset in ['styles.css', 'layout.css', 'chapter-data.js', 'geography-data.js', 'app.js']:
    digest = hashlib.sha256(out.with_name(asset).read_bytes()).hexdigest()[:12]
    markup = re.sub(r'((?:src|href)="\./' + re.escape(asset) + r')(?:\?v=[^"\s]*)?"', lambda m: m[1] + '?v=' + digest + '"', markup)
page.write_text(markup, encoding='utf-8')
print('Built static bilingual text and versioned chapter assets:', page)
