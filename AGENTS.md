# Promptify Agent Instructions

## Project Overview

Promptify is a Claude Code skill repository. It contains:

- A single skill at `skills/promptify/SKILL.md` that converts short developer intent into a structured task brief.
- A set of Markdown shared rules and templates under `skills/promptify/shared/`.

The repository must not contain a runtime service, web UI, database, telemetry, MCP server, npm CLI, or any non-Claude-Code adapter.

## Repository Map

- `skills/promptify/SKILL.md`: The Promptify skill instructions. References sibling `shared/` files inside the skill directory.
- `skills/promptify/shared/brief-standard.md`: Compact brief blocks, guided prompt-first behavior, execution modes, language rules.
- `skills/promptify/shared/glossary.md`: Canonical Promptify terminology for docs, templates, and generated briefs.
- `skills/promptify/shared/task-routing.md`: Task type cues, routing priority, examples.
- `skills/promptify/shared/safety.md`: High-risk signals, safety levels, confirmation behavior.
- `skills/promptify/shared/context-discovery.md`: Minimal-context exploration rules.
- `skills/promptify/shared/evolution-loop.md`: SIA-style generational loop contract for the evolve task type.
- `skills/promptify/shared/template-authoring.md`: Rules for creating and editing compact templates.
- `skills/promptify/shared/test-plan.md`: Manual QA checklist source.
- `skills/promptify/shared/templates/*.md`: Templates for task, bugfix, feature, prototype, data analysis, evolve, refactor, test, review, docs, plan, PRD, goal.
- `docs/adr/`: Architectural decision records for product boundaries and durable design decisions.
- `docs/out-of-scope/`: Rationale for product directions Promptify intentionally does not support.
- `README.md`, `README.zh-CN.md`: User-facing installation, usage, safety, QA, limitations.

## Editing Guidelines

- Keep the product Markdown-first. Do not reintroduce executable runtime code, host abstractions, install/uninstall CLIs, or multi-platform adapters.
- Put platform-neutral rules in `skills/promptify/shared/`. Put skill-specific routing and behavior in `skills/promptify/SKILL.md`.
- Skill references to `shared/...` are relative to `skills/promptify/`; keep `shared/` inside the `promptify` skill directory.
- Use `skills/promptify/shared/glossary.md` terminology consistently when editing docs, templates, or skill behavior.
- Use `skills/promptify/shared/template-authoring.md` when changing `skills/promptify/shared/templates/` or the brief contract.
- Match generated brief language to the user's input language while preserving technical identifiers in their original form.
- Treat the `promptify` skill as the only entry point. There are no slash commands.
- Record durable product-boundary decisions in `docs/adr/`; record rejected recurring feature directions in `docs/out-of-scope/`.

## Safety And Scope

- Do not add web UI, hosted service, cloud sync, telemetry, external database, or MCP indexing.
- Do not add a Codex adapter, an npm package, or a CLI installer.
- High-risk signals: deletion, migration, payment, permission, auth, security, production, mass update, rewrite, purge.
- High-risk or destructive work must start with analysis and require explicit confirmation before edits.
- For review-only and plan-only modes, do not imply files were changed unless edits were explicitly requested later.
- For prd-only mode, produce the PRD and stop without publishing to an issue tracker or entering implementation.

## Verification

After changing shared templates, the SKILL.md, or any of the markdown docs:

```bash
rg -n "目标：|模式：|上下文：|要求：" skills/promptify/shared/templates -g '!prd.md'
rg -n "问题陈述：|解决方案：|用户故事：|实现决策：|测试决策：|非目标：|补充说明：" skills/promptify/shared/templates/prd.md
rg -n "analysis-first|prompt-only|review-only|plan-only|prd-only|shared/templates" skills
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" skills/promptify/shared skills README.md README.zh-CN.md AGENTS.md CLAUDE.md
git diff --check HEAD
```

The compact core-block scan should find the compact required blocks in each non-PRD template. The PRD scan should find the PRD core sections. The skill scan should find mode names and shared template references. The unfinished-marker scan should produce no output. If a check is not relevant to the files you changed, state why in the final report.

## Git Notes

- Work on a feature branch or isolated worktree for multi-step changes.
- Keep commits scoped by concern.
- Do not revert unrelated user changes.
