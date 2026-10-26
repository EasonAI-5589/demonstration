# Cyber Motion Lab — Implementation Plan

## 2026-10-26 — EWM Challenge web visuals

- [x] User supplied https://adamleopold.github.io/ewm-challenge/ and chose to reconstruct all five data visuals as gallery scenes.
- [x] REA: recover `fx.js` / `stack3d.js`, capture DOM, original frames (motion allowed) and scroll progress; record Evidence IDs.
- [x] Port worldFX, holoFX (quiet + risk), terminalFX, cityFX and the three.js layer stack to deterministic Canvas 2D (scenes 13–17).
- [x] Reference frames + manifests; full-frame pixel differences recorded in notes/measurements/ewm-challenge.md.
- [x] Pull request requested by the user (Haohaha-11).

## 2026-10-26 — WeChat inspiration expansion

- [x] User confirmed shortlist 01–06; Xiaohongshu automation disabled.
- [x] Decode attributed originals and retain REA evidence with measured/inferred boundaries.
- [x] Add Bauhaus, mirror array, grid rhythm, digital organism, Poseidon fountain and streaming diagram.
- [x] Preserve original aspect ratios/durations and synchronize original reference frames to the timeline.
- [x] Verify deterministic reverse seeking, source assets, legacy switching and six browser previews.
- [x] Local review page and screenshots delivered. Subsequent commit/push authorization is recorded below; no claim of photographic or perceptual equivalence.
- [x] User requested committing and pushing all six additions, source attribution, REA analysis notes and README on 2026-10-26. Git history is the publication record.

- [x] **Phase 1: Repository Scaffolding (`new-repo-scaffold`)**
  - [x] `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`, `notes/`
  - [x] Pre-commit hook blocking `.mp4` binaries (>2 MB) and credentials
  - [x] Initial scaffolding commit
- [x] **Phase 2: Evidence Extraction & Reference Assets (`workflow/`)**
  - [x] Compress 6 reference keyframes into `assets/references/*.jpg` (<410 KB each)
  - [x] Write `workflow/extract-evidence.mjs` CLI for future video/bundle frame & palette extraction
- [x] **Phase 3: Multi-Scene Interactive Canvas Gallery (`app/`)**
  - [x] Scene 01 (`spider-inet` & `spider-studio`): Prompt Spider (Studio + InferenceNet Econometric & RSI)
  - [x] Scene 02 (`rea-decompiler`): `REA · BYTES IN. SOURCE OUT.` dual-ring disasm/decomp handoff console
  - [x] Scene 03 (`kessler-orbital`): `KESSLER WATCH // CONJUNCTION DESK` 3D LEO orbital collision avoidance desk
  - [x] Scene 04 (`stanford-torus`): `STANFORD AI LAB / DISCOVERY ARCHITECTURE` 3D torus connectome
  - [x] Scene 05 (`subs-teardown`): `SUBS → LOCAL // $300/mo → $0/mo` JEV dome filter & subscription teardown
  - [x] Scene 06 (`jev-isometric`): `Jev: System One` warm-gold isometric mechanical schema reader
- [x] **Phase 4: Verification & GitHub Delivery**
  - [x] Run deterministic tests (`npm test`) and verify all 6 scenes in `tools.browser` on `http://127.0.0.1:4318/`
  - [x] Push repository to `https://github.com/EasonAI-5589/cyber-motion-lab`
