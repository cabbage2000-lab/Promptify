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

**PRD**:
A product requirement document synthesized from current conversation and minimal project context. It describes the problem, solution, user stories, implementation decisions, testing decisions, out of scope, and open notes. It is not an execution plan and does not publish to an issue tracker.

## Relationships

- Promptify turns short developer intent into a brief.
- Task routing chooses the template used to generate the brief.
- Brief standard defines the required blocks and mode behavior for generated briefs.
- Safety rules decide whether a brief needs a safety gate or analysis-first handling.
- Context discovery tells the host assistant what to inspect before filling or executing a brief.
- PRD mode turns current context into a product requirement document and stops before implementation.
