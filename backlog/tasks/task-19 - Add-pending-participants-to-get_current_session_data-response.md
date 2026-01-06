---
id: task-19
title: Add pending participants to get_current_session_data response
status: Done
assignee:
  - Claude
created_date: '2026-01-06 17:38'
updated_date: '2026-01-06 17:43'
labels:
  - api
  - core-service
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a computed field to the `get_current_session_data` response that lists participants who have joined the council but haven't sent any feedback yet.

Currently the response includes `state.participants` (all who joined) and `feedback` (all responses), but clients must manually compute who is "pending". This should be a first-class field in the response to enable UI features like showing loading indicators for agents about to respond.

The computation: participants whose `agentName` does not appear as `author` in any feedback entry for the current request.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 get_current_session_data response includes a `pendingParticipants` field (array of agent names)
- [x] #2 Field contains participants who joined but have no feedback entries for current request
- [x] #3 Field is empty array when no participants are pending
- [x] #4 MCP markdown format includes pending participants section when non-empty
- [x] #5 MCP JSON format includes the array in structured response
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Files to Modify (5 files)

1. `src/core/services/council/types.ts` - Add `pendingParticipants: string[]` to `GetCurrentSessionDataResult`
2. `src/core/services/council/index.ts` - Compute pending participants in `buildSessionData()`
3. `src/interfaces/mcp/dtos/types.ts` - Add `pending_participants: string[]` to `GetCurrentSessionDataResponse`
4. `src/interfaces/mcp/mapper.ts` - Map `pendingParticipants` → `pending_participants`
5. `src/interfaces/mcp/server.ts` - Add markdown section for pending participants

### Computation Logic (in buildSessionData)

1. If no active request → return empty array
2. Filter state.feedback to entries where requestId === request.id
3. Extract set of authors from filtered feedback
4. Return participant.agentName for each participant NOT in authors set

### Markdown Format (when non-empty)

```
Awaiting response from: Agent1, Agent2
```

Added after messages section, before cursor line.

### Edge Cases
- No active session → empty array
- No participants → empty array
- All participants have responded → empty array
- Participant responded to previous request but not current → included in pending
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**Core Service** (`src/core/services/council/index.ts`):
- Added `computePendingParticipants()` helper that filters participants who haven't submitted feedback for the current request
- Extended `buildSessionData()` return type to include `pendingParticipants`
- Updated `getCurrentSessionData()` to pass through the new field

**Core Types** (`src/core/services/council/types.ts`):
- Added `pendingParticipants: string[]` to `GetCurrentSessionDataResult`

**DTO Types** (`src/interfaces/mcp/dtos/types.ts`):
- Added `pending_participants: string[]` to `GetCurrentSessionDataResponse`

**Mapper** (`src/interfaces/mcp/mapper.ts`):
- Added mapping for `pending_participants` field

**MCP Server** (`src/interfaces/mcp/server.ts`):
- Added markdown formatting: `Awaiting response from: Agent1, Agent2` when array is non-empty

### Computation Logic
Participants are "pending" if their `agentName` does not appear as `author` in any feedback entry for the current request. Returns empty array when no active request.
<!-- SECTION:NOTES:END -->
