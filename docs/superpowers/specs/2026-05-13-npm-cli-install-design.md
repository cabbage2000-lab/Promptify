# Promptify NPM CLI 安装设计

## 背景

Promptify 当前是 Markdown-first workflow package，核心价值在 `shared/` 规则、`shared/templates/` 模板，以及 Claude Code / Codex 的薄 adapter。用户希望通过 NPM 方式完成安装、升级、卸载，同时在安装时选择宿主工具，并自动写入宿主配置。

本设计允许新增轻量本地 NPM CLI，但不改变 Promptify 的核心形态：不新增 runtime service、web UI、database、telemetry、cloud sync 或 MCP indexing。

## 目标

- 支持从仓库根目录运行 `npm install -g .` 安装全局 CLI。
- 支持 `promptify install` 交互式选择 Claude Code、Codex 或两者。
- 在用户确认后自动写入所选宿主配置。
- 写配置前展示变更摘要，写配置前创建备份。
- 支持 `promptify update` 更新本地安装资源并复检配置。
- 支持 `promptify uninstall` 移除 Promptify 注入配置，并可恢复最近备份。
- 支持 `promptify doctor` 只检查不修改。

## 非目标

- 不实现 hosted installer。
- 不采集 telemetry。
- 不做 web UI。
- 不做 MCP repository indexer。
- 不改变 Promptify 生成任务 brief 的共享模板逻辑。
- 不在未确认情况下覆盖用户宿主配置。

## 推荐用户体验

安装 CLI：

```bash
npm install -g .
```

交互安装：

```bash
promptify install
```

交互流程：

1. CLI 显示将安装到 `~/.promptify/current/`。
2. CLI 让用户选择宿主，可多选：
   - Claude Code
   - Codex
3. CLI 检测对应宿主配置路径。
4. CLI 展示将创建或修改的文件列表。
5. CLI 展示 Promptify 注入片段摘要。
6. 用户确认后，CLI 创建备份目录：

```text
~/.promptify/backups/<timestamp>/
```

7. CLI 复制 package 内的 `shared/`、`adapters/`、`README.md` 到：

```text
~/.promptify/current/
```

8. CLI 写入所选宿主配置。
9. CLI 自动运行 `promptify doctor`。
10. CLI 输出 smoke test 示例。

非交互安装：

```bash
promptify install --host claude-code,codex --yes
```

`--yes` 仅跳过最终确认，不跳过备份。

## 文件布局

仓库新增：

```text
package.json
bin/
  promptify.js
lib/
  cli.js
  install.js
  update.js
  uninstall.js
  doctor.js
  paths.js
  fs-safe.js
  hosts/
    claude-code.js
    codex.js
```

安装后用户目录：

```text
~/.promptify/
  current/
    README.md
    shared/
    adapters/
  backups/
    <timestamp>/
      manifest.json
      hosts/
```

`manifest.json` 记录：

```json
{
  "version": "0.1.0",
  "installedAt": "2026-05-13T00:00:00.000Z",
  "installPath": "~/.promptify/current",
  "hosts": ["claude-code", "codex"],
  "backups": [
    {
      "host": "claude-code",
      "path": "<host-config-path>",
      "backupPath": "~/.promptify/backups/<timestamp>/hosts/claude-code"
    }
  ]
}
```

## 宿主配置策略

每个 host module 必须实现统一接口：

```js
export async function detect(options) {}
export async function planInstall(context) {}
export async function applyInstall(plan) {}
export async function planUninstall(context) {}
export async function doctor(context) {}
```

`planInstall` 只生成计划，不写文件。`applyInstall` 只执行已经展示并确认的计划。

### Claude Code

Claude Code host module 负责：

- 检测可写配置路径。
- 将 Promptify Claude adapter 配置为指向 `~/.promptify/current/adapters/claude-code/`。
- 保留已有 Claude Code 配置。
- 只更新 Promptify 管理的配置片段。

如果无法可靠识别宿主配置格式，CLI 必须停止自动写入，并输出手动配置步骤。

### Codex

Codex host module 负责：

- 检测可写配置路径或用户级 instructions 位置。
- 将 Promptify skill 指向 `~/.promptify/current/adapters/codex/skills/promptify/SKILL.md`。
- 在 fallback 场景中提示用户使用 `~/.promptify/current/adapters/codex/instructions/promptify.md`。
- 保留已有 Codex 配置。

如果无法可靠识别宿主配置格式，CLI 必须停止自动写入，并输出手动配置步骤。

## 安全机制

- 自动写配置前必须创建备份。
- 安装和卸载必须只修改 Promptify 管理的片段。
- 配置片段应包含稳定 marker，例如：

```text
# BEGIN PROMPTIFY MANAGED BLOCK
# END PROMPTIFY MANAGED BLOCK
```

- 如果配置文件存在但没有 Promptify marker，不得删除已有内容。
- 如果配置文件包含手动编辑过的 Promptify marker，卸载前显示摘要并要求确认。
- `doctor` 不允许写文件。
- `update` 不得删除用户备份。

## 命令定义

```bash
promptify install
promptify install --host claude-code,codex
promptify install --host claude-code --yes
promptify update
promptify uninstall
promptify uninstall --host codex
promptify doctor
promptify doctor --json
promptify version
```

## 验证规则

`promptify doctor` 检查：

- `~/.promptify/current/shared/` 存在。
- `~/.promptify/current/adapters/claude-code/.claude-plugin/plugin.json` 是合法 JSON。
- `~/.promptify/current/adapters/codex/skills/promptify/SKILL.md` 存在。
- 已选择宿主配置中包含 Promptify marker。
- 宿主配置引用路径存在。
- `shared/templates/` 中能找到 `目标：`、`模式：`、`上下文：`、`要求：`。

## 错误处理

- 配置路径不存在：提示用户输入自定义配置路径或输出手动配置步骤。
- 配置路径不可写：停止安装，提示权限问题。
- 备份失败：停止安装，不写配置。
- 安装资源复制失败：停止安装，保留已有备份。
- doctor 失败：返回非零退出码，并输出失败项。

## 文档更新

README 需要包含：

- `npm install -g .`
- `promptify install`
- `promptify update`
- `promptify uninstall`
- `promptify doctor`
- 安全说明：写配置前备份、可回滚、不会启动服务或采集数据。

release 文档需要包含：

- NPM 发布检查。
- `npm pack --dry-run` 检查。
- 本地安装 smoke test。
- CLI doctor 验证。

## 自检

- 本设计覆盖用户要求的 NPM 安装、升级、卸载。
- 本设计覆盖 Claude Code / Codex 多选安装。
- 本设计覆盖自动写入宿主配置，但要求展示计划、创建备份、确认后执行。
- 本设计没有引入服务端、UI、数据库、遥测或 MCP indexing。
- 本设计没有留下待补占位。
