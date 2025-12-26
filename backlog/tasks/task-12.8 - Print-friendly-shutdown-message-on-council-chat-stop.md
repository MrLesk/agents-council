---
id: task-12.8
title: Print friendly shutdown message on council chat stop
status: Done
assignee:
  - '@Codex'
created_date: '2025-12-26 08:04'
updated_date: '2025-12-26 08:05'
labels: []
milestone: v0.2.0 Chat UI
dependencies: []
parent_task_id: task-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When the chat server stops via Ctrl+C/SIGINT, show a short shutdown message so users see the server is stopping cleanly.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 On Ctrl+C/SIGINT while `council chat` is running, a user-friendly shutdown message prints before exit.
- [x] #2 The shutdown message is printed only once per shutdown.
- [x] #3 Chat shutdown timing behavior remains within the existing timeout expectations.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update `src/cli/index.ts` in `setupChatShutdown` to print a concise shutdown message on first SIGINT/SIGTERM before stopping the server.
2. Guard the message with the existing `shuttingDown` flag so it only prints once.
3. Keep the existing timeout/stop logic unchanged to preserve shutdown timing.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a shutdown log line on first SIGINT/SIGTERM in `setupChatShutdown` guarded by the existing `shuttingDown` flag.

Manual check: rebuilt `dist/council`, ran `./dist/council chat --no-open --port 5126`, and saw "🛑 Shutting down council chat..." on Ctrl+C.
<!-- SECTION:NOTES:END -->
