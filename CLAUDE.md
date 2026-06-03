# Claude Code Instructions For Promptify

## Project Role

Promptify is a Claude Code skill repository. The single skill at `skills/promptify/SKILL.md` converts short developer intent into a structured task brief, shows the brief first, and asks whether to enter execution.

This repository is Markdown-only. Do not add a runtime service, npm CLI, package manager, web UI, database, telemetry, cloud sync, MCP server, slash commands, or non-Claude-Code adapters.

## Claude Code Context

Load and reason from the repository root. The skill under `skills/promptify/` depends on files under `skills/promptify/shared/`, which must stay inside the skill directory for Claude Code installation.

Key files:

- `skills/promptify/SKILL.md`: The Promptify skill.
- `skills/promptify/shared/brief-standard.md`: Generated brief fields, modes, and language rules.
- `skills/promptify/shared/glossary.md`: Canonical Promptify terminology.
- `skills/promptify/shared/task-routing.md`: Routing cues and priority.
- `skills/promptify/shared/safety.md`: Safety levels, high-risk signals, and confirmation behavior.
- `skills/promptify/shared/context-discovery.md`: Minimal-context exploration rules.
- `skills/promptify/shared/template-authoring.md`: Rules for creating and editing compact templates.
- `skills/promptify/shared/templates/*.md`: Core workflow templates (task, bugfix, feature, prototype, refactor, test, review, docs, plan, PRD, goal).
- `docs/adr/`: Architectural decision records for product boundaries and durable design decisions.
- `docs/out-of-scope/`: Rationale for product directions Promptify intentionally does not support.

## Editing Rules

- Put platform-neutral behavior in `skills/promptify/shared/`.
- Put skill-specific routing and behavior only in `skills/promptify/SKILL.md`.
- Treat all `shared/...` references in the skill as relative to `skills/promptify/`; keep `shared/` inside the `promptify` skill directory.
- Use `skills/promptify/shared/glossary.md` terminology consistently when editing docs, templates, or skill behavior.
- Use `skills/promptify/shared/template-authoring.md` when changing `skills/promptify/shared/templates/` or the brief contract.
- Match generated brief language to the user's input language by default while preserving technical identifiers, commands, paths, package names, and framework names.
- The `promptify` skill is the only entry point. There are no slash commands, no host abstractions, no install/update/uninstall CLIs.
- Record durable product-boundary decisions in `docs/adr/`; record rejected recurring feature directions in `docs/out-of-scope/`.
- Preserve mode semantics inside the skill:
  - default prompt-first: output the brief, then ask whether to enter execution.
  - prompt-only: output the brief and stop.
  - review-only: findings first; do not edit unless explicitly requested.
  - plan-only: produce the plan and stop.
  - prd-only: produce the PRD and stop; do not publish to an issue tracker.
  - goal: produce only the goal block from `skills/promptify/shared/templates/goal.md` and stop.
  - analysis-first: auto-enforced on high-risk signals.

## Safety Rules

- High-risk signals include deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge.
- High-risk or destructive work must start with analysis and require explicit confirmation before edits.
- Preserve unrelated user changes.
- For review-only and plan-only flows, do not imply files were changed unless edits were explicitly requested later.

## Verification

After changing the SKILL.md, shared templates, README, AGENTS.md, or this file, run the relevant checks:

```bash
rg -n "目标：|模式：|上下文：|要求：" skills/promptify/shared/templates -g '!prd.md'
rg -n "问题陈述：|解决方案：|用户故事：|实现决策：|测试决策：|非目标：|补充说明：" skills/promptify/shared/templates/prd.md
rg -n "analysis-first|prompt-only|review-only|plan-only|prd-only|shared/templates" skills
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" skills/promptify/shared skills README.md README.zh-CN.md AGENTS.md CLAUDE.md
git diff --check HEAD
```

The unfinished-marker scan should produce no output. If a check is not relevant to the files changed, say why in the final response.

## Git Notes

- Use a feature branch or isolated worktree for multi-step changes.
- Keep commits scoped by concern.
- Do not revert unrelated user changes.
