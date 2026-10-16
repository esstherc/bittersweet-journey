# Chapter Page Consistency Audit

Historical audit of the original four-chapter implementation. Its issue lists and translated sample labels are preserved for context, not asserted as current defects. All nine chapters now use the current shared conventions: pictorial seals, single-subtitle curtains, footer notes, no redundant distance/counter/location annotations, and required mobile landscape with parallel map/text. Current verification is documented in mobile-landscape.md and the regression tools.

**Date:** 2026-09-19
**Scope:** the four chapter pages under `site/chapters/` — Dujiangyan `dujiangyan` (Ch. 04), A Secret Spring in the Sand `secret-spring` (Ch. 07), The Taoist Priest's Tower `taoist-tower` (Ch. 05), The Villa from Behind `mountain-resort` (Ch. 10) — compared against each other, and where relevant against the homepage (`site/index.html`, `site/scripts/atlas.js`).
**Method:** static comparison of each chapter's `index.html`, `app.js`, `styles.css` and `chapter-data.js`. I evaluated the chapter-data schema by executing each `chapter-data.js` in a sandbox. Line numbers are omitted on purpose (files are still changing); findings cite selectors and keys so they can be searched.
**Not covered:** pixel-level rendering at mobile widths, translation quality, and a diff against `content/chapter-alignment.json`. The opening curtains were checked visually earlier in this session; nothing else in this report was re-rendered.

---

## 1. Summary

`dujiangyan`, `secret-spring` and `taoist-tower` share one template and differ mostly in chapter-specific extras. **`mountain-resort` is the outlier** — it is structurally, typographically and behaviorally a different page. Within the three "template" chapters, the main drift is in small behaviors (keyboard, panels, hard-coded English) and in the seal/stamp glyphs.

### Priority findings

| # | Priority | Finding | Where |
|---|----------|---------|-------|
| 1 | High | `mountain-resort` has **no "back to atlas" link** except the wordmark, and a differently built language switch | header markup |
| 2 | High | `mountain-resort` loads **no Caudex/Ysabeau fonts** and has only 4 English-mode CSS rules (others: 13–17), so English typography differs from every other page | `<head>`, `styles.css` |
| 3 | High | `dujiangyan` `.map-note` button ("Schematic map / Not a surveyed scale") **does nothing** when clicked; the sound toggle is a placeholder | `dujiangyan/app.js` |
| 4 | High | `dujiangyan` footnote advertises "↑ ↓ Read" but there is **no arrow-key handler** (other chapters step sections with arrows) | `dujiangyan/app.js` |
| 5 | High | The same story has **three identifiers**: folder/storage key `mountain-resort`, story id and `?revealed=` value `chengde` | `atlas.js`, `mountain-resort/app.js` |
| 6 | Medium | **Seal glyphs don't line up** across homepage stamp, reader footer seal and completion overlay (e.g. taoist-tower: stamp emptiness / footer seal collection) | see §4.3 |
| 7 | Medium | `mountain-resort`'s completion overlay lacks `role="status"` / `aria-live` (the other three have them) | `mountain-resort/index.html` |
| 8 | Medium | Hard-coded English shown in Chinese mode: curtain kicker "Chapter NN · Land", section-button `aria-label`s, dujiangyan footnote hint | multiple |
| 9 | Medium | `taoist-tower` thesis begins with the same phrase as its new teaser ("A cave door opens") | curtain |
| 10 | Medium | Homepage receipt text and chapter `complete-line` differ for 3 of 4 chapters | §5 |
| 11 | Low | Class-name, token, breakpoint and i18n-key naming drift (details in §3 and §6) | multiple |

---

## 2. Comparison matrix

`—` = not present. Cells in **bold** are the ones that break the pattern of the other columns.

### 2.1 Page shell and header

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| Google Fonts (Caudex, Ysabeau) | yes | yes | yes | **no** (uses `Arial` in 17 places) |
| Paper texture element | `.paper-noise` | `.paper-noise` | `.paper-noise` | **`.paper-grain`** |
| `<body>` extra attribute | — | — | `data-reading-level` | `data-reading-level` |
| `<main>` class | `experience` | `experience` | `experience` | **`chapter-layout`** |
| Chapter meta | `.chapter-index` + `.chapter-name` | same | same | **plain unclassed `<span>`s** |
| Back-to-atlas link | `.back-atlas` (+ wordmark) | `.back-atlas` (+ wordmark) | `.back-atlas` (+ wordmark) | **wordmark only** |
| Language switch element | `<div role="group">` | `<div role="group">` | `<div role="group">` | **`<nav>`** |
| Language switch labels | Chinese ／ EN | Chinese ／ EN | Chinese ／ EN | **Chinese / EN** |
| Extra header control | **sound toggle** (placeholder) | — | — | — |
| `<meta description>` | says "…Reading map**Prototype**" | no "prototype" | no "prototype" | no "prototype" |

### 2.2 Opening screen

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| Container | `.opening-curtain` | `.opening-curtain` (+ `.curtain-sand`) | `.opening-curtain` (+ `.curtain-door`) | **`.opening-gate`** (two panels + `.gate-title`) |
| Kicker | "Chapter 04 · Land" — hard-coded English | "Chapter 07 · Land" — hard-coded English | "Chapter 05 · Land" — hard-coded English | **"Chengde · Twilight" / "Chengde · Twilight"** via `data-copy` (place/time, no chapter number) |
| Teaser element | `p.curtain-teaser` | `p.curtain-teaser` | `p.curtain-teaser` | **`span.gate-teaser`** |
| Title markup | both languages in DOM, toggled by CSS (`.curtain-title-cn/-en`, vertical writing) | same pattern | same pattern (single line) | **one `<strong data-copy>`** |
| Sub-line under title | `.curtain-thesis` | `.curtain-thesis` | `.curtain-thesis` | `<small data-copy="opening-line">` (a different key from `thesis`) |
| Open button | `.open-book` + arrow SVG | same | same | **`.gate-open`, text only** (plus a second `.open-book` "↓" inside the reader) |

### 2.3 Reader area

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| Reader container | `<article.reader-panel aria-label>` | same | same | **`<aside.reader-panel>`, no aria-label** |
| Reader intro block | — | `.reader-note` | `.reader-note` | **`.reader-intro`** (kicker + thesis + button) |
| Section navigation | `nav.section-rail`, no caption | `nav.section-rail` + caption | `nav.section-rail` + caption | **`nav.reading-rail`**, placed outside `<main>` |
| Number of sections | 4 | 4 (called *waypoints*) | 5 | 5 |
| Reader-footer seal | `<img seal-water.svg>` (water) | `<span.spring-seal>` spring | `<span.archive-seal>` **collection** | **none** |
| Finish button | text + arrow SVG | same | same | **text only**, and the block also repeats `complete-line` and `source` |
| Map "data / note" affordance | `.map-note` — **no handler, no panel** | `.map-data-button` + panel | **`.map-note-button`** + `.map-note-panel` | `.map-data-button` + panel |
| Footnote bar | source + "↑ ↓ Read / L Language" (English) | source + `source-map` | source + `source-map` | **none** (citation sits in `.reader-finish`) |

### 2.4 Completion overlay

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| ARIA | `role="status" aria-live` | same | same | **none** |
| Visual | `.complete-ripple` (no glyph) | `.complete-crescent` (no glyph) | `.complete-mark` **emptiness** | `<span>` **shadow** |
| `complete-kicker` (zh) | A landscape has been revealed | A landscape has been revealed | **A dispersal path has been revealed** | A landscape has been revealed |
| Redirect delay | 3000 ms | 3000 ms | 3000 ms | **2800 ms** |

---

## 3. Behavior (JS)

| Behavior | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| `L` toggles language | yes | yes | yes | yes |
| Arrow keys move between sections | **no** | yes | yes | yes |
| `Esc` closes side panel | n/a (no panel) | yes | yes | yes |
| Preview URL params | **none** | `open`, `section`, `data` | `open`, `section`, **`note`** | `open`, `section`, `data` |
| `openBook()` re-entry guard | no | no | no | **yes** |
| Focus moves to reader after open | 700 ms | 650 ms | 650 ms | **never** |
| Section-button `aria-label` | `Section n` (English only) | `Waypoint n` (English only) | `Section n` (English only) | **localized** |
| `document.body` style | inline `document.body` | `const body` | `const body` | `const body` |

Details worth calling out:

- **Dead button (dujiangyan).** `.map-note` looks interactive (it is a `<button>` with `aria-label="Map notes"`) but has no listener and no panel. Its label is also always bilingual ("Schematic map" + "Not a surveyed scale") regardless of language mode. The sound toggle only flips `aria-pressed`; its tooltip literally reads "Water sounds（Prototype placeholder）" (prototype placeholder).
- **Advertised shortcut that doesn't exist (dujiangyan).** The footnote says "↑ ↓ Read / L Language". Only `L` is implemented. The reader panel is focused after opening, so arrow keys scroll natively, but they do not step sections like the other three chapters.
- **Unused URL parameter.** Every chapter link from the homepage carries `?from=atlas`, but no chapter script ever reads it.
- **Same panel, different flag.** The "open the map data panel" preview flag is `data=1` in secret-spring/mountain-resort but `note=1` in taoist-tower.
- **Consistent (good):** `?lang=` handling, `localStorage` language persistence, and the `pageshow` reset of `is-completing` are now identical in all four.

---

## 4. Content and i18n

### 4.1 Hard-coded English in Chinese mode
- Curtain kicker "Chapter 04 · Land" (three chapters) is not localized, unlike `map-eyebrow` ("Book I · Land" / "Book I · Land"). The homepage uses "Chapter 04 **/** Land" (slash) while the curtains use "**·**".
- Section-button `aria-label`s (`Section n`, `Waypoint n`) — see §3.
- dujiangyan footnote hint and `.map-note` label — see §3.

### 4.2 Section and thesis wording
| | zh section label | en section label | thesis (zh) |
|---|---|---|---|
| dujiangyan | Section I … | Section I … | The map does not exist，until it is read。 |
| secret-spring | Waypoint I · Footprints … | Waypoint **1** · Footprints … | First come the footprints，then comes the spring。 |
| taoist-tower | File I · Stupa … | File I · The stupa … | A cave door opens，manuscripts are taken from Dunhuang，and dispersed into imperial collections。 |
| mountain-resort | I · Outside … | I · Outside … | The garden does not move。The age looking at it does。 |

- dujiangyan's thesis is a **site-level tagline** (close to the homepage thesis), while the other three are chapter-specific lines.
- English numerals mix Roman (Section I, File I, I · Outside) with Arabic (Waypoint 1).
- taoist-tower: the teaser "A cave door opens" and the thesis that starts "A cave door opens，manuscripts are taken from Dunhuang…" now appear two lines apart on the same screen.

### 4.3 Seal / stamp glyphs
The homepage stamp collection uses water / spring / emptiness / shadow. The chapters use glyphs in three places, and they don't agree:

| | Homepage stamp | Reader-footer seal | Completion overlay |
|---|---|---|---|
| dujiangyan | water | water (image `seal-water.svg`) | ripple, **no glyph** |
| secret-spring | spring | spring | crescent, **no glyph** |
| taoist-tower | emptiness | **collection** | emptiness |
| mountain-resort | shadow | **none** | shadow |

So water and spring never appear as characters at the moment of collection, and taoist-tower's footer seal (collection) is a different character from the one the reader ends up collecting (emptiness).

### 4.4 Chapter vs homepage wording
| | Homepage receipt (`STORIES.receipt`) | Chapter `complete-line` |
|---|---|---|
| dujiangyan | The waters of the Min River，become the Chengdu Plain here。 | The waters of the Min River，return to China。 |
| secret-spring | Behind Echoing Sand Hill，a crescent spring remains on the map。 | The desert remembers a crescent spring。 |
| taoist-tower | The caves remain in Dunhuang，the words travel the world。 | The caves remain in Dunhuang，the words travel the world。 *(identical)* |
| mountain-resort | After a dynasty exits，the landscape remains。 | After a dynasty departs，the landscape remains。 |

This may be deliberate (two beats: chapter ending, then map receipt), but only taoist-tower is identical. Also `complete-kicker` differs for taoist-tower only ("A dispersal path has been revealed" in the chapter vs "A landscape has been revealed" on the homepage receipt).

English titles drift too: dujiangyan is "Dujiangyan Irrigation System" in `chapter-data.js` but "Dujiangyan" on the homepage; secret-spring is "A Secret Spring in the Sand" in the chapter and the preview card, but the homepage map's completed label says "The Secret Spring".

### 4.5 i18n dictionary structure
- Every chapter has full zh/en key parity (no missing keys) — good.
- Key style: kebab-case everywhere except `cameraMode`/`cameraTech` (secret-spring) and `sectionSubtitle`/`stateName` (taoist-tower).
- Section-label arrays are named differently per chapter (`section`, `waypoint`, `file`).
- taoist-tower has no `chapter-subtitle` key: its subtitle is written by JS per section, and the static HTML text has no `data-copy`.
- mountain-resort has no `back-atlas` key (it has no back link).

---

## 5. Data (`chapter-data.js`, geography)

- Schema is identical across chapters: `{ number, zh: { title, intro, sections[{label, paragraphs}] }, en: {…} }`. `intro` is an empty array in all four (unused field).
- Section labels are defined twice: in `chapter-data.js` (`I/II/III/IV`, `I/II/…`, or `Footprints/Ridge/…`) and again in each `ui` dictionary. In dujiangyan the renderer reads the `ui` array, so the data-file labels appear to be dead there (not verified for the other three).
- Paragraph counts differ between zh and en in several sections (dujiangyan §3: 18 vs 16; secret-spring §1: 15 vs 14 and §4: 9 vs 8; taoist-tower §3: 20 vs 17, §4: 26 vs 28, §5: 19 vs 18; mountain-resort §5: 14 vs 13). Switching language mid-read is synced by section index, so this is low risk, but it is worth cross-checking against `content/chapter-alignment.json`.
- Geography sources: only dujiangyan loads the shared `data/real-geography.js` (the homepage uses it too). secret-spring, taoist-tower and mountain-resort each ship their own `geography-data.js` (taoist-tower's is ~731 KB in a 2-line file). I did not verify that shared places (e.g. Dunhuang) have identical coordinates across these datasets.
- Script load order differs per page (e.g. `chapter-data.js` before vs after `geography-data.js`); harmless but inconsistent.

---

## 6. Visual system (CSS)

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| Accent red token / value | `--seal` `#9d3d31` | `--seal` `#9c4333` | `--seal` `#9f3f31` | **`--cinnabar`** `#93493d` (+ `--cinnabar-dark`) |
| `--paper` | `#ece7db` | `#eee7d8` | `#eee6d6` | **`#ded8ca`** (noticeably darker) |
| Font tokens | `--serif-cn/-en`, `--sans` | same | same | **none** |
| Masthead | 76px, z-index 20, pad 38px | 76px, z 40, pad 38px | 76px, z 50, pad 38px | `--header-h` 76px, z 40, pad **34px** |
| Breakpoints | 900 / 540 | 1040 / 820 / 520 | 1080 / 820 / 540 | 980 / 580 |
| `:focus-visible` styles | none | none (one `:focus` rule) | none | none |
| `prefers-reduced-motion` | yes | yes | yes | yes |
| `body[data-language="en"]` rules | 13 | 16 | 17 | **4** |

- The three "template" chapters carry three slightly different reds and papers; the homepage uses dujiangyan's values (`#9d3d31`, `#ece7db`). This looks like drift rather than intent.
- mountain-resort's darker paper and Arial/Noto Serif mix is the most visible difference when moving between chapters.
- No chapter has `:focus-visible` styling, so keyboard focus relies on browser defaults (the homepage has some, added recently).
- Asset cache versions are currently `?v=20260917-1` (CSS) / `-2` (JS) everywhere; `terrain-3d.js` is still `20260724-3` (untouched, fine).

---

## 7. What is already consistent

- Header layout, wordmark, `N / 20` chapter index and 76px masthead height (in three chapters; mountain-resort differs only in markup).
- "Complete chapter · Return to atlas" / "Complete chapter · Return to atlas" wording, and the source citation "Text：Yu Qiuyu《A Bittersweet Journey Through Culture》".
- `[data-copy]` + `ui.zh/ui.en` mechanism, with full key parity.
- Opening order: kicker → teaser → title → thesis → button (verified in code and screenshots).
- Language persistence via `?lang=` + `localStorage`, `pageshow` reset of transient classes, and the `is-completing` guard.
- Chapter numbering matches the homepage (04 / 05 / 07 / 10).

---

## 8. Suggested order of work

1. **Decide the template.** Treat `dujiangyan` / `secret-spring` / `taoist-tower` as canonical and bring `mountain-resort` toward it, or explicitly document it as an intentional exception.
2. **Quick correctness fixes:** wire or remove dujiangyan's `.map-note` and sound toggle; add arrow-key stepping (or drop the "↑ ↓ Read" hint); add `role="status" aria-live` to mountain-resort's completion overlay; add a back-to-atlas link to mountain-resort.
3. **Unify identifiers:** rename the story id `chengde` ↔ `mountain-resort` (or document the mapping); remove or use `?from=atlas`.
4. **Resolve seal glyphs:** pick one character per chapter and use it on the stamp, reader-footer seal and completion overlay.
5. **Localize the leftovers:** curtain kicker, section-button `aria-label`s, dujiangyan footnote hint.
6. **Content pass:** decide how chapter `complete-line`/`complete-kicker` should relate to the homepage receipt; reword the taoist-tower thesis or teaser; align English titles.
7. **Design-token pass:** move shared tokens (`--seal`, `--paper`, font stacks) and shared behaviors (language, `pageshow`, completion, keyboard) into one shared CSS/JS file so drift can't recur.
