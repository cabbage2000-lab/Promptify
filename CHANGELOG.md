# Changelog

Promptify uses this file as the canonical version record. Versions follow SemVer:

- PATCH: documentation fixes, template wording tweaks, or installation note fixes.
- MINOR: new templates, modes, or notable workflow behavior.
- MAJOR: breaking layout or behavior changes.

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
