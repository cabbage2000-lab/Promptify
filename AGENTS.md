# Promptify Agent Instructions

## Project Overview

Promptify is a Markdown-first workflow package for Claude Code and Codex. It turns short developer intent into structured, platform-aware coding task briefs.

This repository contains product documentation, shared prompt/workflow rules, thin platform adapters, and may include a lightweight local NPM CLI for install/update/uninstall workflows. It must not contain a runtime service, web UI, database, telemetry, or MCP server.

## Repository Map

- `prd/promptify-prd.md`: Product requirements and MVP acceptance criteria.
- `docs/superpowers/plans/2026-05-13-promptify-mvp.md`: Implementation plan used to build the MVP.
- `shared/brief-standard.md`: Compact generated brief blocks, execution modes, and language rules.
- `shared/task-routing.md`: Task type cues, routing priority, and examples.
- `shared/safety.md`: High-risk signals, safety levels, and confirmation behavior.
- `shared/templates/*.md`: Core task templates for generic tasks, bugfixes, features, refactors, tests, reviews, docs, and planning.
- `adapters/claude-code/`: Claude Code plugin metadata, command wrappers, and skill instructions.
- `adapters/codex/`: Codex skill and fallback instructions.
- `README.md`: User-facing installation, usage, safety, QA, and limitations.

## Editing Guidelines

- Keep the product Markdown-first unless a new PRD or plan explicitly asks for executable runtime code.
- Preserve the separation between shared behavior and platform adapters.
- Put platform-neutral rules in `shared/`.
- Keep Claude Code-specific behavior under `adapters/claude-code/`.
- Keep Codex-specific behavior under `adapters/codex/`.
- Do not duplicate shared templates into adapters unless packaging requirements explicitly force it.
- Treat `shared/...` references inside adapters as repository-root-relative paths.
- Keep output language Chinese-first by default, while preserving technical identifiers in their original form.

## Safety And Scope

- Do not add web UI, hosted service, cloud sync, telemetry, external database, or MCP indexing unless the PRD is updated.
- NPM packaging is allowed only for local installation, update, uninstall, and verification workflows; keep Promptify's core behavior Markdown-first.
- High-risk signals include deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge.
- High-risk or destructive work must start with analysis and require explicit confirmation before edits.
- For review-only and plan-only workflows, do not imply files were changed unless edits were explicitly requested later.

## Verification

Run these checks after changing shared templates or adapters:

```bash
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

The core-block scan should find the compact required blocks in each template. The unfinished-marker scan should produce no output. If a check is not relevant to the files you changed, state why in the final report.

## Git Notes

- Work on a feature branch or isolated worktree for multi-step changes.
- Keep commits scoped by concern.
- Do not revert unrelated user changes.
