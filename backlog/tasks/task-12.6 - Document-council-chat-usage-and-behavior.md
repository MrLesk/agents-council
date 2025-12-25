---
id: task-12.6
title: Document council chat usage and behavior
status: Done
assignee:
  - '@Codex'
created_date: '2025-12-23 22:03'
updated_date: '2025-12-25 22:32'
labels: []
milestone: v0.2.0 Chat UI
dependencies: []
parent_task_id: task-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update documentation to cover the chat command and its local-only behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `docs/council.md` documents `council chat`, `--port/-p`, and `--no-open`.
- [x] #2 `README.md` includes a short section describing the chat UI and local-only scope.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update `docs/council.md` to include `council chat` usage and describe `--port/-p` and `--no-open`.
2. Add a short `README.md` section explaining the chat UI and that it is local-only (no auth/remote access).
3. Keep wording consistent with existing CLI documentation and examples.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated `docs/council.md` with `council chat`, `--port/-p`, and `--no-open` usage.

Added README `Chat UI` section describing the local-only scope.

Added a README features bullet for the local chat UI (`council chat`).

Added `council chat` usage to `DEVELOPMENT.md` for local dev parity.
<!-- SECTION:NOTES:END -->
