---
id: TASK-23.2
title: Codex app-server model/list fetch (best-effort)
status: Done
assignee:
  - '@codex'
created_date: '2026-01-18 11:57'
updated_date: '2026-01-18 12:48'
labels:
  - summon
  - codex
dependencies: []
parent_task_id: TASK-23
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fetch Codex model list via codex app-server model/list (like CodexMonitor) as a best-effort refresh source. Must not block startup; fallback to cached list or config model when offline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Best-effort model/list fetch updates cached Codex model list.
- [x] #2 Failure to reach app-server leaves existing cache intact.
- [x] #3 Uses codexPath override/CODEX_PATH when spawning codex app-server.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Implement a minimal codex app-server JSON-RPC client to fetch model/list (spawn codex app-server, initialize, request model/list, parse response).
- Use codexPath override/CODEX_PATH when spawning the CLI; apply a short timeout and clean shutdown.
- On success, update the Codex model cache; on failure, keep existing cache intact and return no models.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added codex app-server model/list fetch with timeouts, codexPath/CODEX_PATH support, and cache updates on success only.
<!-- SECTION:NOTES:END -->
