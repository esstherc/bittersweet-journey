# Chapter Page Consistency Audit

**Date:** 2026-09-19
**Scope:** the four chapter pages under `site/chapters/` — 都江堰 `dujiangyan` (Ch. 04), 沙原隐泉 `secret-spring` (Ch. 07), 道士塔 `taoist-tower` (Ch. 05), 山庄背影 `mountain-resort` (Ch. 10) — compared against each other, and where relevant against the homepage (`site/index.html`, `site/scripts/atlas.js`).
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
| 3 | High | `dujiangyan` `.map-note` button ("Schematic map / 非测绘比例") **does nothing** when clicked; the sound toggle is a placeholder | `dujiangyan/app.js` |
| 4 | High | `dujiangyan` footnote advertises "↑ ↓ Read" but there is **no arrow-key handler** (other chapters step sections with arrows) | `dujiangyan/app.js` |
| 5 | High | The same story has **three identifiers**: folder/storage key `mountain-resort`, story id and `?revealed=` value `chengde` | `atlas.js`, `mountain-resort/app.js` |
| 6 | Medium | **Seal glyphs don't line up** across homepage stamp, reader footer seal and completion overlay (e.g. taoist-tower: stamp 空 / footer seal 藏) | see §4.3 |
| 7 | Medium | `mountain-resort`'s completion overlay lacks `role="status"` / `aria-live` (the other three have them) | `mountain-resort/index.html` |
| 8 | Medium | Hard-coded English shown in Chinese mode: curtain kicker "Chapter NN · Land", section-button `aria-label`s, dujiangyan footnote hint | multiple |
| 9 | Medium | `taoist-tower` thesis begins with the same phrase as its new teaser ("一扇洞门打开") | curtain |
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
| Language switch labels | 中文 ／ EN | 中文 ／ EN | 中文 ／ EN | **中 / EN** |
| Extra header control | **sound toggle** (placeholder) | — | — | — |
| `<meta description>` | says "…阅读地图**原型**" | no "prototype" | no "prototype" | no "prototype" |

### 2.2 Opening screen

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| Container | `.opening-curtain` | `.opening-curtain` (+ `.curtain-sand`) | `.opening-curtain` (+ `.curtain-door`) | **`.opening-gate`** (two panels + `.gate-title`) |
| Kicker | "Chapter 04 · Land" — hard-coded English | "Chapter 07 · Land" — hard-coded English | "Chapter 05 · Land" — hard-coded English | **"承德 · 薄暮" / "Chengde · Twilight"** via `data-copy` (place/time, no chapter number) |
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
| Reader-footer seal | `<img seal-water.svg>` (水) | `<span.spring-seal>` 泉 | `<span.archive-seal>` **藏** | **none** |
| Finish button | text + arrow SVG | same | same | **text only**, and the block also repeats `complete-line` and `source` |
| Map "data / note" affordance | `.map-note` — **no handler, no panel** | `.map-data-button` + panel | **`.map-note-button`** + `.map-note-panel` | `.map-data-button` + panel |
| Footnote bar | source + "↑ ↓ Read / L Language" (English) | source + `source-map` | source + `source-map` | **none** (citation sits in `.reader-finish`) |

### 2.4 Completion overlay

| | dujiangyan | secret-spring | taoist-tower | mountain-resort |
|---|---|---|---|---|
| ARIA | `role="status" aria-live` | same | same | **none** |
| Visual | `.complete-ripple` (no glyph) | `.complete-crescent` (no glyph) | `.complete-mark` **空** | `<span>` **影** |
| `complete-kicker` (zh) | 一处山河已经显影 | 一处山河已经显影 | **一条流散路径已经显影** | 一处山河已经显影 |
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

- **Dead button (dujiangyan).** `.map-note` looks interactive (it is a `<button>` with `aria-label="地图说明"`) but has no listener and no panel. Its label is also always bilingual ("Schematic map" + "非测绘比例") regardless of language mode. The sound toggle only flips `aria-pressed`; its tooltip literally reads "水声（原型占位）" (prototype placeholder).
- **Advertised shortcut that doesn't exist (dujiangyan).** The footnote says "↑ ↓ Read / L Language". Only `L` is implemented. The reader panel is focused after opening, so arrow keys scroll natively, but they do not step sections like the other three chapters.
- **Unused URL parameter.** Every chapter link from the homepage carries `?from=atlas`, but no chapter script ever reads it.
- **Same panel, different flag.** The "open the map data panel" preview flag is `data=1` in secret-spring/mountain-resort but `note=1` in taoist-tower.
- **Consistent (good):** `?lang=` handling, `localStorage` language persistence, and the `pageshow` reset of `is-completing` are now identical in all four.

---

## 4. Content and i18n

### 4.1 Hard-coded English in Chinese mode
- Curtain kicker "Chapter 04 · Land" (three chapters) is not localized, unlike `map-eyebrow` ("第一卷 · 山河" / "Book I · Land"). The homepage uses "Chapter 04 **/** Land" (slash) while the curtains use "**·**".
- Section-button `aria-label`s (`Section n`, `Waypoint n`) — see §3.
- dujiangyan footnote hint and `.map-note` label — see §3.

### 4.2 Section and thesis wording
| | zh section label | en section label | thesis (zh) |
|---|---|---|---|
| dujiangyan | 第一节 … | Section I … | 地图并不存在，直到它被阅读。 |
| secret-spring | 路标一 · 脚印 … | Waypoint **1** · Footprints … | 先有脚印，然后才有泉。 |
| taoist-tower | 档案一 · 塔 … | File I · The stupa … | 一扇洞门打开，经卷被带离敦煌，散入帝国收藏。 |
| mountain-resort | 一 · 门外 … | I · Outside … | 园林没有移动。移动的是看它的时代。 |

- dujiangyan's thesis is a **site-level tagline** (close to the homepage thesis), while the other three are chapter-specific lines.
- English numerals mix Roman (Section I, File I, I · Outside) with Arabic (Waypoint 1).
- taoist-tower: the teaser "一扇洞门打开" and the thesis that starts "一扇洞门打开，经卷被带离敦煌…" now appear two lines apart on the same screen.

### 4.3 Seal / stamp glyphs
The homepage stamp collection uses 水 / 泉 / 空 / 影. The chapters use glyphs in three places, and they don't agree:

| | Homepage stamp | Reader-footer seal | Completion overlay |
|---|---|---|---|
| dujiangyan | 水 | 水 (image `seal-water.svg`) | ripple, **no glyph** |
| secret-spring | 泉 | 泉 | crescent, **no glyph** |
| taoist-tower | 空 | **藏** | 空 |
| mountain-resort | 影 | **none** | 影 |

So 水 and 泉 never appear as characters at the moment of collection, and taoist-tower's footer seal (藏) is a different character from the one the reader ends up collecting (空).

### 4.4 Chapter vs homepage wording
| | Homepage receipt (`STORIES.receipt`) | Chapter `complete-line` |
|---|---|---|
| dujiangyan | 岷江的水，在这里成为成都平原。 | 岷江的水，正在回到中国。 |
| secret-spring | 鸣沙山后，一弯清泉留在了地图上。 | 荒漠记住了一弯清泉。 |
| taoist-tower | 洞窟留在敦煌，文字走向世界。 | 洞窟留在敦煌，文字走向世界。 *(identical)* |
| mountain-resort | 王朝退场后，山水仍坐在原处。 | 一个王朝离开后，山水仍坐在原处。 |

This may be deliberate (two beats: chapter ending, then map receipt), but only taoist-tower is identical. Also `complete-kicker` differs for taoist-tower only ("一条流散路径已经显影" in the chapter vs "一处山河已经显影" on the homepage receipt).

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
- Section labels are defined twice: in `chapter-data.js` (`一/二/三/四`, `I/II/…`, or `脚印/山脊/…`) and again in each `ui` dictionary. In dujiangyan the renderer reads the `ui` array, so the data-file labels appear to be dead there (not verified for the other three).
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
- "完成本章 · 返回总图" / "Complete chapter · Return to atlas" wording, and the source citation "文本：余秋雨《文化苦旅》".
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
