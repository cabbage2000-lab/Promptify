# Handoff Prompt Template

Use this when the user wants to hand off the current session to a new window because the context is near full or the host model is drifting. Produce a paste-ready continuation prompt and stop.

## Brief

目标：
把当前会话的进度状态压缩成一个可直接粘贴到新会话的续跑 prompt，让任务在新窗口无缝接续，不丢失已完成的工作与已敲定的决策。

模式：
handoff-prompt；只生成续跑 prompt 块并停止，不进入执行，不询问是否执行。

上下文：
回顾当前会话历史，提炼已完成的改动、已敲定的决策与当前断点；按 `shared/context-discovery.md` 做最小必要的只读项目发现（`git status`、最近改动、`PLAN.md` 或相关产物）核对真实进度。只读，不编辑文件，不运行执行命令。

要求：
输出一个让新会话 agent 能立即接续的 prompt：先读什么、已完成什么（不重做）、停在何处、下一步、约束与完成条件、何时停下来问。`Progress so far` 必须忠实于当前会话事实，不臆造未完成的进度；不确定的归入 `Where it stopped` 或 `Next`。高风险或破坏性任务必须写入停止并确认的条件。

## Handoff Prompt

Continue this work from the previous session. <One-line restatement of the task goal with a verifiable completion condition.>

Context to read first:
- <PLAN.md, CLAUDE.md, or the specific files, plans, issues, or logs the new session should read first>
- <Run `git status` and `git diff` to confirm the real current state>

Progress so far (do not redo):
- <Completed item 1: which file changed / what decision was made / what verification passed>
- <Completed item 2>

Where it stopped:
- <The current breakpoint: what was being done last and why it stopped>

Next:
- <Next step 1: what to do next>
- <Next step 2>

Constraints:
- <Hard constraint: scope boundaries, code style, dependencies, compatibility, or decisions already locked in>
- <Preserve unrelated user changes; keep edits surgical>

Done when:
1. <Verifiable artifact or behavior 1, citing specific files, commands, tests, or logs>
2. <Final report covers changes, verification, risks, and remaining items>

Stop if:
- <Stop and ask on scope-expanding changes, destructive operations, permission/secret/production risk, or requirement ambiguity>
- <Stop and present evidence when key verification fails repeatedly or product judgment is needed>

## Rendering Rules

- Match the natural language of the user's task, but keep `Context to read first`, `Progress so far`, `Where it stopped`, `Next`, `Constraints`, `Done when`, and `Stop if` labels in English for host compatibility.
- Generate exactly one continuation prompt block, ready to paste into a fresh session.
- Base `Progress so far` strictly on the current session history and verified project state; never invent completed work. If something is uncertain, state it under `Where it stopped` or `Next` instead of asserting it as done.
- Prefer concrete files, commands, plans, logs, or artifacts over vague summaries.
- Keep the prompt self-contained: a fresh session with no memory of this conversation should be able to continue from it.
- For high-risk or destructive work, include a `Stop if` condition requiring explicit user confirmation before destructive edits.
