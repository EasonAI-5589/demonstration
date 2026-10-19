# Cyber Motion Lab — Agent Operating Guide

## What This Project Is

**Cyber Motion Lab** is an interactive Canvas 2D motion-engineering gallery and reconstruction workbench. It operationalizes a 4-stage closed-loop workflow for turning viral UI/telemetry motion designs (discovered on Xiaohongshu / X / Web) into zero-dependency, 60fps interactive HTML5 Canvas 2D implementations:

```text
1. Human Discovery (人找灵感：小红书点赞/收藏或网页 URL)
   ↓
2. REA & Frame Evidence Extraction (REA 拆包/视频拆帧：提取色板、布局坐标、时间轴锚点与轨迹)
   ↓
3. Deterministic Canvas Reconstruction & Emil Motion Polish (原生 Canvas 2D 重建 + 弹簧/阻尼/复合层手感打磨)
   ↓
4. Side-by-Side Verification (同屏对比原片关键帧与实时 Canvas 渲染，验收通过后入库)
```

## Repo Map

| Path | Purpose |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Cross-agent instructions and workflow SOP |
| `notes/plan.md` | Live checklist of scenes and workflow milestones |
| `notes/decisions.md` | Append-only architectural & motion-parameter decision log |
| `notes/xhs-sources.md` | Provenance registry of Xiaohongshu discoveries (`feed_id`, author, palette, metrics) |
| `workflow/extract-evidence.mjs` | Automated frame-sampling, color-palette, and layout-grid extractor (`ffmpeg` + `rea`) |
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

1. **Discover (`$xiaohongshu-local`)**: Browse via the built-in real browser (`tools.browser`), never headless Docker scrapers. Record the stable `https://www.xiaohongshu.com/explore/<feed_id>` in `notes/xhs-sources.md`.
2. **Extract Evidence (`workflow/extract-evidence.mjs` + `$reverse-engineer-anything`)**:
   - For video sources: run `node workflow/extract-evidence.mjs --video <mp4> --id <scene-id>` to sample keyframes, measure bounding boxes, and extract dominant hex palettes.
   - For web/JS bundles: run `rea analyze-web-bundle <url>` or `rea capture-browser-scenario` to extract state machines and curves.
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

1. **No Raw Video Binaries or Secrets in Git**: Never commit `.mp4`, `.mov`, `.m4s`, cookies, `xsec_token`, or API keys. `.git/hooks/pre-commit` enforces a 2 MB file size ceiling and blocks secret patterns.
2. **Deterministic Timeline Scrubbing**: Every scene must be a pure function of `(elapsed, state)` so pausing and dragging the timeline works identically across all 6 scenes.
3. **Zero Frontend Build Step**: Pure ES modules + HTML5 Canvas 2D. Refreshing the browser reflects changes immediately.
4. **Respect `prefers-reduced-motion`**: All scenes must support pausing and dampening high-frequency motion when `reducedMotion` is active.
