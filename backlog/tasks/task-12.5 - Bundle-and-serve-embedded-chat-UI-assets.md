---
id: task-12.5
title: Bundle and serve embedded chat UI assets
status: Done
assignee:
  - '@Codex'
created_date: '2025-12-23 22:03'
updated_date: '2025-12-25 22:18'
labels: []
milestone: v0.2.0 Chat UI
dependencies: []
parent_task_id: task-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Serve the chat UI from embedded assets when running `council chat`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `council chat` serves the UI from embedded assets without a separate install step.
- [x] #2 The built output includes the UI assets alongside the CLI binary.
- [x] #3 The UI renders correctly on desktop and mobile-sized viewports.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Build the compiled binary with `bun run build` to ensure the HTML import is bundled.
2. Launch `./dist/council chat --no-open --port 5123` and keep it running.
3. Fetch `/` and the emitted JS/CSS/asset URLs to confirm they are served from the compiled binary.
4. Verify UI renders at desktop and mobile viewports via DevTools and check for console errors.
5. Stop the server and record results/acceptance criteria in the task.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tested `bun run build` and `./dist/council chat --no-open --port 5124` (5123 was already in use). HTML and bundled JS/CSS assets served with 200 responses; logo PNG served at hashed URL.

Verified Gate UI renders at desktop size (1920x911) and a mobile-sized window (375x759 via window.open).

Observed a 404 for `/favicon.ico` in DevTools (non-blocking).
<!-- SECTION:NOTES:END -->
