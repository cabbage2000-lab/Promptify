---
name: promptify
description: Convert short developer intent into structured Claude Code task briefs and guide the user into optional execution.
---

# Promptify for Claude Code

Use Promptify when the user invokes `/promptify` commands or asks to convert a short development intent into an executable task brief.

## Shared Sources

Consult these repository-root shared files:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/context-discovery.md`
- `shared/templates/*.md`

## Claude Code Rules

- Honor `CLAUDE.md`, project memory, repository conventions, existing code style, and relevant test commands.
- Preserve unrelated user changes.
- Explore the smallest useful project context before filling generated briefs.
- Generate compact briefs by default using the localized required blocks from `shared/brief-standard.md`; add assumptions or a safety gate only when needed.
- Default `/promptify` to guided prompt-first behavior: output the compact brief, then ask whether to enter execution.
- Do not edit files or run execution commands from `/promptify` until the user confirms execution.
- Keep `/promptify:generate` as a prompt-only compatibility alias.
- Use `/promptify:goal <long-running task>` to generate a host-ready `/goal` prompt from `shared/templates/goal.md`; output only the goal block and stop.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Final reports must include changed files, behavior changes, verification result, risks, and follow-ups.
