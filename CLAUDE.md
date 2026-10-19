@AGENTS.md

## Claude Code & OpenCode Specific Notes

- Always check `notes/plan.md` and `notes/xhs-sources.md` before adding or modifying scenes.
- When the user says "我又点赞了几个帖子，薅下来复刻进仓库", follow the 4-stage pipeline in `AGENTS.md`:
  1. Read the user's `点赞` tab via `$xiaohongshu-local` (`tools.browser` in-place modal click).
  2. Extract keyframes and palette via `workflow/extract-evidence.mjs` / `$reverse-engineer-anything`.
  3. Build the deterministic Canvas 2D scene under `app/scenes/` using `$animate` and `$emil-design-eng`.
  4. Verify side-by-side at `http://127.0.0.1:4318/` before committing and pushing.
