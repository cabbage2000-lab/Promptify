---
name: promptify
description: Convert short developer intent into structured Claude Code task workflows with direct execution as the default.
---

# Promptify for Claude Code

Use Promptify when the user invokes `/promptify` commands or asks to convert a short development intent into an executable task brief.

## Shared Sources

Consult these shared files:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/templates/*.md`

## Claude Code Rules

- Honor `CLAUDE.md`, project memory, repository conventions, existing code style, and relevant test commands.
- Preserve unrelated user changes.
- Default `/promptify` to direct execution.
- Keep `/promptify:generate` prompt-only.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Final reports must include changed files, behavior changes, verification result, risks, and follow-ups.
