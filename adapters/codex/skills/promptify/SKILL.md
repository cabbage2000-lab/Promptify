---
name: promptify
description: Convert short developer intent into structured Codex task workflows with direct execution as the preferred default.
---

# Promptify for Codex

Use Promptify when the user invokes a Promptify-like workflow or asks to convert short development intent into an executable Codex task brief.

## Shared Sources

Consult these repository-root shared sources:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/templates/*.md`

## Codex Rules

- Honor `AGENTS.md` or equivalent repository instruction files.
- Honor current session instructions, sandbox behavior, existing code style, and test conventions.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Prefer direct execution when the host supports it.
- Use prompt-only behavior when the user asks to generate a reusable brief.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Editing/direct execution modes must report changed files, behavior changes, verification result, risks, and follow-ups.
- Prompt-only mode must output the generated brief and stop.
- Review-only mode must lead with findings, include file/line references where possible, and omit a changed-file summary unless edits were explicitly requested later.
- Plan-only mode must report the staged plan, risks, tests, and rollout notes, and omit a changed-file summary unless edits were explicitly requested later.

## Command-Like Invocation

When slash commands are unavailable, interpret user phrases like these as Promptify invocations:

- `promptify: 修复登录失败提示`
- `promptify generate: 重构订单状态计算逻辑`
- `promptify review: 当前改动`
- `promptify plan: 支持团队模板覆盖`
