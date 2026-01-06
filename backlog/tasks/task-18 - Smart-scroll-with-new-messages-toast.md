---
id: task-18
title: Smart scroll with new messages toast
status: Done
assignee: []
created_date: '2026-01-06 16:12'
updated_date: '2026-01-06 16:18'
labels:
  - chat-ui
  - ux
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Improve scroll behavior when new messages arrive via WebSocket. Instead of auto-scrolling (which interrupts users reading older messages), show a "New messages" toast at the bottom-right of the voices panel.

Users can click the toast to scroll to the latest messages, or it auto-dismisses when they scroll to the bottom manually.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No auto-scroll when user is scrolled up reading older messages
- [x] #2 Toast appears at bottom-right when new messages arrive while scrolled up
- [x] #3 Clicking toast scrolls to bottom smoothly
- [x] #4 Toast auto-dismisses when user scrolls to bottom manually
- [x] #5 No auto-scroll anywhere - toast is the only scroll trigger (per user request)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Added 200ms loading animation delay on Summon Agent button before closing popup

- Removed all automatic scrollToBottom() calls - scroll only happens via toast click

- Users will see "↓ New messages" toast when new messages arrive while scrolled up
<!-- SECTION:NOTES:END -->
