---
id: task-1.2
title: Define core domain model + CouncilService interface
status: To Do
assignee: []
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 12:54'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.1
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Introduce the domain-driven core layout (`src/core`) with shared types and a CouncilService interface/class that encapsulates business rules without MCP concerns.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `src/core` exists with subfolders for types, services, and state.
- [ ] #2 Domain types cover session, request, feedback, and participant records.
- [ ] #3 CouncilService interface/class exposes request_feedback, check_session, provide_feedback, and reset_session operations.
- [ ] #4 No MCP-specific types or transport logic exist in `src/core`.
- [ ] #5 Linting passes (Biome).
- [ ] #6 Formatting check passes (Biome).

- [ ] #7 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/learn/architecture.md
<!-- SECTION:NOTES:END -->
