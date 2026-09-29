# Book transition

The editable production artwork is `site/assets/transition-book.svg`: blank warm paper, a cover, page edges and spine shading. Desktop, mobile and both languages share this file. There is no generated template, illustration, title font or language-specific book asset.

Only atlas-to-chapter entry plays the book sequence (1800 ms desktop, 1450 ms mobile). The book is 1.5 times the original size; its outer edges extend beyond the viewport. Entering the reading and returning to the atlas use a 280 ms fade. Reduced motion skips both effects.

`site/scripts/page-transition.js` handles navigation markers, cached-page restoration and compatibility. Browsers with same-document but no cross-document View Transitions preload the chapter in a temporary iframe before turning the book. Browsers without snapshot support use an opacity fade. Keep this fallback: it is required for file previews and browser compatibility.

Checks: `node tools/test_page_transition.cjs` and `node tools/test_book_turn.cjs`.
