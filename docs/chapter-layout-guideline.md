# Chapter Layout Guideline

**Status:** v0.5 — **all four chapters (都江堰, 山庄背影, 沙原隐泉, 道士塔) are migrated** onto the shared shell (§7). Open follow-ups: registry / identifier rename and the homepage title bar (§7).
**Date:** 2026-09-19
**Builds on:** [chapter-consistency-audit.md](chapter-consistency-audit.md) (what differs today) and your layout brief (what it should become).

---

## 0. Purpose and how to use this document

This guideline fixes **where things go and how they look and behave** on every chapter page. Content stays free: the map, the images, the reading text, the teaser wording and the decorative layers differ per chapter. The *frame* does not.

Two uses:

| You want to… | Read |
|---|---|
| **Check an existing chapter** | §5 (gaps per chapter) → §8 (checklist) |
| **Create a new chapter** | §3 (anatomy) → §4 (rules) → §6 (contract) → §8 (checklist) |

Conventions:

- **MUST / SHOULD / MAY** carry their usual meaning. Anything not marked is a MUST.
- Every rule has an ID (`F-1`, `T-2`, …) so checks and commits can refer to it.
- "Free zone" = the chapter author decides. "Fixed zone" = this guideline decides.
- Numbers are **starting values** taken from the median of the current chapters. Change them in one place (§4.1 tokens), not per chapter.

---

## 1. Your brief → rules (traceability)

| Your requirement | Rule(s) |
|---|---|
| Consistent font and layout | §4.1, §4.8, §4.10 |
| Title bar **left**: title, only Chinese *or* English | T-2 |
| Title bar **middle**: chapter number and title | T-3 |
| Title bar **right**: language switch | T-4, T-5 |
| Curtain covers the whole width and locks the scrolling context panel | C-1, C-2 |
| Left panel: map and images | M-1 |
| Left panel top: remove chapter information | M-2 |
| Left panel bottom: year (progress bar) | M-4 |
| Right panel: context | R-1 … R-6 |
| Right panel bottom: reading sections (progress bar) | R-7 |
| Seal glyphs line up | S-1 … S-5 |
| Bottom bar left: credentials + button to expand map notes and data sources | B-2, B-4 |
| Bottom bar right: button back to Atlas | B-3 |
| Details that need fixing | §5.3 |
| Context and map may differ a lot, layout stays consistent | §0 (fixed vs free zones), §3 |

---

## 2. Interpretations and decisions to confirm

I had to interpret a few points. Each has a **default** that the rest of the document already assumes. Tell me which to change and I will update the rules before touching any chapter.

| # | Question | Default used in this draft |
|---|---|---|
| D1 | "Title bar left – title" means the **site title** (山河显影 / Land, Made Visible), shown in the current language only? (The chapter title is in the middle.) | Yes |
| D2 | "Curtain covers the whole width" — do the title bar and bottom bar stay visible above/below it? | Yes: covers everything **between** the two bars; the language switch and "Back to Atlas" stay usable |
| D3 | The docked bottom rails and the scroll lock need a fixed-height frame. OK to stop scrolling the **window** and scroll only inside the context panel? | Yes (impacts every chapter's scroll/section-detection JS — see §7) |
| D4 | Column split. Today the map is 58–69 % wide; the context column is narrow (~14 Chinese characters per line on 都江堰). | **60 / 40** (`3fr / 2fr`, context min 400 px) |
| D5 | Every chapter gets a "year" progress bar. Only 山庄背影 has years today. For chapters without dates, what does a tick show? | **Resolved: the timeline is optional.** Use it only when the chapter has a real chronology (山庄背影, probably 道士塔). 都江堰 is organised by place, so it has no timeline; the map panel simply has no docked row (§5.4) |
| D6 | Seal glyph source of truth | The homepage stamps: **水 / 泉 / 空 / 影**. Change 道士塔's reader-footer seal 藏 → 空; add a glyph seal to 都江堰 and 沙原隐泉 completion screens and to 山庄背影's reader footer |
| D7 | Section labels currently mix 第一节 / 路标一 / 档案一 / 一 · 门外 | One pattern: **ordinal + short title** (`一 · 门外` / `I · Outside`). The thematic noun (路标, 档案, 原文章节) moves to the rail caption |
| D8 | 都江堰 sound toggle (placeholder, no audio) | **Remove** until real audio exists |
| D9 | "Credentials" = the text credit (文本：余秋雨《文化苦旅》) | Yes |
| D10 | Keep the reader's "完成本章 · 返回总图" button *and* the bar's "总地图" button? | Yes: the bar button leaves **without** recording completion; the finish button records completion, plays the completion screen, then returns |
| D11 | Chapter pages retire the eyebrow "第一卷 · 山河" and the subtitle ("水，被读出来的形状") along with the heading block | Retire both; the volume moves into the curtain kicker; subtitles may be reused as curtain thesis or in the notes drawer if you want to keep the wording |
| D12 | Homepage title bar is 72 px, chapters are 76 px | Standardize on **76 px**; homepage follow-up (not blocking) |

---

## 3. Anatomy

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 山河显影            │   04 / 20 │ 都江堰    │            中文 ／ EN        │  TITLE BAR   76px
│ (site title,        │ (number + chapter     │        (language switch)     │  fixed
│  current lang)      │  title, cur. lang)    │                              │
├─────────────────────────────────────────────┬────────────────────────────┤
│                                             │ 一 · 岷江             01 / 04│
│  MAP PANEL  (60 %)                          │ 岷江 · 都江堰              │
│                                             │ ──────────────────────────│
│  free canvas: map, images, insets           │                            │
│  no chapter heading, no buttons on top      │  CONTEXT PANEL (40 %)      │
│                                             │  scroll area               │
│                                             │  reading text              │
│                                             │  …                         │
│                                             │  end block: [seal] [finish]│
│                                             │                            │
│ ▸ TIMELINE (year)  ●──────○──────○──────○   │ ▸ READING SECTIONS 01 02 03│  docked rows 56px
├─────────────────────────────────────────────┴────────────────────────────┤
│ 文本：余秋雨《文化苦旅》  [ⓘ 地图说明与数据来源]                [← 总地图]│  BOTTOM BAR  38px
└──────────────────────────────────────────────────────────────────────────┘
   CURTAIN (before "open"): covers the whole area between the two bars
```

| Region | Fixed zone (this guideline) | Free zone (author) |
|---|---|---|
| Title bar | Everything | — |
| Curtain | Position, lock, order of elements, animation, typography | Teaser/thesis/verb wording, decorative layer inside it |
| Map panel | Empty top, docked timeline, safe areas | The map/images themselves and their on-canvas labels |
| Context panel | Section header, body typography, docked rail, end block | Text, notes, section titles |
| Bottom bar | Everything | Wording inside the notes drawer sections |
| Completion screen | Seal glyph + timing + ARIA | Flourish animation around the seal |

---

## 4. Rules

### 4.1 Frame (F) and tokens

- **F-1** The page is a fixed app frame: `height: 100dvh`, the **window never scrolls**. Title bar fixed at top, bottom bar fixed at bottom, `main` fills the space between.
- **F-2** `main` is a two-column grid: `grid-template-columns: minmax(0, 3fr) minmax(400px, 2fr)`, one 1 px `--line` divider between panels. Both panels have exactly the same height. **No `min-height`** on the frame or panels (today's `min-height: 650px` overflows on short laptop screens); maps must scale to any main-area height ≥ 480 px.
- **F-3** Only the **context scroll area** scrolls (`overflow-y: auto; overscroll-behavior: contain`). The map panel never scrolls and never uses `position: sticky`.
- **F-4** Both panels end with a **docked row** of equal height (`--rail-h`), on the same baseline: timeline (left), reading sections (right). Nothing may overlap these rows; scrolling content gets `padding-bottom ≥ --rail-h + 24px`.
- **F-5** z-index scale (do not invent new layers): content 1–10 · rails 20 · curtain 40 · notes drawer 45 · bars 50 · completion screen 60.
- **F-6** Tokens (shared, defined once):

| Token | Value | Notes |
|---|---|---|
| `--bar-top` | 76px | title bar (mobile: 64px) |
| `--bar-bottom` | 38px | same as homepage `.atlas-footer` |
| `--rail-h` | 56px | docked timeline / reading rail |
| `--split` | `3fr / 2fr`, `--ctx-min: 400px` | D4 |
| `--bar-pad-x` | 38px | title and bottom bars |
| `--ctx-pad-x` | `clamp(32px, 4vw, 68px)` | context text inset |
| `--measure` | `32em` zh / `34em` en | max line length in the context text |

### 4.2 Title bar (T)

- **T-1** Grid `1fr auto 1fr`, height `--bar-top`, padding `0 var(--bar-pad-x)`, 1 px bottom `--line`, translucent paper with blur, `z-index` 50.
- **T-2 Left – site title.** Only the current language: zh `山河显影`, en `Land, Made Visible`. Serif of that language, 20 px, weight 700, tracking `.18em` (zh) / `.12em` (en). It links to the atlas (`?lang=` kept in sync). *Never* both languages at once (today 山庄背影 shows both).
- **T-3 Middle – chapter identity.** `NN / 20` (UI font, `--ink-soft`) + thin divider + chapter title in the current language (serif, 14 px). `NN` comes from the chapter number, zero-padded. Nothing else.
- **T-4 Right – language switch only.** Markup: `<div role="group" aria-label="Language">` with buttons `中文` and `EN`, separator `／`, `aria-pressed` on the active one. Identical markup on every chapter and on the homepage.
- **T-5** The title bar **MUST NOT** contain a back link, sound toggle, notes button, progress or any chapter-specific control.
- **T-6** ≤ 900 px: two columns (site title, language switch), height 64 px, middle hidden (the curtain and the context header carry the chapter identity).

### 4.3 Curtain (C)

- **C-1 Coverage.** Before "open", the curtain covers the **entire area between the title bar and the bottom bar** (both panels). The bars stay visible and usable (D2).
- **C-2 Lock.** While closed: the context scroll area is `overflow: hidden` **and** `inert`; the map is `inert`; keyboard section navigation is disabled (`L` still works). Remove the ad-hoc veils and per-chapter tricks (`.reader-panel::after` grid veil, `display:none` reading copy).
- **C-3 Content order (top → bottom), centered:** kicker → teaser → title → thesis → open button.
- **C-4 Kicker.** Localized, never hard-coded English. Format `{Chapter NN} · {volume theme}`: zh `第 04 章 · 山河`, en `Chapter 04 · Land` *(zh wording to confirm)*. A place/time phrase such as 山庄背影's "承德 · 薄暮" may live in the thesis line.
- **C-5 Teaser.** The homepage's unread clue for this chapter, verbatim (registry field `teaser`), seal-red, 16 px, weight 600.
- **C-6 Title.** One horizontal line in the current language, `clamp(64px, 9vw, 140px)` (zh) / `clamp(46px, 6vw, 88px)` (en, may wrap to two lines). Not vertical, not split into per-character elements.
- **C-7 Thesis.** One or two sentences, 14 px, `--ink-soft`. Must not repeat the teaser (see 道士塔).
- **C-8 Open button.** One primary button, chapter-specific verb allowed (开卷 / 开始攀登 / 打开档案 / 绕到山庄背后), arrow icon, same style everywhere.
- **C-9 Animation.** Canonical: split from the center (`clip-path: inset(0 50% 0 50%)`), 1.35 s, `cubic-bezier(.76, 0, .24, 1)`, then `visibility: hidden`. A chapter may add a decorative layer *inside* the curtain (sand, door, ripple) but not change the mechanism.
- **C-10 On open:** curtain gets `aria-hidden="true"` + `inert`; context and map lose `inert`; focus moves to the context panel after the animation. The curtain never closes again in the same visit.
- **C-11 Semantics.** `role="dialog" aria-modal="false" aria-labelledby` the curtain title (`false` because the title bar and bottom bar stay usable, D2). The curtain title is the page's `h1` while it is visible; afterwards a visually-hidden `h1` keeps the heading outline (see M-2). Initial focus on the open button.
- **C-12** `?open=1[&section=N]` skips the curtain (preview mode) on every chapter.

### 4.4 Map panel — left (M)

> Everything drawn **on** the map (content, views, symbols, map type sizes, label placement, visual hierarchy, contrast) is specified in [map-guidance.md](map-guidance.md), which takes precedence over this document for map content.

- **M-1 Canvas (free zone).** Map and images fill the panel. SVG uses `viewBox` + `preserveAspectRatio`; canvas/WebGL redraws on resize (`ResizeObserver`). The panel background may be tinted by the chapter but keeps `--paper` as its base.
- **M-2 Top: nothing.** No eyebrow, no chapter title, no subtitle, no buttons. On-map labels, legends, insets, scale bars and compass are part of the map and allowed. Provide a **visually-hidden `h1`** (`.sr-only`) with the chapter title and `aria-label` on the section (today's `aria-labelledby="map-title"` points at the heading being removed).
- **M-3 Safe area.** 24 px clear of the panel edges; nothing overlaps the timeline row.
- **M-4 Bottom: timeline (docked row, `--rail-h`) — optional.** Include it only when the chapter has a real chronology; a chapter organised by place omits it and leaves the panel bottom to the map. When present:
  - One tick per reading section, **evenly spaced**, each with a short **time label** (a year when there is one; otherwise era, dated moment or time of day — never empty).
  - A fill line advances to the active tick (0.8 s ease); the active label is seal-red; caption at left (`时间线` / `Timeline`).
  - Driven by the same active-section index as the reading rail (R-8). Ticks are not buttons (they only reflect state); the reading rail is the control.
  - Replaces: 山庄背影's `.map-status` + `.time-rail`, 道士塔's `.state-caption`, and any per-chapter "state" captions.
- **M-5** *(shared component `.map-caption`: one short line, bottom-left of the map panel, same left inset as the reading text; used by 道士塔 — 沙原隐泉's `.camera-caption` and 山庄背影's `.map-status` predate it and could be folded into it.)* Captions that exist today as separate chrome (secret-spring `.camera-caption`, dujiangyan "Schematic map", etc.) either sit **inside** the map canvas as annotations or move into the notes drawer (B-4).

### 4.5 Context panel — right (R)

- **R-1** Structure top → bottom: **scroll area**, then **docked reading rail**.
- **R-2** Scroll area content: optional reader note (plain first item, *not* sticky) → sections → end block.
- **R-3 Section header.** Label (serif 20 px, seal-red, pattern `一 · 门外` / `I · Outside`, D7) on the left, `01 / 04` progress (UI font, tabular numbers) on the right, location line below (UI font 13 px, `--ink-soft`), then a 1 px rule.
- **R-4 Body.** zh: serif, 18 px (fluid 17–20 allowed), line-height 1.95, tracking `.04em`, justified. en: Caudex, 18 px, line-height 1.78, left-aligned. Paragraph gap `1.45em`. Max width `--measure`.
- **R-5 Drop cap.** First paragraph of each section, 3.3 em, chapter accent color. Skipped automatically when the paragraph opens with a bare numeral stroke (一 二 三 … 十): at that size 一 reads as a rule and the paragraph appears to lose its first character (shell adds `.no-dropcap`).
- **R-6 End block.** Inside the scroll area, after the last section: **seal (size M)** + **finish button** ("完成本章 · 返回总图"), 1 px top rule.
- **R-7 Reading rail (docked, `--rail-h`).** `<nav aria-label>` with caption (chapter-specific noun allowed: 阅读路标 / 阅读档案 / 原文章节 / Sections), buttons `01 … NN` (hit area ≥ 32 px, 44 px on touch), a fill line, active button highlighted. Click scrolls the scroll area to that section (smooth).
- **R-8 One active index.** A single `active` state (from an `IntersectionObserver` rooted on the scroll area) drives: reading rail, timeline, `01 / 04` progress, and any map reveal. Switching language keeps the same active section.
- **R-9** Horizontal padding `--ctx-pad-x`; bottom padding ≥ `--rail-h + 24px` so text never hides under the rail.
- **R-10** Section count is 3–6; the rail and timeline adapt to N.

### 4.6 Bottom bar (B)

- **B-1** Full width, fixed, height `--bar-bottom`, 1 px top `--line`, translucent paper, UI font 12 px, tracking `.07em` — same look as the homepage's `.atlas-footer`.
- **B-2 Left.** Text credit in the current language (`文本：余秋雨《文化苦旅》` / `Text: Yu Qiuyu, A Bittersweet Journey Through Culture`) followed by the **notes button**: `ⓘ 地图说明与数据来源` / `Map notes & sources` (`aria-expanded`, `aria-controls`).
- **B-3 Right.** **Back to Atlas** button/link: `← 总地图` / `← Atlas`, `href="../../index.html?lang=<current>"`, kept in sync on language change. Present on every chapter.
- **B-4 Notes drawer.** Opens **upward from the notes button, over the map panel** (bottom-left), width `min(480px, panel − 48px)`, max-height = main area − 40 px (the drawer scrolls inside; 70 % proved too short for five sections), `z-index` 45. Fixed section order, each optional but in this order:
  1. *Reading this map* — what is measured vs. literary (this replaces "Schematic map / 非测绘比例")
  2. *Data & projection*
  3. *Sources* (links, dates retrieved)
  4. *Disclaimer*
  5. *Keyboard* (↑ ↓ ← → sections · L language · Esc close)
  Behavior: `Esc` or outside click closes; focus returns to the button; the reading is **not** locked; usable while the curtain is closed too.
- **B-5** The bar **MUST NOT** hold key hints ("↑ ↓ Read / L Language") or the map-source line; those live in the drawer.
- **B-6** ≤ 900 px: the credit is hidden; the two buttons remain.

### 4.7 Seal glyphs (S)

> **Superseded (2026-09):** every chapter now uses a pictorial image seal (`.seal-image`), not a text glyph; see map-guidance.md §8 (K-1 to K-3). S-1 to S-3 below are kept for history.

- **S-1 One glyph per chapter, from a single registry.** Canonical set today: 水 都江堰 · 泉 沙原隐泉 · 空 道士塔 · 影 山庄背影. It is a **single Chinese character**, unique across chapters, renderable in the zh serif stack.
- **S-2 The same glyph appears in three places:** (a) homepage stamp collection and receipt, (b) the context panel end block (size M), (c) the completion screen (size L).
- **S-3 One component.** A shared `.seal`: square, 2 px seal-red border, glyph in the zh serif, subtle red tint, sizes S 44 px (homepage) / M 72 px / L 140 px. On the coloured completion screen the seal switches to a paper-coloured outline (red on the accent colour has too little contrast). The hand-drawn `seal-water.svg` is retired unless you want it as an optional "skin" for every chapter.
- **S-4** The completion screen shows the seal **last**: flourish animation (ripple, crescent…) → seal → kicker + line. Kicker text is identical on every chapter (`一处山河已经显影`) unless the chapter's `complete-kicker` is registered on the homepage too.
- **S-5** `role="status" aria-live="polite"`, `aria-hidden` toggled with the state, total duration **3000 ms** on every chapter (today 山庄背影 is 2800).

### 4.8 Typography (Y)

Fonts must be loaded on **every** page (Google Fonts `Caudex` + `Ysabeau`). No Arial, no Georgia, no Noto Serif SC stacks.

| Token | Stack |
|---|---|
| `--serif-cn` | `"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", serif` |
| `--serif-en` | `"Caudex", Georgia, serif` |
| `--sans` (UI) | `"Ysabeau", sans-serif` |

| Role | Font | Size | Weight | Tracking | Color |
|---|---|---|---|---|---|
| Site title (bar left) | serif of language | 20px | 700 | .18em zh / .12em en | `--ink` |
| Chapter number (bar middle) | UI | 13px | 500 | .1em | `--ink-soft` |
| Chapter title (bar middle) | serif | 14px | 400 | .1em | `--ink` |
| Language switch, bottom bar, rails, timeline, captions | UI | 12–13px | 500 | .08–.1em | `--ink-soft` |
| Curtain kicker | UI | 12px | 600 | .16em | accent |
| Curtain teaser | serif | 16px | 600 | .04em | `--seal` |
| Curtain title | serif | see C-6 | 400 | .16em zh / −.025em en | `--ink` |
| Curtain thesis | serif | 14px | 400 | .18em zh / .02em en | `--ink-soft` |
| Section label | serif | 20px | 400 | .12em | `--seal` |
| Section location | UI | 13px | 400 | .08em | `--ink-soft` |
| Section progress | UI, tabular | 12px | 400 | .12em | `--ink-soft` |
| Reading text | see R-4 | 18px | 400 | .04em zh | `--ink` |
| Notes drawer title / body | serif | 26px / 14px (1.8) | 400 | .12em / .04em | `--ink` / `--ink-soft` |

Minimum sizes: ~~12 px for UI text~~ **13.5 px (10 pt) for any text, including UI and map text** (2026-09, see map-guidance.md T-1), 16 px for reading text. The `body[data-language="en"]` switch changes the serif stack and tracking only; sizes stay as above.

### 4.9 Language (G)

- **G-1** Exactly **one language is visible at any time**, everywhere. No "Schematic map / 非测绘比例", no always-English kickers, no bilingual title spans toggled by CSS.
- **G-2** Every visible or assistive string (including `aria-label`, `title`, `alt`) is a `data-copy` key with `zh` and `en` values; key parity is enforced (today's chapters already have full parity).
- **G-3** Chinese is Simplified. `<html lang>` follows the state (`zh-CN` / `en`).
- **G-4** Language source of truth: `?lang=` → `localStorage["bittersweet-journey:language"]` → `zh`. Every internal link carries `?lang=`. `L` toggles.

### 4.10 Color (K)

- **K-1 Shared tokens, same values on every page and on the homepage:** `--paper #ece7db`, `--paper-deep #ded7c7`, `--ink #20251f`, `--ink-soft #5b5d53`, `--seal #9d3d31`, `--line rgba(32,37,31,.22)`.
- **K-2** One **chapter accent** token (`--accent`) for the drop cap and secondary highlights (water blue, spring teal, cave blue, lake grey…). `--seal` remains the site-wide highlight for teaser, section label, active rail state and seals.
- **K-3** A chapter may tint the **map panel background** only. Bars, context panel and curtain base use the shared paper. (山庄背影's darker `#ded8ca` and `--cinnabar` become `--paper` / `--seal`, or are documented as an intentional exception.)

### 4.11 State and motion (A)

- **A-1** States: `curtain` → `open` → `completing` → navigate. Body classes: `is-open`, `is-completing`.
- **A-2** Transient states (`is-completing`) are reset on `pageshow` (bfcache). `is-open` may persist.
- **A-3** Durations: curtain 1.35 s · paragraph fade-in 0.55 s (stagger ≤ 280 ms) · rail/timeline fill 0.8 s · completion 3 s.
- **A-4** `prefers-reduced-motion: reduce` disables all of the above except state changes.

### 4.12 Responsive (P) — *draft, needs device testing*

| Width | Rules |
|---|---|
| ≥ 1080 | Two columns per F-2 |
| 900 – 1079 | Two columns, `--split: 56 / 44`, context min 360 px |
| < 900 | **Stacked**: title bar 64 px (T-6); map panel on top, height `min(46vh, 480px)` with the timeline row inside its bottom; context panel below fills the remaining height with its own scroll area and docked reading rail; bottom bar 40 px (credit hidden); curtain covers map + context |
| < 540 | Title 44 px (curtain), hit areas 44 px, notes drawer becomes full-width sheet |

### 4.13 Accessibility (X)

- **X-1** Landmarks: `<header>` title bar, `<main>`, map `<section aria-label>`, context `<article aria-label>`, `<nav aria-label>` for each rail, `<footer>` bottom bar. Exactly one `h1`.
- **X-2** All interactive controls ≥ 32 px (44 px on touch), visible `:focus-visible` outline in `--seal` (no chapter has one today).
- **X-3** Curtain and notes drawer: dialog semantics, focus placement and return as specified in C-11 / B-4.
- **X-4** Contrast: ≥ 4.5 : 1 for normal text, ≥ 3 : 1 for large text, measured against the pixels actually behind the text; fix by adjusting the background first (map-guidance.md A-1, A-2). `--ink-soft` on `--paper` is never used for critical information.

### 4.14 URLs, storage, keyboard (U)

- **U-1 Identifier.** `id` = folder name = homepage story id = `?revealed=` value = `localStorage` key segment. (Today 山庄背影 is `mountain-resort` in the folder and storage key but `chengde` on the homepage.)
- **U-2** Storage: `bittersweet-journey:<id>:complete = "true"`, `bittersweet-journey:language`.
- **U-3** Query params, all chapters: `lang`, `open=1`, `section=N`, `notes=1` (open the notes drawer). Remove `from=atlas` (never read) or start using it.
- **U-4** Keys: `L` language · `↑ ↓ ← →` previous/next section (only when open) · `Esc` closes the drawer.
- **U-5** Cache busting: whenever a file changes, bump its `?v=` in every HTML that references it (one shared version string is fine).

---

## 5. Gap analysis (old chapters → guideline)

### 5.1 Per rule, per chapter

✓ = already conforms. Everything else is a change.

| Rule | 都江堰 | 沙原隐泉 | 道士塔 | 山庄背影 |
|---|---|---|---|---|
| **F-1/F-3** frame & scroll | window scroll + sticky map → app frame | same | same | same |
| **F-2** split | `1.6fr / .72fr` (≈ 69 %) → 60/40 | `1.58 / .74` (≈ 68 %) | `1.5 / .78` (≈ 66 %) | `58vw / 1fr` (58 %) |
| **F-2** min-height | `min-height: 650px` → remove | same | same | — (verify) |
| **T-2** left title | ✓ single language (verify EN) | ✓ (verify EN) | ✓ (verify EN) | ✗ shows both (22 px + 11 px uppercase) |
| **T-3** middle | ✓ | ✓ | ✓ | unclassed spans, uppercase Arial → shared markup |
| **T-4/T-5** right | remove **back-atlas** and **sound toggle** | remove **back-atlas** | remove **back-atlas** | labels `中 / EN` → `中文 ／ EN`; `<nav>` → `div role=group` |
| **C-1/C-2** curtain | covers left only; reader visible and scrollable → full width + lock | same | full-width lock partly done (veil + `overflow:hidden`) → replace with `inert` | full-width already, but starts below the title bar and runs to the viewport bottom (`z-index 60`) → stop above the new bottom bar; lock |
| **C-4** kicker | hard-coded "Chapter 04 · Land" | "Chapter 07 · Land" | "Chapter 05 · Land" | "承德 · 薄暮" → standard kicker |
| **C-5** teaser | ✓ | ✓ | ✓ | ✓ (`.gate-teaser`) |
| **C-7** thesis | site-level tagline → chapter-specific | ✓ | duplicates teaser → reword | `opening-line` key → `thesis` |
| **C-9** animation | ✓ canonical | own | own (door) | two sliding panels → canonical split |
| **M-2** heading block | remove eyebrow/h1/subtitle; add sr-only h1 | same | same | same (no `id`, uses `aria-label`) |
| **M-4** timeline (optional) | not needed — place-based, no dates | not needed unless the author wants a time-of-day bar | `.state-caption` → fold in if the chapter is chronological | `.map-status` + `.time-rail` → restyle |
| **B-2/B-4** notes | `.map-note` dead button → build drawer | `.map-data-button` (bottom-right of map) + `.camera-caption` → drawer / on-canvas | `.map-note-button` (top-right of map) → drawer | `.map-data-button` (top-right) + right-side panel → standard drawer |
| **B-1/B-3** bottom bar | right-anchored `.footnote` (`min(42vw, 640px)`) → full bar | right-anchored (`min(56vw, 900px)`) → full bar | full-width ✓ (31 px → 38 px) | none → add; add Back to Atlas |
| **R-3** section label | `第一节` | `路标一 · 脚印` | `档案一 · 塔` | `一 · 门外` ✓ |
| **R-4** body type | fluid 17–20 / 1.92 | fluid 17–20 / 1.92 | 18 / 2 | 18 / 1.95 ✓ but EN in Georgia → Caudex |
| **R-5** drop cap | ✓ | ✓ | ✓ | add |
| **R-6/S-3** end seal | `<img seal-water.svg>` 水 → shared `.seal` | 泉 span → shared `.seal` | **藏** → 空 | none → add 影 |
| **R-7** reading rail | `.section-rail` at map bottom-left → dock right | same | same | `.reading-rail` fixed at `58vw + 18px`, hidden until open → dock right |
| **S-4** completion | ripple only → add seal 水 | crescent only → add seal 泉 | 空 ✓; kicker "一条流散路径已经显影" (decide) | 影 ✓ |
| **S-5** completion ARIA/time | ✓ / 3000 | ✓ / 3000 | ✓ / 3000 | **no role/aria-live**; 2800 → 3000 |
| **Y** fonts | ✓ | ✓ | ✓ | **Google Fonts missing**; Arial/Georgia/Noto Serif SC everywhere |
| **K** tokens | `--seal #9d3d31` ✓ | `#9c4333` → shared | `#9f3f31` → shared | `--cinnabar #93493d`, `--paper #ded8ca` → shared or documented exception |
| **U-3** params | no `open` / `section` → add | `data=1` → `notes=1` | `note=1` → `notes=1` | `data=1` → `notes=1` |
| **U-1** id | ✓ | ✓ | ✓ | `chengde` ≠ `mountain-resort` |

### 5.2 Timeline labels needed (M-4, D5)

Author input required — I will not invent dates. Data already in the repo:

| Chapter | Sections | Existing hints | Needed |
|---|---|---|---|
| 都江堰 | 4 | `location`: 岷江 · 都江堰 / 江声 · 鱼嘴 / 水理 · 李冰 / 青城山 · 伏龙观 — no dates | 4 labels (era, or "then / now") |
| 沙原隐泉 | 4 | `location`: 鸣沙山北缘 / 沙脊 · 夕照 / 峰坡 · 月牙泉 / 泉边 · 静池 — time-of-day hint | 4 labels (time of day or "step") |
| 道士塔 | 5 | one date in data: 藏经洞 · 1900年6月22日 | 5 labels |
| 山庄背影 | 5 | `years: ["QING","1703","1793","1861","1927"]` — **ready** (map to zh/en) | none |

### 5.3 Additional issues to fix (beyond your list)

| # | Issue | Why it matters | Rule |
|---|---|---|---|
| 1 | Removing the heading block breaks `aria-labelledby="map-title"` and leaves pages without an `h1` | a11y regression if not handled | M-2, C-11 |
| 2 | 都江堰's `.footnote` floats over the reading text (bottom lines are covered) | text hidden behind fixed UI | F-4, B-1 |
| 3 | Window-scroll → panel-scroll changes every chapter's section-detection JS (`scroll` listener + `getBoundingClientRect`) | biggest implementation risk | F-3, R-8 |
| 4 | `min-height: 650px` on the map panel overflows below ~ 760 px viewport height | clipped map/rails on laptops | F-2 |
| 5 | 沙原隐泉's WebGL terrain canvas must resize with the new panel ratio | blank or stretched terrain | M-1 — ✅ resolved (§5.6) |
| 6 | 都江堰 `.map-note` is a dead button; sound toggle is a placeholder ("原型占位") and the `<meta description>` still says "原型" | looks finished, isn't | B-4, D8 |
| 7 | 都江堰 advertises "↑ ↓ Read" but has no arrow-key handler | broken promise | U-4 |
| 8 | `?from=atlas` is appended to every chapter link but never read | dead parameter | U-3 |
| 9 | Preview flags differ (`data=1` / `note=1`) and 都江堰 has none | inconsistent QA workflow | C-12, U-3 |
| 10 | 道士塔 thesis repeats its teaser ("一扇洞门打开") | visible repetition on the curtain | C-7 |
| 11 | Hard-coded English in zh mode: curtain kicker, `aria-label`s, "Schematic map" | breaks G-1 | G-1, G-2 |
| 12 | 山庄背影 has no `:focus-visible`/`aria` on the completion screen; no chapter has `:focus-visible` | keyboard users | X-2, S-5 |
| 13 | Homepage receipt text vs chapter `complete-line` differ for 3 of 4 chapters; homepage and chapter English titles differ (都江堰, 沙原隐泉) | content drift | §6.2 |
| 14 | `chengde` vs `mountain-resort` identifier | breakable link between homepage and chapter | U-1 |
| 15 | Section labels exist twice (`chapter-data.js` and each `ui` dict); zh/en paragraph counts differ in 7 sections | maintenance and alignment | §6.2 |
| 16 | Homepage title bar is 72 px vs 76 px on chapters | visible jump when navigating | D12 |
| 17 | Cache-busting `?v=` must be bumped on every edit (we already hit a stale-cache failure once) | stale code | U-5 |
| 18 | After removing the eyebrow and subtitle, that copy disappears | content loss | D11 |

### 5.4 Migration status and per-chapter decisions

| Chapter | Status |
|---|---|
| **都江堰** | **Migrated (v0.2).** Shell files, markup, notes drawer, seal and completion screen done; verified in a real browser at 1440×900, 1280×720, 1024×768, 800×900 and 390×844 |
| **沙原隐泉** | **Migrated (v0.4).** 3D terrain canvas inside the map panel, reader note kept, no timeline; the reading order was restored to the essay's own order; verified at 1440×900, 1280×720, 1024×768, 800×900 and 390×844, plus the homepage round trip (§5.6) |
| **道士塔** | **Migrated (v0.5).** Layered geography map only (China close-up → Eurasia → world), no timeline, no reader note; the earlier schematic map layers (dead code) removed; per-level zoom for stacked layouts; verified at 1440×900, 1280×720, 1024×768, 800×900 and 390×844 in zh and en, plus the homepage round trip (§5.7) |
| **山庄背影** | **Migrated (v0.3).** Uses the optional timeline and reader note; verified at 1440×900, 1280×720, 1024×768, 800×900 and 390×844, plus the homepage round trip (§5.5) |

Components judged **not necessary for 都江堰's content** (and therefore left out — the guideline allows this):

| Component | Decision | Why |
|---|---|---|
| Timeline (M-4) | **Omitted** | The chapter is organised by place (岷江 → 鱼嘴 → 李冰 → 青城山); its data has no dates, and inventing labels would be guessing |
| Sound toggle | **Removed** | Placeholder with no audio (D8) |
| Reader note (R-2) | **Omitted** | Nothing to explain; the section labels are already the original's four parts |
| Heading block, eyebrow, subtitle (M-2, D11) | **Removed** | The subtitle "水，被读出来的形状" was reused as the curtain thesis, so no copy was lost |
| Hand-drawn `seal-water.svg` | **Unreferenced** | Replaced by the shared CSS `.seal` (S-3); the file is still in `assets/` and can be deleted |

Content decisions taken for 都江堰 (change them freely):

- **Section labels** were split from the old `location` strings: `岷江 · 都江堰` → label `一 · 岷江` + location `都江堰` (likewise 江声/鱼嘴, 水理/李冰, 青城山/伏龙观 and the English equivalents).
- **Curtain thesis** = the former subtitle (`水，被读出来的形状` / `The shape of water, read into view`); the former site-level tagline `地图并不存在，直到它被阅读。` is no longer on this page.
- **Notes drawer** content is taken from `docs/chapters/dujiangyan/GEODATA.md` and `real-geography.js` (sources, projection, generation date 2026-07-24, offline use). Sources are plain text, not links, because I did not want to guess URLs.
- **Map label sizes** were raised (about +15 %) because the map panel is smaller than before, and phone-width crops the empty western margin of the map so labels stay legible.
- **Keyboard:** ↑ ↓ ← → now switch sections (the old README promised this but the code lacked it); arrows keep working after a rail click.

### 5.5 山庄背影 — migration notes

**Kept and promoted** (this chapter's content needed them, so the shell gained them):

| Component | How |
|---|---|
| **Timeline (M-4)** | Real chronology: 清代 · 1703 · 1793 · 1861 · 1927 (one tick per section, `QING` in English). Docked at the map panel bottom on the same baseline as the reading rail; both follow one active section. New shell option `timeline: { zh, en }` and `.timeline` markup |
| **Reader note (R-2)** | The old reader-panel thesis "园林没有移动。移动的是看它的时代。" is now the note at the top of the reading area (`.reader-note`). Rail item 01 scrolls to the very top so the note stays reachable |
| **On-map caption** | The old "year + status" line ("1703 椅背 · 园林展开") stays as a map annotation just above the timeline (M-5) |
| **Two-scale map** | Regional → resort transition and all `data-level` reveal layers untouched; the shell passes `previous` to `onSection` so the scale-transition class still fires |
| **Notes drawer (B-4)** | The old data panel became the drawer: *Reading this map* (zones, narrative, regional axis + the legend), *Data & projection* (property, places, cross-city memory), *Sources* (the four existing links, kept as links), disclaimer, keyboard |

**Retired or changed**

| Item | Decision |
|---|---|
| Dark two-panel gate | Replaced by the standard paper curtain (K-3). The chapter's dusk mood is lost; a decorative layer inside the curtain could bring it back |
| Curtain kicker "承德 · 薄暮" and reader kicker "承德 · 塞外" | Retired; the kicker is now the standard `第 10 章 · 山河`. Say if you want the place/time phrase back as a thesis prefix |
| Subtitle "一把罗圈椅，坐过一个疲惫的王朝" and eyebrow | Retired with the heading block (D11) |
| Reader-finish paragraph "一个王朝离开后，山水仍坐在原处。" | Removed from the reading area; it still appears on the completion screen |
| Seal | 影 at the end of the chapter (was missing) and on the completion screen |
| `Arial`/`Georgia`/Noto Serif stacks | Replaced by the shared fonts; `paper-grain` gradient replaced by the shared paper texture |
| `?data=1` | Now `?notes=1` |
| Old scroll model (window scroll, fixed rail at `58vw + 18px`) | Replaced by the fixed frame and docked rail |

**Fixes made on the way**
- The light label "山岭如椅背 · 面南而坐" ran from the dark mountain band onto light ground and became unreadable; it now has a dark halo.
- README rule "regular letterforms only, no italics" is respected (the shared English completion line is upright on this chapter).
- Stacked (tablet) layout scales the map up; phone keeps the original crop.
- The English section openings were ALL CAPS (small caps in the source EPUB); the five of them are now shown in sentence case, as 都江堰 already does.

**Identifier follow-up (U-1, deliberately not done yet).** The chapter now passes `revealId: "chengde"` so the homepage keeps working. Renaming the homepage story id `chengde` → `mountain-resort` touches `atlas.js`, `index.html` and `atlas.css`; it is best done together with the shared registry (§6.5). Until then this chapter is the one documented exception to U-1.

### 5.6 沙原隐泉 — migration notes

**Kept** (this chapter's content needed them):

| Component | How |
|---|---|
| **3D terrain canvas** | Sits inside the map panel under the SVG story layers. No `ResizeObserver` was needed: `terrain-3d.js` reads the canvas size on every frame, so it follows the panel at all breakpoints (measured canvas pixels = panel pixels at 1440, 1280, 1024, 800 and 390 px wide) |
| **Reader note (R-2)** | "四个“路标”用于交互节奏，不是原文编号分节。" stays as the first item of the reading area: it is an honest disclosure that the four beats are editorial pacing, not the essay's own sections |
| **On-map caption (M-5)** | The old `.camera-caption` (camera mode + tech line, e.g. "贴近沙脊 · 3D terrain · DEM") stays as a map annotation, bottom-left, on the same baseline as 山庄背影's status caption |
| **Reveal layers and camera** | `data-level` layers, the level-2 regional scene (Dunhuang → Mogao → Yulin) and the four camera states are untouched; `onSection` still drives them |
| **Notes drawer (B-4)** | The old data panel became the drawer: *Reading this map* (3D, footsteps, region), *Data & projection*, *Sources* (plain text — GEODATA.md has no URLs and none were invented), disclaimer, keyboard |

**Omitted**

| Component | Decision | Why |
|---|---|---|
| Timeline (M-4) | **Omitted** | The four beats are places and moments (脚印 → 山脊 → 下坡 → 隐泉), not dates |

**Retired or changed**

| Item | Decision |
|---|---|
| Heading block, eyebrow "第一卷 · 山河", subtitle "水，藏在不该有水的地方" (M-2, D11) | Removed. The subtitle is **not** reused (the curtain thesis stays "先有脚印，然后才有泉。"), so that line no longer appears on the page — say if you want it back as the teaser or thesis |
| Two-tone curtain title (隐泉 in teal) and the dune shapes in the curtain | Replaced by the standard paper curtain (K-3) |
| Crescent shape on the completion screen | Replaced by the standard ripple + seal 泉 (S-4); the end-of-reading seal is the shared `.seal` (was a hand-styled `.spring-seal`) |
| "Map data & accuracy" floating button and the two-line footnote | The button is the bottom-bar notes button; the map credit "Copernicus DEM GLO-30 · OpenStreetMap" moved into the drawer's sources |
| `?data=1` | Now `?notes=1` |
| SVG `<title>`/`<desc>` | Were Chinese only; now bilingual |
| Terrain light drift | Now driven by the scroll of `.reader-scroll` (was window scroll) |

**Content fix: reading order.** The old page read the sections as `waypointOrder = [1, 0, 2, 3]` — the ridge paragraphs ("完全不必担心栖宿…") were shown **before** the essay's opening line ("沙漠中也会有路的，但这儿没有"), the rail read `02 · 01 · 03 · 04`, and the first section header said "02 / 04". The corpus is contiguous in the order footprints → ridge → descent → spring (`tools/build_secret_spring_chapter.py`), so this scrambled the text. The page now follows the essay's order, labels are `一 · 脚印` … `四 · 隐泉` (D7), and the camera goes local → regional pull-back at the ridge → dive → low hold. One visible consequence: the first thing after opening is the local footprint view (it used to be the regional view). If the old order was intentional, it has to be changed in the data (the `BEATS` in the build script), not in the page.

**Fixes made on the way**
- SVG map labels were 8–10 map units (≈ 7 px on screen), now ≥ 11 units. The regional scene gets a 1.1× zoom on desktop and 1.6× in the wide, short stacked panel; phones keep the full scene at 1× with larger place names (coordinates stay small — a 95 km-wide scene cannot be legible at 390 px).
- The English label "Mingsha · Crescent Spring" was clipped by the panel edge; it is now two lines. The "12.3 km" distance label no longer touches the Mogao icon.
- English opening "ROADS EXIST" is shown in sentence case.
- Drawer row styles (`p > b`, `.notes-datum`) moved from 山庄背影's own stylesheet into the shared shell, since a second chapter now uses them.

**Pre-existing, left alone.** The far edge of the 3D mesh is a hard straight line (same in the old page); and the level-3/4 `.terrain-viewport` zoom rules never win the specificity contest against the level-≠2 rule, so those two shifts never applied (they never did before either).

### 5.7 道士塔 — migration notes

**Kept**

| Component | How |
|---|---|
| **Layered geography map** | The three live layers are untouched: China close-up (Ministry of Natural Resources standard-map base, Albers), Eurasia (Natural Earth) and world; `body[data-reading-level]` still switches the layers, routes and the 29-crate arrival animation. Geography placement code (`applyGeography`) is carried over verbatim |
| **On-map caption (M-5)** | The old per-section map subtitle ("人物地理 · 从湖北到河西走廊", "1900 · 西北考古与全球权力背景" …) is now the shared `.map-caption`. The old `.state-caption` ("01 塔") is gone: number and name are already in the rail and the section header |
| **Notes drawer (B-4)** | The old map-note panel became the drawer: *Reading this map* (solid line / dashed line / Wudang / the gap), *Data & projection* (China close-up, world and Eurasia), *Sources*, disclaimer, keyboard. The old note text is kept nearly word for word, only split into rows; the sentence that the chapter does not treat manuscripts as collectibles is now in the disclaimer |

**Omitted**

| Component | Decision | Why |
|---|---|---|
| Timeline (M-4) | **Omitted** | Only sections 2 (1900) and 5 (1943) state a date in the text; the other three have none. Five ticks would need invented dates (e.g. Stein's 1907 arrival is not in the text). The dated hints live in the map caption instead. Add a timeline later if you supply the labels |
| Reader note (R-2) | **Omitted** | The five sections *are* the essay's own numbered sections, and the labels 一 … 五 say so; the old note "五份档案对应原文五个编号分节" is redundant now that the thematic noun "档案" sits in the rail caption (D7) |

**Retired or changed**

| Item | Decision |
|---|---|
| Heading block, eyebrow, per-section subtitle at the map top (M-2, D11) | Removed; the subtitle text survives as the map caption |
| Section labels `档案一 · 塔` … | `一 · 塔` … `五 · 三座墓` / `I · The stupa` … (D7); rail caption stays "阅读档案" / "Reading files" |
| Seal | **空** at the end of the reading and on the completion screen (D6; it was 藏 in the reader footer). The completion kicker is now the shared default "一处山河已经显影" (the chapter used "一条流散路径已经显影"), matching the homepage receipt (§5.3 issue 13); the completion line is unchanged |
| Curtain: door decoration, two-line title block | Replaced by the standard curtain (K-3) |
| Footnote (text credit + "地图：原文地点 · 文学示意路径") | Standard bottom bar; map credits are in the drawer's sources |
| `?note=1` | Now `?notes=1` |
| **Dead schematic map** | Five SVG groups (`.local-ground`, `.archive-room`, `.meeting-diagram`, `.departure-map`, `.grave-map`) plus the manuscript-field builder were `display: none` in the old stylesheet and nothing re-enabled them. They and their 46 CSS rules, three filters/gradients and two keyframes were removed (the old files are in git). The CSS was pruned mechanically: only rules whose selectors can match nothing in the new page were dropped |

**Fixes made on the way** (all three were visible in the old page too, and are more noticeable in the smaller panel)
- **Crate manifest (section 4):** the heading "装箱记录 · 七日" overlapped the first crate row and the caption "29 只大木箱" was covered by the last row; the sheet is 18 units taller and the crates and captions moved down.
- **Projection note vs legend (sections 4–5):** "Natural Earth · Equirectangular projection" was printed on top of the legend; it moved below it. On stacked layouts it is hidden (the drawer says the same). The China projection note is also hidden on phones, where it collided with the two-line English caption.
- **English "South China Sea Islands"** label was wider than its inset frame; it is now two lines. (The inset itself is a required element of the standard map and stays visible at every size.)
- **Dash drop-cap** (all chapters): see R-5.

**Stacked and phone layouts.** The map is drawn into a wide, short panel, so the SVG is zoomed per level (China close-up 1.3× / 1.45× on phones; Eurasia and world 1.2× / 1.14×, with the labels enlarged on phones because those levels cannot be zoomed further; English uses smaller enlargements because its labels are longer).

**Not touched.** `geography-data.js` (731 KB, two lines) is still loaded synchronously; the shared-geography question is still open (see the audit's note on geography sources).

---

## 6. New chapter contract

### 6.1 Files

```
site/chapters/<id>/
  index.html          shell markup only (per §3); no chapter chrome outside the slots
  app.js              chapter-specific behavior (map reveal); shell behavior comes from shared code
  chapter-data.js     text + per-section metadata (below)
  geography-data.js   optional, map geometry
  styles.css          map canvas and chapter-specific styling only
  assets/             images, hillshade, etc.
```

`<id>` = story id = `?revealed=` value = storage key segment (U-1).

### 6.2 `chapter-data.js` (proposed schema v2)

```js
window.CHAPTER_DATA = {
  id: "dujiangyan",
  number: 4,                       // shown as 04 / 20
  mark: "水",                      // seal glyph (S-1), must match the homepage
  zh: {
    title: "都江堰",
    teaser: "水在这里被分开",       // = homepage unread clue
    thesis: "…",
    completeLine: "…",             // = homepage receipt text, or document why different
    sections: [
      { label: "一 · 岷江", location: "岷江 · 都江堰", time: "…", paragraphs: ["…"] }
    ]
  },
  en: { /* same shape and same section count */ }
};
```

Rules: `sections.length` is 3–6 and equal in zh and en; `time` is required (M-4); paragraph counts should match between languages (warn otherwise, and note in the alignment file); section metadata lives **with** the section, not in a separate `ui` array.

### 6.3 Required copy keys (zh + en)

`curtain-kicker`, `map-teaser`, `thesis`, `open`, `finish`, `complete-kicker`, `complete-line`, `rail-caption`, `timeline-caption`, `notes-button`, `notes-title`, `notes-map`, `notes-data`, `notes-sources`, `notes-disclaimer`, `notes-keyboard`, `source` (credit), `back-atlas`. Chapter-specific extras are allowed but must be in both languages.

### 6.4 Content checks

- Teaser = the homepage unread clue; complete line = the homepage receipt (or a documented reason).
- English title identical on the homepage, the title bar, the curtain and `chapter-data.js`.
- Seal glyph unique among chapters and present in the homepage stamp set.
- Every section has a time label and a location line.
- Thesis does not repeat the teaser.

### 6.5 Registering the chapter on the homepage

1. Add a `STORIES` entry in `site/scripts/atlas.js`: `storageKey`, `href`, `index` ("Chapter NN / Land"), `title` (zh/en), `preview`, `enter`, `receipt` (mark, zh, en).
2. Add its story-point group, memory group and "complete" clue text to `site/index.html`, the matching CSS in `atlas.css`, and its coordinates in `originalAnchors` / `labelOffsets`.
3. Add the place to `data/real-geography.js` if it is new.
4. Check the stamp modal shows the new glyph, the count `N / total` and the "all revealed" logic.
5. Bump `?v=` on the homepage files (U-5).

*Recommendation:* move the fields that both sides need (id, number, titles, mark, teaser, receipt, storage key, href) into one shared registry (`site/data/chapters-registry.js`) so the homepage and chapters cannot drift (issues 13, 14).

---

## 7. Implementation (started)

**Shared files** (all in `site/chapters/_shared/`):

| File | Purpose |
|---|---|
| `chapter-shell.css` | Tokens, frame, title bar, curtain, reader typography, docked rail, seal, bottom bar, notes drawer, completion screen, responsive rules |
| `chapter-shell.js` | `ChapterShell.init(config)`: language, copy, section rendering, rail, curtain lock, notes drawer, keyboard, completion, `pageshow`, URL params |
| `chapter-template.html` | Starter markup with `__PLACEHOLDERS__` (title, number, teaser, thesis, seal glyph…) |

**A chapter folder then contains only:** `index.html` (from the template), `chapter-data.js`, `app.js`, `styles.css` (set `--accent`, style the map canvas), plus assets.

**`app.js` in a chapter** (see 都江堰 for a complete example):

```js
ChapterShell.init({
  id: "dujiangyan",            // folder = story id = ?revealed= value (U-1)
  number: data.number,
  data,                        // window.CHAPTER_DATA
  sections: { zh: [{ label: "一 · 岷江", location: "都江堰" }, …], en: […] },
  copy: { zh: { "map-teaser": "…", thesis: "…", open: "…", "complete-line": "…", "notes-map": "…" }, en: { … } },
  formatParagraph,             // optional
  timeline: { zh: [...], en: [...] },   // optional docked timeline (M-4)
  revealId: "chengde",         // optional: only if the homepage story id differs from `id`
  onRender: (language) => {},  // optional: called whenever copy is (re)applied
  onSection: (index, state, previous) => { /* reveal map layers */ }
});
```

Shell-provided copy (site title, bar labels, drawer headings, "finish", kicker template `第 {n} 章 · 山河` / `Chapter {n} · Land`, rail caption, completion kicker) lives in `chapter-shell.js`; a chapter can override any key in its own `copy`.

**Order of work from here**

1. ✅ Shared shell, template and all four chapters migrated and verified.
2. **Review the four chapters together** in the browser; then decide the follow-ups below.
3. Registry (`chapters-registry.js`) shared with `atlas.js`; unify identifiers; homepage title bar 72 → 76.
4. QA with the §8 checklist at 1440×900, 1280×720, 1024×768, 390×844; bump every `?v=`.

**Known risks:** the 731 KB `taoist-tower/geography-data.js`, phone layout of dense maps (label sizes are chapter-specific), and the new fixed-height frame on very short screens (< 600 px main height).

---

## 8. Checklist (use for old and new chapters)

**Frame** — [ ] F-1 window does not scroll · [ ] F-2 split and equal panel heights, no `min-height` · [ ] F-3 only the context scroll area scrolls · [ ] F-4 docked rows aligned, no overlap · [ ] F-5 z-index scale respected

**Title bar** — [ ] T-2 site title, current language only · [ ] T-3 `NN / 20` + chapter title · [ ] T-4 language switch markup · [ ] T-5 nothing else in the bar

**Curtain** — [ ] C-1 covers both panels, between bars · [ ] C-2 context locked and `inert` · [ ] C-3/C-4 order and localized kicker · [ ] C-5 teaser = homepage clue · [ ] C-7 thesis ≠ teaser · [ ] C-9 canonical animation · [ ] C-10/C-11 open/focus/dialog semantics · [ ] C-12 `?open=1`

**Map panel** — [ ] M-1 scales to any height · [ ] M-2 top empty, sr-only `h1`, `aria-label` · [ ] M-3 safe area · [ ] M-4 timeline with a label per section · [ ] M-5 no stray captions/buttons

**Context panel** — [ ] R-3 section header pattern · [ ] R-4 typography · [ ] R-5 drop cap · [ ] R-6 end block (seal + finish) · [ ] R-7 docked reading rail · [ ] R-8 one active index · [ ] R-9 bottom padding

**Bottom bar** — [ ] B-1 full width, 38 px · [ ] B-2 credit + notes button · [ ] B-3 Back to Atlas with `?lang=` · [ ] B-4 drawer sections in order, Esc/outside/focus · [ ] B-5 no key hints in the bar

**Seal** — [ ] S-1 glyph matches the homepage · [ ] S-2 same glyph in stamp, end block, completion · [ ] S-3 shared component · [ ] S-4 seal last on completion · [ ] S-5 ARIA + 3000 ms

**System** — [ ] Y fonts loaded, tokens used · [ ] G-1 one language visible, no hard-coded strings · [ ] K colors from tokens · [ ] A `pageshow` reset, reduced motion · [ ] X landmarks, one `h1`, focus-visible · [ ] U id, params, `?v=` bumped

---

## Appendix A — Current measured values (for reference)

| | 都江堰 | 沙原隐泉 | 道士塔 | 山庄背影 |
|---|---|---|---|---|
| Map / context columns | `1.6fr / .72fr` (min 350) | `1.58fr / .74fr` (min 370) | `1.5fr / .78fr` (min 390) | `58vw / 1fr` (min 540 / 380) |
| Title bar height / padding / z | 76 / 38 / 20 | 76 / 38 / 40 | 76 / 38 / 50 | 76 / **34** / 40 |
| Reading text zh | 17–20 px / 1.92 | 17–20 px / 1.92 | 18 px / 2 | 18 px / 1.95 |
| Reading text en | Caudex 16–20 / 1.72–1.78 | Caudex 16–20 / 1.72–1.78 | Caudex 18 / 1.78 | **Georgia** 18 / 1.8 |
| Section label size | 21 px | 20 px | 15 px | 27 px |
| Curtain title size (zh) | `clamp(74, 11vw, 156)` | `clamp(72, 10vw, 142)` | (single line) | `clamp(38, 6vw, 78)` |
| Reader panel before open | visible, scrollable | visible, scrollable | veiled (`overflow:hidden` + overlay) | reading copy `display:none` |
| Breakpoints | 900 / 540 | 1040 / 820 / 520 | 1080 / 820 / 540 | 980 / 580 |
| Homepage for comparison | title bar 72, bottom bar 38, breakpoints 900 / 520 | | | |
