# Review Template

## Brief

目标：
审查指定范围的代码或当前改动，优先发现真实风险。

模式：
Review-only；默认不编辑文件。

上下文：
按 `shared/context-discovery.md` 做最小必要发现，优先看 diff、相关实现、测试和调用方。

要求：
使用代码审查姿态，优先找 bug、回归、安全风险、缺失测试和行为不一致；尽量给文件和行号，并按严重程度排序。不要把总结放在发现之前，不把纯风格偏好作为主要问题，不修改代码。以阅读和必要只读命令验证；若无问题，明确说明未发现问题和剩余测试风险。最终先列 findings，再列 open questions 或 assumptions，最后给简短 summary。
