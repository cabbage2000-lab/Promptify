# Promptify

Promptify turns brief developer prompts into structured, context-aware, platform-aware development task workflows for Claude Code and Codex.

## What It Is

- A task instruction orchestrator for Claude Code and Codex.
- A short-intent-to-executable-task converter.
- A lightweight workflow package for bugfixes, features, refactors, tests, reviews, docs, and planning.

## MVP Behavior

- `/promptify <short_task>` defaults to direct execution when the host supports it.
- `/promptify:generate <short_task>` outputs a prompt-only brief and stops.
- High-risk inputs use analysis-first mode and require confirmation before destructive edits.

## Claude Code Usage

Install or load Promptify from the repository root:

```text
promptify/
```

Claude Code plugin metadata uses component paths under `adapters/claude-code/`,
but that adapter depends on repository-root shared sources under `shared/`.
Keep `adapters/claude-code/` and `shared/` together in the same repository-root
context when loading or installing Promptify.

Example commands:

```text
/promptify 修复登录失败提示
/promptify:generate 重构订单状态计算逻辑
/promptify:review 当前改动
/promptify:plan 支持团队模板覆盖
```

## Codex Usage

Use the Codex skill or fallback instructions from the repository root:

```text
promptify/
```

The Codex adapter lives under `adapters/codex/`, but its instructions reference
repository-root shared sources under `shared/`. Keep `adapters/codex/` and
`shared/` together in the same repository-root context when loading Promptify.

When slash commands are unavailable, use command-like text:

```text
promptify: 修复登录失败提示
promptify generate: 重构订单状态计算逻辑
promptify review: 当前改动
promptify plan: 支持团队模板覆盖
```

## Supported Task Types

| Task | Template |
|---|---|
| Generic task | `shared/templates/task.md` |
| Bugfix / debug | `shared/templates/bugfix.md` |
| Feature | `shared/templates/feature.md` |
| Refactor | `shared/templates/refactor.md` |
| Test | `shared/templates/test.md` |
| Review | `shared/templates/review.md` |
| Docs | `shared/templates/docs.md` |
| Plan | `shared/templates/plan.md` |

## Safety

Promptify treats deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge signals as high risk. These tasks start with analysis and require explicit confirmation before destructive edits.

## Manual QA

Run these checks before release:

```bash
rg -n "任务目标：|执行模式：|项目上下文：|执行要求：|边界限制：|验收标准：|验证方式：|最终汇报：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md
```

The first two commands should find required behavior. The final command should produce no output.

## Limitations

- No web UI.
- No hosted service.
- No cloud sync.
- No MCP repository indexer.
- Direct execution depends on host platform support.
