# Promptify MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the local Promptify MVP described in `prd/promptify-prd.md`: shared task templates, safety/routing rules, Claude Code adapter, Codex adapter, and README usage docs.

**Architecture:** Keep product behavior in `shared/` as platform-neutral Markdown instructions. Keep Claude Code and Codex integration thin in `adapters/`, where each adapter references the shared templates and adds host-specific execution rules. Use Markdown-first assets so the MVP can work as a plugin/workflow package without a runtime service.

**Tech Stack:** Markdown instruction files, Claude Code plugin command files, Codex skill/instruction package files, shell-based documentation checks.

---

## File Structure

Create the following structure:

```text
promptify/
  shared/
    templates/
      task.md
      bugfix.md
      feature.md
      refactor.md
      test.md
      review.md
      docs.md
      plan.md
    safety.md
    task-routing.md
    brief-standard.md
  adapters/
    claude-code/
      .claude-plugin/
        plugin.json
      commands/
        promptify.md
        promptify-generate.md
        promptify-task.md
        promptify-debug.md
        promptify-refactor.md
        promptify-test.md
        promptify-review.md
        promptify-docs.md
        promptify-plan.md
      skills/
        promptify/
          SKILL.md
    codex/
      skills/
        promptify/
          SKILL.md
      instructions/
        promptify.md
  README.md
```

Responsibilities:

- `shared/brief-standard.md`: Canonical generated brief sections, mode differences, output language rules, and final report expectations.
- `shared/task-routing.md`: Keyword cues, routing priority, high-risk override behavior, and examples.
- `shared/safety.md`: High-risk signals, action safety levels, confirmation requirements, and prompt-only safety behavior.
- `shared/templates/*.md`: One focused task brief template per supported task type.
- `adapters/claude-code/**`: Claude Code local plugin wrapper, command entry points, and skill instructions.
- `adapters/codex/**`: Codex skill/instruction wrapper and fallback usage instructions.
- `README.md`: Installation, usage, examples, limitations, QA, and roadmap.

## Task 1: Create Repository Skeleton

**Files:**
- Create directories under `shared/`, `adapters/claude-code/`, `adapters/codex/`
- Create empty Markdown/JSON files listed in File Structure

- [ ] **Step 1: Create directories**

Run:

```bash
mkdir -p shared/templates \
  adapters/claude-code/.claude-plugin \
  adapters/claude-code/commands \
  adapters/claude-code/skills/promptify \
  adapters/codex/skills/promptify \
  adapters/codex/instructions
```

Expected: command exits with status 0.

- [ ] **Step 2: Create initial files**

Run:

```bash
touch shared/brief-standard.md \
  shared/safety.md \
  shared/task-routing.md \
  shared/templates/task.md \
  shared/templates/bugfix.md \
  shared/templates/feature.md \
  shared/templates/refactor.md \
  shared/templates/test.md \
  shared/templates/review.md \
  shared/templates/docs.md \
  shared/templates/plan.md \
  adapters/claude-code/.claude-plugin/plugin.json \
  adapters/claude-code/commands/promptify.md \
  adapters/claude-code/commands/promptify-generate.md \
  adapters/claude-code/commands/promptify-task.md \
  adapters/claude-code/commands/promptify-debug.md \
  adapters/claude-code/commands/promptify-refactor.md \
  adapters/claude-code/commands/promptify-test.md \
  adapters/claude-code/commands/promptify-review.md \
  adapters/claude-code/commands/promptify-docs.md \
  adapters/claude-code/commands/promptify-plan.md \
  adapters/claude-code/skills/promptify/SKILL.md \
  adapters/codex/skills/promptify/SKILL.md \
  adapters/codex/instructions/promptify.md \
  README.md
```

Expected: command exits with status 0.

- [ ] **Step 3: Verify skeleton**

Run:

```bash
find shared adapters -type f | sort
```

Expected: output lists all files from the File Structure section.

- [ ] **Step 4: Commit**

```bash
git add shared adapters README.md
git commit -m "chore: scaffold promptify mvp structure"
```

## Task 2: Write Shared Brief Standard

**Files:**
- Modify: `shared/brief-standard.md`

- [ ] **Step 1: Add canonical brief standard**

Write `shared/brief-standard.md` with these sections:

```markdown
# Promptify Brief Standard

Every generated Promptify brief must include these fields unless a selected task type explicitly removes one:

| Field | Required | Purpose |
|---|---|---|
| 任务目标 | Yes | Restate the intended outcome in concrete terms. |
| 假设 | Conditional | Required when input is vague or task type detection is uncertain. |
| 执行模式 | Yes | State direct execution, prompt-only, analysis-first, review-only, or plan-only. |
| 项目上下文 | Yes | Tell the host assistant what local context to inspect first. |
| 执行要求 | Yes | Define the order of investigation, planning, editing, and validation. |
| 边界限制 | Yes | Define what should not be changed. |
| 验收标准 | Yes | Define observable completion criteria. |
| 验证方式 | Yes | Require relevant tests, lint, typecheck, or documented manual checks. |
| 安全门禁 | Conditional | Required for high-risk signals or destructive actions. |
| 最终汇报 | Yes | Define what the assistant must report back. |

## Mode Rules

Direct execution mode:

- Treat the generated brief as the active instruction for the current session.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Plan briefly before edits.
- Verify with the most relevant available command.
- Report changed files, behavior changes, verification results, risks, and follow-ups.

Prompt-only mode:

- Output only the generated brief.
- Do not read files, run commands, edit files, or continue into execution.
- Include verification and safety expectations for the future executor.

Analysis-first mode:

- Inspect relevant context and identify impact.
- Do not perform high-risk or destructive edits before explicit confirmation.
- Report affected files, modules, likely blast radius, and a proposed safe plan.

Review-only mode:

- Use a code-review stance.
- Lead with findings.
- Prioritize bugs, regressions, security risks, and missing tests.
- Keep summaries secondary.

Plan-only mode:

- Investigate relevant code and constraints when allowed by the host.
- Produce a staged implementation plan.
- Do not edit code unless the user explicitly asks to continue.

## Language Rules

- Default output language is Chinese.
- If the user's task is mostly English, English output is allowed unless local instructions prefer Chinese.
- Keep technical identifiers, commands, file paths, package names, and framework names unchanged.
```

- [ ] **Step 2: Verify required sections exist**

Run:

```bash
rg -n "Mode Rules|Direct execution mode|Prompt-only mode|Analysis-first mode|Review-only mode|Plan-only mode|Language Rules" shared/brief-standard.md
```

Expected: all listed headings or phrases are present.

- [ ] **Step 3: Commit**

```bash
git add shared/brief-standard.md
git commit -m "docs: define promptify brief standard"
```

## Task 3: Write Routing and Safety Rules

**Files:**
- Modify: `shared/task-routing.md`
- Modify: `shared/safety.md`

- [ ] **Step 1: Write routing rules**

Write `shared/task-routing.md` with:

```markdown
# Promptify Task Routing

Promptify classifies short user input with lightweight keyword and intent cues.

## Task Type Cues

| Input cues | Task type | Template |
|---|---|---|
| 修复, bug, 报错, 失败, 异常, 不对, crash | debug / bugfix | `templates/bugfix.md` |
| 新增, 实现, 支持, 增加, add, implement | feature | `templates/feature.md` |
| 重构, 优化结构, 拆分, 整理, refactor | refactor | `templates/refactor.md` |
| 测试, 覆盖率, 补 test, 单测 | test | `templates/test.md` |
| review, 审查, 看看代码, PR | review | `templates/review.md` |
| 文档, README, 注释, docs | docs | `templates/docs.md` |
| 规划, 方案, 设计, plan | plan | `templates/plan.md` |

## Priority

1. Explicit specialized command wins.
2. High-risk signals override normal direct execution.
3. User-stated intent wins over secondary words.
4. Closely related multi-intent tasks use one brief with primary and secondary goals.
5. Independent multi-intent tasks ask one focused clarification question or propose splitting the work.
6. Uncertain tasks use `templates/task.md` and state assumptions.

## Examples

| Input | Route | Mode |
|---|---|---|
| `/promptify 修复登录失败提示` | debug / bugfix | direct execution |
| `/promptify:generate 修复登录失败提示` | debug / bugfix | prompt-only |
| `/promptify:review 当前改动` | review | review-only |
| `/promptify 重构支付模块并补测试` | high-risk refactor | analysis-first |
| `/promptify 删除旧支付模块` | high-risk task | analysis-first |
| `/promptify 优化一下这个模块` | generic task | investigative direct execution or clarification |
```

- [ ] **Step 2: Write safety rules**

Write `shared/safety.md` with:

```markdown
# Promptify Safety Rules

## High-Risk Signals

Treat these signals as high risk:

- 删除 / remove / delete
- 数据迁移 / migration
- 支付 / payment
- 权限 / permission
- 认证 / auth
- 安全 / security
- 生产 / production
- 批量修改 / mass update
- 重写 / rewrite
- 清空 / purge

## Safety Levels

| Safety level | Examples | Default behavior |
|---|---|---|
| Read-only | Inspect files, search code, read docs, summarize current behavior | Allowed during direct execution and analysis-first mode. |
| Low-risk edit | Small scoped fix, docs update, focused test addition | Allowed in direct execution when no high-risk signal is present. |
| Medium-risk edit | Refactor, dependency change, broad test rewrite, behavior-affecting feature | Require brief plan before editing and relevant verification after editing. |
| High-risk edit | Delete files, migration, auth or permission change, payment flow change, production config change, mass rewrite | Analysis-first only; require explicit user confirmation before execution. |
| Destructive action | Remove modules, purge data, irreversible migration, forceful cleanup | Never perform without explicit confirmation and rollback or recovery notes. |

## Confirmation Requirements

For high-risk or destructive actions, ask for confirmation before editing. Include:

- Proposed action.
- Affected files, modules, or systems.
- Expected behavior change.
- Verification plan.
- Known risks and rollback or recovery notes when applicable.

Destructive actions require clear confirmation such as `确认删除` or `continue with deletion`.

## Prompt-Only Safety

Prompt-only mode still detects high-risk signals. Generated prompts for high-risk tasks must instruct the future host assistant to start with impact analysis and request confirmation before destructive edits.
```

- [ ] **Step 3: Verify routing and safety terms**

Run:

```bash
rg -n "High-risk|analysis-first|prompt-only|确认删除|templates/bugfix.md|templates/plan.md" shared/task-routing.md shared/safety.md
```

Expected: routing and safety files both contain the key terms.

- [ ] **Step 4: Commit**

```bash
git add shared/task-routing.md shared/safety.md
git commit -m "docs: define routing and safety rules"
```

## Task 4: Write Core Templates

**Files:**
- Modify: `shared/templates/task.md`
- Modify: `shared/templates/bugfix.md`
- Modify: `shared/templates/feature.md`
- Modify: `shared/templates/refactor.md`
- Modify: `shared/templates/test.md`
- Modify: `shared/templates/review.md`
- Modify: `shared/templates/docs.md`
- Modify: `shared/templates/plan.md`

- [ ] **Step 1: Write generic task template**

Write `shared/templates/task.md`:

```markdown
# Generic Task Template

Use this when task type detection is uncertain or the input contains mixed intent.

## Brief

任务目标：
基于用户的简短输入，明确当前最可能的目标。如果目标不清晰，先说明合理假设。

执行模式：
默认使用调查式直接执行。若存在高风险信号，切换到分析优先模式。

项目上下文：
优先阅读当前仓库、平台指令文件、已有代码风格、测试约定、README、包脚本、CI 配置和用户会话指令。

执行要求：
1. 先定位相关文件和现有实现。
2. 判断任务类型和影响范围。
3. 如目标足够明确，制定简短计划后执行。
4. 如目标不明确，提出一个聚焦澄清问题。

边界限制：
不要修改无关模块，不要做不必要的大规模重构，不要引入无关依赖。

验收标准：
任务目标被明确并完成，或在信息不足时给出明确的下一步问题。

验证方式：
运行最相关的测试、lint、typecheck 或项目已有验证命令；无法运行时说明原因。

最终汇报：
说明假设、执行内容、修改文件、验证结果、风险和后续建议。
```

- [ ] **Step 2: Write bugfix template**

Write `shared/templates/bugfix.md`:

```markdown
# Bugfix / Debug Template

## Brief

任务目标：
修复用户描述的问题，并保持无关行为不变。

执行模式：
直接执行。若输入含高风险信号，先进入分析优先模式。

项目上下文：
优先查找报错、失败路径、相关调用链、测试、日志、错误处理和近期变更。

执行要求：
1. 复现、检查或定位问题，不要直接猜测修改。
2. 明确最可能根因。
3. 制定简短修复计划。
4. 应用最小范围修复。
5. 适当补充或更新测试。

边界限制：
不要重构无关模块，不要改动与根因无关的行为，不要引入无关依赖。

验收标准：
原问题被修复，相关正常路径保持不变。

验证方式：
运行最相关的测试或检查命令；如果无法运行，说明阻塞原因和替代验证。

最终汇报：
说明根因、修改文件、行为变化、验证结果、剩余风险和后续建议。
```

- [ ] **Step 3: Write feature template**

Write `shared/templates/feature.md`:

```markdown
# Feature Template

## Brief

任务目标：
实现用户要求的新能力，并与现有架构和代码风格保持一致。

执行模式：
直接执行。若需求范围大或含高风险信号，先进入分析优先模式。

项目上下文：
优先阅读相邻功能、现有架构、命名风格、测试样例、错误处理和文档。

执行要求：
1. 找到相似功能和现有扩展点。
2. 明确最小完整实现范围。
3. 制定简短计划。
4. 实现功能、必要错误态和边界情况。
5. 添加或更新测试。

边界限制：
不要扩大需求范围，不要重写无关架构，不要添加未要求的配置系统。

验收标准：
新能力可用，关键边界情况被处理，相关测试通过。

验证方式：
运行目标测试、相关 lint/typecheck 或项目推荐验证命令。

最终汇报：
说明新增行为、修改文件、测试覆盖、验证结果、风险和后续建议。
```

- [ ] **Step 4: Write refactor template**

Write `shared/templates/refactor.md`:

```markdown
# Refactor Template

## Brief

任务目标：
在保持现有行为不变的前提下改善指定代码结构。

执行模式：
直接执行。涉及支付、认证、权限、迁移、生产配置、删除或重写时进入分析优先模式。

项目上下文：
优先阅读目标模块、调用方、测试、公开接口和文档。

执行要求：
1. 明确当前行为和依赖关系。
2. 制定低风险分步计划。
3. 保持公开接口稳定，除非用户明确要求修改。
4. 做小步重构，避免格式和风格噪音。
5. 运行相关测试后再声称完成。

边界限制：
不要改变业务行为，不要引入无关抽象，不要修改无关调用方。

验收标准：
行为保持一致，结构更清晰，测试或替代验证通过。

验证方式：
优先运行现有相关测试；如缺少测试，说明人工检查路径和风险。

最终汇报：
说明重构范围、保持不变的行为、修改文件、验证结果和残留风险。
```

- [ ] **Step 5: Write test template**

Write `shared/templates/test.md`:

```markdown
# Test Template

## Brief

任务目标：
为指定目标补充或改进有价值的测试覆盖。

执行模式：
直接执行。若测试目标涉及高风险模块，先分析影响范围。

项目上下文：
优先阅读现有测试目录、测试命名、测试工具、fixture、mock 风格和目标实现。

执行要求：
1. 确认现有测试框架和约定。
2. 找到需要覆盖的具体行为。
3. 添加聚焦行为的测试，避免脆弱的实现细节断言。
4. 如发现真实缺陷，先报告并按 bugfix 流程处理。

边界限制：
不要为了测试大改生产代码，不要添加不稳定测试，不要追求无意义覆盖率。

验收标准：
新增或更新的测试覆盖目标行为，并能稳定运行。

验证方式：
运行目标测试命令；必要时运行相关测试集合。

最终汇报：
说明新增测试覆盖的行为、修改文件、验证结果和未覆盖风险。
```

- [ ] **Step 6: Write review template**

Write `shared/templates/review.md`:

```markdown
# Review Template

## Brief

任务目标：
审查指定范围的代码或当前改动，优先发现真实风险。

执行模式：
Review-only。默认不编辑文件。

项目上下文：
优先查看 diff、相关实现、测试和调用方。

执行要求：
1. 使用代码审查姿态。
2. 优先找 bug、回归、安全风险、缺失测试和行为不一致。
3. 尽量提供文件和行号引用。
4. 按严重程度排序。

边界限制：
不要把总结放在发现之前，不要提出纯风格偏好作为主要问题，不要修改代码。

验收标准：
输出清晰的审查结论；若无问题，明确说明未发现问题并列出剩余测试风险。

验证方式：
以阅读和必要的只读命令为主；不运行破坏性命令。

最终汇报：
先列 findings，再列 open questions 或 assumptions，最后给简短 summary。
```

- [ ] **Step 7: Write docs template**

Write `shared/templates/docs.md`:

```markdown
# Docs Template

## Brief

任务目标：
更新指定文档，使其准确反映已实现行为。

执行模式：
直接执行，默认仅修改文档。

项目上下文：
优先阅读现有文档风格、相关实现、示例命令和安装说明。

执行要求：
1. 确认文档目标和受众。
2. 对照实际实现更新说明。
3. 保持简洁、准确、一致。
4. 更新过期示例命令。

边界限制：
不要记录未实现行为，不要顺手改代码，不要加入营销式内容。

验收标准：
文档与当前实现一致，示例可理解且可执行。

验证方式：
检查链接、命令、文件路径和示例是否与仓库一致。

最终汇报：
说明更新内容、修改文件、验证结果和仍需补充的文档点。
```

- [ ] **Step 8: Write plan template**

Write `shared/templates/plan.md`:

```markdown
# Plan Template

## Brief

任务目标：
为用户描述的功能、重构或复杂任务产出可执行计划。

执行模式：
Plan-only。默认不编辑代码。

项目上下文：
优先调查相关代码、约束、测试、现有架构、平台指令文件和文档。

执行要求：
1. 明确目标和非目标。
2. 识别相关模块和依赖。
3. 拆分阶段和任务。
4. 写明每阶段的验证方式。
5. 标注风险、回滚或降级策略。

边界限制：
不要开始实现，不要运行破坏性命令，不要跳过风险说明。

验收标准：
计划足够具体，工程师可按任务顺序执行并验证。

验证方式：
检查计划是否覆盖目标、范围、文件、测试、风险和验收。

最终汇报：
输出阶段化计划、关键文件、验证命令、风险和建议执行顺序。
```

- [ ] **Step 9: Verify all templates have required sections**

Run:

```bash
rg -n "任务目标：|执行模式：|项目上下文：|执行要求：|边界限制：|验收标准：|验证方式：|最终汇报：" shared/templates
```

Expected: every file in `shared/templates/` contains all listed section labels.

- [ ] **Step 10: Commit**

```bash
git add shared/templates
git commit -m "docs: add core promptify templates"
```

## Task 5: Implement Claude Code Adapter

**Files:**
- Modify: `adapters/claude-code/.claude-plugin/plugin.json`
- Modify: `adapters/claude-code/skills/promptify/SKILL.md`
- Modify: `adapters/claude-code/commands/promptify.md`
- Modify: `adapters/claude-code/commands/promptify-generate.md`
- Modify: `adapters/claude-code/commands/promptify-task.md`
- Modify: `adapters/claude-code/commands/promptify-debug.md`
- Modify: `adapters/claude-code/commands/promptify-refactor.md`
- Modify: `adapters/claude-code/commands/promptify-test.md`
- Modify: `adapters/claude-code/commands/promptify-review.md`
- Modify: `adapters/claude-code/commands/promptify-docs.md`
- Modify: `adapters/claude-code/commands/promptify-plan.md`

- [ ] **Step 1: Write plugin metadata**

Write `adapters/claude-code/.claude-plugin/plugin.json`:

```json
{
  "name": "promptify",
  "version": "0.1.0",
  "description": "Turn brief developer intent into structured Claude Code and Codex task workflows.",
  "author": "Promptify",
  "commands": [
    "promptify",
    "promptify-generate",
    "promptify-task",
    "promptify-debug",
    "promptify-refactor",
    "promptify-test",
    "promptify-review",
    "promptify-docs",
    "promptify-plan"
  ],
  "skills": [
    "promptify"
  ]
}
```

- [ ] **Step 2: Write Claude Code skill**

Write `adapters/claude-code/skills/promptify/SKILL.md`:

```markdown
---
name: promptify
description: Convert short developer intent into structured Claude Code task workflows with direct execution as the default.
---

# Promptify for Claude Code

Use Promptify when the user invokes `/promptify` commands or asks to convert a short development intent into an executable task brief.

## Shared Sources

Consult these shared files:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/templates/*.md`

## Claude Code Rules

- Honor `CLAUDE.md`, project memory, repository conventions, existing code style, and relevant test commands.
- Preserve unrelated user changes.
- Default `/promptify` to direct execution.
- Keep `/promptify:generate` prompt-only.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Final reports must include changed files, behavior changes, verification result, risks, and follow-ups.
```

- [ ] **Step 3: Write default command**

Write `adapters/claude-code/commands/promptify.md`:

```markdown
# /promptify

Convert the user's short task into a Promptify execution brief and proceed directly when safe.

Input: `$ARGUMENTS`

Workflow:

1. Read `shared/task-routing.md`, `shared/safety.md`, and `shared/brief-standard.md`.
2. Classify `$ARGUMENTS`.
3. Select the matching file from `shared/templates/`.
4. If high-risk signals are present, use analysis-first mode and ask for confirmation before high-risk edits.
5. Otherwise, treat the generated brief as the active instruction and execute it.
6. Report changed files, behavior changes, verification result, risks, and follow-ups.
```

- [ ] **Step 4: Write prompt-only command**

Write `adapters/claude-code/commands/promptify-generate.md`:

```markdown
# /promptify:generate

Convert the user's short task into a polished Promptify brief. Do not execute it.

Input: `$ARGUMENTS`

Rules:

- Do not edit files.
- Do not run commands.
- Do not continue into implementation.
- Output the generated brief only.
- Include safety gates and verification expectations.
```

- [ ] **Step 5: Write specialized commands**

Use this exact pattern for specialized command files, changing `Template` and `Mode` per file:

`adapters/claude-code/commands/promptify-task.md`

```markdown
# /promptify:task

Input: `$ARGUMENTS`

Template: `shared/templates/task.md`
Mode: direct execution unless high-risk signals require analysis-first mode.

Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-debug.md`

```markdown
# /promptify:debug

Input: `$ARGUMENTS`

Template: `shared/templates/bugfix.md`
Mode: direct execution unless high-risk signals require analysis-first mode.

Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-refactor.md`

```markdown
# /promptify:refactor

Input: `$ARGUMENTS`

Template: `shared/templates/refactor.md`
Mode: direct execution unless high-risk signals require analysis-first mode.

Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-test.md`

```markdown
# /promptify:test

Input: `$ARGUMENTS`

Template: `shared/templates/test.md`
Mode: direct execution unless high-risk signals require analysis-first mode.

Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-review.md`

```markdown
# /promptify:review

Input: `$ARGUMENTS`

Template: `shared/templates/review.md`
Mode: review-only.

Do not edit files unless the user explicitly asks for fixes after the review.
Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-docs.md`

```markdown
# /promptify:docs

Input: `$ARGUMENTS`

Template: `shared/templates/docs.md`
Mode: direct execution limited to documentation unless high-risk signals require analysis-first mode.

Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

`adapters/claude-code/commands/promptify-plan.md`

```markdown
# /promptify:plan

Input: `$ARGUMENTS`

Template: `shared/templates/plan.md`
Mode: plan-only.

Investigate relevant context when allowed, then produce a staged implementation plan. Do not edit code unless the user explicitly asks to continue.
Follow `shared/brief-standard.md`, `shared/task-routing.md`, and `shared/safety.md`.
```

- [ ] **Step 6: Verify Claude adapter**

Run:

```bash
rg -n "promptify|shared/templates|analysis-first|prompt-only|review-only|plan-only" adapters/claude-code
```

Expected: each command and skill references Promptify behavior and shared files.

- [ ] **Step 7: Commit**

```bash
git add adapters/claude-code
git commit -m "docs: add claude code promptify adapter"
```

## Task 6: Implement Codex Adapter

**Files:**
- Modify: `adapters/codex/skills/promptify/SKILL.md`
- Modify: `adapters/codex/instructions/promptify.md`

- [ ] **Step 1: Write Codex skill**

Write `adapters/codex/skills/promptify/SKILL.md`:

```markdown
---
name: promptify
description: Convert short developer intent into structured Codex task workflows with direct execution as the preferred default.
---

# Promptify for Codex

Use Promptify when the user invokes a Promptify-like workflow or asks to convert short development intent into an executable Codex task brief.

## Shared Sources

Consult these shared files:

- `shared/brief-standard.md`
- `shared/task-routing.md`
- `shared/safety.md`
- `shared/templates/*.md`

## Codex Rules

- Honor `AGENTS.md` or equivalent repository instruction files.
- Honor current session instructions, sandbox behavior, existing code style, and test conventions.
- Inspect the workspace before editing.
- Preserve unrelated user changes.
- Prefer direct execution when the host supports it.
- Use prompt-only behavior when the user asks to generate a reusable brief.
- Use analysis-first mode for high-risk signals.
- Do not perform destructive edits without explicit confirmation.
- Final reports must include changed files, behavior changes, verification result, risks, and follow-ups.

## Command-Like Invocation

When slash commands are unavailable, interpret user phrases like these as Promptify invocations:

- `promptify: 修复登录失败提示`
- `promptify generate: 重构订单状态计算逻辑`
- `promptify review: 当前改动`
- `promptify plan: 支持团队模板覆盖`
```

- [ ] **Step 2: Write Codex fallback instructions**

Write `adapters/codex/instructions/promptify.md`:

```markdown
# Promptify Codex Fallback Instructions

Use this file when Codex cannot load a dedicated Promptify command.

## Usage

- Direct execution: `promptify: <short task>`
- Prompt-only generation: `promptify generate: <short task>`
- Review: `promptify review: <scope>`
- Plan: `promptify plan: <feature or goal>`

## Behavior

1. Read `shared/task-routing.md`, `shared/safety.md`, and `shared/brief-standard.md`.
2. Select the relevant template from `shared/templates/`.
3. Apply Codex-specific rules:
   - inspect the workspace first;
   - preserve unrelated user changes;
   - follow `AGENTS.md` and session instructions;
   - verify with relevant commands;
   - report changed files, behavior changes, verification result, risks, and follow-ups.
4. For prompt-only generation, output the brief and stop.
5. For high-risk inputs, start with analysis and request explicit confirmation before destructive edits.
```

- [ ] **Step 3: Verify Codex adapter**

Run:

```bash
rg -n "AGENTS.md|sandbox|promptify generate|analysis-first|destructive|shared/templates" adapters/codex
```

Expected: Codex skill and fallback instructions include Codex-specific constraints and shared template references.

- [ ] **Step 4: Commit**

```bash
git add adapters/codex
git commit -m "docs: add codex promptify adapter"
```

## Task 7: Write README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README**

Write `README.md` with:

```markdown
# Promptify

Promptify turns brief developer prompts into structured, context-aware, platform-aware development task workflows for Claude Code and Codex.

## What It Is

- A task instruction orchestrator for Claude Code and Codex.
- A short-intent-to-executable-task converter.
- A lightweight workflow package for bugfixes, features, refactors, tests, reviews, docs, and planning.

## MVP Behavior

- `/promptify <short_task>` defaults to direct execution when the host supports it.
- `/promptify:generate <short_task>` outputs a prompt-only brief and stops.
- High-risk inputs use analysis-first mode and require confirmation before destructive edits.

## Claude Code Usage

Install or load the local adapter from:

```text
adapters/claude-code/
```

Example commands:

```text
/promptify 修复登录失败提示
/promptify:generate 重构订单状态计算逻辑
/promptify:review 当前改动
/promptify:plan 支持团队模板覆盖
```

## Codex Usage

Use the Codex skill or fallback instructions from:

```text
adapters/codex/
```

When slash commands are unavailable, use command-like text:

```text
promptify: 修复登录失败提示
promptify generate: 重构订单状态计算逻辑
promptify review: 当前改动
promptify plan: 支持团队模板覆盖
```

## Supported Task Types

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

## Safety

Promptify treats deletion, migration, payment, permission, auth, security, production, mass update, rewrite, and purge signals as high risk. These tasks start with analysis and require explicit confirmation before destructive edits.

## Manual QA

Run these checks before release:

```bash
rg -n "任务目标：|执行模式：|项目上下文：|执行要求：|边界限制：|验收标准：|验证方式：|最终汇报：" shared/templates
rg -n "analysis-first|prompt-only|review-only|plan-only|shared/templates" adapters
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]" shared adapters README.md
```

The first two commands should find required behavior. The final command should produce no output.

## Limitations

- No web UI.
- No hosted service.
- No cloud sync.
- No MCP repository indexer.
- Direct execution depends on host platform support.
```

- [ ] **Step 2: Verify README examples**

Run:

```bash
rg -n "/promptify|promptify generate|High-risk|Manual QA|Limitations" README.md
```

Expected: README includes examples, safety notes, QA, and limitations.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add promptify readme"
```

## Task 8: Run MVP QA

**Files:**
- Inspect all created files
- Modify any file that fails the checks

- [ ] **Step 1: Check required template sections**

Run:

```bash
rg -l "任务目标：" shared/templates | wc -l
rg -l "执行模式：" shared/templates | wc -l
rg -l "项目上下文：" shared/templates | wc -l
rg -l "执行要求：" shared/templates | wc -l
rg -l "边界限制：" shared/templates | wc -l
rg -l "验收标准：" shared/templates | wc -l
rg -l "验证方式：" shared/templates | wc -l
rg -l "最终汇报：" shared/templates | wc -l
```

Expected: each command prints `8`.

- [ ] **Step 2: Check no unfinished markers remain**

Run:

```bash
rg -n "T[B]D|T[O]DO|implement late[r]|fill in detail[s]|coming soo[n]" shared adapters README.md
```

Expected: no output and exit status 1 from `rg` because no matches were found.

- [ ] **Step 3: Check adapter references**

Run:

```bash
rg -n "shared/brief-standard.md|shared/task-routing.md|shared/safety.md|shared/templates" adapters
```

Expected: both Claude Code and Codex adapters reference shared sources.

- [ ] **Step 4: Check PRD acceptance coverage**

Run:

```bash
rg -n "修复登录失败提示|prompt-only|review-only|删除旧支付模块|analysis-first|Claude Code|Codex" README.md shared adapters
```

Expected: output shows coverage for default bugfix, prompt-only, review, high-risk deletion, Claude Code, and Codex scenarios.

- [ ] **Step 5: Final commit**

```bash
git add shared adapters README.md
git commit -m "test: verify promptify mvp documentation package"
```

## PRD Coverage Checklist

- [ ] Short natural-language input is represented by `/promptify` and fallback command-like Codex usage.
- [ ] Task type detection is represented in `shared/task-routing.md`.
- [ ] Direct execution is defaulted in Claude and Codex adapter rules.
- [ ] Prompt-only mode is represented by `promptify-generate.md` and Codex fallback usage.
- [ ] Seven core templates plus generic task template are present.
- [ ] High-risk behavior is represented in `shared/safety.md` and adapter rules.
- [ ] Platform support is represented by separate Claude Code and Codex adapters.
- [ ] README documents installation, usage, limitations, and QA checks.
- [ ] Manual QA maps to the MVP test matrix from `prd/promptify-prd.md`.

## Execution Notes

- Prefer one commit per task.
- Keep all MVP assets Markdown/JSON only.
- Do not add a runtime, package manager, web UI, telemetry, database, or MCP server in v0.1.
- If host-specific plugin loading behavior differs from current assumptions, document the supported fallback in README and adapter instructions instead of inventing unsupported behavior.
