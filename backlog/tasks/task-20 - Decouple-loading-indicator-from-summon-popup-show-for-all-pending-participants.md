---
id: task-20
title: >-
  Decouple loading indicator from summon popup - show for all pending
  participants
status: Done
assignee:
  - Claude
created_date: '2026-01-06 17:38'
updated_date: '2026-01-06 18:16'
labels:
  - chat-ui
  - ux
dependencies:
  - task-19
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently the chat UI shows a "thinking" loading indicator only when a user summons an agent via the modal. This is tightly coupled to the `pendingSummon` local state in Hall.tsx.

Change the behavior to show loading indicators for ALL agents who have joined the council but haven't responded yet, regardless of how they joined (summoned, joined via MCP tool, etc.).

This provides better visibility into council activity - users can see when any agent is "thinking" and about to respond, not just agents they personally summoned.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Loading indicator shown for each participant in pendingParticipants from API response
- [x] #2 Multiple pending participants show multiple loading indicators
- [x] #3 Loading indicator disappears when participant sends their first response
- [x] #4 Summon flow no longer manages its own pendingSummon state for the indicator
- [x] #5 Works for agents joining via any method (summon, join_council MCP tool, etc.)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Files to Modify (3 files)

1. `src/interfaces/chat/ui/types.ts` - Add `pending_participants` field to API response type
2. `src/interfaces/chat/ui/hooks/useCouncil.ts` - Expose `pendingParticipants` from API response
3. `src/interfaces/chat/ui/pages/Hall.tsx` - Use `pendingParticipants` for loading indicators

### Detailed Changes

#### 1. types.ts
- Add `pending_participants: string[]` to `GetCurrentSessionDataResponse`

#### 2. useCouncil.ts
- Add `pendingParticipants` state (array of strings)
- Update it from `getCurrentSessionData` response in `refresh()`
- Add `pendingParticipants` to `CouncilContext` type and return value

#### 3. Hall.tsx
- Get `pendingParticipants` from council context
- Remove `pendingSummon` state usage for loading indicators
- Replace single thinking card with loop over `pendingParticipants`
- Keep only error tracking for summon failures (`summonError` state)
- Remove effect that clears pendingSummon when agent responds
- Remove 90-second timeout effect
- Adjust toast/new messages logic
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**types.ts**
- Added `pending_participants: string[]` to `GetCurrentSessionDataResponse`

**useCouncil.ts**
- Added `pendingParticipants` state (array of strings)
- Updates from `getCurrentSessionData` response via `setPendingParticipants(result.pending_participants)`
- Exposed in `CouncilContext` type and return value

**Hall.tsx**
- Replaced `pendingSummon` state with `summonFailure` (for error handling only)
- Removed effects that managed pendingSummon lifecycle (clear on response, 90s timeout)
- Updated rendering to iterate over `pendingParticipants` from API, showing one thinking indicator per pending agent
- Separate error card for `summonFailure` (summon-specific errors)
- Updated empty state check to include `pendingParticipants.length === 0`
- Changed label from "summoning..." to "thinking..." since it applies to all pending participants

### How It Works
1. Agent joins council → becomes a participant with no feedback
2. API computes `pendingParticipants` = participants who haven't sent feedback yet
3. Chat UI polls via WebSocket → gets `pending_participants` in response
4. Hall renders a loading indicator for EACH name in `pendingParticipants`
5. When agent responds → API updates → participant removed from list → indicator disappears

### Testing
- `bun run typecheck` ✓
- `bun run lint` ✓
<!-- SECTION:NOTES:END -->
