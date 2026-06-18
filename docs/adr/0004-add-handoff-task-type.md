# ADR 0004: Add Handoff Task Type

## Status

Accepted

## Context

Long Claude Code or Codex sessions accumulate context until the host model drifts and task quality drops. Promptify had no supported way to package the current session's progress into a prompt the user can paste into a fresh window to continue the same task. Doing this by hand loses verified progress, locked-in decisions, and stopping points.

`goal` prompts (see `skills/promptify/shared/templates/goal.md`) start a durable long-running task from scratch, but they do not capture in-flight progress. PRDs freeze requirements; they do not resume execution. Neither bridges an ongoing session into a new one.

## Decision

Add a `handoff` task type and a `handoff-prompt` mode. Triggered by `/promptify:handoff`, `promptify handoff:`, or natural-language continuation cues (换会话继续, context handoff, continue in new session), it outputs a single paste-ready continuation prompt and stops. The prompt follows goal-style English labels (`Context to read first`, `Progress so far`, `Where it stopped`, `Next`, `Constraints`, `Done when`, `Stop if`) so a fresh session with no prior memory can resume.

Handoff is read-only: it reviews current session history and does minimal project discovery per `shared/context-discovery.md`; it never edits files or runs execution commands. It is the session-continuation counterpart to goal-prompt mode.

## Consequences

- Adds a new template, routing row, mode, glossary terms, ADR, and README examples, consistent with how `goal`, `data-analysis`, and `evolve` were introduced.
- Handoff prompts are not compact briefs and do not enter execution, matching the existing goal/PRD boundary.
- Out of scope: auto-detecting context drift or proactively prompting the user to hand off. Handoff stays purely user-triggered, in line with the product's manual-control stance recorded in `docs/adr/0001-markdown-first-single-entry.md`.
