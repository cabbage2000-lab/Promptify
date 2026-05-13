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
