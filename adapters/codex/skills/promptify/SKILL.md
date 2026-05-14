---
name: promptify
description: Convert short developer intent into structured Codex task briefs and guide the user into optional execution.
---

# Promptify for Codex

Use Promptify when the user invokes a Promptify-like workflow or asks to convert short development intent into an executable Codex task brief.

## Shared Sources

Consult these shared sources. When installed through `promptify install --host=codex`, use the paths from the Promptify-managed block in `~/.codex/AGENTS.md`; when running from the repository, use these repository-root paths:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/context-discovery.md`
- `shared/templates/*.md`

## Codex Rules

- Honor `AGENTS.md` or equivalent repository instruction files.
- Honor current session instructions, sandbox behavior, existing code style, and test conventions.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Explore the smallest useful project context before filling generated briefs.
- Generate compact briefs by default using the localized required blocks from `shared/brief-standard.md`; add assumptions or a safety gate only when needed.
- Default Promptify invocation to guided prompt-first behavior: output the compact brief, then ask whether to enter execution.
- Do not edit files or run execution commands from the default invocation until the user confirms execution.
- Keep `promptify generate:` as a prompt-only compatibility alias.
- Use `promptify goal: <long-running task>` or requests for `/goal` prompt generation to output a Codex-ready `/goal` block from `shared/templates/goal.md` and stop.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Confirmed execution modes must report changed files, behavior changes, verification result, risks, and follow-ups.
- Prompt-only mode must output only the compact generated brief and stop.
- Review-only mode must lead with findings, include file/line references where possible, and omit a changed-file summary unless edits were explicitly requested later.
- Plan-only mode must report the staged plan, risks, tests, and rollout notes, and omit a changed-file summary unless edits were explicitly requested later.

## Command-Like Invocation

When slash commands are unavailable, interpret user phrases like these as Promptify invocations:

- `promptify: 修复登录失败提示`
- `promptify generate: 重构订单状态计算逻辑` (compatibility alias)
- `promptify goal: 完成 PLAN.md 的 MVP`
- `promptify review: 当前改动`
- `promptify plan: 支持团队模板覆盖`
