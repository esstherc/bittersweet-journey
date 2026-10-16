# Reading globe

The local globe.js uses WebGL sphere projection/lighting and packaged Natural Earth WORLD_LAND coastlines. It needs no remote map or rendering library. The flat world map remains available without WebGL.

Section one rotates slowly. Section two faces Asia and stops for readable labels: seven tenths ocean, three tenths land, Eurasia, China, Pacific, northwestern deserts and Tibetan Plateau. Washes indicate approximate geography, not administrative or precise landform boundaries. Later scenes retain the China map and three lines. The ending includes nomadic, agrarian and maritime civilizations.

Reduced motion uses a static globe; drawing stops while hidden. Compact landscape puts globe/context side by side, with independent reading scroll. Validation: tools/test_hometown_globe.cjs, using PLAYWRIGHT_MODULE if needed.
