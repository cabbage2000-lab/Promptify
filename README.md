# Promptify

Promptify 将简短的开发意图转换为结构化、上下文感知、平台感知的 Claude Code 和 Codex 开发任务工作流。

## 它是什么

- 面向 Claude Code 和 Codex 的任务指令编排器。
- 将短意图转换为可执行任务的轻量工具包。
- 覆盖 bugfix、feature、refactor、test、review、docs、planning 等常见开发任务的 workflow package。

## MVP 行为

- `/promptify <short_task>` 在宿主平台支持时默认直接执行。
- `/promptify:generate <short_task>` 只输出紧凑的 prompt-only brief，然后停止。
- Promptify 会先探索最小必要项目上下文，再填充生成的紧凑 brief，规则见 `shared/context-discovery.md`。
- 高风险输入进入 analysis-first 模式， destructive edits 前必须获得明确确认。

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
/promptify:generate 重构订单状态计算逻辑
/promptify:review 当前改动
/promptify:plan 支持团队模板覆盖
```

## Codex 用法

从仓库根目录使用 Codex skill 或 fallback instructions：

```text
promptify/
```

Codex adapter 位于 `adapters/codex/`，但其说明文件会引用仓库根目录下的 `shared/` 共享资源。加载 Promptify 时，请保持 `adapters/codex/` 和 `shared/` 位于同一个仓库根目录上下文中。

本地安装时，可以加载 `adapters/codex/skills/promptify/SKILL.md`，也可以将 `adapters/codex/instructions/promptify.md` 作为 fallback session instructions 使用。请保持完整仓库结构，确保 adapter 能引用 `shared/`。

当 slash commands 不可用时，可以使用 command-like text：

```text
promptify: 修复登录失败提示
promptify generate: 重构订单状态计算逻辑
promptify review: 当前改动
promptify plan: 支持团队模板覆盖
```

## 安装

Promptify 作为本地 workflow package 安装。它通过 NPM CLI 分发和刷新本地 Markdown 资源，但没有 runtime service、database、telemetry 或 web UI。

推荐安装：

```bash
npm install -g promptify
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
- Claude Code 写入 `~/.claude/CLAUDE.md`；Codex 写入 `~/.codex/AGENTS.md`。
- 写入配置时会保留已有用户内容，只替换 Promptify-managed block。
- 如果目标配置已存在，安装会先在 `~/.promptify/backups/` 下创建备份。
- `promptify doctor` 是 read-only 检查，只读取安装路径和 adapter/template 状态，不修改文件。
- `promptify uninstall --host=...` 只移除所选宿主配置中的 Promptify-managed block，保留其他用户内容。

推荐目录结构：

```text
promptify/
  README.md
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
5. 执行 prompt-only smoke test，例如 `/promptify:generate 修复登录失败提示` 或 `promptify generate: 修复登录失败提示`。

## 更新

通过 NPM CLI 更新已安装资源：

```bash
promptify update
```

手动仓库安装时，更新完整仓库，不要单独复制 adapter 文件：

```bash
git pull --ff-only
```

更新后重新运行 Manual QA 检查。如果更新涉及 shared templates、safety rules、routing rules 或 adapter entry points，也请在每个正在使用的宿主中执行一次 prompt-only smoke test。

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

## 安全规则

Promptify 将 deletion、migration、payment、permission、auth、security、production、mass update、rewrite、purge 等信号视为高风险。此类任务会先进入 analysis-first 模式，并在 destructive edits 前要求明确确认。

## Manual QA

根据你修改的文件，使用 `shared/test-plan.md` 选择相关检查清单。发布前至少运行以下命令：

```bash
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

第一条命令应能在每个 template 中找到紧凑核心块。adapter scan 应能找到 mode 名称和 shared template 引用。unfinished-marker scan 应无输出。

## 限制

- 无 web UI。
- 无 hosted service。
- 无 cloud sync。
- 无 MCP repository indexer。
- 直接执行能力取决于宿主平台支持。
