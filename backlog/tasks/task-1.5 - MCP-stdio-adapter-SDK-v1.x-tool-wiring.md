---
id: task-1.5
title: MCP stdio adapter (SDK v1.x) + tool wiring
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:25'
updated_date: '2025-12-21 17:27'
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
- [x] #1 MCP server uses `@modelcontextprotocol/sdk` v1.x with stdio transport.
- [x] #2 tools/list exposes request_feedback, check_session, and provide_feedback only.
- [x] #3 tools/call forwards to CouncilService methods without embedding business logic.
- [x] #4 Linting passes (Biome).
- [x] #5 Formatting check passes (Biome).
- [x] #6 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.5):
- Add zod dependency for MCP tool input schemas.
- Add interface-layer DTOs and mapping helpers for MCP input/output shapes.
- Implement MCP stdio server in src/interfaces/mcp/server.ts using McpServer + StdioServerTransport (SDK v1.x).
- Register tools: request_feedback, check_session, provide_feedback. Each tool validates input, forwards to CouncilService, returns structuredContent + text.
- Keep adapter free of business logic; avoid stdout logging.
- Run lint/format/typecheck after changes and fix any issues.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/sdk.md
- docs/mcp/docs/develop/build-server.md
- docs/mcp/specification/2025-11-25/basic/transports.md
- docs/mcp/specification/2025-11-25/server/tools.md

Updated scope: reset_session tool removed; request_feedback handles session reset internally.

Implemented MCP stdio adapter with SDK v1.x, registered request_feedback/check_session/provide_feedback tools, mapped DTOs to domain/service, and wired CouncilService to FileCouncilStateStore. Added zod dependency. Lint/format/typecheck pass.
<!-- SECTION:NOTES:END -->
