---
id: task-1
title: 'Council v1: SDK v1.x MCP CLI + core domain'
status: To Do
assignee: []
created_date: '2025-12-21 11:23'
updated_date: '2025-12-21 12:53'
labels: []
milestone: Council v1 (stdio)
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deliver the Bun-based council CLI (npm: agents-council, binary: council) with an MCP stdio server powered by the TypeScript MCP SDK v1.x, and a core domain layer separated from the MCP interface.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `council mcp` starts the MCP stdio server using the TypeScript MCP SDK v1.x only.
- [ ] #2 Running `council` without `mcp` prints the startup error message.
- [ ] #3 MCP server exposes request_feedback, check_session, and provide_feedback (plus optional reset when enabled).
- [ ] #4 Core domain logic lives under `src/core` and the MCP interface only forwards to it.
- [ ] #5 Compiled `council` binary is available for local use.
- [ ] #6 All v1 subtasks are completed and integrated.

- [ ] #7 Linting passes (Biome).
- [ ] #8 Formatting check passes (Biome).
- [ ] #9 Type check passes.
<!-- AC:END -->
