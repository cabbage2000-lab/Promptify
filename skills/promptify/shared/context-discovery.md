# Promptify Context Discovery

Use context discovery before filling a generated brief. The goal is to turn the
user's short input into project-aware instructions without over-reading the
repository or changing files during prompt-only, review-only, or plan-only
flows.

## Discovery Order

1. Parse the original user input and identify the likely task type candidates.
2. Read platform and repository instructions such as `AGENTS.md`, `CLAUDE.md`,
   project memory, or session instructions when available.
3. Read lightweight project overview files such as `README.md`, package or
   build files, CI configuration, and test configuration when relevant.
4. Locate likely target files with file search, text search, or existing
   routing cues from the user's input.
5. Inspect the smallest useful set of related source, test, and documentation
   files.
6. Summarize discovered context into the generated brief instead of pasting raw
   file contents.

## Base Context Signals

Capture only context that helps the future executor act safely:

- Project type, language, framework, and package or build tools.
- Repository instruction files and platform-specific constraints.
- Existing test, lint, typecheck, and manual verification commands.
- Relevant source areas, public interfaces, command entry points, or docs.
- Existing style, naming, fixture, mock, and error-handling patterns.
- Known high-risk areas touched by the request.

## Task-Specific Discovery

Bugfix or debug:
- Find the failing path, error text, logs, related tests, calling code, and
  recent nearby behavior.

Feature:
- Find similar features, extension points, data flow, UI or API contracts,
  tests, docs, and error states.

Prototype (UI):
- Confirm the question is about appearance. If it is about logic, state, or data
  shape, defer to the executor to ask one clarifying question instead of scoping
  it here.
- Detect and reuse the project's existing stack instead of introducing new
  tooling: the UI framework and its router API (Next `router.replace`, React
  Router `navigate`, etc.), the component library and styling system
  (TailwindCSS, shadcn, MUI, plain CSS), and the routing convention.
- Find an existing page that can host the variants and the data available on
  that page.
- Default to embedding variants in the existing page with no persistence and no
  real mutations.

Refactor:
- Find current behavior, public interfaces, callers, tests, and compatibility
  constraints.

Test:
- Find test framework, test naming, fixture setup, mock style, target behavior,
  and existing verification commands.

Review:
- Find the diff, related implementation, tests, callers, and behavior contracts.

Docs:
- Find the implemented behavior, commands, installation paths, examples, and
  limitations that the docs must reflect.

Plan:
- Find architecture, related modules, constraints, tests, rollout risks, and
  verification commands.

PRD:
- Synthesize from current conversation and minimal project context.
- Find the user problem, expected behavior, likely actors, relevant product or code areas, constraints, prior decisions, similar features, and test expectations.
- Do not restart with a broad interview; ask at most one focused clarification question only when a missing decision would make the PRD misleading.

Generic task:
- Find enough context to confirm the most likely task type. If the goal remains
  ambiguous, generate one focused clarification question instead of inventing a
  broad plan.

## Mode Boundaries

Direct execution:
- Discovery may use read-only commands before selecting or filling the final
  brief.
- Keep discovery narrow, then proceed with the selected template.

Prompt-only:
- Do not read files or run commands unless the host platform explicitly allows
  prompt generation with read-only context.
- If read-only discovery is unavailable, write context instructions into the
  generated brief for the future executor.

Analysis-first:
- Use discovery to identify affected files, modules, blast radius, verification
  plan, and confirmation requirements.
- Do not perform high-risk or destructive edits before explicit confirmation.

Review-only:
- Discovery should stay read-only and focus on diff, behavior, tests, callers,
  and risks.

Plan-only:
- Discovery should support a staged plan with files, validation, risks, and
  rollout notes.

## Brief Filling Rules

Use discovery results to fill the localized brief fields from
`shared/brief-standard.md`:

- Goal / `目标`: restate the goal using project-specific nouns when known.
- Assumptions / `假设`: state assumptions only when discovery cannot confirm intent.
- Context / `上下文`: list the exact files, directories, tools, or conventions to
  inspect first.
- Requirements / `要求`: include task-specific investigation order, scope limits, verification,
  and final reporting expectations.
- Safety Gate / `安全门禁`: include confirmation requirements when high-risk signals or
  destructive actions are present.

Keep the final brief concise. The brief should guide execution, not become a
repository summary.
