# Codex Adapter Is Out Of Scope

Promptify will not add a Codex adapter or other non-Claude-Code adapter.

## Why

Promptify is currently a Claude Code skill repository. Adding adapters for other hosts would require host-specific behavior, installation instructions, naming, lifecycle assumptions, and verification.

That would conflict with the current product boundary:

- one skill entry point
- Markdown shared rules
- no multi-platform adapter layer

## Existing Path

The concepts in `shared/` are platform-neutral enough for humans to reuse manually, but this repository does not publish or maintain host-specific adapters outside Claude Code.
