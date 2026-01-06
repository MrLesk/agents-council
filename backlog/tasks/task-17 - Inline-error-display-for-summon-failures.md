---
id: task-17
title: Inline error display for summon failures
status: Done
assignee: []
created_date: '2026-01-06 16:12'
updated_date: '2026-01-06 16:12'
labels:
  - chat-ui
  - summon
  - error-handling
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When summoning a Claude agent fails (e.g., wrong executable path, network error), display an error card inline in the messages list where the thinking indicator was shown, instead of silently failing or reopening the modal.

Previously, errors would cause the modal to close and scroll down with nothing appearing, leaving users confused about what happened.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Error card appears inline where thinking indicator was
- [x] #2 Error card shows agent badge with 'failed' label
- [x] #3 Error message is displayed clearly
- [x] #4 Dismiss button clears the error card
- [x] #5 Timeout errors show appropriate message after 90 seconds
<!-- AC:END -->
