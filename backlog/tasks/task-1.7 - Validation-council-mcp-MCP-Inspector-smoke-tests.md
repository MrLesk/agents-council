---
id: task-1.7
title: 'Validation: council mcp + MCP Inspector smoke tests'
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
Validate the stdio MCP server using the `council mcp` command and capture repeatable Inspector steps.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Manual multi-terminal run using `council mcp` confirms session creation, polling, and lock behavior.
- [ ] #2 MCP Inspector smoke test succeeds for tools/list and tools/call.
- [ ] #3 Validation steps are captured in project docs or runbook.
- [ ] #4 Linting passes (Biome).
- [ ] #5 Formatting check passes (Biome).
- [ ] #6 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/tools/inspector.md
- docs/mcp/specification/2025-11-25/basic/transports.md
<!-- SECTION:NOTES:END -->
