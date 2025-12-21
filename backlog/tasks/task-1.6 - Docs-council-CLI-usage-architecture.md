---
id: task-1.6
title: 'Docs: council CLI usage + architecture'
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:25'
updated_date: '2025-12-21 17:31'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.5
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update docs to describe `council mcp`, SDK v1.x requirement, and the core/MCP separation for v1 setup instructions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Docs explain how to install/run agents-council and start the server with `council mcp`.
- [x] #2 Docs include the startup error message for running `council` without `mcp`.
- [x] #3 Docs describe the core domain layer vs MCP adapter responsibility split.
- [x] #4 Docs mention the SDK v1.x requirement, `request_feedback` resetting the session, and the `AGENTS_COUNCIL_STATE_PATH` env var.
- [x] #5 Linting passes (Biome).
- [x] #6 Formatting check passes (Biome).

- [x] #7 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.6):
- Identify a docs entrypoint (new docs/council.md) for CLI usage and architecture overview.
- Document install/build/run steps for the local CLI, including `council mcp` and the startup error when run without mcp.
- Describe the core vs MCP adapter split and the three tools with request_feedback reset semantics.
- Document SDK v1.x requirement and AGENTS_COUNCIL_STATE_PATH default/override.
- Run lint/format/typecheck after changes and fix any issues.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/develop/connect-local-servers.md
- docs/mcp/docs/sdk.md
- docs/bun/docs/bundler/executables.md
- docs/bun/docs/guides/process/argv.md

Added docs/council.md covering install/build/run, startup error message, tool list with request_feedback reset semantics, architecture split, SDK v1.x requirement, and AGENTS_COUNCIL_STATE_PATH override. Lint/format/typecheck pass.
<!-- SECTION:NOTES:END -->
