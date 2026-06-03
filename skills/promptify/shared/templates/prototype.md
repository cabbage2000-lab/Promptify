# Prototype Template

Use this when the user wants a throwaway prototype to answer a design question
before committing — feel out a state model or business logic, or explore what a
UI should look like ("做个原型", "试一下", "草几个设计", "prototype this").

## Brief

目标：
用一个一次性原型回答某个具体设计问题，快速验证后即删除或把结论吸收进真实代码，而不是直接产出生产实现。

假设：
原型分两支，先判定在回答哪类问题：
- 逻辑/状态/数据形态是否成立 → logic 分支：构建可手动驱动状态模型的最小可运行终端程序。
- 界面应该长什么样 → UI 分支：在单一路由上生成多个结构迥异、可经浮动栏按 `?variant=` 切换的界面变体。
问题不明确且用户不在场时，按相邻代码判定（后端模块→logic，页面/组件→UI），并在原型顶部写明该假设。

模式：
先生成高质量 brief 并询问是否进入执行阶段；含高风险信号（如真实数据迁移、生产配置）时先分析并确认。

上下文：
按 `shared/context-discovery.md` 做最小必要发现：先判定 logic/UI 分支，再读相邻模块或页面、现有任务运行器（package.json scripts、Makefile、pyproject 等）、组件库与样式系统、路由约定，让原型贴近真实用法。

要求：
原型自始即为一次性并显式标记；用一条命令即可运行；默认不持久化，状态留在内存（确需数据库时用带 "PROTOTYPE — wipe me" 标记的临时库）；跳过测试、错误处理与抽象，只保留可运行所需；每次操作（logic）或每次切换变体（UI）后完整暴露相关状态。
- logic 分支：把回答问题的核心逻辑隔离为可移植纯模块（reducer / 状态机 / 纯函数），TUI 仅作薄壳，每帧清屏重绘"当前状态 + 快捷键"。
- UI 分支：默认嵌入已有页面，变体须结构迥异而非仅换色；浮动切换栏支持方向键与改写 URL search param，并在生产构建中隐藏。
不要把原型直接当生产代码提升，不要泛化、不接真实数据库、不接真实写操作。最终汇报：原型在回答什么问题、运行命令、（UI）`?variant=` 键、得到的答案，以及"删除或吸收"的处置建议。
