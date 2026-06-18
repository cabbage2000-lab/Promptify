# Promptify Glossary

Use these terms consistently across Promptify docs, templates, and skill instructions.

## Core Terms

**Brief**:
A compact task contract generated from short developer intent. A brief tells the host assistant the goal, mode, context to inspect, requirements, and any safety gate.
_Avoid_: prompt template, full spec, implementation plan, unless referring to a specific external artifact.

**Prompt-first**:
The default Promptify workflow: generate the brief first, show it to the user, then ask whether to enter execution.
_Avoid_: auto-execute, one-shot execution.

**Execution-after-confirmation**:
The mode used only after the user confirms they want the generated brief executed. The assistant may then inspect, edit, verify, and report within the brief scope.

**Prompt-only**:
A mode that outputs only the generated brief and stops. It does not inspect files, run commands, edit files, or continue into execution unless the host explicitly allows read-only prompt generation.

**Review-only**:
A mode for code review or audit. It leads with findings and does not edit files unless the user later asks for changes.

**Plan-only**:
A mode for staged implementation design. It can investigate relevant context when allowed, but it stops after the plan.

**Analysis-first**:
A safety mode for high-risk work. It identifies affected areas, blast radius, verification, and confirmation needs before any high-risk or destructive edit.

**Safety gate**:
The confirmation requirement included when a task contains high-risk signals or destructive actions. It must state proposed action, affected areas, expected behavior change, verification plan, risks, and rollback or recovery notes when relevant.

**Task routing**:
The lightweight classification step that maps user intent to a task type and template.

**Template**:
A Markdown source under `shared/templates/` that provides task-specific brief content. Templates are sources for generated briefs, not standalone execution plans.

**Goal prompt**:
A durable `/goal` prompt for long-running work. It is larger than a compact brief and must include concrete done criteria and stop conditions.

**Handoff prompt**:
A paste-ready continuation prompt generated from the current session's progress. It lets a task resume in a fresh window when the current context is near full or the host model is drifting. It includes context to read first, completed progress, the stopping point, next steps, constraints, done criteria, and stop conditions.
_Avoid_: session export, full transcript, checkpoint file.

**Handoff-prompt mode**:
A mode that outputs only a handoff prompt and stops. It reviews current session history and does minimal read-only project discovery, but does not edit files or continue into execution. It is the session-continuation counterpart to goal-prompt mode.

**PRD**:
A product requirement document synthesized from current conversation and minimal project context. It describes the problem, solution, user stories, implementation decisions, testing decisions, out of scope, and open notes. It is not an execution plan and does not publish to an issue tracker.

**Evolution loop**:
A score-driven generational optimization flow for evolve briefs. A deterministic orchestrator runs generations; each generation executes the evaluation contract, records the score into the run history, and lets a feedback role write the next candidate. Defined in `shared/evolution-loop.md`.
_Avoid_: genetic algorithm, auto-retry.

**Evaluation contract**:
The required scoring definition for an evolve brief: metric definition, measurement method, and target value or budget. Prefer an executable scoring command; fall back to a fixed-rubric LLM judge only when no objective metric exists.
_Avoid_: vague success language such as "make it better".

**Brief principles**:
The four-principle behavior contract that every generated brief defaults to. Defined in `shared/principles.md`. The principles shape brief content; they do not add new brief blocks or modes.

**Think Before Coding**:
Principle 1. State assumptions, surface tradeoffs, and stop on confusion instead of picking one interpretation silently.
_Avoid_: silent assumption, drive-by interpretation.

**Simplicity First**:
Principle 2. Keep the brief's scope to the minimum that solves the stated problem. No speculative features, abstractions, or configuration.
_Avoid_: bloated abstraction, premature flexibility.

**Surgical Changes**:
Principle 3. The brief restricts edits to the lines required by the goal and forbids drive-by refactors, style drift, or deletion of pre-existing dead code.
_Avoid_: drive-by refactor, scope creep.

**Goal-Driven Verification**:
Principle 4. Imperative requests are restated as verifiable goals with a concrete check (test, command, or observation). The brief names how the future executor proves the goal was met.
_Avoid_: vague success language such as "make it work".

## Relationships

- Promptify turns short developer intent into a brief.
- Task routing chooses the template used to generate the brief.
- Brief standard defines the required blocks and mode behavior for generated briefs.
- Brief principles define the default behavior contract every generated brief must reflect.
- Safety rules decide whether a brief needs a safety gate or analysis-first handling.
- Context discovery tells the host assistant what to inspect before filling or executing a brief.
- PRD mode turns current context into a product requirement document and stops before implementation.
- The evolution loop turns a confirmed evolve brief into a generational optimization run driven by its evaluation contract.
- Handoff-prompt mode compresses current session progress into a paste-ready continuation prompt for a fresh window; it is the session-continuation counterpart to goal-prompt mode.
