# Goal Prompt Template

Use this when the user wants a `/goal` prompt for long-running Claude Code or Codex work.

## Brief

目标：
把用户的长跑任务意图转换为可直接交给 `/goal` 的持久目标 prompt。

模式：
goal-prompt；只生成 `/goal` 条件块并停止，不进入执行。

上下文：
按 `shared/context-discovery.md` 做最小必要发现；只在宿主明确允许 prompt 生成阶段进行只读发现时读取上下文。

要求：
输出一个目标清晰、范围收敛、约束明确、完成条件可验证、停止条件具体的 `/goal` prompt。不要编辑文件，不要运行执行命令，不要询问是否进入执行。高风险或破坏性任务必须写入停止并确认的条件。

## Goal Prompt

/goal <用一句话描述一个持久目标，并写明可验证的停止条件>

Scope:
- <列出允许触碰的目录、文件、模块、计划或 issue>
- <列出明确不要触碰的范围>

Constraints:
- <硬性约束 1，包含代码风格、安全、依赖、兼容性或迁移边界>
- <硬性约束 2，要求分 checkpoint 工作并保持简短进展记录>
- <硬性约束 3，要求保护无关用户改动>

Done when:
1. <可验证产物或行为 1，引用具体文件、命令、测试、截图或日志>
2. <可验证产物或行为 2，说明通过标准>
3. <最终汇报包含改动、验证、风险和剩余事项>

Stop if:
- <遇到范围外改动、破坏性操作、权限/密钥/生产风险或需求歧义时停止并询问>
- <关键验证连续失败或需要产品判断时停止并说明证据>

## Rendering Rules

- Match the natural language of the user's task, but keep `/goal`, `Scope`, `Constraints`, `Done when`, and `Stop if` labels in English for host compatibility.
- Generate exactly one `/goal` block.
- Keep the objective durable and bounded: bigger than one prompt, smaller than an open-ended backlog.
- Include concrete context to read first when known, such as `PLAN.md`, `README.md`, failing tests, issue links, or target modules.
- Include validation commands when the project exposes them.
- Include an explicit stop condition before destructive, high-risk, or scope-expanding edits.
