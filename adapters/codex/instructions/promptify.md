# Promptify Codex Fallback Instructions

Use this file when Codex cannot load a dedicated Promptify command.

## Usage

- Guided prompt-first: `promptify: <short task>`
- Prompt-only compatibility alias: `promptify generate: <short task>`
- Goal prompt: `promptify goal: <long-running task>`
- Review: `promptify review: <scope>`
- Plan: `promptify plan: <feature or goal>`

## Behavior

1. Read the repository-root shared files: `shared/task-routing.md`, `shared/safety.md`, `shared/context-discovery.md`, and `shared/brief-standard.md`.
2. Classify the input, then explore the smallest useful project context allowed by the selected mode.
3. Confirm task type and risk level after discovery.
4. Select the relevant template from `shared/templates/`.
5. Apply Codex-specific rules:
   - inspect the workspace first;
   - preserve unrelated user changes;
   - follow `AGENTS.md` and session instructions;
   - verify with relevant commands;
6. Generate compact briefs by default using the localized required blocks from `shared/brief-standard.md`; add assumptions or a safety gate only when needed.
7. Default Promptify invocation must output the compact generated brief first, then ask whether the user wants to enter execution.
8. Do not edit files or run execution commands from the default invocation until the user confirms execution.
9. Confirmed execution modes must report changed files, behavior changes, verification result, risks, and follow-ups.
10. Prompt-only compatibility mode must output only the compact generated brief and stop.
11. Goal-prompt mode must output exactly one `/goal` block from `shared/templates/goal.md` and stop; do not edit files, run commands, or ask whether to execute.
12. Review-only mode must lead with findings, include file/line references where possible, and omit a changed-file summary unless edits were explicitly requested later.
13. Plan-only mode must report the staged plan, risks, tests, and rollout notes, and omit a changed-file summary unless edits were explicitly requested later.
14. For high-risk inputs, start with analysis and request explicit confirmation before destructive edits.
