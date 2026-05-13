# Promptify Brief Standard

Every generated Promptify brief must include these fields unless a selected task type explicitly removes one:

| Field | Required | Purpose |
|---|---|---|
| 任务目标 | Yes | Restate the intended outcome in concrete terms. |
| 假设 | Conditional | Required when input is vague or task type detection is uncertain. |
| 执行模式 | Yes | State direct execution, prompt-only, analysis-first, review-only, or plan-only. |
| 项目上下文 | Yes | Tell the host assistant what local context to inspect first. |
| 执行要求 | Yes | Define the order of investigation, planning, editing, and validation. |
| 边界限制 | Yes | Define what should not be changed. |
| 验收标准 | Yes | Define observable completion criteria. |
| 验证方式 | Yes | Require relevant tests, lint, typecheck, or documented manual checks. |
| 安全门禁 | Conditional | Required for high-risk signals or destructive actions. |
| 最终汇报 | Yes | Define what the assistant must report back. |

## Mode Rules

Direct execution mode:
- Treat the generated brief as the active instruction for the current session.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Plan briefly before edits.
- Verify with the most relevant available command.
- Report changed files, behavior changes, verification results, risks, and follow-ups.

Prompt-only mode:
- Output only the generated brief.
- Do not read files, run commands, edit files, or continue into execution.
- Include verification and safety expectations for the future executor.

Analysis-first mode:
- Inspect relevant context and identify impact.
- Do not perform high-risk or destructive edits before explicit confirmation.
- Report affected files, modules, likely blast radius, and a proposed safe plan.

Review-only mode:
- Use a code-review stance.
- Lead with findings.
- Prioritize bugs, regressions, security risks, and missing tests.
- Keep summaries secondary.

Plan-only mode:
- Investigate relevant code and constraints when allowed by the host.
- Produce a staged implementation plan.
- Do not edit code unless the user explicitly asks to continue.

## Language Rules
- Default output language is Chinese.
- If the user's task is mostly English, English output is allowed unless local instructions prefer Chinese.
- Keep technical identifiers, commands, file paths, package names, and framework names unchanged.
