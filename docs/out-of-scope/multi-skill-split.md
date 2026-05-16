# Multi-Skill Split Is Out Of Scope

Promptify will not split bugfix, feature, refactor, test, review, docs, plan, and goal behavior into separate skills.

## Why

Promptify's product shape is a single entry point that routes short developer intent to the right brief template. Splitting each task type into a separate skill would duplicate routing logic and make the user choose the mode before Promptify has classified the intent.

The current design keeps the user-facing surface small:

- one skill to invoke
- lightweight task routing
- shared brief standard
- shared safety rules
- task-specific templates

## Existing Path

New task types should usually be added as templates and routing cues, not as new skills. A separate skill should only be considered if the behavior no longer fits the brief-generation workflow.
