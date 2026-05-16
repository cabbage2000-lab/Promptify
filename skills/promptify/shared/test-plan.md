# Promptify Test Plan

Use this plan after changing shared rules, task templates, the Promptify skill, or
user-facing documentation. Pick the smallest relevant checklist for the change,
then report what was run and what remains unverified.

## Change Type Checklist

Shared brief rules:
1. Confirm `shared/brief-standard.md` still lists the compact core blocks and conditional blocks.
2. Confirm mode rules remain consistent with adapter behavior.
3. Confirm `shared/context-discovery.md` is referenced by brief generation and
   relevant templates.
4. Run the compact core-block scan against non-PRD templates and the PRD section scan when `shared/templates/prd.md` changes. From the repository root, use `skills/promptify/shared/templates`.

Task routing or safety rules:
1. Confirm examples match the routing priority and high-risk behavior.
2. Check that high-risk signals still require analysis-first confirmation.
3. Run the adapter scan for mode names and shared template references.

Shared templates:
1. Confirm every compact brief template keeps the required block labels and that final rendering follows `shared/brief-standard.md` language rules.
2. For `shared/templates/prd.md`, confirm the PRD sections remain present and that PRD-only mode stops before implementation.
3. Confirm execution mode, boundaries, validation, and final report instructions
   are specific to the task type.
4. Confirm each compact template's `上下文` block points to context discovery.
5. Run the compact core-block scan, PRD section scan when relevant, and unfinished-marker scan.

README or product docs:
1. Confirm documented commands and task types match current adapter files.
2. Confirm limitations still state there is no runtime service, UI, telemetry,
   database, cloud sync, or MCP indexer.
3. Run the unfinished-marker scan.

## Standard Verification Commands

```bash
rg -n "目标：|模式：|上下文：|要求：" skills/promptify/shared/templates -g '!prd.md'
rg -n "问题陈述：|解决方案：|用户故事：|实现决策：|测试决策：|非目标：|补充说明：" skills/promptify/shared/templates/prd.md
rg -n "analysis-first|prompt-only|review-only|plan-only|prd-only|shared/templates" skills
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" skills/promptify/shared skills README.md README.zh-CN.md AGENTS.md CLAUDE.md
git diff --check HEAD
```

The unfinished-marker scan should produce no output. The other scans should
produce relevant matches unless the edited files make a command irrelevant.

## Manual Review

Before finishing, read the final diff and check:

1. The Markdown-first scope is preserved.
2. Shared behavior lives under `skills/promptify/shared/` in this repository and under `shared/` inside the installed skill package.
3. Claude Code skill behavior lives under `skills/promptify/`.
4. Input-language output rules remain intact.
5. No unrelated runtime, service, database, telemetry, adapter, CLI, or UI scope was added.

## Final Report Template

Include these points in the final response:

1. Changed files.
2. Behavior or documentation impact.
3. Verification commands and results.
4. Any skipped checks and why.
5. Remaining risk or follow-up, if any.
