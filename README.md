# Promptify

[简体中文](README.zh-CN.md)

Promptify is a Claude Code skill that turns brief developer intent into a structured, context-aware task brief, then lets the user decide whether to enter execution.

## Why It Exists

When a short intent such as "fix the login failure message" is handed directly to an agent, common failures include unclear scope, incorrect context, missing test expectations, or high-risk edits starting too early. Promptify generates a compact brief before execution, making the goal, mode, context, requirements, and safety gate explicit.

Promptify is not an auto-executor or installer. Its core value is giving the user and agent the same task contract before work begins.

## What It Is

- A Claude Code skill package: `skills/promptify/SKILL.md`.
- A set of shared Markdown rules and templates: `skills/promptify/shared/`.
- Coverage for common development tasks: bugfix, feature, prototyping, data analysis, evolve (iterative optimization), refactor, test, review, docs, planning, PRD, handoff (session continuation), and long-running goal prompts.

## When To Use Promptify

Promptify is most useful when the task intent is short but the project context is complex. It is especially useful for work involving permissions, authentication, security, migrations, deletion, production risk, or other high-risk changes, and for tasks that need explicit modes such as `review-only`, `plan-only`, or `prd-only`.

It also fits teams that want a consistent agent intake format, or users who want a confirmable task contract before Claude Code executes. Promptify turns a short intent into a brief with a goal, mode, context, requirements, and any needed safety gate so the user and agent align before editing.

Promptify is less useful for tiny mechanical edits, tasks where the user has already written a complete implementation plan, situations where Claude Code should immediately enter a debugging loop, or requests that need new tool or platform capabilities.

Promptify relates to Claude Code as a front-door navigator relates to an execution engine: Promptify reduces misunderstanding, controls scope, and improves verifiability; Claude Code reads code, edits files, runs tests, and debugs. The trade-off is an extra workflow step, and Promptify does not improve Claude Code's underlying execution capability.

## Behavior

- Classifies short intent and routes it to the right template via `skills/promptify/shared/task-routing.md`.
- Discovers the smallest useful project context via `skills/promptify/shared/context-discovery.md`, then generates a compact brief.
- Matches the brief language to the user's input: Chinese input produces Chinese, English input produces English; technical identifiers, commands, and paths stay unchanged.
- Routes high-risk input such as deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge into analysis-first mode; destructive edits require explicit confirmation.
- Defaults to prompt-first: output the brief first, then ask whether to execute. Users can explicitly request `prompt-only`, `review-only`, `plan-only`, `prd-only`, or `goal` mode.

## Repository Layout

```text
promptify/
  README.md
  README.zh-CN.md
  AGENTS.md
  CLAUDE.md
  docs/
    adr/
      0001-markdown-first-single-entry.md
    out-of-scope/
      codex-adapter.md
      multi-skill-split.md
      npm-cli-and-installer.md
      web-ui-or-hosted-service.md
  skills/
    promptify/
      SKILL.md
      shared/
        brief-standard.md
        context-discovery.md
        evolution-loop.md
        glossary.md
        safety.md
        template-authoring.md
        task-routing.md
        test-plan.md
        templates/
          bugfix.md
          data-analysis.md
          docs.md
          evolve.md
          feature.md
          goal.md
          handoff.md
          plan.md
          prd.md
          prototype.md
          refactor.md
          review.md
          task.md
          test.md
```

`skills/promptify/SKILL.md` references resources in its sibling `shared/` directory. Keep `shared/` under `skills/promptify/` so the resources are included when `skills/promptify` is installed as a Claude Code skill.

## Installation

Promptify is distributed as a repository. It has no npm package, installer, or automatic host registration. Put the repository where Claude Code can load the skill.

Recommended: clone the repository to a stable location, then let Claude Code load its `skills/` directory. For example:

```bash
git clone <repo-url> ~/promptify
ln -s ~/promptify/skills/promptify ~/.claude/skills/promptify
```

You can also place the whole repository inside a project as a project-level skill. In either case, keep `shared/` inside `skills/promptify/`.

## Usage

Describe your development intent in Claude Code and ask it to use the `promptify` skill. For example:

```text
Use promptify: fix the login failure message
promptify: review the current changes
promptify: turn the current discussion into a PRD
promptify: implementation plan for team template overrides
promptify: turn docs/superpowers/plans/2026-05-13-promptify-mvp.md into a long-running goal
```

The skill generates a compact brief first, then asks whether to execute. PRD mode generates the PRD and stops.

## Examples

### Quick Inputs

```text
promptify: fix the login failure message
promptify: add CSV export
promptify: refactor order status calculation without behavior changes
promptify: add tests for payment callbacks
promptify: review the current branch, focusing on security and regression risk
promptify prompt-only: turn "optimize settings page load speed" into a brief; do not execute
promptify plan-only: plan the migration from REST to GraphQL
promptify prd-only: turn "team template overrides" into a PRD
promptify: delete the old permission table and migration scripts
promptify goal: keep progressing docs/plans/cache-cleanup.md
promptify handoff: continue this work in a new session
```

### Bugfix

Input:

```text
promptify: fix the login failure message
```

Example output:

```text
Goal:
Fix the user-visible message shown when login fails, while preserving the existing login flow and error handling style.

Mode:
Generate the brief first and ask whether to enter execution.

Context:
Inspect the login entry point, error handling, existing tests, and login-related docs first.

Requirements:
Locate the source of the failed-login message and make the smallest scoped fix without changing the authentication flow. Add or update relevant tests, run the targeted verification command, and report changed files, behavior changes, verification results, risks, and follow-ups.
```

### Feature

Input:

```text
promptify: add CSV export
```

Example output:

```text
Goal:
Add CSV export support for the existing list or report, following the current product interaction and permission boundaries.

Mode:
Generate a feature brief first, then execute after user confirmation.

Context:
Inspect the relevant list view, data query layer, permission checks, existing export behavior, and test coverage first.

Requirements:
Clarify exported fields, filters, file naming, and empty-state behavior. Reuse existing data and permission logic, avoid adding a separate export service, add targeted tests, and report verification commands, behavior changes, and remaining risks.
```

### Prototype (UI)

Input:

```text
promptify: sketch a few layouts for the settings page
```

Example output:

```text
Goal:
Use a throwaway UI prototype to explore what the settings page should look like — render several structurally different layout variations on the existing settings route, switchable for side-by-side comparison, then fold the winner into the real page and delete the rest.

Assumptions:
Treated as a UI prototype (appearance only). If the question is actually about logic or state, the executor should ask one clarifying question first.

Mode:
Generate the brief first and ask whether to enter execution.

Context:
Detect and reuse the project's existing stack first — the UI framework and its router API, the component library, the styling system, and the routing convention — then locate the settings page and the data available to it.

Requirements:
Build 3 structurally different variants (different layout, hierarchy, and primary affordance — not just colors), named VariantA/VariantB/VariantC and switchable on one route via ?variant= with a floating switcher (arrow keys, URL-updating, hidden in production). Keep it throwaway: no persistence, no real mutations, no tests. Report the access URL and ?variant= keys, the winning variant, and the delete-or-absorb recommendation.
```

### Data analysis

Input:

```text
promptify: analyze last week's retention data
```

Example output:

```text
Goal:
Answer a verifiable analytical question about last week's retention with concrete numbers, stating which data and metric definitions decide the result — not a vague descriptive overview.

Assumptions:
Make data assumptions explicit first — time range, grain (what one row represents), metric definitions (how "active" and "retained" are computed), dedup and filtering rules, and whether test or internal traffic is included.

Mode:
Generate the brief first and ask whether to enter execution.

Context:
Understand the data before computing — data sources and access, schema and column meaning, sample rows and row-count magnitude, null rates and distributions, time coverage, and existing metric definitions or queries — reusing the project's existing analysis stack.

Requirements:
Keep the analysis reproducible (saved query or script) and run data-integrity self-checks (row magnitude, null rates, double-counting, join cardinality, time coverage); relax only for obviously one-off explorations and say what was relaxed. Do not over-interpret: state sample size, separate correlation from causation, and note caveats. Report the conclusion and key numbers, the data and metric definitions used, how to reproduce, the integrity checks done, and remaining limitations.
```

### Evolve

Input:

```text
promptify: optimize this classifier prompt until accuracy reaches 90%
```

Example output:

```text
Goal:
Evolve prompts/classifier.md generation by generation until the evaluation contract reports accuracy >= 0.90 on the labeled sample set, or the generation budget (3) is exhausted — delivering the best generation, the full score curve, and rerun instructions, not a one-shot rewrite.

Assumptions:
Evaluation contract: run the project's scoring script on each candidate and read accuracy from its JSON output; the untouched prompt is scored first as the gen 0 baseline. Stop on target reached, budget exhausted, or 2 consecutive generations without improvement. Adjust the budget here if needed.

Mode:
Generate the brief first and ask whether to enter execution. Executing creates .claude/agents/evolve-meta.md, .claude/agents/evolve-feedback.md, and a .claude/workflows/ loop script in this project, then runs a multi-generation, multi-agent loop — confirm the cost before launching.

Context:
The artifact to evolve and its current content, the existing scoring command and labeled data, runtime requirements, and the orchestration contract in shared/evolution-loop.md.

Requirements:
Follow shared/evolution-loop.md: evolve-meta writes generation 1; each generation is scored by the fixed evaluation command into score.json and appended to history.md; evolve-feedback then writes improvement.md and the next generation without repeating recorded failures. Evolve copies under evolve-runs/run_<id>/ only — never edit the original prompt file during the run. Report the score curve including the gen 0 baseline, the best generation and its diff against the baseline, per-generation improvement highlights, and rerun/resume instructions; write the best generation back to prompts/classifier.md only after explicit confirmation.
```

### Refactor

Input:

```text
promptify: refactor order status calculation without behavior changes
```

Example output:

```text
Goal:
Refactor order status calculation to reduce complexity while preserving existing external behavior and data results.

Mode:
Generate a refactor brief first, then execute after confirmation.

Context:
Inspect order status entry points, callers, edge cases, existing tests, and historical docs first.

Requirements:
Lock down current behavior and test baseline before making small structural changes. Do not change status enums, API responses, or database structure. Add missing edge-case tests, and report refactor scope, verification results, and compatibility risks.
```

### Review

Input:

```text
promptify: review the current branch, focusing on security and regression risk
```

Example output:

```text
Goal:
Review the current branch changes, prioritizing security, permission, data consistency, and regression risks.

Mode:
review-only; output review findings only and do not edit files.

Context:
Inspect git diff, related tests, permission boundaries, external input handling, and high-risk modules first.

Requirements:
List findings by severity with file locations, impact, and actionable fixes. If no clear issue is found, state residual risk and recommended additional verification.
```

### PRD

Input:

```text
promptify prd-only: turn "team template overrides" into a PRD
```

Example output:

```text
Problem Statement:
Teams want to maintain overrideable brief template rules for specific projects or teams while keeping the default templates available.

Solution:
Define template override loading order, scope, conflict handling, and fallback behavior.

User Stories:
As a team maintainer, I can provide custom templates for team projects and keep using defaults when no override is configured.

Implementation Decisions:
Prefer a Markdown-first override convention without introducing a service, database, or runtime sync.

Testing Decisions:
Use documentation examples and template checks to cover default behavior, override behavior, override conflicts, and missing fallback.

Non-Goals:
No web UI, cloud sync, permission system, or cross-platform adapter.

Notes:
PRD mode stops after generating the document and does not automatically enter implementation.
```

### High-Risk Task

Input:

```text
promptify: delete the old permission table and migration scripts
```

Example output:

```text
Goal:
Evaluate the deletion request for the old permission table and migration scripts, confirming impact radius and rollback path.

Mode:
analysis-first; this involves deletion, permission, and migration, so any destructive edits require explicit confirmation.

Context:
Inspect database migration history, permission callers, deployment flow, backup strategy, and test coverage first.

Requirements:
First produce an impact analysis, dependency list, verification plan, and rollback plan. Do not delete files, modify migrations, or remove permission paths without explicit user confirmation.
```

### Long-Running Goal

Input:

```text
promptify goal: keep progressing docs/plans/cache-cleanup.md
```

Example output:

```text
Goal:
Turn docs/plans/cache-cleanup.md into a durable goal prompt for staged cache cleanup work.

Mode:
goal; establish a long-running objective, phase checkpoints, and per-turn execution boundaries.

Context:
Read the plan document, cache modules, test commands, and known risks first.

Requirements:
Break the work into verifiable small steps, record the current phase, next step, blockers, and verification results, and avoid expanding each turn into refactors outside the plan.
```

### Handoff

Input:

```text
promptify handoff: continue this work in a new session
```

Example output (paste the block below into a fresh session):

```text
Continue this work from the previous session. Finish the login-failure message fix so the targeted test passes.

Context to read first:
- Read src/auth/login.ts, tests/auth/login.test.ts, and CLAUDE.md.
- Run `git status` and `git diff` to confirm the current change set.

Progress so far (do not redo):
- Located the failing message in src/auth/login.ts and drafted a scoped fix.
- Confirmed the existing login flow and error-handling style are untouched.

Where it stopped:
- The fix is drafted but the targeted login test has not been run yet.

Next:
- Run the targeted login test; if it fails, adjust only the message handling.

Constraints:
- Do not change the authentication flow or error enums; keep edits surgical.

Done when:
1. tests/auth/login.test.ts passes.
2. Final report covers changed files, verification, risks, and follow-ups.

Stop if:
- A destructive or scope-expanding change is required — stop and ask first.
```

## Supported Task Types

| Task | Template |
|---|---|
| General task | `skills/promptify/shared/templates/task.md` |
| Bugfix / debug | `skills/promptify/shared/templates/bugfix.md` |
| Feature | `skills/promptify/shared/templates/feature.md` |
| Prototype (UI) | `skills/promptify/shared/templates/prototype.md` |
| Data analysis | `skills/promptify/shared/templates/data-analysis.md` |
| Evolve (iterative optimization) | `skills/promptify/shared/templates/evolve.md` |
| Refactor | `skills/promptify/shared/templates/refactor.md` |
| Test | `skills/promptify/shared/templates/test.md` |
| Review | `skills/promptify/shared/templates/review.md` |
| Docs | `skills/promptify/shared/templates/docs.md` |
| PRD | `skills/promptify/shared/templates/prd.md` |
| Plan | `skills/promptify/shared/templates/plan.md` |
| Goal prompt | `skills/promptify/shared/templates/goal.md` |
| Handoff (session continuation) | `skills/promptify/shared/templates/handoff.md` |

## Safety Rules

See `skills/promptify/shared/safety.md`. High-risk tasks such as deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge enter analysis-first mode, and destructive edits require explicit confirmation.

## Project Boundaries

Promptify's boundaries are recorded in `docs/adr/0001-markdown-first-single-entry.md`. Out-of-scope directions are recorded in `docs/out-of-scope/`, including npm CLI, Codex adapter, web UI / hosted service, and multi-skill splitting.

When maintaining templates, refer to `skills/promptify/shared/glossary.md` and `skills/promptify/shared/template-authoring.md` to keep terminology, mode semantics, and safety gates consistent.

## Version Maintenance

Versions and changes are maintained in `CHANGELOG.md`. Version numbers follow SemVer: documentation or template touch-ups increment PATCH, new templates, modes, or notable workflow behavior increment MINOR, and breaking layout or behavior changes increment MAJOR.

## Manual QA

After changing shared templates or `SKILL.md`, run at least:

```bash
rg -n "目标：|模式：|上下文：|要求：" skills/promptify/shared/templates -g '!prd.md'
rg -n "问题陈述：|解决方案：|用户故事：|实现决策：|测试决策：|非目标：|补充说明：" skills/promptify/shared/templates/prd.md
rg -n "analysis-first|prompt-only|review-only|plan-only|prd-only|shared/templates" skills
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" skills/promptify/shared skills README.md README.zh-CN.md AGENTS.md CLAUDE.md
git diff --check HEAD
```

The first command should find compact core blocks in every compact brief template. The second should find the PRD core sections. The third should find mode names and shared template references. The unfinished-marker scan should produce no output.

## Limitations

- No npm CLI, installer, or automatic host registration.
- No Codex adapter; this repository targets Claude Code skills only.
- No web UI, hosted service, cloud sync, telemetry, or MCP indexer.
- Execution-stage capability depends on Claude Code itself, and by default requires user confirmation after brief generation.
