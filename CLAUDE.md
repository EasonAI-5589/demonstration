@AGENTS.md

## Claude Code & OpenCode Specific Notes

- Check `notes/plan.md` and the relevant `notes/measurements/` record before changing scenes. Historical xhs-sources.md is provenance only; Xiaohongshu automation is disabled by the user.
- When the user says "我又点赞了几个帖子，薅下来复刻进仓库", follow the 4-stage pipeline in `AGENTS.md`:
  1. Collect references through Zhihu / WeChat or user-supplied media, and let the user review the candidates.
  2. Extract keyframes and palette via `workflow/extract-evidence.mjs` / `$reverse-engineer-anything`.
  3. Build the deterministic Canvas 2D scene under `app/scenes/` using `$animate` and `$emil-design-eng`.
  4. Verify the real original frames beside the new scene, then deliver local review. Push only when explicitly requested.
