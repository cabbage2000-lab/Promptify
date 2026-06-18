# Changelog

Promptify uses this file as the canonical version record. Versions follow SemVer:

- PATCH: documentation fixes, template wording tweaks, or installation note fixes.
- MINOR: new templates, modes, or notable workflow behavior.
- MAJOR: breaking layout or behavior changes.

## 0.5.0 - 2026-06-18

### Added

- Added the `handoff` task type for session continuation when a Claude Code or Codex session nears its context limit and the host model starts to drift. The new `skills/promptify/shared/templates/handoff.md` template compresses the current session's progress into a single paste-ready continuation prompt with goal-style English labels (`Context to read first`, `Progress so far`, `Where it stopped`, `Next`, `Constraints`, `Done when`, `Stop if`) so a fresh window with no prior memory can resume. It is read-only: it reviews current session history and does minimal project discovery, never edits files or runs execution commands.
- Added a `handoff-prompt` mode; added handoff routing cues, a disambiguation note, and examples to `skills/promptify/shared/task-routing.md`; added a Handoff-prompt mode section and a non-compact-brief note to `skills/promptify/shared/brief-standard.md`; added Handoff prompt and Handoff-prompt mode terms to `skills/promptify/shared/glossary.md`; added a Handoff (session continuation) entry to `skills/promptify/shared/context-discovery.md`; recorded ADR 0004 (add handoff task type); and registered the template across `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, and `README.zh-CN.md`.

## 0.4.0 - 2026-06-12

### Added

- Added the `evolve` task type for score-driven iterative optimization, mapping the SIA self-improvement pattern onto Claude Code primitives: a host-generated Workflow script holds the deterministic generation loop and two host-generated subagents (`evolve-meta`, `evolve-feedback`) hold the roles. The new `skills/promptify/shared/templates/evolve.md` template restates "tune X" as an artifact / evaluation-contract / budget triple, requires explicit scoring (executable command first, fixed-rubric LLM judge fallback), evolves copies under `evolve-runs/` only, and writes the best generation back only after user confirmation.
- Added `skills/promptify/shared/evolution-loop.md` describing the orchestration contract (role mapping, artifact layout, subagent skeletons, workflow script contract, guardrails, final report); added evolve routing cues, a disambiguation note, and an example to `skills/promptify/shared/task-routing.md`; added an Evolve entry to `skills/promptify/shared/context-discovery.md`; added Evolution loop and Evaluation contract terms to `skills/promptify/shared/glossary.md`; recorded ADR 0003 (host-generated orchestration); and registered the template across `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, and `README.zh-CN.md`.

## 0.3.0 - 2026-06-09

### Added

- Added the `data analysis` task type for ad-hoc data analysis and exploration (EDA), where the deliverable is a conclusion, insight, chart, or report rather than production code. The new `skills/promptify/shared/templates/data-analysis.md` template restates a vague "analyze the data" request as a verifiable analytical question, makes data assumptions (grain, metric definitions, time range, dedup, filters) explicit, and defaults to reproducible analysis with data-integrity self-checks and no over-interpretation, relaxing only for obviously one-off explorations.
- Added data analysis routing cues, a disambiguation note, and an example to `skills/promptify/shared/task-routing.md`; added a Data analysis entry to `skills/promptify/shared/context-discovery.md`; and registered the template across `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, and `README.zh-CN.md`.

## 0.2.0 - 2026-06-03

### Added

- Added the `prototype` task type for building a throwaway UI prototype before committing to a design. The new `skills/promptify/shared/templates/prototype.md` template scopes to the UI branch only — several radically different UI variations switchable on one route via `?variant=` and a floating switcher — and defers logic/state prototyping to the executor with one clarifying question.
- Added prototype routing cues and an example to `skills/promptify/shared/task-routing.md`, a Prototype (UI) entry to `skills/promptify/shared/context-discovery.md`, and registered the template across `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, and `README.zh-CN.md`.

## 0.1.0 - 2026-05-16

Initial tracked version.

### Changed

- Moved shared rules and templates into `skills/promptify/shared/` so the Claude Code skill package is self-contained.
- Updated `skills/promptify/SKILL.md` to resolve `shared/...` relative to the skill directory.
- Updated README and repository instructions to document that `shared/` must live under `skills/promptify/`.
- Updated verification commands to scan `skills/promptify/shared/templates`.

### Fixed

- Fixed the user-level install shape where linking only `skills/promptify` could omit the repository-root `shared/` directory.
