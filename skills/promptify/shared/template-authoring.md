# Promptify Template Authoring

Use this guide when creating or editing files under `shared/templates/` or changing the generated brief contract.

## Template Shape

Each compact template should preserve these blocks unless the task type explicitly removes one:

- `目标：`
- `模式：`
- `上下文：`
- `要求：`

Add `假设：` only when the task type commonly has ambiguity that must be surfaced.
Add `安全门禁：` only for templates or examples that involve high-risk signals.

`shared/templates/prd.md` is intentionally not a compact brief template. It should preserve the PRD sections defined there and stop before implementation.

## Writing Rules

- Keep templates compact. They should guide a host assistant, not become a full implementation plan.
- State task-specific investigation order, scope boundaries, verification, and final reporting expectations.
- Preserve the prompt-first contract unless the selected mode intentionally stops earlier.
- Keep high-risk behavior aligned with `shared/safety.md`.
- Match terminology from `shared/glossary.md`.
- Preserve technical identifiers, file paths, commands, package names, and framework names exactly in examples.
- Do not add host-specific APIs, slash-command requirements, runtime assumptions, or installer behavior.

## Language Rules

- Chinese templates may use Chinese headings and prose.
- Generated briefs must still follow `shared/brief-standard.md` and match the user's input language.
- Technical identifiers remain unchanged even when surrounding prose is localized.

## Review Checklist

Before finishing a template change, verify:

- The compact core blocks remain present.
- Mode semantics still match `shared/brief-standard.md`.
- High-risk cases route through analysis-first and safety gates.
- The template does not imply files were changed in prompt-only, review-only, or plan-only mode.
- The template does not add unsupported product surface such as an npm CLI, web UI, hosted service, MCP indexer, or non-Claude-Code adapter.
