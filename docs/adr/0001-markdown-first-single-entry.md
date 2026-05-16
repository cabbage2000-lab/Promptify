# ADR 0001: Markdown-First Single Entry

## Status

Accepted.

## Context

Promptify converts short developer intent into a structured, context-aware brief. The project works best when its behavior is easy to inspect, edit, and copy as Markdown.

The repository already has a clear product boundary:

- one skill entry point at `skills/promptify/SKILL.md`
- shared rules and templates under `skills/promptify/shared/`
- no runtime service, web UI, database, telemetry, MCP server, npm CLI, or non-Claude-Code adapter

Expanding into installers, host abstractions, generated registries, or multiple adapters would make the project harder to reason about and would move maintenance effort away from the brief quality itself.

## Decision

Promptify remains Markdown-first and single-entry:

- `skills/promptify/SKILL.md` is the only skill entry point.
- Platform-neutral behavior lives in `skills/promptify/shared/`.
- Promptify-specific routing and behavior live in `skills/promptify/SKILL.md`.
- Documentation records product boundaries and rationale instead of adding runtime enforcement.
- The repository does not add an npm CLI, package manager workflow, web UI, hosted service, cloud sync, telemetry, MCP indexer, slash commands, or non-Claude-Code adapter.

## Consequences

This keeps Promptify easy to audit and adapt. Users can read the exact behavior in Markdown and modify rules without learning a runtime.

The trade-off is that installation and host registration stay manual. That is acceptable because automatic installation is not the core value of Promptify; the core value is producing a high-quality brief before execution.

Future proposals that add runtime surface should first explain why Markdown instructions cannot express the same behavior. If they mainly improve distribution convenience, they remain out of scope.
