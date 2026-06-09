# Promptify Task Routing

Promptify classifies short user input with lightweight keyword and intent cues.

## Task Type Cues

| Input cues | Task type | Template |
|---|---|---|
| 修复, bug, 报错, 失败, 异常, 不对, crash | debug / bugfix | `templates/bugfix.md` |
| 新增, 实现, 支持, 增加, add, implement | feature | `templates/feature.md` |
| 原型, prototype, 做个原型, 草几个设计, 试几个布局/方案, mock up | prototype (UI) | `templates/prototype.md` |
| 数据分析, 分析数据, 探索数据, EDA, 探索性分析, 算指标, 看下留存/转化/分布, 这批数据/这张表/这份日志说明什么, analyze data, explore dataset | data analysis | `templates/data-analysis.md` |
| 重构, 优化结构, 拆分, 整理, refactor | refactor | `templates/refactor.md` |
| 测试, 覆盖率, 补 test, 单测 | test | `templates/test.md` |
| review, 审查, 看看代码, PR | review | `templates/review.md` |
| 文档, README, 注释, docs | docs | `templates/docs.md` |
| PRD, 产品需求, 需求文档, product requirement | prd | `templates/prd.md` |
| 规划, 方案, 设计, plan | plan | `templates/plan.md` |
| /goal, goal, 长跑任务, 持久目标, 持续执行, 直到完成 | goal prompt | `templates/goal.md` |

数据分析专指理解数据、产出洞察；看代码/审查/PR 走 review，实现数据看板/指标管道/ETL 走 feature。

## Priority

1. Explicit specialized command wins.
2. High-risk signals override normal execution confirmation and force analysis-first handling.
3. User-stated intent wins over secondary words.
4. Closely related multi-intent tasks use one brief with primary and secondary goals.
5. Independent multi-intent tasks ask one focused clarification question or propose splitting the work.
6. Uncertain tasks use `templates/task.md` and state assumptions.

## Examples

| Input | Route | Mode |
|---|---|---|
| `/promptify 修复登录失败提示` | debug / bugfix | guided prompt-first |
| `/promptify:generate 修复登录失败提示` | debug / bugfix | prompt-only compatibility alias |
| `/promptify:review 当前改动` | review | review-only |
| `promptify：把当前讨论整理成 PRD` | prd | prd-only |
| `/promptify 重构支付模块并补测试` | high-risk refactor | analysis-first |
| `/promptify 删除旧支付模块` | high-risk task | analysis-first |
| `/promptify:goal 完成 PLAN.md 的 MVP` | goal prompt | goal-prompt |
| `promptify goal: 迁移旧测试到 node:test` | goal prompt | goal-prompt |
| `/promptify 给设置页草几个设计` | prototype (UI) | guided prompt-first |
| `/promptify 分析下上周的留存数据` | data analysis | guided prompt-first |
| `/promptify 优化一下这个模块` | generic task | guided prompt-first or clarification |
