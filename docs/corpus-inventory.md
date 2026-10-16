# Corpus inventory

The supplied Chinese source is Yu Qiuyu's 2014 Changjiang Literature and Art Publishing House edition. The English selection is A Bittersweet Journey Through Culture, CN Times Books, 2015. The Chinese volume contains 26 essays; the English contains 20. Twenty essays and 109 sections were aligned into content/bilingual-corpus.json. Article/section alignment is reliable; paragraph/sentence alignment is not automatic because translation merges, splits and reorganizes passages.

## Aligned selection

These are the published English headings, in the aligned selection's order rather than the Chinese volume's full numbering.

| Selection order | Published English title | Sections |
|---|---|---|
| 1 | Memorial Archway | 7 |
| 2 | Temple | 5 |
| 3 | My Hometown | 5 |
| 4 | Dujiangyan Irrigation System | 4 |
| 5 | The Taoist Priest’s Tower | 5 |
| 6 | Mogai Caves | 4 |
| 7 | A Secret Spring in the Sand | Unnumbered essay |
| 8 | Snow on the Southern Pass | Unnumbered essay |
| 9 | Kashgar in the Western Regions | 5 |
| 10 | The Villa from Behind | 5 |
| 11 | Fish Tail Lodge | 6 |
| 12 | Arctic Cold Night | 9 |
| 13 | Faraway Sea | 8 |
| 14 | Peephole of Family Xie | 10 |
| 15 | Ba Jin’s Centennial | 10 |
| 16 | Last Words of Zuolin | 6 |
| 17 | Path to Shi Yige | 8 |
| 18 | Dialogue Between Heaven and Man | Unnumbered essay |
| 19 | Eulogy for my Mother | Unnumbered essay |
| 20 | Pen Memories | 8 |

## Six essays absent from the English selection

Their romanized identifiers are Feijing Lengyan, Hangzhou Xuanyan, Huangzhou Tuwei, Ningguta, Baokui Shanxi and Fengyu Tianyige. These are identifiers, not invented published English titles. The runtime contents retains original titles and marks the missing English edition explicitly.

Published and editorial titles must remain distinguishable. Mogai Caves is corrected to Mogao Caves for site display. My Hometown and Snow on the Southern Pass retain the supplied English titles despite geographic nuance in the originals. Path to Shi Yige contains a wordplay and must not be treated as an ordinary geocoded place. EPUB author metadata Quiyu, Yu is normalized to Yu Qiuyu in presentation. The supplied translation itself is not silently rewritten.

## Implemented atlas

Nine selected chapters, Chinese book numbers 03-11, are now available: My Hometown, Dujiangyan, Taoist Tower, Mogao, Secret Spring, Yangguan, Kashgar, Mountain Resort and Fish Tail Lodge. The earlier seven-node MVP proposal is historical. Collection counts nine selections, independent of original book numbering. Credits show all 26 titles and mark six missing English selections.

The interpretive arc moves from land and natural barriers to journeys and cultural memory. Geographic anchors, shapes and routes are curated separately from the corpus; place-name extraction alone is not sufficient evidence to publish coordinates. The two supplied editions remain authoritative source text. Use chapter-specific alignment adapters where paragraphs differ.
