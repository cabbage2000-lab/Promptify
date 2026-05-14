# Promptify

Promptify 将简短的开发意图转换为结构化、上下文感知、平台感知的 Claude Code 和 Codex 开发任务工作流。

## 它是什么

- 面向 Claude Code 和 Codex 的任务指令编排器。
- 将短意图转换为可执行任务的轻量工具包。
- 覆盖 bugfix、feature、refactor、test、review、docs、planning 等常见开发任务的 workflow package。

## MVP 行为

- `/promptify <short_task>` 是推荐入口：先生成紧凑高质量 brief，再询问用户是否进入执行阶段。
- `/promptify:generate <short_task>` 保留为兼容 alias：只输出紧凑的 prompt-only brief，然后停止。
- `/promptify:goal <long_running_task>` 生成可交给 Claude Code 或 Codex `/goal` 使用的持久目标 prompt，然后停止。
- Promptify 会先探索最小必要项目上下文，再填充生成的紧凑 brief，规则见 `shared/context-discovery.md`。
- 高风险输入进入 analysis-first 模式，destructive edits 前必须获得明确确认。

## Claude Code 用法

从仓库根目录安装或加载 Promptify：

```text
promptify/
```

Claude Code 插件元数据使用 `adapters/claude-code/` 下的组件路径，但该 adapter 依赖仓库根目录下的 `shared/` 共享资源。加载或安装 Promptify 时，请保持 `adapters/claude-code/` 和 `shared/` 位于同一个仓库根目录上下文中。

本地安装时，保留完整仓库，并根据宿主安装流程将 Claude Code 指向仓库根目录或 Claude Code adapter 目录：

```text
promptify/
  shared/
  adapters/claude-code/
```

不要只复制 `adapters/claude-code/`；其中的 command 和 skill 文件依赖 `shared/` 下的仓库根目录共享规则与模板。

示例命令：

```text
/promptify 修复登录失败提示
/promptify:goal 完成 docs/superpowers/plans/2026-05-13-promptify-mvp.md 的 MVP
/promptify:review 当前改动
/promptify:plan 支持团队模板覆盖
```

兼容旧用法时，`/promptify:generate <short_task>` 仍可用于只生成 brief。

Claude Code 支持内置 `/goal`，适合让 agent 围绕一个目标持续工作。Promptify 的 `/promptify:goal` 不直接启动执行，只生成带 `Scope`、`Constraints`、`Done when` 和 `Stop if` 的 `/goal` 条件块，方便你检查后再交给 `/goal`。

## Codex 用法

从仓库根目录使用 Codex skill 或 fallback instructions：

```text
promptify/
```

Codex adapter 位于 `adapters/codex/`，但其说明文件会引用仓库根目录下的 `shared/` 共享资源。加载 Promptify 时，请保持 `adapters/codex/` 和 `shared/` 位于同一个仓库根目录上下文中。

本地安装时，`promptify install --host=codex` 会把 Codex skill 注册到 `~/.codex/skills/promptify/`，同时在 `~/.codex/AGENTS.md` 写入 fallback instructions 和 shared rules 路径。手动安装时，可以加载 `adapters/codex/skills/promptify/SKILL.md`，也可以将 `adapters/codex/instructions/promptify.md` 作为 fallback session instructions 使用。请保持完整仓库结构，确保 adapter 能引用 `shared/`。

Codex 当前使用可发现 skill 和 command-like text；它不会像 Claude Code 插件一样注册 `/promptify` slash command。使用方式：

```text
promptify: 修复登录失败提示
promptify goal: 完成 PLAN.md 的 MVP
promptify review: 当前改动
promptify plan: 支持团队模板覆盖
```

兼容旧用法时，`promptify generate: <short task>` 仍可用于只生成 brief。

Codex 的 `/goal` 适合长跑任务，会围绕目标、停止条件和验证证据推进。`promptify goal:` 会生成 Codex-ready 的 `/goal` 块，但不会修改文件或进入执行。

## 安装

Promptify 作为本地 workflow package 安装。它通过 NPM CLI 分发和刷新本地 Markdown 资源，但没有 runtime service、database、telemetry 或 web UI。

推荐安装：

```bash
npm install -g @wjl6339/promptify
promptify install --host=claude-code,codex
promptify doctor
```

升级：

```bash
promptify update
```

卸载：

```bash
promptify uninstall --host=claude-code,codex
```

安全行为：

- `promptify install --host=...` 允许选择 Claude Code、Codex 或两者；可使用 `claude-code`、`codex` 或 `claude-code,codex`。
- 安装会把 Promptify 资源复制到 `~/.promptify/current/`，并在所选宿主配置中写入 Promptify-managed block。
- Claude Code 写入 `~/.claude/CLAUDE.md`，并注册本地插件 `promptify@promptify-local`，让 `/promptify` 等 slash commands 出现在 Claude Code 输入框中；Codex 写入 `~/.codex/AGENTS.md`，并注册可发现 skill 到 `~/.codex/skills/promptify/`。
- 写入配置时会保留已有用户内容，只替换 Promptify-managed block。
- 如果目标配置已存在，安装会先在 `~/.promptify/backups/` 下创建备份。
- `promptify doctor` 是 read-only 检查，只读取安装路径、adapter/template 状态、Claude Code 本地插件注册状态和 Codex skill 注册状态，不修改文件。
- `promptify uninstall --host=...` 会移除所选宿主配置中的 Promptify-managed block；Claude Code 还会移除 `promptify@promptify-local` 插件注册，Codex 还会移除 `~/.codex/skills/promptify/`，保留其他用户内容。

推荐目录结构：

```text
promptify/
  README.md
  README.zh-CN.md
  shared/
  adapters/
    claude-code/
    codex/
```

手动 fallback 安装流程：

以下流程仅用于不使用 NPM CLI 的场景。已经使用 `promptify install --host=...` 时，不需要再手动配置宿主 assistant。

1. 将完整仓库 clone 或复制到稳定的本地路径。
2. 配置宿主 assistant 加载对应 adapter。
3. 保持 `shared/` 与 `adapters/` 同级；adapter 文件使用仓库根目录相对路径引用共享资源。
4. 运行 Manual QA 章节中的验证命令。
5. 执行 smoke test，例如 `/promptify 修复登录失败提示` 或 `promptify: 修复登录失败提示`，确认它先生成 brief 并询问是否执行。

## 更新

通过 NPM CLI 更新已安装资源：

```bash
promptify update
```

手动仓库安装时，更新完整仓库，不要单独复制 adapter 文件：

```bash
git pull --ff-only
```

更新后重新运行 Manual QA 检查。如果更新涉及 shared templates、safety rules、routing rules 或 adapter entry points，也请在每个正在使用的宿主中执行一次 `/promptify <short_task>` smoke test，确认它先生成 brief 并询问是否执行。

固定版本安装可以切换到已知 release tag：

```bash
git fetch --tags
git checkout v0.1.0
```

## 回滚和卸载

通过 NPM CLI 卸载所选宿主的 managed block：

```bash
promptify uninstall --host=claude-code,codex
```

回滚固定版本安装时，切换到上一个已知可用的 tag 或 commit：

```bash
git checkout <previous-tag-or-commit>
```

手动安装卸载时，移除宿主 assistant 中加载 Promptify 的配置；如果没有其他项目依赖该本地仓库，再删除仓库副本。Promptify 不会创建外部服务或数据库。

## 支持的任务类型

| Task | Template |
|---|---|
| Generic task | `shared/templates/task.md` |
| Bugfix / debug | `shared/templates/bugfix.md` |
| Feature | `shared/templates/feature.md` |
| Refactor | `shared/templates/refactor.md` |
| Test | `shared/templates/test.md` |
| Review | `shared/templates/review.md` |
| Docs | `shared/templates/docs.md` |
| Plan | `shared/templates/plan.md` |
| Goal prompt | `shared/templates/goal.md` |

## 安全规则

Promptify 将 deletion、migration、payment、permission、auth、security、production、mass update、rewrite、purge 等信号视为高风险。此类任务会先进入 analysis-first 模式，并在 destructive edits 前要求明确确认。

## Manual QA

根据你修改的文件，使用 `shared/test-plan.md` 选择相关检查清单。发布前至少运行以下命令：

```bash
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|goal-prompt|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md README.zh-CN.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

第一条命令应能在每个 template 中找到紧凑核心块。adapter scan 应能找到 mode 名称和 shared template 引用。unfinished-marker scan 应无输出。

## 限制

- 无 web UI。
- 无 hosted service。
- 无 cloud sync。
- 无 MCP repository indexer。
- 执行阶段能力取决于宿主平台支持，并且默认需要用户在 brief 生成后确认。
