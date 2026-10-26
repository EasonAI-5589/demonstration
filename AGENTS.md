# Demonstration — Agent Operating Guide

## Current user workflow (2026-10-26)

- Discover through Zhihu, WeChat public articles, or user-supplied references; user reviews candidates before implementation. Xiaohongshu skills and automation are disabled. Historical links remain provenance only.
- The gallery now contains 12 scene families / 13 presets. Additions register in app/new-scenes.js, with original frames and manifest.json under assets/references/<scene-id>/.
- Use actual REA source/runtime evidence and record its IDs in notes/measurements/. GIF decoding and pixel measurement may use separate ordinary tools; identify those separately. Do not imply video pixels recovered source code or hidden state.
- Preserve deterministic elapsed/state rendering, reverse seeking, original-frame comparison and reduced-motion support. Respect each original's aspect ratio and measured duration.
- Treat pixel differences as pixel differences, not reconstruction percentages. No unmeasured FPS/SSIM claims. Commit and push when the user requests it; the user authorized publishing this six-scene expansion on 2026-10-26.

## What This Project Is

**Demonstration** is an interactive Canvas 2D motion-engineering gallery and reconstruction workbench. It turns reviewed visual references into zero-dependency interactive HTML5 Canvas 2D implementations, with measured source attribution and explicit reconstruction limits:

```text
1. Human Discovery & Review (知乎 / 微信公众号 / 用户给定参考)
   ↓
2. REA Evidence + Separate Image Measurement (原始帧、源码或运行取证 → notes/measurements/)
   ↓
3. Native Canvas reconstruction + controlled browser comparison (记录测量与推断，保留实际像素差与限制)
   ↓
4. Side-by-Side Verification (同屏比较原始关键帧与 Canvas，记录多时刻结果)
```

## Repo Map

| Path | Purpose |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Cross-agent instructions and workflow SOP |
| `notes/plan.md` | Live checklist of scenes and workflow milestones |
| `notes/decisions.md` | Append-only architectural & motion-parameter decision log |
| `notes/xhs-sources.md` | Provenance registry of Xiaohongshu discoveries (`feed_id`, author, palette, metrics) |
| `workflow/extract-evidence.mjs` | Legacy single-frame extractor and image audit (`ffmpeg` / `rea`; image audit uses macOS `sips`) |
| `app/index.html` / `app/style.css` | Unified multi-scene Gallery + Side-by-Side Reference Inspector shell |
| `app/gallery.js` | Scene router, timeline controller, speed/loop transport, and reference overlay toggle |
| `app/spider/` | Scene 01: Prompt Spider (`studio.prompt` original + `inferencenet.harness` edition) |
| `app/scenes/rea-decompiler.js` | Scene 02: `REA · BYTES IN. SOURCE OUT.` dual-ring disasm/decomp handoff console |
| `app/scenes/kessler-orbital.js` | Scene 03: `KESSLER WATCH // CONJUNCTION DESK` 3D LEO orbital collision avoidance desk |
| `app/scenes/stanford-torus.js` | Scene 04: `STANFORD AI LAB / DISCOVERY ARCHITECTURE` 3D torus connectome & cognitive stack |
| `app/scenes/subs-teardown.js` | Scene 05: `SUBS → LOCAL // $300/mo → $0/mo` JEV dome filter & REA teardown console |
| `app/scenes/jev-isometric.js` | Scene 06: `Jev: System One` warm-gold isometric mechanical schema reader |
| `assets/references/` | Compressed WebP/PNG reference keyframes (<300 KB each) for side-by-side comparison |
| `server.mjs` | Zero-dependency Node.js HTTP server (`PORT=4318`, binds `127.0.0.1`) |

## Standard Reconstruction Workflow (How to Add a New Scene)

1. **Discover**: Use Zhihu / WeChat articles or explicitly supplied references, attribute the creator and record media availability. Xiaohongshu automation is disabled; notes/xhs-sources.md is historical only.
2. **Extract Evidence (`workflow/extract-evidence.mjs` + `$reverse-engineer-anything`)**:
   - Decode supplied video/GIFs, sample real frames, and document geometry/time measurements separately. The legacy extractor selects one frame; it does not automatically recover palettes or layouts.
   - For web/JS targets, use REA's advertised input schemas for source analysis or controlled browser capture. Record actual Evidence IDs and coverage limitations.
3. **Reconstruct & Polish (`$animate` / `$emil-design-eng` / `$animation-performance`)**:
   - Implement a deterministic `renderScene(ctx, state)` module in `app/scenes/<scene-id>.js` accepting `(elapsed, duration, reducedMotion, interactiveState)`.
   - Use composite-friendly transforms, physical spring/bezier easing, and deterministic seeded PRNG so scrubbing the timeline (`←` / `→` or slider) reproduces the exact frame at any timestamp $t$.
4. **Verify (`$verification-before-completion`)**:
   - Open `http://127.0.0.1:4318/?scene=<scene-id>&compare=1` in `tools.browser`, compare the live Canvas against the reference keyframe, and run `npm test`.

## Commands

```bash
npm start                                  # Start gallery server on http://127.0.0.1:4318
PORT=4318 node server.mjs                  # Explicit port start
npm test                                   # Run deterministic motion & server tests
node workflow/extract-evidence.mjs --help  # Run evidence extractor on a new video/frame
```

## HARD RULES

1. **No Raw Video Binaries or Secrets in Git**: Never commit raw videos, large GIFs, cookies, `xsec_token`, or API keys. Check each reference asset stays below 2 MB; Git hooks are local and are not assumed to be installed after cloning.
2. **Deterministic Timeline Scrubbing**: Every scene must be a pure function of `(elapsed, state)` so pausing and dragging work across all scenes.
3. **Zero Frontend Build Step**: Pure ES modules + HTML5 Canvas 2D. Refreshing the browser reflects changes immediately.
4. **Respect `prefers-reduced-motion`**: All scenes must support pausing and dampening high-frequency motion when `reducedMotion` is active.
