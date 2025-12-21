---
id: task-1.1
title: Scaffold Bun/TS + council CLI + compile pipeline
status: To Do
assignee: []
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 12:54'
labels: []
milestone: Council v1 (stdio)
dependencies: []
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up the project scaffolding with the council CLI entrypoint, Bun/TypeScript configuration, Biome, and a compiled binary workflow. Ensure the MCP SDK dependency is v1.x only.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `package.json` declares npm name `agents-council` and bin `council`.
- [ ] #2 Running `council` without arguments prints the startup error message.
- [ ] #3 `council mcp` dispatches to the MCP server entrypoint.
- [ ] #4 Build workflow produces `dist/council` via Bun compile.
- [ ] #5 Dependencies include `@modelcontextprotocol/sdk` v1.x only (no 2.x).

- [ ] #6 Linting passes (Biome).
- [ ] #7 Formatting check passes (Biome).
- [ ] #8 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/bun/docs/bundler/executables.md
- docs/bun/docs/guides/process/argv.md
- docs/bun/docs/typescript.md
- docs/mcp/docs/sdk.md
<!-- SECTION:NOTES:END -->
