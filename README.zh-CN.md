# Promptify

Promptify 是一个 Claude Code skill，把简短的开发意图转换成结构化、上下文感知的任务 brief，并在生成 brief 之后再决定是否进入执行。

## 为什么需要它

直接把“修复登录失败提示”这类短意图交给 agent 执行，常见问题是范围不清、上下文读错、测试要求缺失，或者高风险改动过早进入编辑。Promptify 在执行前先生成一个紧凑 brief，把目标、模式、上下文、要求和安全门禁说清楚。

Promptify 不是自动执行器，也不是安装器。它的核心价值是让用户和 agent 在动手前共享同一份任务契约。

## 它是什么

- 一个 Claude Code skill 包：`skills/promptify/SKILL.md`。
- 一组 Markdown 共享规则与模板：`skills/promptify/shared/`。
- 覆盖 bugfix、feature、refactor、test、review、docs、planning、PRD、long-running goal 等常见开发任务。

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
          docs.md
          feature.md
          goal.md
          plan.md
          prd.md
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

## 支持的任务类型

| 任务 | 模板 |
|---|---|
| 通用任务 | `skills/promptify/shared/templates/task.md` |
| Bugfix / debug | `skills/promptify/shared/templates/bugfix.md` |
| Feature | `skills/promptify/shared/templates/feature.md` |
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
