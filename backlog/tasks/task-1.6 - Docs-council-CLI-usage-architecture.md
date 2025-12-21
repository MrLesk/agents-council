---
id: task-1.6
title: 'Docs: council CLI usage + architecture'
status: To Do
assignee: []
created_date: '2025-12-21 11:25'
updated_date: '2025-12-21 12:55'
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
- [ ] #1 Docs explain how to install/run `agents-council` and start the server with `council mcp`.
- [ ] #2 Docs include the startup error message for running `council` without `mcp`.
- [ ] #3 Docs describe the core domain layer vs MCP adapter responsibility split.
- [ ] #4 Docs mention the SDK v1.x requirement and reset/state env vars.
- [ ] #5 Linting passes (Biome).
- [ ] #6 Formatting check passes (Biome).

- [ ] #7 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/develop/connect-local-servers.md
- docs/mcp/docs/sdk.md
- docs/bun/docs/bundler/executables.md
- docs/bun/docs/guides/process/argv.md
<!-- SECTION:NOTES:END -->
