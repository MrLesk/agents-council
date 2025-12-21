---
id: task-1.4
title: CouncilService logic + polling semantics
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 17:21'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.3
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the CouncilService behaviors (request, check, provide) on top of the core state store, with cursor-based polling rules and participant tracking.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CouncilService implements request_feedback, check_session, and provide_feedback behaviors.
- [x] #2 request_feedback resets the session state (clears requests, feedback, participants) before creating a new request.
- [x] #3 check_session returns only new requests/feedback since the cursor and updates participant markers.
- [x] #4 Polling behavior is non-blocking and avoids duplicate delivery across cursors.
- [x] #5 Service logic uses core state store without MCP-specific code.
- [x] #6 Linting passes (Biome).
- [x] #7 Formatting check passes (Biome).

- [x] #8 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.4):
- Update CouncilServiceImpl to reset session state in requestFeedback and remove resetSession behavior.
- Ensure requestFeedback creates a fresh session, clears prior requests/feedback/participants, and sets current request.
- Keep checkSession cursor behavior and participant updates; no blocking or duplicate delivery.
- Keep provideFeedback logic on top of core store.
- Keep logic core-only (no MCP DTOs) and run lint/format/typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/specification/2025-11-25/server/utilities/pagination.md
- docs/mcp/specification/2025-11-25/basic/lifecycle.md
- docs/bun/docs/guides/util/javascript-uuid.md

Implemented CouncilServiceImpl logic in src/core/services/council/index.ts using core state store update flow, with cursor-based polling, participant updates, non-blocking checks, and reset behavior. Lint/format/typecheck pass.

Requirements updated: reset_session tool removed; request_feedback now resets session state automatically in v1.

Updated requestFeedback to reset session state (clears requests/feedback/participants) and removed resetSession from CouncilService; lint/format/typecheck pass.
<!-- SECTION:NOTES:END -->
