# Promptify Safety Rules

## High-Risk Signals

Treat these signals as high risk:

- 删除 / remove / delete
- 数据迁移 / migration
- 支付 / payment
- 权限 / permission
- 认证 / auth
- 安全 / security
- 生产 / production
- 批量修改 / mass update
- 重写 / rewrite
- 清空 / purge

## Safety Levels

| Safety level | Examples | Default behavior |
|---|---|---|
| Read-only | Inspect files, search code, read docs, summarize current behavior | Allowed during guided prompt-first discovery, confirmed execution, and analysis-first mode. |
| Low-risk edit | Small scoped fix, docs update, focused test addition | Allowed after execution confirmation when no high-risk signal is present. |
| Medium-risk edit | Refactor, dependency change, broad test rewrite, behavior-affecting feature | Require brief plan before editing and relevant verification after editing. |
| High-risk edit | Delete files, migration, auth or permission change, payment flow change, production config change, mass rewrite | Analysis-first only; require explicit user confirmation before execution. |
| Destructive action | Remove modules, purge data, irreversible migration, forceful cleanup | Never perform without explicit confirmation and rollback or recovery notes. |

## Confirmation Requirements

For high-risk or destructive actions, ask for confirmation before editing. Include:

- Proposed action.
- Affected files, modules, or systems.
- Expected behavior change.
- Verification plan.
- Known risks and rollback or recovery notes when applicable.

Destructive actions require clear confirmation such as `确认删除` or `continue with deletion`.

## Prompt-Only Safety

Prompt-only mode still detects high-risk signals. Generated prompts for high-risk tasks must instruct the future host assistant to start with impact analysis and request confirmation before destructive edits.
