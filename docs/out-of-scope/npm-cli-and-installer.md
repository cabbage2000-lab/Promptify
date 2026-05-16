# npm CLI And Installer Are Out Of Scope

Promptify will not add an npm package, installer, updater, uninstaller, or automatic host registration flow.

## Why

The project is intentionally Markdown-first. Its value is the quality of the generated brief and the safety of the prompt-first workflow, not the mechanics of installing a package.

An npm CLI would create a permanent maintenance surface:

- package metadata and release process
- versioning and registry concerns
- install and uninstall edge cases
- host-specific filesystem behavior
- support burden unrelated to brief quality

## Existing Path

Users can clone the repository and link `skills/promptify` into a Claude Code skills directory, or place the repository where the host can load project-level skills. The `shared/` directory must live inside `skills/promptify/` so the skill package is self-contained.
