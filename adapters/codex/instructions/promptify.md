# Promptify Codex Fallback Instructions

Use this file when Codex cannot load a dedicated Promptify command.

## Usage

- Direct execution: `promptify: <short task>`
- Prompt-only generation: `promptify generate: <short task>`
- Review: `promptify review: <scope>`
- Plan: `promptify plan: <feature or goal>`

## Behavior

1. Read the repository-root shared files: `shared/task-routing.md`, `shared/safety.md`, and `shared/brief-standard.md`.
2. Select the relevant template from `shared/templates/`.
3. Apply Codex-specific rules:
   - inspect the workspace first;
   - preserve unrelated user changes;
   - follow `AGENTS.md` and session instructions;
   - verify with relevant commands;
4. Editing/direct execution modes must report changed files, behavior changes, verification result, risks, and follow-ups.
5. Prompt-only mode must output the generated brief and stop.
6. Review-only mode must lead with findings, include file/line references where possible, and omit a changed-file summary unless edits were explicitly requested later.
7. Plan-only mode must report the staged plan, risks, tests, and rollout notes, and omit a changed-file summary unless edits were explicitly requested later.
8. For high-risk inputs, start with analysis and request explicit confirmation before destructive edits.
