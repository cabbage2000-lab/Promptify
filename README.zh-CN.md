# Promptify

Promptify 是一个 Claude Code skill，把简短的开发意图转换成结构化、上下文感知的任务 brief，并在生成 brief 之后再决定是否进入执行。

## 为什么需要它

直接把“修复登录失败提示”这类短意图交给 agent 执行，常见问题是范围不清、上下文读错、测试要求缺失，或者高风险改动过早进入编辑。Promptify 在执行前先生成一个紧凑 brief，把目标、模式、上下文、要求和安全门禁说清楚。

Promptify 不是自动执行器，也不是安装器。它的核心价值是让用户和 agent 在动手前共享同一份任务契约。

## 它是什么

- 一个 Claude Code skill 包：`skills/promptify/SKILL.md`。
- 一组 Markdown 共享规则与模板：`skills/promptify/shared/`。
- 覆盖 bugfix、feature、prototyping、data analysis、refactor、test、review、docs、planning、PRD、long-running goal 等常见开发任务。

## 什么时候使用 Promptify

Promptify 适合在任务意图很短、但项目上下文复杂时使用。它尤其适合涉及权限、认证、安全、迁移、删除、生产风险等高风险改动的任务，或者需要 `review-only`、`plan-only`、`prd-only` 等明确模式的场景。

团队希望统一 agent 接任务格式，或者希望在 Claude Code 执行前先产出一份可确认的任务契约时，也适合使用 Promptify。它把短意图整理成包含目标、模式、上下文、要求和必要安全门禁的 brief，让用户和 agent 在动手前先对齐。

Promptify 不太适合很小的机械修改、用户已经写好完整实现计划的任务、需要 Claude Code 立刻进入调试循环的场景，或者需要新增工具能力、平台能力的需求。

Promptify 和 Claude Code 的关系更像前置导航与执行引擎：Promptify 负责减少误解、控制范围、提高可复验性；Claude Code 负责实际读代码、改文件、跑测试和调试。Promptify 的代价是多一层流程，并不会提升 Claude Code 本体的底层执行能力。

## 行为

- 把短意图分类后，按 `skills/promptify/shared/task-routing.md` 路由到合适的模板。
- 先按 `skills/promptify/shared/context-discovery.md` 探索最小必要项目上下文，再生成紧凑 brief。
- brief 生成语言跟随用户输入：中文输入生成中文，英文输入生成英文；技术标识、命令、路径保留原文。
- 高风险输入（deletion、migration、payment、permission、auth、security、production、mass update、rewrite、purge 等）进入 analysis-first 模式，destructive edits 前必须明确确认。
- 默认 prompt-first：先输出 brief，再询问是否执行。用户可以在请求里显式声明 `prompt-only`、`review-only`、`plan-only`、`prd-only` 或 `goal` 模式。

## 目录结构

```text
promptify/
  README.md
  README.zh-CN.md
  AGENTS.md
  CLAUDE.md
  docs/
    adr/
      0001-markdown-first-single-entry.md
    out-of-scope/
      codex-adapter.md
      multi-skill-split.md
      npm-cli-and-installer.md
      web-ui-or-hosted-service.md
  skills/
    promptify/
      SKILL.md
      shared/
        brief-standard.md
        context-discovery.md
        glossary.md
        safety.md
        template-authoring.md
        task-routing.md
        test-plan.md
        templates/
          bugfix.md
          data-analysis.md
          docs.md
          feature.md
          goal.md
          plan.md
          prd.md
          prototype.md
          refactor.md
          review.md
          task.md
          test.md
```

`skills/promptify/SKILL.md` 引用同一 skill 目录内的 `shared/` 资源。`shared/` 必须位于 `skills/promptify/` 之下，这样把 `skills/promptify` 安装为 Claude Code skill 时资源才会随 skill 一起加载。

## 安装

Promptify 以仓库形态分发，没有 npm 包、安装器或自动注册。把仓库放到 Claude Code 能识别 skill 的位置即可。

推荐：把仓库 clone 到一个稳定位置，然后让 Claude Code 加载它的 `skills/`。例如：

```bash
git clone <repo-url> ~/promptify
ln -s ~/promptify/skills/promptify ~/.claude/skills/promptify
```

或者把整个仓库直接放在项目里作为项目级 skill。无论哪种方式，请保持 `shared/` 在 `skills/promptify/` 目录内。

## 使用

在 Claude Code 中描述你的开发意图，并要求使用 `promptify` skill 处理。例如：

```text
用 promptify 处理：修复登录失败提示
promptify：当前改动 review 一下
promptify：把当前讨论整理成 PRD
promptify：支持团队模板覆盖的实现计划
promptify：把 docs/superpowers/plans/2026-05-13-promptify-mvp.md 跑成 long-running goal
```

skill 会先生成紧凑 brief，再询问是否执行；PRD 模式会直接生成 PRD 并停止。

## 示例

### 快速输入示例

```text
promptify：修复登录失败提示
promptify：新增导出 CSV 功能
promptify：重构订单状态计算逻辑，保持行为不变
promptify：给支付回调补测试
promptify：review 当前分支，重点看安全和回归风险
promptify prompt-only：把“优化设置页加载速度”整理成 brief，不要执行
promptify plan-only：制定从 REST 迁移到 GraphQL 的实施计划
promptify prd-only：把“团队模板覆盖”整理成 PRD
promptify：删除旧权限表和迁移脚本
promptify goal：按 docs/plans/cache-cleanup.md 持续推进
```

### Bugfix

输入：

```text
promptify：修复登录失败提示
```

输出会类似：

```text
目标：
修复登录失败时的用户可见提示，保持现有登录流程和错误处理风格。

模式：
先生成 brief 并询问是否进入执行阶段。

上下文：
优先检查登录入口、错误处理、已有测试和文档中的登录说明。

要求：
定位失败提示来源，最小范围修复，不改动认证流程；补充或更新相关测试，并运行目标验证命令。最终汇报改动文件、行为变化、验证结果、风险和后续建议。
```

### Feature

输入：

```text
promptify：新增导出 CSV 功能
```

输出会类似：

```text
目标：
为现有列表或报表新增 CSV 导出能力，遵循当前产品交互和权限边界。

模式：
先生成 feature brief，并在用户确认后再进入实现。

上下文：
优先检查相关列表页面、数据查询层、权限判断、现有导出能力和测试覆盖。

要求：
明确导出字段、筛选条件、文件命名和空状态行为；复用现有数据与权限逻辑，避免引入独立导出服务。补充目标测试，并汇报验证命令、行为变化和剩余风险。
```

### Prototype (UI)

输入：

```text
promptify：给设置页草几个布局设计看看
```

输出会类似：

```text
目标：
用一次性 UI 原型探索设置页该长什么样——在现有设置页路由上生成几个结构迥异的布局变体，便于切换对比，定稿后把胜出布局吸收进真实页面、删除其余。

假设：
按 UI 原型处理（只探索界面）。若其实是逻辑或状态问题，执行层应先追问一个澄清问题。

模式：
先生成 brief 并询问是否进入执行阶段。

上下文：
优先摸清并沿用项目既有技术栈——UI 框架及其路由 API、组件库、样式系统、路由约定，再定位设置页及其可用数据。

要求：
做 3 个结构迥异的变体（布局、信息层级、主操作不同，而非仅换色），命名 VariantA/VariantB/VariantC，在单一路由经 ?variant= 切换并配浮动切换栏（方向键、改写 URL、生产构建隐藏）。保持一次性：不持久化、不接真实写操作、不加测试。最终汇报访问地址与 ?variant= 键、胜出变体，以及“删除或吸收”的处置建议。
```

### Refactor

输入：

```text
promptify：重构订单状态计算逻辑，保持行为不变
```

输出会类似：

```text
目标：
重构订单状态计算逻辑，降低复杂度，同时保持现有外部行为和数据结果不变。

模式：
先生成 refactor brief，并在确认后执行。

上下文：
优先检查订单状态入口、调用方、边界条件、已有测试和历史文档。

要求：
先锁定当前行为和测试基线，再做小范围结构调整；不改变状态枚举、接口返回或数据库结构。补充缺失的边界测试，并汇报重构范围、验证结果和兼容性风险。
```

### Review

输入：

```text
promptify：review 当前分支，重点看安全和回归风险
```

输出会类似：

```text
目标：
审查当前分支改动，优先发现安全、权限、数据一致性和回归风险。

模式：
review-only；只输出审查结论，不直接修改文件。

上下文：
优先检查 git diff、相关测试、权限边界、外部输入处理和高风险模块。

要求：
按严重程度列出问题，提供文件位置、影响说明和可执行修复建议；如果没有发现明确问题，说明残余风险和建议补充的验证。
```

### PRD

输入：

```text
promptify prd-only：把“团队模板覆盖”整理成 PRD
```

输出会类似：

```text
问题陈述：
团队希望在保留默认模板的同时，为特定项目或团队维护可覆盖的 brief 模板规则。

解决方案：
定义团队模板覆盖的加载顺序、作用范围、冲突处理和回退行为。

用户故事：
作为团队维护者，我可以为团队项目提供定制模板，并在未配置时继续使用默认模板。

实现决策：
优先设计 Markdown-first 的覆盖约定，不引入服务端、数据库或运行时同步。

测试决策：
用文档示例和模板检查覆盖默认、覆盖冲突、缺失回退等场景。

非目标：
不提供 web UI、云同步、权限系统或跨平台 adapter。

补充说明：
PRD 模式生成文档后停止，不自动进入实现。
```

### 高风险任务

输入：

```text
promptify：删除旧权限表和迁移脚本
```

输出会类似：

```text
目标：
评估旧权限表和迁移脚本的删除需求，确认影响范围和回滚路径。

模式：
analysis-first；涉及 deletion、permission、migration，执行任何 destructive edits 前必须获得明确确认。

上下文：
优先检查数据库迁移历史、权限调用方、部署流程、备份策略和测试覆盖。

要求：
先产出影响分析、依赖清单、验证方案和回滚计划；未经用户明确确认，不删除文件、不修改迁移、不移除权限路径。
```

### Long-running Goal

输入：

```text
promptify goal：按 docs/plans/cache-cleanup.md 持续推进
```

输出会类似：

```text
目标：
把 docs/plans/cache-cleanup.md 转换为可持续推进的 goal prompt，用于分阶段清理缓存相关工作。

模式：
goal；建立长期目标、阶段检查点和每轮执行边界。

上下文：
优先读取计划文档、缓存模块、测试命令和已知风险。

要求：
拆分可验证的小步骤，记录当前阶段、下一步、阻塞点和验证结果；每轮执行都避免扩大到计划之外的重构。
```

## 支持的任务类型

| 任务 | 模板 |
|---|---|
| 通用任务 | `skills/promptify/shared/templates/task.md` |
| Bugfix / debug | `skills/promptify/shared/templates/bugfix.md` |
| Feature | `skills/promptify/shared/templates/feature.md` |
| Prototype (UI) | `skills/promptify/shared/templates/prototype.md` |
| Data analysis | `skills/promptify/shared/templates/data-analysis.md` |
| Refactor | `skills/promptify/shared/templates/refactor.md` |
| Test | `skills/promptify/shared/templates/test.md` |
| Review | `skills/promptify/shared/templates/review.md` |
| Docs | `skills/promptify/shared/templates/docs.md` |
| PRD | `skills/promptify/shared/templates/prd.md` |
| Plan | `skills/promptify/shared/templates/plan.md` |
| Goal prompt | `skills/promptify/shared/templates/goal.md` |

## 安全规则

详见 `skills/promptify/shared/safety.md`。高风险任务（deletion、migration、payment、permission、auth、security、production、mass update、rewrite、purge）会先进入 analysis-first 模式，destructive edits 前必须显式确认。

## 项目边界

Promptify 的边界记录在 `docs/adr/0001-markdown-first-single-entry.md`。不做的方向记录在 `docs/out-of-scope/`，包括 npm CLI、Codex adapter、web UI / hosted service，以及多 skill 拆分。

维护模板时参考 `skills/promptify/shared/glossary.md` 和 `skills/promptify/shared/template-authoring.md`，保持术语、模式语义和安全门禁一致。

## 版本维护

版本和修改内容统一维护在 `CHANGELOG.md`。版本号按 SemVer 递增：文档或模板小修递增 PATCH，新增模板、模式或显著工作流行为递增 MINOR，破坏性布局或行为变化递增 MAJOR。

## Manual QA

修改 shared 模板或 SKILL.md 后，至少运行：

```bash
rg -n "目标：|模式：|上下文：|要求：" skills/promptify/shared/templates -g '!prd.md'
rg -n "问题陈述：|解决方案：|用户故事：|实现决策：|测试决策：|非目标：|补充说明：" skills/promptify/shared/templates/prd.md
rg -n "analysis-first|prompt-only|review-only|plan-only|prd-only|shared/templates" skills
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" skills/promptify/shared skills README.md README.zh-CN.md AGENTS.md CLAUDE.md
git diff --check HEAD
```

第一条应能在每个 compact brief 模板里找到紧凑核心块。第二条应能找到 PRD 核心段。第三条应能找到 mode 名称和 shared template 引用。未完成标记扫描应无输出。

## 限制

- 没有 npm CLI、安装器、宿主自动注册。
- 没有 Codex 适配器；本仓库只面向 Claude Code skill。
- 没有 web UI、hosted service、cloud sync、telemetry、MCP indexer。
- 执行阶段能力取决于 Claude Code 自身，并默认需要用户在 brief 生成后确认。
