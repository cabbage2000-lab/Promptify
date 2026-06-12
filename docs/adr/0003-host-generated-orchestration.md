# ADR 0003: Host-Generated Orchestration For Evolve

## Status

Accepted.

## Context

The evolve task type maps the SIA self-improvement pattern onto Claude Code
primitives: a Workflow script for the deterministic generational loop and two
custom subagents (`evolve-meta`, `evolve-feedback`) for the roles. Those
artifacts are executable surface. ADR 0001 keeps this repository
Markdown-first with a single skill entry point.

Shipping prebuilt workflow scripts or agent definition files inside this
repository would create a second product surface: versioned executable code
whose content depends on each target task anyway — the artifact, the
evaluation contract, and the budget differ per run.

## Decision

- `skills/promptify/shared/evolution-loop.md` describes the orchestration
  contract in Markdown: role mapping, evaluation contract, artifact layout,
  subagent skeletons, workflow script contract, guardrails, and final
  report. The contract names Claude Code primitives but carries a sequential
  host fallback, keeping `shared/` behavior portable per ADR 0001.
- This repository does not ship `.claude/workflows/` scripts or
  `.claude/agents/` definition files.
- At execution time, the host assistant generates these files inside the
  user's target project, after the user confirms the cost notice in the
  brief.

## Consequences

Generated orchestration quality depends on the host model following the
contract, so `shared/evolution-loop.md` must state the role definitions,
artifact layout, scoring schema, and stop conditions precisely. In exchange,
the repository stays auditable Markdown, and users keep full ownership of the
orchestration files generated in their own projects. Future proposals to
ship prebuilt orchestration files in this repository should first explain why
a host-generated, per-task artifact is insufficient.
