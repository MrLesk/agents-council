---
id: task-1.1
title: Scaffold Bun/TS + council CLI + compile pipeline
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 13:13'
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
- [x] #1 `package.json` declares npm name `agents-council` and bin `council`.
- [x] #2 Running `council` without arguments prints the startup error message.
- [x] #3 `council mcp` dispatches to the MCP server entrypoint.
- [x] #4 Build workflow produces `dist/council` via Bun compile.
- [x] #5 Dependencies include `@modelcontextprotocol/sdk` v1.x only (no 2.x).

- [x] #6 Linting passes (Biome).
- [x] #7 Formatting check passes (Biome).
- [x] #8 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.1):
- Inspect repo structure and existing configs (package.json, tsconfig, bunfig, biome) to avoid overwriting prior work.
- Update/add package.json with name agents-council, bin council, scripts for build/lint/format/typecheck, and dependency on @modelcontextprotocol/sdk pinned to v1.x.
- Add CLI entry src/cli/index.ts that prints the startup error when run without mcp and dispatches council mcp to MCP server entrypoint.
- Add MCP server stub at src/interfaces/mcp/server.ts (export startMcpServer) so CLI compiles; real implementation comes in task-1.5.
- Add/align Bun compile pipeline to produce dist/council via bun build --compile.
- Run lint/format/typecheck after changes; fix any issues to keep scripts green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/bun/docs/bundler/executables.md
- docs/bun/docs/guides/process/argv.md
- docs/bun/docs/typescript.md
- docs/mcp/docs/sdk.md

Scaffolded initial CLI + configs: added package.json with agents-council/bin council, tsconfig.json, biome.json, src/cli/index.ts dispatching to MCP entrypoint, and stub src/interfaces/mcp/server.ts; added bun build --compile script to produce dist/council.

Ran `bun install`, `bun run lint`, `bun run format`, `bun run format:check`, and `bun run typecheck` after adjusting format check script to use `biome check`. All lint/format/typecheck now pass.
<!-- SECTION:NOTES:END -->
