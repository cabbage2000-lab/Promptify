# Promptify Brief Standard

Promptify briefs are compact by default. Stronger host models need clear intent,
context, constraints, and verification expectations; they do not need a verbose
form when the same information can be carried in fewer lines.

Every generated Promptify brief must include these core blocks unless a selected
task type explicitly removes one. Render block labels in the user's input
language:

| Chinese label | English label | Required | Purpose |
|---|---|---|---|
| 目标 | Goal | Yes | Restate the intended outcome in concrete terms. |
| 假设 | Assumptions | Conditional | Include only when input is vague or task type detection is uncertain. |
| 模式 | Mode | Yes | State guided prompt-first, prompt-only, execution-after-confirmation, analysis-first, review-only, plan-only, or prd-only. |
| 上下文 | Context | Yes | Tell the host assistant what local context to inspect first. |
| 要求 | Requirements | Yes | Combine execution order, boundaries, acceptance, verification, and final report expectations. |
| 安全门禁 | Safety Gate | Conditional | Include only for high-risk signals or destructive actions. |

Promptify can also generate `/goal` prompts for long-running work. Goal prompts are
not compact briefs; they are durable contracts for a host agent to keep working
until a verifiable stopping condition is met.

Promptify can also generate handoff prompts for session continuation. Handoff prompts
are not compact briefs; they compress current session progress into a paste-ready
continuation prompt for a fresh window when the context is near full or the host
model is drifting.

Promptify can also generate PRDs. PRDs are not compact briefs and do not enter
execution; they synthesize current conversation and minimal project context into
a product requirement document.

## Compression Rules

- Prefer 4 compact blocks: goal, mode, context, and requirements.
- Add assumptions only when they prevent ambiguity.
- Add a safety gate only when the input includes high-risk signals.
- Keep sentences short and task-specific.
- Avoid repeating generic host-agent rules unless they affect the selected task.
- Preserve technical identifiers, file paths, commands, package names, and framework names exactly.
- Keep professional boundaries: scope limits, verification, and final reporting must remain present, even when merged into the requirements block.

## Generation Flow

Before filling a generated brief:
- Read `shared/context-discovery.md`.
- Parse the original user input and identify likely task type candidates.
- Explore the smallest useful project context allowed by the selected mode.
- Confirm task type and risk level after discovery.
- Fill the selected compact template with project-specific context, boundaries,
  verification, and reporting expectations.
- Treat `shared/templates/*.md` as content templates. Their Chinese headings and
  prose define required intent, but the final rendered brief must follow the
  language rules below.

## Mode Rules

Guided prompt-first mode:
- Default `/promptify <short task>` behavior.
- Output the compact generated brief first.
- Ask the user whether to enter the execution stage.
- Do not edit files or run execution commands before the user confirms.
- If the user confirms, treat the generated brief as the active instruction for the current session.
- If high-risk signals are present, enter analysis-first mode even after confirmation and require explicit confirmation before high-risk or destructive edits.

Execution-after-confirmation mode:
- Use only after the user confirms they want to execute a generated brief.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Plan briefly before edits.
- Verify with the most relevant available command.
- Report changed files, behavior changes, verification results, risks, and follow-ups.

Prompt-only mode:
- Compatibility behavior for `/promptify:generate <short task>` and `promptify generate: <short task>`.
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

PRD-only mode:
- Use when the user asks to turn current conversation, a feature idea, or project context into a PRD.
- Synthesize what is already known; do not restart with a broad interview.
- Ask at most one focused clarification question only when a missing decision would make the PRD misleading.
- Otherwise record uncertainty under assumptions, open questions, or further notes.
- Produce the PRD from `shared/templates/prd.md` and stop.
- Do not publish to an issue tracker, apply labels, edit code, or continue into implementation.

Goal-prompt mode:
- Use for `/promptify:goal <long-running task>`, `promptify goal: <long-running task>`, or direct requests to turn an intent into a `/goal` prompt.
- Output only a `/goal` prompt block and stop.
- Do not edit files, run execution commands, or continue into implementation.
- Inspect project context only when the host mode explicitly allows read-only discovery for prompt generation.
- Include one objective, a tight scope, hard constraints, verifiable done criteria, and stop conditions.
- Prefer concrete files, commands, plans, issues, logs, or artifacts over vague success language.
- Keep the goal larger than one normal prompt but smaller than an open-ended backlog.
- For high-risk or destructive work, include a stop condition requiring explicit user confirmation before destructive edits.

Handoff-prompt mode:
- Use for `/promptify:handoff`, `promptify handoff: <...>`, or natural-language requests to continue current work in a new session (context near full, host model drifting).
- Output only a paste-ready continuation prompt block and stop.
- Do not edit files, run execution commands, or continue into execution.
- Review current session history for completed work, locked-in decisions, and the stopping point; do minimal read-only project discovery per `shared/context-discovery.md` to verify real progress.
- Base the `Progress so far` block strictly on verified fact; do not invent completed work. Move anything uncertain to `Where it stopped` or `Next`.
- Keep the prompt self-contained so a fresh session with no prior memory can continue.
- For high-risk or destructive work, include a `Stop if` condition requiring explicit user confirmation before destructive edits.

## Language Rules
- Match the generated brief language to the user's short task language.
- If the user's task is mostly Chinese, use Chinese labels and Chinese prose.
- If the user's task is mostly English, use English labels and English prose.
- For mixed-language input, use the dominant natural-language portion of the
  user's task. Ignore code, paths, commands, package names, and framework names
  when deciding the dominant language.
- Keep technical identifiers, commands, file paths, package names, and framework names unchanged.
