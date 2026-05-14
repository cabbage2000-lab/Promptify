# /promptify:goal

Convert the user's long-running task intent into a `/goal` prompt. Do not execute it.

Input: `$ARGUMENTS`

Template: repository-root `shared/templates/goal.md`
Mode: goal-prompt.

Workflow:

1. Read repository-root `shared/brief-standard.md`, `shared/task-routing.md`, `shared/safety.md`, `shared/context-discovery.md`, and `shared/templates/goal.md`.
2. If the intent lacks a concrete objective, scope, or stopping condition, ask one focused clarification question.
3. If enough information is present, output exactly one `/goal` prompt block using `shared/templates/goal.md`.
4. Do not edit files.
5. Do not run execution commands.
6. Do not ask whether to enter execution; the user will paste or run the generated `/goal` when ready.
