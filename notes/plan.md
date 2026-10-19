# Cyber Motion Lab — Implementation Plan

- [x] **Phase 1: Repository Scaffolding (`new-repo-scaffold`)**
  - [x] `AGENTS.md`, `CLAUDE.md`, `README.md`, `.gitignore`, `notes/`
  - [x] Pre-commit hook blocking `.mp4` binaries (>2 MB) and credentials
  - [x] Initial scaffolding commit
- [ ] **Phase 2: Evidence Extraction & Reference Assets (`workflow/`)**
  - [ ] Compress 6 reference keyframes into `assets/references/*.webp` (<250 KB each)
  - [ ] Write `workflow/extract-evidence.mjs` CLI for future video/bundle frame & palette extraction
- [ ] **Phase 3: Multi-Scene Interactive Canvas Gallery (`app/`)**
  - [ ] Scene 01 (`spider-inet` & `spider-studio`): Prompt Spider (Studio + InferenceNet Econometric & RSI)
  - [ ] Scene 02 (`rea-decompiler`): `REA · BYTES IN. SOURCE OUT.` dual-ring disasm/decomp handoff console
  - [ ] Scene 03 (`kessler-orbital`): `KESSLER WATCH // CONJUNCTION DESK` 3D LEO orbital collision avoidance desk
  - [ ] Scene 04 (`stanford-torus`): `STANFORD AI LAB / DISCOVERY ARCHITECTURE` 3D torus connectome
  - [ ] Scene 05 (`subs-teardown`): `SUBS → LOCAL // $300/mo → $0/mo` JEV dome filter & subscription teardown
  - [ ] Scene 06 (`jev-isometric`): `Jev: System One` warm-gold isometric mechanical schema reader
- [ ] **Phase 4: Verification & GitHub Delivery**
  - [ ] Run deterministic tests (`npm test`) and verify all 6 scenes in `tools.browser` on `http://127.0.0.1:4318/`
  - [ ] Push repository to `https://github.com/EasonAI-5589/cyber-motion-lab`
