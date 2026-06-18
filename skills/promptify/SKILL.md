---
name: promptify
description: Convert short developer intent into a structured task brief, then guide the user into optional execution.
---

# Promptify

Use this skill when the user gives a short development intent (bug, feature, prototype, data analysis, iterative optimization (evolve), refactor, test, review, docs, plan, PRD, debug, handoff, or long-running goal) and you need to convert it into a structured brief or product requirement document before any code edits.

## Shared Sources

Read these files relative to this skill directory:

- `shared/brief-standard.md`
- `shared/glossary.md`
- `shared/principles.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/context-discovery.md`
- `shared/evolution-loop.md`
- `shared/template-authoring.md`
- `shared/templates/*.md`

## Default Behavior

1. Read `shared/task-routing.md`, `shared/safety.md`, `shared/context-discovery.md`, `shared/brief-standard.md`, `shared/principles.md`, and `shared/glossary.md`.
2. Classify the user's intent.
3. Explore the smallest useful project context per `shared/context-discovery.md`.
4. Confirm task type and risk level.
5. Select the matching template from `shared/templates/`.
6. Generate a compact brief with the localized required blocks from `shared/brief-standard.md`; fill each block so the brief reflects the four principles in `shared/principles.md`; add assumptions or a safety gate only when needed.
7. For prd-only mode, generate the PRD from `shared/templates/prd.md` and stop.
8. For handoff-prompt mode, generate the continuation prompt from `shared/templates/handoff.md` and stop.
9. Output the generated brief first.
10. Ask the user whether to enter execution.
11. Do not edit files or run execution commands before confirmation.
12. If confirmed and high-risk signals are present, use analysis-first mode and require confirmation before destructive edits.
13. If confirmed and no high-risk signals are present, execute the brief.
14. After execution, report changed files, behavior changes, verification result, risks, and follow-ups.

## Modes

Map the user's natural-language request to one of these modes:

- prompt-only: user asks for the brief only. Output the brief and stop.
- review-only: user asks for code review or audit. Findings first, no edits unless explicitly requested later.
- plan-only: user asks for an implementation plan or staged design. Produce the plan via `shared/templates/plan.md` and stop.
- prd-only: user asks to turn current context into a PRD. Produce the PRD via `shared/templates/prd.md` and stop; do not publish to an issue tracker.
- goal: user describes a long-running task or asks for a host-ready `/goal` prompt. Produce only the goal block from `shared/templates/goal.md` and stop.
- handoff-prompt: user asks to continue current work in a new session (context near full, host model drifting). Produce only the handoff prompt from `shared/templates/handoff.md` and stop.
- analysis-first: enforced automatically when high-risk signals from `shared/safety.md` are present.

## Rules

- Honor `CLAUDE.md`, project memory, repository conventions, existing code style, and relevant test commands.
- Preserve unrelated user changes.
- Use terminology from `shared/glossary.md` consistently in generated briefs and maintenance work.
- Every generated brief must reflect the four principles in `shared/principles.md`: think before coding, simplicity first, surgical changes, and goal-driven verification.
- Generate the brief in the user's input language; keep technical identifiers, commands, paths, package names, and framework names in their original form.
- Do not perform destructive edits without explicit confirmation.
- Final reports must include changed files, behavior changes, verification result, risks, and follow-ups.
