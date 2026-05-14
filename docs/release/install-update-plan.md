# Promptify 安装与更新方案

## 目的

本文档定义 Promptify 的用户安装流程和维护者更新发布流程。Promptify 保持 Markdown-first workflow package 形态，可以使用本地 NPM CLI 分发安装资源，但不需要 runtime service、web UI、database、telemetry 或 MCP indexing。

## 支持的安装形态

Promptify 应作为完整仓库树安装或加载：

```text
promptify/
  README.md
  shared/
  adapters/
    claude-code/
    codex/
```

`shared/` 是已安装产品的一部分。`adapters/claude-code/` 和 `adapters/codex/` 下的 adapter 文件会通过仓库根目录相对路径引用共享模板和规则。

## 用户安装流程

推荐从 Promptify 仓库根目录安装本地 NPM 全局 CLI：

```bash
npm install -g @wjl6339/promptify
promptify install --host=claude-code,codex
promptify doctor
```

NPM registry 上的 `promptify` 包不是本项目；直接运行 `npm install -g promptify` 会安装另一个不提供 `promptify` 命令的包。请使用 scoped package `@wjl6339/promptify`。

`promptify install --host=...` 让用户选择 Claude Code、Codex 或两者。CLI 会将 Promptify 资源复制到 `~/.promptify/current/`，并向所选宿主配置写入 Promptify-managed block：Claude Code 使用 `~/.claude/CLAUDE.md`，Codex 使用 `~/.codex/AGENTS.md`。写入时保留已有用户内容，只替换 managed block；如果目标配置已存在，会先在 `~/.promptify/backups/` 下创建备份。

`promptify doctor` 是 read-only 检查。它需要已有安装资源路径；因此在新环境中应先运行 `promptify install --host=...`，或在测试中先用临时 HOME 完成本地安装 fixture，再运行 doctor。

手动安装流程仍可作为 fallback：

1. 将完整仓库 clone 或复制到稳定的本地路径。
2. 对 Claude Code，通过宿主插件流程加载仓库根目录或 `adapters/claude-code/`。
3. 对 Codex，加载 `adapters/codex/skills/promptify/SKILL.md`，或使用 `adapters/codex/instructions/promptify.md` 作为 fallback instructions。
4. 运行 `README.md` 中的验证命令。
5. 运行 guided prompt-first smoke test：

```text
/promptify 修复登录失败提示
promptify: 修复登录失败提示
```

预期结果：Promptify 返回 Chinese-first 的结构化 brief，询问是否进入执行阶段，并且在用户确认前不编辑文件。

## 用户更新流程

通过 NPM CLI 更新：

```bash
promptify update
```

`promptify update` 刷新 `~/.promptify/current/` 下的安装资源，并在更新后运行 doctor。

手动安装的用户应更新完整仓库，而不是复制单个 adapter 文件：

```bash
git pull --ff-only
```

每次更新后：

1. 运行 `README.md` 中的验证命令。
2. 确认 `shared/` 仍与 `adapters/` 同级存在。
3. 在每个正在使用的宿主中运行一次 guided prompt-first smoke test。
4. 跨 release tag 更新时阅读 release notes。

固定版本安装应使用 tag：

```bash
git fetch --tags
git checkout v0.1.0
```

## 回滚和卸载

回滚使用 Git tags 或 commit hashes：

```bash
git checkout <previous-tag-or-commit>
```

通过 NPM CLI 卸载：

```bash
promptify uninstall --host=claude-code,codex
```

卸载时，CLI 只移除所选宿主配置中的 Promptify-managed block，并保留其他用户内容。手动安装时，移除宿主 assistant 中加载 Promptify 的配置；如果不再需要该本地仓库，再删除仓库副本。Promptify 不会创建外部数据库、服务、scheduled jobs 或 cloud resources。

## 维护者发布流程

多步骤更新使用范围清晰的 release branch：

```bash
git checkout -b release/v0.1.1
```

发布前：

1. 在 `shared/` 下更新共享规则或模板。
2. 仅当宿主行为或 entry points 变化时，更新 `adapters/` 下的薄平台 wrapper。
3. 当用户可见的安装、使用、更新、安全或验证行为变化时，更新 `README.md`。
4. 将平台中立行为保留在 `shared/`；将宿主特定行为保留在对应 adapter 目录。
5. NPM packaging 只能用于本地 install、update、uninstall 和 doctor 验证流程。
6. 除非 PRD 先更新，否则不要添加 runtime services、web UI、telemetry、external databases 或 MCP indexing。

运行发布检查：

```bash
npm test
npm pack --dry-run
node bin/promptify.js version
rg -n "目标：|模式：|上下文：|要求：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md AGENTS.md
python3 -m json.tool adapters/claude-code/.claude-plugin/plugin.json
git diff --check HEAD
```

本地 CLI smoke tests 应使用临时 HOME，避免修改真实宿主配置：

```bash
PROMPTIFY_SMOKE_HOME="$(mktemp -d)"
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js install --host=claude-code,codex
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js doctor
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js update
HOME="$PROMPTIFY_SMOKE_HOME" node bin/promptify.js uninstall --host=claude-code,codex
```

不要把 `node bin/promptify.js doctor` 记录为干净环境的预安装检查；doctor 需要 `~/.promptify/current/` 等安装资源存在，应该放在 install smoke test 之后。

预期结果：

- `npm test` passes.
- `npm pack --dry-run` lists only expected package files.
- `node bin/promptify.js version` prints the package version.
- 临时 HOME smoke tests 不修改真实 `~/.claude/CLAUDE.md` 或 `~/.codex/AGENTS.md`。
- install smoke test 写入 managed block 并按需备份已有配置；doctor 在本地安装后通过；update 刷新资源并运行 doctor；uninstall 只移除 managed block。
- core-block scan 能在每个 template 中找到紧凑必需块。
- adapter scan 能找到 mode 名称和 shared template 引用。
- unfinished-marker scan 无输出。
- `plugin.json` 是合法 JSON。
- `git diff --check HEAD` 不报告 whitespace errors。

## 版本策略

包体较小时使用轻量 semantic tags：

- `v0.1.x`：与 MVP 兼容的文档、template、routing、safety 和 adapter 更新。
- `v0.2.x`：向后兼容的行为扩展，例如新增支持的 task types 或更清晰的 adapter workflow。
- `v1.0.0`：稳定 package shape 和明确的兼容性预期。

检查通过后打 tag：

```bash
git tag v0.1.1
git push origin v0.1.1
```

## 兼容性规则

- 更新 `shared/templates/*.md` 必须保留验证扫描所需的紧凑必需块。
- 更新 `shared/task-routing.md` 不得让 specialized commands 变得含糊。
- 更新 `shared/safety.md` 必须保留 destructive 或 high-risk tasks 的 analysis-first 行为。
- 更新 Claude Code command files 必须保留对 `shared/` 的引用。
- 更新 Codex skill 或 instruction files 必须保留对 `shared/` 的仓库根目录相对路径引用。

## Release Notes 清单

每份 release note 应包含：

- Version tag。
- 变更的 shared templates 或 rules。
- 变更的 Claude Code adapter behavior。
- 变更的 Codex adapter behavior。
- 用户更新后需要执行的操作。
- 已运行的验证命令及结果。
- 已知限制或兼容性说明。
