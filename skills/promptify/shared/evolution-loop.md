# Promptify Evolution Loop

Use this guide when filling an evolve brief and again when the user confirms
execution. It maps the SIA-style self-improvement pattern (generate →
execute → score → improve, generation by generation) onto Claude Code
primitives: a Workflow script holds the deterministic generation loop, and two
custom subagents hold the roles. The host assistant generates every
orchestration file inside the user's target project; this repository ships
only this Markdown contract.

## Role Mapping

| Role | Responsibility | Claude Code primitive |
|---|---|---|
| Orchestrator | generation loop, stop conditions, final result | Workflow script in `.claude/workflows/` |
| evolve-meta | produce generation 1 from the task statement, baseline artifact, and evaluation contract | custom subagent in `.claude/agents/evolve-meta.md` |
| evolve-feedback | read the previous generation, its score, and the full history; write `improvement.md` and the next generation | custom subagent in `.claude/agents/evolve-feedback.md` |
| Evaluator | run the evaluation contract for one generation, write `gen_<n>/score.json`, append the entry to `history.md`, and return a structured score | lightweight `agent()` call inside the workflow |

## Evaluation Contract

Every evolve run needs an explicit evaluation contract before the loop starts:

- Prefer an executable scoring command. It reads one candidate artifact and
  prints JSON with at least `{"score": <number>}` (higher is better) plus any
  diagnostic fields. Keep the command identical across generations.
- Fall back to a fixed-rubric LLM judge only when no objective metric exists:
  freeze the rubric text in the brief, use the same judge setup every
  generation, and mark the final report as subjective.
- Score the untouched original artifact once as the `gen 0` baseline before
  evolving.
- Stop when any condition triggers: target value reached, generation budget
  exhausted (default 3), or no improvement for 2 consecutive generations.

## Artifact Layout

All run artifacts live in the target project:

```
evolve-runs/run_<id>/
  history.md          # cross-generation memory: change summary, score, lesson per generation
  gen_<n>/
    <artifact>        # this generation's evolved copy
    score.json        # evaluator output for this generation
    improvement.md    # analysis and plan written by evolve-feedback (gen 2+)
```

`history.md` is the loop's memory, owned by the evaluator: after scoring a
generation it appends one entry (generation, score, change summary, lesson),
and evolve-feedback must read it before writing the next generation so failed
approaches are not repeated.

## Subagent Role Definitions

Generate both files in the target project's `.claude/agents/`. Keep the tool
set minimal and the model inherited.

`evolve-meta.md`:

```markdown
---
name: evolve-meta
description: Generate the first candidate generation for an evolve run from the task statement, the baseline artifact, and the evaluation contract.
tools: Bash, Read, Write, Edit, Glob
model: inherit
---
You generate generation 1 of an evolve run. Read the task statement, the
baseline artifact, and the evaluation contract you are given. Write the full
candidate artifact into the generation directory you are given. Never modify
the original file. End by summarizing what you changed relative to the
baseline and why you expect it to score higher.
```

`evolve-feedback.md`:

```markdown
---
name: evolve-feedback
description: Analyze the previous generation's artifact and score, then write improvement.md and the next candidate generation.
tools: Bash, Read, Write, Edit, Glob
model: inherit
---
You improve one generation of an evolve run. First read history.md in full and
do not repeat approaches it records as failed. Analyze the previous
generation's artifact, its score.json, and the evaluation contract. Write
improvement.md (analysis and plan) and the next candidate artifact into the
generation directory you are given. Prefer structural improvements that
generalize; do not overfit to a single evaluation sample. Never modify the
original file.
```

## Workflow Script Contract

Save the script as `.claude/workflows/evolve-<artifact-slug>.js` in the target
project so the run can be re-launched, resumed, and tuned. The script must:

- Take the run id, generation budget, and target score via `args`.
- Score the untouched original artifact first and record it as the `gen 0`
  entry in `history.md` before calling evolve-meta (for gen 0, append to
  `history.md` only; no `gen_0/` directory is created).
- Call `agent(..., {agentType: 'evolve-meta'})` once for generation 1, then
  loop deterministically: evaluate each generation with a lightweight `agent()`
  that writes `gen_<n>/score.json`, appends the entry to `history.md`, and
  returns `{"score": number, "notes": string}` via a JSON schema; check the
  stop conditions ("no improvement" compares each generation against the best
  score so far); then call `agent(..., {agentType: 'evolve-feedback'})` for
  the next generation.
- Return the full score curve (including gen 0) and the best generation's
  path.

Illustrative loop shape (adapt names and paths to the actual run):

```js
phase('Baseline')
const gen0 = await agent(evalPrompt(0), { schema: SCORE_SCHEMA })
const curve = [{ gen: 0, score: gen0.score }]
phase('Meta')
await agent(metaPrompt, { agentType: 'evolve-meta' })
for (let gen = 1; gen <= args.maxGen; gen++) {
  phase(`Gen ${gen}`)
  const result = await agent(evalPrompt(gen), { schema: SCORE_SCHEMA })
  curve.push({ gen, score: result.score })
  if (result.score >= args.target || stagnant(curve, 2) || gen === args.maxGen) break
  await agent(feedbackPrompt(gen, result), { agentType: 'evolve-feedback' })
}
return { curve, best: bestOf(curve) }
```

If the host does not support the Workflow primitive, run the same loop
sequentially from the main session with the two subagents and a small
generation budget; the contract above stays unchanged.

## Guardrails

- Evolution happens only on copies under `evolve-runs/`; write the best
  generation back to the original file only after explicit user confirmation.
- Launching the loop requires explicit user consent to the cost notice in the
  brief (many generations, many agent calls).
- Evaluation commands carrying high-risk signals from `shared/safety.md`
  (production, deletion, migration, and similar) force analysis-first
  handling.
- Keep generation artifacts append-only during a run; do not delete earlier
  generations before the final report.

## Final Report

Report the score curve including the gen 0 baseline, the best generation and
its diff summary against the baseline, per-generation improvement highlights,
and how to re-run or resume the loop: relaunch the saved script with the same
run id, or use the host's workflow resume mechanism.
