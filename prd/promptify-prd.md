# Promptify PRD

## 1. Document Info

- Product name: Promptify
- Product type: AI coding assistant task orchestration plugin / workflow package
- Version: v0.1 PRD
- Date: 2026-05-13
- Primary language: Chinese
- Core goal: Turn short developer intent into high-quality task instructions for Claude Code and Codex, with direct execution as the default workflow where the host platform supports it.

## 2. Background

Claude Code and Codex users often describe development tasks with short, casual instructions:

```text
帮我修一下登录 bug
重构这个模块
给这个功能补测试
看看这个 PR 有没有问题
```

These short instructions are convenient, but they often miss key information that AI coding assistants need to act safely and efficiently:

- Clear goal and success criteria
- Relevant project context
- Modification boundaries
- Testing and verification expectations
- Risk handling rules
- Final reporting format

The result is that Claude Code or Codex may over-edit, under-investigate, skip validation, or require multiple correction rounds.

Promptify solves this by acting as a task orchestration layer for AI coding assistants. It converts short user intent into structured, professional, platform-aware task instructions, then either executes the task directly or outputs the generated instruction for reuse.

## 3. Product Positioning

### 3.1 One-Sentence Positioning

Promptify turns brief developer prompts into structured, context-aware, platform-aware development tasks for Claude Code and Codex.

### 3.2 What It Is

- A task instruction orchestrator for Claude Code and Codex
- A short-intent-to-executable-task converter
- A lightweight workflow layer for common coding tasks
- A cross-platform prompt and workflow package that uses project memory, assistant instruction files, repository conventions, and task-specific templates

### 3.3 What It Is Not

- Not a generic prompt template library
- Not a standalone chatbot
- Not a project management system
- Not a replacement for Claude Code or Codex native planning, editing, and verification workflows
- Not a tool that only beautifies prompts

## 4. Target Users

### 4.1 Primary Users

1. Claude Code and Codex beginners
   - They do not yet know how to write effective AI coding assistant instructions.
   - They need help turning vague intent into complete task requirements.

2. High-frequency Claude Code and Codex users
   - They want to type less while preserving execution quality.
   - They repeatedly ask for bug fixes, refactors, tests, reviews, and docs.

3. Engineering teams
   - They want consistent AI collaboration behavior across team members.
   - They need shared rules such as "read code first", "avoid unrelated refactors", and "always report verification results".

4. Independent developers and AI coding power users
   - They want to accelerate daily development tasks without manually rewriting long prompts.

## 5. Problem Statement

Developers want the speed of short prompts, but AI coding assistants perform better with structured task briefs.

Current pain points:

- Users do not want to repeatedly write long, well-structured prompts.
- Users often forget to specify boundaries and verification requirements.
- Generated prompt workflows create extra friction if users must copy and paste the result.
- Different team members may use inconsistent assistant instruction styles across Claude Code and Codex.
- High-risk tasks may be executed too aggressively if the prompt is underspecified.

## 6. Product Goals

### 6.1 MVP Goals

The MVP should allow a user to enter a short task and have Claude Code or Codex proceed with a high-quality execution brief, without requiring manual copy and paste where direct execution is available.

The MVP must:

- Accept short natural-language task input.
- Identify the likely task type.
- Generate a structured platform-aware task brief.
- Default to direct execution instead of prompt-only output.
- Offer a prompt-only mode for reuse, learning, or review.
- Include task boundaries, verification requirements, and final reporting expectations.
- Treat high-risk tasks conservatively.

### 6.2 Non-Goals for MVP

The MVP will not include:

- Visual UI
- Cloud sync
- Prompt marketplace
- Team dashboard
- External database
- MCP-based repository indexing
- Automatic historical behavior learning

## 7. Success Metrics

### 7.1 User Experience Metrics

- A user can start a structured AI coding task within 10 seconds.
- Common tasks require no manual prompt engineering.
- The default workflow does not require copying generated prompts.

### 7.2 Quality Metrics

For supported task types, generated task briefs should include:

- Task goal
- Project context instructions
- Execution process
- Boundaries and non-goals
- Verification requirements
- Final response format

### 7.3 Safety Metrics

- High-risk tasks should not directly perform destructive changes.
- The workflow should instruct the assistant to preserve unrelated user changes.
- The plugin should avoid encouraging broad rewrites unless explicitly requested.

## 8. Core User Flows

### 8.1 Default Direct Execution Flow

User input:

```text
/promptify 修复登录失败时错误提示不准确的问题
```

Expected behavior:

1. The plugin identifies the task as a bugfix or debug task.
2. The plugin generates an internal structured execution brief.
3. The host assistant directly proceeds with the task.
4. The assistant reads relevant files, identifies the cause, applies a scoped fix, and verifies it.
5. The assistant reports changes, verification results, and remaining risks.

User should not need to copy a generated prompt.

### 8.2 Prompt-Only Generation Flow

User input:

```text
/promptify:generate 重构订单状态计算逻辑
```

Expected behavior:

1. The plugin identifies the task as a refactor task.
2. The plugin outputs a structured platform-aware prompt.
3. The assistant does not edit files, run commands, or continue execution.

This mode is for learning, sharing, saving, or manual review.

### 8.3 High-Risk Analysis Flow

User input:

```text
/promptify 删除旧支付模块
```

Expected behavior:

1. The plugin identifies risk signals such as deletion, payment, auth, permission, migration, or data changes.
2. The task enters analysis-first mode.
3. The assistant performs impact analysis and proposes a safe plan.
4. The assistant does not delete files or perform destructive changes without explicit user confirmation.

## 9. Command Design

### 9.1 Default Command

```text
/promptify <short_task>
```

Default mode: direct execution.

The generated task brief should be treated as the active instruction for the current assistant session when the host supports direct execution. The user should see execution progress and final results, not only a generated prompt.

### 9.2 Prompt-Only Command

```text
/promptify:generate <short_task>
```

Default mode: generate only.

Rules:

- Do not edit files.
- Do not run commands.
- Do not start implementation.
- Output a polished platform-aware task brief.

### 9.3 Specialized Commands

```text
/promptify:task <short_task>
/promptify:debug <problem>
/promptify:refactor <target>
/promptify:test <target>
/promptify:review <scope>
/promptify:docs <target>
/promptify:plan <feature_or_goal>
```

These commands skip or reduce task type ambiguity by selecting a specific template.

## 10. Task Type Detection

The plugin should classify short user input into a task type using lightweight keyword and intent cues.

| Input cues | Task type | Template |
|---|---|---|
| 修复, bug, 报错, 失败, 异常, 不对, crash | debug / bugfix | Systematic debugging template |
| 新增, 实现, 支持, 增加, add, implement | feature | Feature implementation template |
| 重构, 优化结构, 拆分, 整理, refactor | refactor | Scoped refactor template |
| 测试, 覆盖率, 补 test, 单测 | test | Test improvement template |
| review, 审查, 看看代码, PR | review | Code review template |
| 文档, README, 注释, docs | docs | Documentation template |
| 规划, 方案, 设计, plan | plan | Implementation planning template |

If detection is uncertain, use the generic `task` template and state reasonable assumptions.

### 10.1 Routing Priority

When multiple cues are present, the plugin should route the task using the following priority:

1. Explicit specialized command wins.
   - `/promptify:review` always uses the review template.
   - `/promptify:test` always uses the test template.
   - `/promptify:plan` always uses the plan template.

2. High-risk signals override normal direct execution.
   - If the input includes deletion, migration, payment, auth, permission, production, security, mass update, rewrite, or purge signals, the task enters analysis-first mode even if another task type is detected.
   - The selected task template may still be identified, but destructive execution is gated by confirmation.

3. User-stated intent wins over secondary words.
   - `重构支付模块并补测试` should route as high-risk refactor with test expectations, not as a pure test task.
   - `修复订单测试失败` should route as debug / bugfix, not as test improvement.

4. Multi-intent tasks should be handled conservatively.
   - If the intents are closely related, generate one brief with primary and secondary goals.
   - If the intents are independent, ask one focused clarification question or propose splitting the work.

5. If no confident route exists, use the generic task template.
   - State the assumed task type.
   - Keep the first action investigative.
   - Avoid edits until the target scope is clear.

### 10.2 Routing Examples

| User input | Expected route | Notes |
|---|---|---|
| `/promptify 修复登录失败提示` | debug / bugfix | Direct execution allowed if no high-risk signal is present. |
| `/promptify:review 当前改动` | review | Explicit command overrides keyword ambiguity. |
| `/promptify 重构支付模块并补测试` | high-risk refactor | Payment signal triggers analysis-first mode. |
| `/promptify 修复订单测试失败` | debug / bugfix | Failure cue is stronger than test cue. |
| `/promptify 给 user service 补单测` | test | Focused test improvement. |
| `/promptify 删除旧支付模块` | high-risk task | No destructive action without explicit confirmation. |

## 11. Generated Task Brief Standard

Every generated execution brief should include the following sections unless the selected task type clearly does not need one:

```text
任务目标：
明确用户希望完成什么。

项目上下文：
请优先参考当前仓库、平台指令文件、已有代码风格、测试约定和用户记忆。

执行要求：
先阅读相关代码，再制定简短计划，再实施改动。

边界限制：
不要修改无关模块，不要做不必要的大规模重构，不要引入无关依赖。

验收标准：
列出什么结果算完成。

验证方式：
运行最相关的测试、lint、typecheck 或项目已有验证命令。

最终汇报：
说明修改文件、行为变化、验证结果、风险和后续建议。
```

### 11.1 Required Fields

Each generated brief should make the following fields explicit:

| Field | Required | Purpose |
|---|---|---|
| Task goal | Yes | Restate the intended outcome in concrete terms. |
| Assumptions | Conditional | Required when input is vague or task type detection is uncertain. |
| Project context instructions | Yes | Tell the host assistant what local context to inspect first. |
| Execution mode | Yes | State whether the task is direct execution, prompt-only, analysis-first, or review-only. |
| Scope boundaries | Yes | Define what should not be changed. |
| Work process | Yes | Define the expected order of investigation, planning, editing, and validation. |
| Verification | Yes | Require the most relevant available tests or checks. |
| Safety gates | Conditional | Required for high-risk signals or destructive actions. |
| Final report format | Yes | Define what the assistant must report back. |

### 11.2 Direct Execution vs Prompt-Only Output

Direct execution mode should:

- Treat the generated brief as the active instruction for the current session.
- Avoid printing a long prompt unless useful for transparency.
- Proceed to inspect the workspace, plan briefly, edit if appropriate, verify, and report.
- Enter analysis-first mode when high-risk signals are present.

Prompt-only mode should:

- Output the polished task brief as the final answer.
- Avoid reading files, running commands, editing files, or continuing into execution.
- Clearly mark the intended host platform if known.
- Include safety and verification requirements even though the assistant is not executing them.

### 11.3 Language Rules

MVP output language should default to Chinese.

If the user's short task is mostly English, the generated brief may use English unless configuration or surrounding project instructions prefer Chinese.

Technical identifiers, commands, file paths, package names, and framework names should remain in their original form.

### 11.4 Example Generated Brief

Input:

```text
/promptify 修复登录失败提示
```

Generated internal brief:

```text
任务目标：
修复登录失败时错误提示不准确的问题，并保持现有登录流程行为不变。

执行模式：
直接执行。先定位问题原因，再进行最小范围修复。

项目上下文：
优先阅读当前仓库中的登录、认证、错误处理、文案映射、测试相关代码。遵守平台指令文件、现有代码风格和测试约定。

执行要求：
1. 查找登录失败提示的生成位置和调用链。
2. 明确当前错误提示不准确的原因。
3. 制定简短修复计划。
4. 进行最小范围代码修改。
5. 补充或更新相关测试，除非现有结构不支持。

边界限制：
不要重构整个认证模块，不要修改无关登录流程，不要引入新依赖。

验收标准：
登录失败时展示符合实际失败原因的提示，既有成功登录路径不受影响。

验证方式：
运行与登录、认证或错误提示相关的最小测试命令；如果无法运行，说明原因和替代检查。

最终汇报：
说明根因、修改文件、行为变化、验证结果、剩余风险和后续建议。
```

## 12. Platform Support

### 12.1 Claude Code Support

Promptify should support Claude Code as a first-class host.

Claude Code packaging should use the official plugin model where available:

- `.claude-plugin/plugin.json`
- `commands/`
- `skills/`
- Optional platform-specific instructions for memory usage and project conventions

Claude Code behavior:

- `/promptify` defaults to direct execution.
- `/promptify:generate` only outputs the generated task brief.
- Generated briefs should explicitly tell Claude Code to honor `CLAUDE.md`, project memory, existing code style, and relevant test commands.

### 12.2 Codex Support

Promptify should support Codex as a first-class host.

Codex packaging should use the conventions available in the local Codex environment:

- Skill package or local instruction package where supported
- Slash-command-like workflow if the host supports commands
- Repository documentation fallback when commands are not available
- Platform-specific instructions for `AGENTS.md`, repository conventions, sandbox behavior, tests, and final reporting

Codex behavior:

- The default workflow should also prefer direct execution.
- The generated task brief should instruct Codex to inspect the workspace first, preserve unrelated user changes, use existing project patterns, and verify with the most relevant commands.
- Prompt-only generation should remain available for users who want to copy, inspect, or share the task brief.

### 12.3 Shared Core and Platform Adapters

Promptify should separate shared logic from platform-specific wrappers:

- Shared core: task types, templates, safety rules, generated brief structure
- Claude Code adapter: Claude plugin commands and skills
- Codex adapter: Codex skill/instruction package and command workflow where supported

This avoids maintaining two unrelated products while still respecting each host's conventions.

### 12.4 Platform Capability Matrix

| Capability | Claude Code MVP | Codex MVP | Fallback |
|---|---|---|---|
| Direct execution command | Supported through Claude Code plugin command where available. | Preferred through Codex skill or command-like workflow where available. | Provide a copyable task brief and clear manual execution instruction. |
| Prompt-only generation | Supported through `/promptify:generate`. | Supported through promptify skill or instruction package. | Output the generated brief without running commands or editing files. |
| Specialized task commands | Implement as command files when supported. | Implement as skill entry points or documented invocation patterns. | Use `/promptify <short_task>` with explicit task keywords. |
| Project instruction usage | Honor `CLAUDE.md`, memory, and repository conventions. | Honor `AGENTS.md`, session instructions, sandbox constraints, and repository conventions. | Instruct the host assistant to inspect local docs before editing. |
| Safety gating | Command brief instructs analysis-first and confirmation behavior. | Skill / instruction brief instructs analysis-first and confirmation behavior. | Generated prompt includes explicit confirmation gate. |
| Installation validation | Local plugin loading flow works. | Local skill or instruction package can be loaded. | README documents manual usage. |

### 12.5 Direct Execution Fallback Rules

If a host platform cannot inject a generated brief as an active instruction, Promptify should:

1. Generate the full task brief.
2. Clearly state that automatic direct execution is unavailable in the current host mode.
3. Tell the user how to continue manually.
4. Avoid pretending execution has started.

If a host platform supports direct execution only partially, Promptify should prefer the safest supported workflow over simulating unsupported behavior.

## 13. Template Requirements

### 13.1 Bugfix / Debug Template

Must instruct the assistant to:

- Reproduce, inspect, or localize the problem before editing.
- Identify likely root cause.
- Apply a minimal scoped fix.
- Add or update tests when appropriate.
- Verify the fix with the most relevant command.
- Report the root cause and validation result.

### 13.2 Feature Template

Must instruct the assistant to:

- Read related implementation patterns first.
- Identify existing architecture and conventions.
- Implement the smallest complete version.
- Include error states and edge cases where relevant.
- Add or update tests.
- Report user-facing behavior changes.

### 13.3 Refactor Template

Must instruct the assistant to:

- Preserve current behavior.
- Avoid unrelated style churn.
- Prefer incremental, low-risk changes.
- Keep public interfaces stable unless explicitly requested.
- Run tests before claiming success.

### 13.4 Test Template

Must instruct the assistant to:

- Identify existing test style and tooling.
- Add focused tests for meaningful behavior.
- Avoid brittle implementation-detail tests unless needed.
- Run the targeted test command.

### 13.5 Review Template

Must instruct the assistant to:

- Use a code-review stance.
- Lead with findings.
- Prioritize bugs, regressions, security risks, and missing tests.
- Include file and line references where possible.
- Keep summaries secondary.

### 13.6 Docs Template

Must instruct the assistant to:

- Match existing documentation style.
- Keep docs accurate and concise.
- Avoid documenting behavior that is not implemented.
- Update examples when APIs or commands change.

### 13.7 Plan Template

Must instruct the assistant to:

- Investigate relevant code and constraints.
- Produce a staged implementation plan.
- Include risks, tests, and rollout notes.
- Avoid editing code unless the user explicitly asks to continue.

## 14. Memory and Context Usage

The plugin should instruct the host assistant to use available project context.

For Claude Code:

- `CLAUDE.md`
- Project-level memory
- User-level memory
- Existing code style
- Existing test commands
- Package scripts, Makefiles, CI configuration, or local docs

For Codex:

- `AGENTS.md` or equivalent repository instruction files
- Current workspace state
- Existing code style
- Existing test commands
- Package scripts, Makefiles, CI configuration, or local docs
- User instructions already present in the session

Promptify should not assume direct database-like access to all historical memory. It should instead guide the host assistant to respect memory and context already available in the session.

## 15. Safety Rules

### 15.1 High-Risk Signals

The plugin should treat the following as high risk:

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

### 15.2 High-Risk Behavior

When high-risk signals are present:

- Default to analysis-first mode.
- Do not directly perform destructive actions.
- Ask for confirmation before deletion, migration, or broad rewrite.
- Explicitly mention affected files, modules, and possible blast radius.

### 15.3 Action Safety Levels

| Safety level | Examples | Default behavior |
|---|---|---|
| Read-only | Inspect files, search code, read docs, summarize current behavior | Allowed during direct execution and analysis-first mode. |
| Low-risk edit | Small scoped fix, docs update, focused test addition | Allowed in direct execution when no high-risk signal is present. |
| Medium-risk edit | Refactor, dependency change, broad test rewrite, behavior-affecting feature | Require brief plan before editing and relevant verification after editing. |
| High-risk edit | Delete files, migration, auth or permission change, payment flow change, production config change, mass rewrite | Analysis-first only; require explicit user confirmation before execution. |
| Destructive action | Remove modules, purge data, irreversible migration, forceful cleanup | Never perform without explicit confirmation and stated rollback or recovery notes. |

### 15.4 Confirmation Requirements

For high-risk or destructive actions, the assistant must ask for confirmation before editing. The confirmation request should include:

- Proposed action.
- Affected files, modules, or systems.
- Expected behavior change.
- Verification plan.
- Known risks and rollback or recovery notes when applicable.

The user confirmation should be explicit. Vague responses such as "ok" may be acceptable for medium-risk edits, but destructive actions should require a clear confirmation such as "确认删除" or "continue with deletion".

### 15.5 Prompt-Only Safety Behavior

Prompt-only mode should still detect high-risk signals.

When high-risk signals are present, the generated prompt should instruct the future host assistant to start with impact analysis and request confirmation before destructive edits. It should not produce a prompt that encourages immediate deletion, migration, or broad rewrite.

## 16. Configuration

### 16.1 MVP Configuration

MVP can rely on fixed defaults:

- Default command mode: execute
- Default output language: Chinese
- Default detail level: medium
- Default safety mode: conservative

### 16.2 Future Configuration

Future versions may support:

```json
{
  "defaultMode": "execute",
  "language": "zh-CN",
  "detailLevel": "medium",
  "safetyMode": "conservative",
  "teamTemplateOverrides": true
}
```

## 17. Project Structure

Recommended MVP structure:

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
  adapters/
    claude-code/
      .claude-plugin/
        plugin.json
      commands/
        promptify.md
        promptify-generate.md
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

### 17.1 Minimum Deliverable File Checklist

The MVP should include the following deliverables:

| Path | Required | Expected content |
|---|---|---|
| `shared/templates/task.md` | Yes | Generic task brief template for uncertain or mixed tasks. |
| `shared/templates/bugfix.md` | Yes | Debug / bugfix workflow template. |
| `shared/templates/feature.md` | Yes | Feature implementation workflow template. |
| `shared/templates/refactor.md` | Yes | Behavior-preserving refactor workflow template. |
| `shared/templates/test.md` | Yes | Test improvement workflow template. |
| `shared/templates/review.md` | Yes | Code review stance and output format. |
| `shared/templates/docs.md` | Yes | Documentation update workflow template. |
| `shared/templates/plan.md` | Yes | Analysis and implementation planning template. |
| `shared/safety.md` | Yes | High-risk signals, safety levels, and confirmation rules. |
| `shared/task-routing.md` | Yes | Keyword cues, routing priority, and fallback behavior. |
| `adapters/claude-code/.claude-plugin/plugin.json` | Yes | Local Claude Code plugin metadata. |
| `adapters/claude-code/commands/*.md` | Yes | Command wrappers for default, generate, and specialized workflows. |
| `adapters/claude-code/skills/promptify/SKILL.md` | Yes | Claude Code skill instructions that reference shared templates. |
| `adapters/codex/skills/promptify/SKILL.md` | Yes | Codex skill instructions that reference shared templates and Codex constraints. |
| `adapters/codex/instructions/promptify.md` | Yes | Fallback usage instructions when command-style invocation is unavailable. |
| `README.md` | Yes | Installation, usage examples, limitations, and verification steps. |

Placeholder files are acceptable only when they clearly state why the host does not support that capability yet and point to the supported fallback.

## 18. MVP Scope

### 18.1 Included

- Claude Code plugin skeleton
- Codex skill or instruction package skeleton
- `/promptify` direct execution command
- `/promptify:generate` prompt-only command
- Specialized commands for common task types
- Task type detection guidance
- Seven core templates
- Safety rules for high-risk tasks
- README with installation and usage examples

### 18.2 Excluded

- Web UI
- Hosted service
- User account system
- Cloud template sync
- MCP server
- Marketplace publishing automation
- Telemetry

## 19. Acceptance Criteria

MVP is accepted when the following scenarios work:

1. `/promptify 修复登录失败提示` causes the host assistant to directly proceed with a scoped bugfix workflow rather than only outputting a prompt.
2. `/promptify:generate 修复登录失败提示` outputs a structured platform-aware task brief and performs no edits.
3. `/promptify:review 当前改动` uses a review-first format where findings lead the response.
4. `/promptify 删除旧支付模块` enters analysis-first mode and does not delete code without explicit confirmation.
5. Generated briefs include project context, boundaries, verification, and final reporting expectations.
6. The Claude Code adapter can be installed locally and tested through Claude Code's plugin loading flow.
7. The Codex adapter can be installed or loaded in the local Codex environment using the supported skill or instruction mechanism.

### 19.1 MVP Test Matrix

| Scenario | Input | Expected mode | Expected route | Editing allowed | Commands allowed | Must include in final output |
|---|---|---|---|---|---|---|
| Default bugfix | `/promptify 修复登录失败提示` | Direct execution | debug / bugfix | Yes, scoped | Yes, relevant checks | Root cause, changed files, verification result. |
| Prompt-only bugfix | `/promptify:generate 修复登录失败提示` | Prompt-only | debug / bugfix | No | No | Complete generated brief only. |
| Review | `/promptify:review 当前改动` | Review-only | review | No unless user later asks | Read-only inspection only | Findings first, file/line references where possible. |
| High-risk deletion | `/promptify 删除旧支付模块` | Analysis-first | high-risk task | No before confirmation | Read-only inspection allowed | Impact analysis, affected scope, confirmation request. |
| Refactor with tests | `/promptify 重构订单状态计算逻辑并补测试` | Direct execution | refactor with test expectations | Yes, scoped | Yes, relevant checks | Behavior preservation note, tests added or updated, verification result. |
| Unclear task | `/promptify 优化一下这个模块` | Investigative direct execution or clarification | generic task | Only after scope is clear | Read-only inspection allowed | Assumptions or focused clarification question. |
| Docs update | `/promptify:docs 更新 README 安装说明` | Direct execution | docs | Yes, docs only | Optional docs validation | Updated docs summary and validation result. |
| Planning | `/promptify:plan 支持团队模板覆盖` | Plan-only | plan | No | Read-only inspection allowed | Staged plan, risks, tests, rollout notes. |

### 19.2 Manual QA Checklist

Before v0.1 is considered complete, maintainers should manually verify:

- Each template renders a coherent brief with no placeholder text.
- Direct execution and prompt-only flows behave differently.
- High-risk inputs never proceed directly to destructive edits.
- Claude Code adapter loads locally or documents a current limitation.
- Codex adapter loads locally or documents a current limitation.
- README examples match the implemented command or fallback behavior.
- Generated Chinese output is clear, concise, and suitable for coding-assistant execution.

## 20. Risks and Mitigations

### 20.1 Risk: The Product Becomes a Generic Prompt Template Library

Mitigation:

- Make direct execution the default.
- Position the product as task orchestration, not prompt beautification.
- Keep templates coding-assistant-specific and platform-aware.

### 20.2 Risk: User Input Is Too Short

Mitigation:

- Apply reasonable assumptions for low-risk tasks.
- Ask one focused clarification question only when needed.
- Use analysis-first mode when ambiguity creates risk.

### 20.3 Risk: Users Do Not Want Copy-Paste Workflows

Mitigation:

- `/promptify` defaults to direct execution.
- `/promptify:generate` is explicitly opt-in.

### 20.4 Risk: The Assistant Edits Too Broadly

Mitigation:

- Every template includes boundaries and non-goals.
- Refactor and high-risk templates emphasize scoped changes.
- Final reporting must include touched files and verification results.

### 20.5 Risk: Different Projects Need Different Rules

Mitigation:

- Always instruct the host assistant to honor platform instruction files, repository conventions, and existing test commands.
- Add team override support in a future version.

### 20.6 Risk: Claude Code and Codex Have Different Extension Models

Mitigation:

- Keep shared templates platform-neutral.
- Maintain thin platform adapters.
- Do not force a Claude Code-specific plugin structure onto Codex.
- Treat direct execution as the default product behavior, but implement it using each host's native mechanism.

## 21. Roadmap

### v0.1

- Local plugin MVP
- Codex adapter MVP
- Core commands
- Core templates
- Conservative safety behavior
- Chinese-first README

### v0.2

- Configurable default mode
- English output support
- Team template override examples
- Better task type routing

### v0.3

- Optional MCP context helper
- PR description generation
- Issue/task brief generation
- Template quality evaluation examples

## 22. Open Questions

1. Should the public command name be `/promptify` on both Claude Code and Codex when the host supports commands?
2. Should the default language follow the user's input language or remain configurable?
3. Should direct execution always show the generated brief first, or keep it internal and only show progress?
4. Should the plugin include team-level template override in v0.1, or defer it to v0.2?
5. Should high-risk tasks always ask confirmation, or only when a destructive action is about to happen?
6. What is the best Codex packaging format for the first public release: skill, repository instruction package, or both?
