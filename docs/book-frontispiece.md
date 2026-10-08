# Book transition

The editable production artwork is `site/assets/transition-book.svg`: blank warm paper, a cover, page edges and spine shading. Desktop, mobile and both languages share this file. There is no generated template, illustration, title font or language-specific book asset.

Only atlas-to-chapter entry plays the book sequence (1800 ms desktop, 1450 ms mobile). The book is 1.5 times the original size; its outer edges extend beyond the viewport. Entering the reading and returning to the atlas use a 280 ms fade. Reduced motion skips both effects.

`site/scripts/page-transition.js` handles navigation markers, cached-page restoration and compatibility. Book entry prepares the destination in a temporary iframe and awaits `CHAPTER_OPENING.ready`, including artwork decoding and its first paint. This also warms the destination assets before native cross-document navigation. The compatibility path captures the prepared frame before navigating. There is no five-second artwork deadline. Browsers without snapshot support use an opacity fade. Keep this fallback: it is required for file previews and browser compatibility.

Before fading into the reading spread, prepare and paint its maps beneath the open title leaf. Do not await animation frames inside a View Transition update callback: painting is suspended there and the transition can time out.

GitHub Pages uses the existing `.nojekyll` files in the repository root and `site/` to retain the `_shared` chapter directory. Preserve the relative resource paths when publishing below a repository URL.

Checks: `node tools/test_page_transition.cjs`, `node tools/test_book_turn.cjs`, and `node tools/test_chapter_landscape_loading.cjs` (desktop/mobile, delayed artwork and a repository URL prefix).
