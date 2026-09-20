# ADR 0005: Add Brainstorm Task Type

## Status

Accepted

## Context

Promptify's routing assumes the user's intent is already a task: a bug to fix, a feature to add, a plan to stage, or a discussion to freeze into a PRD. But a frequent entry point is earlier than that — "I have an idea" with no clear goal, scope, or success criterion. Generating a compact brief at that point only freezes the ambiguity, and `prd-only` mode explicitly refuses to re-interview an already-discussed context. Nothing in Promptify bridges a vague idea to an agreed design.

The Superpowers project (obra/superpowers) ships a brainstorming skill with a proven collaborative design loop: build consensus (discover intent with one focused question at a time, reflect understanding back), classify work into spike / bounded / architectural tiers, gate all implementation behind per-step design approval, self-review designs before review, and name the anti-patterns that let scope creep in ("too simple to need design", using the bounded label to skip design work).

## Decision

Port that loop as a `brainstorm` task type and `brainstorm` mode, defined in `skills/promptify/shared/brainstorm.md`. Triggered by brainstorm cues (头脑风暴, 帮我想想, I have an idea, brainstorm) or natural vague-idea input, it runs the consensus loop, classifies the work into scale tiers (spike with throwaway output, bounded with an in-conversation short design, architectural with 2-3 options and sectioned review), enforces the design gate (no implementation action before the tier's approval; approval covers only the step it was given for; tiers upgrade, never downgrade), self-reviews architectural designs, and stops at the agreed design with an explicit handoff offer into Promptify's own outputs: `prd-only`, `plan-only`, a prompt-first brief, or direct execution of a bounded design.

Deliberately not ported from Superpowers:

- The visual companion browser tooling — a runtime service, which breaks the markdown-only boundary of `docs/adr/0001-markdown-first-single-entry.md`.
- Fixed spec file paths (`docs/superpowers/specs/...`) with mandatory commits — Promptify keeps designs in conversation unless the user asks to persist them.
- Chaining into an external `writing-plans` skill — Promptify reuses its own PRD, plan, and brief outputs as the next step instead.

## Consequences

- Adds a new shared flow file, template, routing row, mode, glossary terms (brainstorm mode, consensus loop, scale tier, design gate), context-discovery entry, ADR, and README updates, consistent with how `goal`, `handoff`, `data-analysis`, and `evolve` were introduced.
- Brainstorm sessions are conversations, not compact briefs; they start from a template contract but do not emit one until the design is agreed and the user picks a follow-up output.
- High-risk signals surfacing during brainstorming still route through analysis-first handling per `shared/safety.md`.
- Out of scope: proactive brainstorm triggering on every vague input. Brainstorm stays user-triggered or routing-triggered, keeping the manual-control stance of `docs/adr/0001-markdown-first-single-entry.md`.
