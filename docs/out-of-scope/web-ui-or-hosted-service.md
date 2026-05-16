# Web UI Or Hosted Service Is Out Of Scope

Promptify will not add a web UI, hosted service, cloud sync, telemetry, database, or MCP indexer.

## Why

Promptify is a local Markdown skill. A hosted product would introduce authentication, storage, deployment, privacy, telemetry, and support responsibilities that are unrelated to the core workflow.

Keeping Promptify local also keeps the generated brief contract inspectable. Users can see and modify the rules directly in Markdown.

## Existing Path

Users who want a different interface can wrap the Markdown rules in their own environment, but the Promptify repository itself remains local and Markdown-only.
