---
id: task-1.4
title: CouncilService logic + polling semantics
status: To Do
assignee: []
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 12:54'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.3
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the CouncilService behaviors (request, check, provide, reset) on top of the core state store, with cursor-based polling rules and participant tracking.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CouncilService implements request_feedback, check_session, provide_feedback, and reset_session behaviors.
- [ ] #2 check_session returns only new requests/feedback since the cursor and updates participant markers.
- [ ] #3 Polling behavior is non-blocking and avoids duplicate delivery across cursors.
- [ ] #4 Service logic uses core state store without MCP-specific code.
- [ ] #5 Linting passes (Biome).
- [ ] #6 Formatting check passes (Biome).
- [ ] #7 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/specification/2025-11-25/server/utilities/pagination.md
- docs/mcp/specification/2025-11-25/basic/lifecycle.md
- docs/bun/docs/guides/util/javascript-uuid.md
<!-- SECTION:NOTES:END -->
