# Changelog

Promptify uses this file as the canonical version record. Versions follow SemVer:

- PATCH: documentation fixes, template wording tweaks, or installation note fixes.
- MINOR: new templates, modes, or notable workflow behavior.
- MAJOR: breaking layout or behavior changes.

## 0.1.0 - 2026-05-16

Initial tracked version.

### Changed

- Moved shared rules and templates into `skills/promptify/shared/` so the Claude Code skill package is self-contained.
- Updated `skills/promptify/SKILL.md` to resolve `shared/...` relative to the skill directory.
- Updated README and repository instructions to document that `shared/` must live under `skills/promptify/`.
- Updated verification commands to scan `skills/promptify/shared/templates`.

### Fixed

- Fixed the user-level install shape where linking only `skills/promptify` could omit the repository-root `shared/` directory.
