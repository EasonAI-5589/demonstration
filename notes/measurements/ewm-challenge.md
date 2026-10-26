# ewm-world · ewm-holo · ewm-city · ewm-tracks · ewm-stack — source and motion measurements

Source: [Economic World Model Challenge](https://adamleopold.github.io/ewm-challenge/) (index, `holobit.html`, `agentic-city.html`, `tracks.html`)
Attribution: EWM Challenge, hosted by NTU GIFTS & Nanyang Business School; site by Yuhang (Adam) Lu (challenge coordinator). Kenney (CC0) models are used by the original 3D scene and are not redistributed here.
Retrieved: 2026-10-26 with REA 6.8.0 (`capture_browser_scenario`, Chromium 156 launched and owned by REA).
Source SHA-256: `assets/js/fx.js` `2d2ca2ff9e53905a00a64250036a914f84cd64416118ccb7edd41c77a8edb4cd` (53,855 bytes); `assets/js/stack3d.js` `98b8f6e76d817b2d1c81d9142c58e08b1fd6901ac84f7a0206ed5b3122e8e36c` (72,786 bytes).

## Observed (from recovered source and controlled browser captures)

The page's data visuals are five canvases, all recovered as JavaScript source rather than inferred from pixels:

| Gallery scene | Original | Canvas | Source |
| --- | --- | --- | --- |
| `ewm-world` | index hero, `canvas.hero-fx[data-fx=world]` | 1280 × 989 behind a 720 px viewport | `fx.js` `worldFX` |
| `ewm-holo` | `holobit.html` hero, `[data-fx=holo][data-quiet]` | 1280 × 890 | `fx.js` `holoFX` (quiet) |
| `ewm-city` | `agentic-city.html` hero, `[data-fx=city][data-quiet][data-cy=.7]` | 1280 × 890 | `fx.js` `cityFX` (quiet) |
| `ewm-tracks` | `tracks.html` (`body[data-lite]`): `fx-top[data-fx=terminal][data-span=.9]` 614 × 417, `holo` 614 × 720, `holo[data-variant=risk]` 742 × 720, `city.flip[data-cx=.79][data-cy=.72][data-scale=.66]` 972 × 720 | three clip-path panels, `--lean: 10.63vh` | `terminalFX`, `holoFX`, `holoFX` risk, `cityFX` |
| `ewm-stack` | index `.scene-stack` pinned section (`--len: 520vh`), `canvas.stack-gl` | WebGL, three.js 0.160 + UnrealBloom | `stack3d.js` |

- `worldFX`: 1100 Fibonacci-sphere dots, R = 0.36 · min(w, h), centre (0.68w, 0.52h), rotation `t·0.08` about y and −0.32 about x; 30 agent arcs (15 % green, 15 % violet, 30 % white, 40 % ice) retargeting every 1.35 progress units with a 0.22 lift; 12 breathing glyphs (person, household, candles, chart, factory, bank, home, coin) on 7–11 s cycles.
- `holoFX`: candles 7 px wide on a 13 px step scrolling at 16 px/s, price `sin(0.11k)·0.55 + sin(0.037k+1.3)·0.9 + sin(0.29k)·0.18 + sin(0.71k)·0.07`, a 5-candle moving average, 26 (quiet) / 22 (lite) / 36 liquidity curves, 22 rising bokeh. Track 2 replaces candles with 90 lending positions on a health-factor axis; a `max(0, sin(0.35t))·0.06` stress wave pushes them through the HF 1.00 line, where they flash and respawn.
- `terminalFX`: on the tracks page the canvas is 614 × 0.9 = 552.6 px wide (< 560), so it runs its `narrow` branch: one wide ETH/USDC price chart, no depth, book or tape panels.
- `cityFX`: a 13 × 13 (11 × 11 quiet) street grid, ~80 % of cells built, height falling off from the centre, 12 % lit roofs; 60 (30 quiet) agents with 10-frame trails; a scenario ping every 1.6 s lasting 3.2 s.
- `stack3d.js`: 14 camera keyframes `[progress, target, radius, azimuth, elevation, layer]` interpolated by Catmull–Rom with log-space radius; reveal curves per layer (L1 folds into an orb from p = 0.08; L2 from 0.10; neural lines from 0.33; L3 from 0.38; L4 from 0.53; lettering from 0.71); layer gaps E3/E4 open to 5 units while visited and close after p = 0.72. L3 is MARKET CLEARING plus AUCTIONS, MATCHING, PRICES, ACCOUNTING, BUDGETS, POLICY RULES, INSTITUTIONS on r = 4.3; L4 is a BEHAVIOUR / DATA / LEARNED ENV armillary on a 12 s converge–hold–drift cycle beside 12 real-data bars and a fitting curve.
- Scroll progress, read from `.scene-stack` style `--p` after each PageDown: 0.0331, 0.2580, 0.4828, 0.7077, 0.9326 (+0.2249 per page).

## Reconstruction and limits

- Constants, colours, geometry and motion formulas are taken from the recovered source; text and layout over the canvases come from the captured DOM and screenshots.
- The originals mutate per-frame state seeded by `Math.random()`. Here random choices come from a seeded PRNG or `hash(item, cycle)`; arcs, glyphs, bokeh, pings and trails use closed forms of elapsed time; Track 2 health factors and the L2 agent behaviour (wander → errand or chat → dock → release) are re-stepped at 30 Hz from t = 0. Drawing is therefore a pure function of `(elapsed, reducedMotion, pointer)` and repeats after reverse seeks. Individual random draws (which dot an arc targets, which building an agent visits) are not the site's draws.
- `ewm-stack` maps the timeline to scroll progress (p = elapsed / 24 s) and uses elapsed time as the animation clock. Painter's sorting replaces the depth buffer, additive strokes and a few shadow glows replace UnrealBloom, and Kenney's GLB people and buildings are replaced by shaded low-poly boxes. Dragging the finished model is not reproduced.
- Not reconstructed: the product screenshot / chat panel over the Agentic City hero and the tracks page's background video (images of another application), the WebGL "ghost" copy behind the foundation section, and the site's web fonts (the gallery stays zero-dependency, so system fonts change text widths).
- Pointer: the gallery passes the pointer unsmoothed; the globe and city tilt with it and the liquidity surface rises under it, as on the site.
- Reduced motion: as on the site, the 2D scenes hold one frame at t = 3 s. `ewm-stack` still follows the timeline's scroll progress but holds its clocks.

## REA evidence

- Page DOM, accessibility tree and screenshot (REA default reduced-motion environment): `ev_db83bf9f8d94889c894acdd9602daf1b66fb3a7552d8d02bd50f798a279ecbe7`.
- Network bodies for index, `fx.js`, `config.js`, `pages.js`, `i18n.js`, `main.css`: `ev_c890f5cbe821a3731a00a883a6a0094656fefa076e13ea38d2924c7b323f200a`. `stack3d.js` exceeded the default 64 KiB body budget (`ev_c0c32367a854ee81a127777b0561f94a75d078e6e910ebe0617dacfbdb3794d1`) and was retained with a raised limit: `ev_c572823919b3bfbf293650b447853a88abd3e5d29847a503c5c947ca2b8d14f1`.
- Reference frames with `reduced_motion: no-preference`: index hero `ev_3e59f4a8f18411a272ca7a7a534720dd754d463e23e22e59963513793d98be73`, HoloBit `ev_347eeea09a2bc340fe92f7f09b0aedc13e708d154e55d4fe6b1094473d545ee3`, Agentic City `ev_0d2e0162f95cab5005fce9072a5bda4d0d58ad48fd5e6a44d601d9d4a0be4243`, tracks `ev_c75a10f7dd71ae4969802af526f43582ac88b66d65717d7db17252ac4949fb00`, pinned 3D scene (12 PageDowns) `ev_9ebdc91b47de98904b980942f036900f59c24636ee433333e26ae26895f4ace2`, and its `--p` readings `ev_7d51e0635c1100af261f1069b5fb2354654a7aff144ef241ed31f4e58db6d016`.
- The 3D-scene capture exceeded REA's 10 MiB MCP response budget and was exported as a retained bundle (32 MB, 9 records, 0 unknowns). It stays outside Git with the raw PNG screenshots.
- All REA browsers reported `terminated-owned-process`. Frame timestamps in the manifests are REA capture-clock seconds since navigation start; the site's own FX clock starts during page load, so the offset between the two is not measured. `ewm-stack` frames are placed at measured scroll progress × 24 s.

## Reference comparison

Compressed original frames and their timestamps are in `assets/references/<id>/manifest.json` (WebP, 32–76 KB each). Pixel differences were computed in Chromium with `getImageData` (ordinary tooling, not REA) between each original frame and the scene rendered at the same timestamp, over the full 1280 × 720 frame, threshold 12 on the max channel difference:

| Scene | Frames | Changed ratio | Mean abs. difference (0–255) |
| --- | --- | --- | --- |
| `ewm-world` | 7 | 0.115–0.117 | 14.2–14.3 |
| `ewm-holo` | 6 | 0.168–0.171 | 14.4 |
| `ewm-city` | 6 | 0.382–0.385 | 19.2–19.4 |
| `ewm-tracks` | 6 | 0.267–0.285 | 16.0–17.0 |
| `ewm-stack` | 5 (p = .03 / .26 / .48 / .71 / .93) | 0.270 / 0.748 / 0.715 / 0.262 / 0.557 | 12.3 / 33.3 / 46.2 / 15.9 / 31.0 |

These are pixel differences, **not** fidelity percentages, SSIM or perceptual measures. They include font substitution, unmatched random draws and animation phases, the missing overlays above, and, for `ewm-stack`, solid GLB models and bloom replaced by boxes and strokes.
