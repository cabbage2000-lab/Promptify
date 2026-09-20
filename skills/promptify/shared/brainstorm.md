# Promptify Brainstorm Flow

Brainstorm turns a vague idea into an agreed design through a short,
structured conversation, then hands that design back to the normal Promptify
outputs (PRD, plan, compact brief) or to bounded execution. It adapts the
collaborative design loop of the Superpowers brainstorming skill to
Promptify's markdown-only, single-skill boundaries.

Use it when the input is an idea, not a task: there is no clear goal, scope,
or success criterion yet, and generating a brief now would only freeze the
ambiguity. When the intent is already concrete, route to the matching task
type instead. PRD mode synthesizes an already-discussed context; it does not
interview. Brainstorm mode does.

## Consensus Loop

Repeat until the user confirms alignment, before writing any design:

1. Discover intent. Ask one focused question at a time, preferably multiple
   choice. Target purpose, audience, constraints, and success criteria, not
   implementation trivia. When information is missing, the first question is
   about purpose or use, not about tools.
2. Reflect understanding. Summarize what the user said, separately from your
   own assumptions, and invite correction before moving on.
3. Carry intent into the design. Every later design choice must trace back
   to the agreed intent; flag choices that cannot.

## Scale Tiers

Classify each piece of work on its own and pick the lightest tier that fits.
When unsure between tiers, choose the heavier one. Tiers only upgrade
mid-flight (stop and reclassify when hidden complexity appears), never
downgrade.

- Spike (feasibility probe): the real question is whether something is
  possible or how a library behaves, not how to design it. Present the
  question and the cheapest probe in two or three sentences, get approval,
  run the probe, and report a recommendation. Probe output is throwaway by
  default; do not keep spike code because it works.
- Bounded (small change to an existing flow): the flow being changed already
  exists in this repository, such as a new flag, a small endpoint, or a
  single-file fix. Ask focused questions, then present a short
  in-conversation design: approach, files touched, tests. Wait for an
  explicit yes. No design document, no plan document.
- Architectural (new project, new subsystem, or changed interface
  relationships): explore context, ask questions, propose two or three
  options with tradeoffs and a recommendation (apply YAGNI ruthlessly),
  present the design in sections and confirm each section, then run the
  design self-review before presenting it for user review.

"It's too simple to need design" is not a tier. Every tier ends with the
user approving a design. Familiarity with the app type does not make work
bounded; bounded measures whether the flow already exists in this
repository. Using the bounded label to skip design work is itself the
signal to choose architectural.

## Design Gate

No implementation action (writing product code, scaffolding, installing
product dependencies, creating external projects) before the selected
tier's gate is satisfied: approval of the probe for spikes, an explicit yes
for bounded designs, user review of the full design for architectural work.
Approval covers only the step it was given for; each following step needs
its own approval. Read-only exploration is never gated.

When multiple independent subsystems surface during brainstorming, stop and
propose splitting; each sub-project gets its own conversation, design, and
gate.

## Design Self-Review

Before presenting an architectural design for review, check it and fix
problems in place:

- No placeholders or unfinished markers.
- Internally consistent; option tradeoffs match the agreed intent.
- Scope is one coherent unit; propose splitting when it is not.
- No requirement that two executors could read differently.

## Handoff

After the design is approved, offer the natural next step inside Promptify
instead of silently continuing: a PRD (`prd-only` mode), a staged plan
(`plan-only` mode), a compact brief for the normal prompt-first flow, or
direct execution of a bounded design. The agreed design is the input; do
not restart the conversation. High-risk signals in the agreed design still
route through analysis-first handling per `shared/safety.md`.

## Exclusions

These Superpowers brainstorming features are intentionally not ported:
visual companion browser tooling (a runtime service breaks the
markdown-only boundary recorded in `docs/adr/0001-markdown-first-single-entry.md`),
fixed spec file paths with mandatory commits (designs stay in conversation
unless the user asks to persist them), and chaining into an external
planning skill (Promptify reuses its own PRD, plan, and brief outputs as
the next step instead).
