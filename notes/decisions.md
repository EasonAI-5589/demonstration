# Decision Log

## 2026-10-19 — Unified Deterministic Canvas 2D Architecture + Reference Inspector

- **Decision**: Host all 6 reconstructed scenes inside a single zero-dependency ES module gallery (`app/gallery.js`) where every scene implements a pure `render(ctx, state)` interface driven by a shared transport bar (`play/pause`, `timeline scrub`, `0.5x-4x speed`, `side-by-side reference comparison`).
- **Why**:
  1. Allows instant 1-click switching between all 6 Xiaohongshu visual inspirations without restarting servers or changing ports.
  2. Built-in side-by-side reference keyframe comparison makes the `Human -> REA -> Reconstruct -> Verify` workflow tangible right inside the UI.
  3. Pure Canvas 2D with deterministic seeded PRNG guarantees 60fps performance and exact frame repeatability when scrubbing the timeline.
- **Rejected Alternatives**:
  - Separate repositories or separate ports per scene (hard to browse and compare).
  - Bundling raw `.mp4` videos into Git (bloats repository size; we store lightweight `<250 KB` WebP keyframes in `assets/references/` and ignore `.mp4` via `.gitignore` + `pre-commit` hook).
