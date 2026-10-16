# My Hometown

Chapter 03 combines the introduction with five original bilingual reading sections. Its atlas anchor between the Yellow and Yangtze Rivers is literary, not a claimed birthplace coordinate.

An empty atlas trace redirects here with ?tour=1, regardless of an older intro-seen flag. Starting reading writes a started trace; completion collects the pictorial seal. ?open=1&section=N opens a reading preview. The replay-tour control reopens the introduction.

The current opening asks where knowledge begins, presents two editions, opens the selected book, introduces three great lines, then follows the Yellow River, cultural roots and Yangtze. This supersedes the earlier five-task map tutorial. See [storyboard](OPENING-STORYBOARD.md).

The first reading scene is a rotating globe; the second faces Asia and illustrates ocean/land, Eurasia, China and natural enclosure. Later maps emphasize natural geography, the Yellow River, Yangtze and approximately 400 mm rainfall boundary. The ending includes nomadic, agrarian and maritime civilizations. See [globe](GLOBE.md).

Natural Earth supplies coastlines/rivers; OSM supplies the Great Wall and WorldClim the rainfall boundary. Washes indicate approximate locations. Prose remains separate from geographic interpretation. Mobile readers must rotate to landscape; map and text then sit side by side.

## Existing maintenance commands

Prepare the inputs and dependencies described by each tool before running.

```bash
python3 tools/build_my_hometown_chapter.py content/bilingual-corpus.json site/chapters/my-hometown/chapter-data.js
```
