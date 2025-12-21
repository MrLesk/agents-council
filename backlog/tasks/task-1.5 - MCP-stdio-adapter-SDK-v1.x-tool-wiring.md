---
id: task-1.5
title: MCP stdio adapter (SDK v1.x) + tool wiring
status: To Do
assignee: []
created_date: '2025-12-21 11:25'
updated_date: '2025-12-21 12:54'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.4
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the MCP stdio server using the TypeScript MCP SDK v1.x, wiring tool calls to the CouncilService and keeping the adapter free of business logic.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MCP server uses `@modelcontextprotocol/sdk` v1.x with stdio transport.
- [ ] #2 tools/list exposes request_feedback, check_session, provide_feedback, and reset_session only when enabled.
- [ ] #3 tools/call forwards to CouncilService methods without embedding business logic.
- [ ] #4 reset_session requires explicit confirmation and is gated by env configuration.
- [ ] #5 Linting passes (Biome).
- [ ] #6 Formatting check passes (Biome).

- [ ] #7 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/sdk.md
- docs/mcp/docs/develop/build-server.md
- docs/mcp/specification/2025-11-25/basic/transports.md
- docs/mcp/specification/2025-11-25/server/tools.md
<!-- SECTION:NOTES:END -->
