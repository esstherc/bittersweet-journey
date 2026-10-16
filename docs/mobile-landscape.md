# Mobile landscape experience

Updated 2026-10-15. Documentation is English; interface localization remains Simplified Chinese and English.

## Required orientation

The shared mobile-orientation.js mounts a localized native dialog on the atlas, introduction and every chapter. Small touch devices in portrait (coarse pointer, portrait orientation, width at most 900 px) must rotate before interacting. Escape does not dismiss the gate. Narrow desktop windows with a fine pointer are not blocked.

The underlying document, selected language and reading position stay mounted. Landscape closes only the gate; returning to portrait reopens it. Newly opened title/credits dialogs cannot bypass it. Credits pause when the gate appears. The implementation does not depend on fullscreen permissions or browser orientation locking.

## Compact layout

mobile-landscape.css is the final responsive layer. At landscape widths up to 1100 px and heights up to 600 px, chapters use a 52/48 map/reader split with a 260 px minimum reader. Both columns fill available height. The header is 52 px, footer 44 px and reading rail 44 px. Text scrolls independently while existing observers resize the map.

Curtains retain one subtitle with compact spacing and a full-height painting. The globe and its context stay side by side. Credits controls and book proportions adapt to short screens. The compact atlas fills the full available width with the map. A small title floats above it; Guide is collapsed by default unless the reader saved an explicit preference. Opening Guide shows a bounded overlay rather than allocating a separate column. The footer remains fixed. Desktop presentation remains intact.

## Validation

Run node tools/test_mobile_landscape.cjs; set PLAYWRIGHT_MODULE to an installed Playwright package if needed. It checks portrait gating, orientation changes, all chapter panel geometries, reader scrolling, modal layering, localization and desktop availability. Isolated portrait-rendering diagnostics can disable only the orientation script; production pages always include it.
