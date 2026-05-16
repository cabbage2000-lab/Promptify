# Generic Task Template

Use this when task type detection is uncertain or the input contains mixed intent.

## Brief

目标：
基于用户输入完成最可能的开发任务；若目标不清晰，先写明合理假设。

模式：
先生成高质量 brief 并询问是否进入执行阶段；目标不足时先澄清，含高风险信号时先分析并确认。

上下文：
按 `shared/context-discovery.md` 做最小必要发现，优先读仓库指令、相关实现、测试约定、README、包脚本、CI 配置和用户会话指令。

要求：
先定位相关文件和影响范围，再简短计划并执行；目标不足时只问一个聚焦问题。保持改动最小，不改无关模块，不引入无关依赖。用相关测试、lint、typecheck 或项目命令验证；无法运行时说明原因。最终汇报假设、改动、验证、风险和后续建议。
