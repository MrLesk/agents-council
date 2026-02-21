---
id: TASK-26.4
title: Evolve MCP tools for explicit session selection in multi-session councils
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - mcp
  - api
  - multi-session
  - week-3
  - week-4
milestone: m-4
dependencies:
  - TASK-26.3
references:
  - src/interfaces/mcp/server.ts
  - src/interfaces/mcp/mapper.ts
  - src/interfaces/mcp/dtos/types.ts
  - src/core/services/council/index.ts
documentation:
  - docs/mcp.md
  - docs/council.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update MCP council tool contracts and behavior so agents can target specific sessions explicitly in a multi-session environment, with clear validation and response semantics.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MCP tool schemas include explicit session targeting where required for deterministic multi-session operations.
- [ ] #2 Server validation and errors clearly handle missing, invalid, or closed session targets.
- [ ] #3 Markdown and JSON tool outputs reflect session-scoped behavior consistently.
- [ ] #4 MCP Inspector validation covers session-specific start/join/get/send/close flows.
- [ ] #5 User-facing MCP documentation is updated to describe the new contract and migration implications.
<!-- AC:END -->
