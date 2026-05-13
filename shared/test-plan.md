# Promptify Test Plan

Use this plan after changing shared rules, task templates, platform adapters, or
user-facing documentation. Pick the smallest relevant checklist for the change,
then report what was run and what remains unverified.

## Change Type Checklist

Shared brief rules:
1. Confirm `shared/brief-standard.md` still lists the compact core blocks and conditional blocks.
2. Confirm mode rules remain consistent with adapter behavior.
3. Confirm `shared/context-discovery.md` is referenced by brief generation and
   relevant templates.
4. Run the core-block scan against `shared/templates`.

Task routing or safety rules:
1. Confirm examples match the routing priority and high-risk behavior.
2. Check that high-risk signals still require analysis-first confirmation.
3. Run the adapter scan for mode names and shared template references.

Shared templates:
1. Confirm every template keeps the required compact Chinese block labels.
2. Confirm execution mode, boundaries, validation, and final report instructions
   are specific to the task type.
3. Confirm each template's `上下文` block points to context discovery.
4. Run the core-block scan and unfinished-marker scan.

Platform adapters:
1. Confirm adapters reference repository-root `shared/...` files rather than
   duplicating shared templates.
2. Confirm platform-specific rules do not weaken safety gates.
3. Run the adapter scan and plugin JSON validation when Claude Code metadata
   changed.

README or product docs:
1. Confirm documented commands and task types match current adapter files.
2. Confirm limitations still state there is no runtime service, UI, telemetry,
   database, cloud sync, or MCP indexer.
3. Run the unfinished-marker scan.

NPM CLI:
1. Run `npm test`.
2. Run `npm pack --dry-run`.
3. Run `node bin/promptify.js version`.
4. Run install, update, and uninstall checks with temporary home directories so real `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md` are not modified.
5. Run `node bin/promptify.js doctor` only after a local install or fixture has created `~/.promptify/current/`.
6. Confirm install writes only the Promptify-managed block, preserves existing config content, and backs up existing config files.
7. Confirm uninstall removes only the Promptify-managed block and preserves existing config content.

## Standard Verification Commands

```bash
npm test
npm pack --dry-run
node bin/promptify.js version
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

For CLI smoke tests, use a temporary HOME and run doctor after install:

```bash
PROMPTIFY_SMOKE_HOME="$(mktemp -d)"
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js install --host=claude-code,codex
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js doctor
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js update
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js uninstall --host=claude-code,codex
```

The unfinished-marker scan should produce no output. The other scans should
produce relevant matches unless the edited files make a command irrelevant.

## Manual Review

Before finishing, read the final diff and check:

1. The Markdown-first scope is preserved.
2. Shared behavior lives under `shared/`.
3. Claude Code-only behavior lives under `adapters/claude-code/`.
4. Codex-only behavior lives under `adapters/codex/`.
5. Chinese-first output rules remain intact.
6. No unrelated runtime, service, database, telemetry, or UI scope was added.

## Final Report Template

Include these points in the final response:

1. Changed files.
2. Behavior or documentation impact.
3. Verification commands and results.
4. Any skipped checks and why.
5. Remaining risk or follow-up, if any.
