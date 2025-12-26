---
id: task-12.7
title: Simplify Hall UI WebSocket status to connection-lost only
status: Done
assignee:
  - '@Codex'
created_date: '2025-12-25 22:47'
updated_date: '2025-12-25 22:50'
labels: []
milestone: v0.2.0 Chat UI
dependencies: []
parent_task_id: task-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove the interim WebSocket joining/connecting state from the Hall UI so the only connection status messaging is the lost/offline indication.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Hall UI does not display any "connecting"/"joining" state or banner.
- [x] #2 A connection-lost/offline indicator still appears when the WebSocket is disconnected.
- [x] #3 No other Hall UI status labels regress (council session status still renders).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update `src/interfaces/chat/ui/hooks/useCouncil.ts` to remove the "connecting" state and keep only "listening" and "offline" transitions.
2. Update `src/interfaces/chat/ui/pages/Hall.tsx` to show only Connected vs Lost labels and render a single offline banner message.
3. Remove unused connecting status/banner styles in `src/interfaces/chat/ui/styles.css`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed "connecting" state from the Hall UI connection status; only listening/offline remain, with a single offline banner message.

Cleaned up unused connecting styles in the chat UI CSS.
<!-- SECTION:NOTES:END -->
