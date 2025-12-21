---
id: task-1.3
title: Core state store + lockfile + atomic writes
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 16:19'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.2
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the JSON state store and locking in `src/core/state`, keeping persistence isolated from the MCP adapter.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 State is persisted with a versioned JSON schema in the configured path.
- [x] #2 Lockfile serialization prevents concurrent writes and handles stale locks safely.
- [x] #3 Atomic write behavior is in place for state updates.
- [x] #4 State path override via environment variable works.
- [x] #5 Core state layer contains no MCP-specific logic.
- [x] #6 Linting passes (Biome).
- [x] #7 Formatting check passes (Biome).

- [x] #8 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.3):
- Extend src/core/state/store.ts to support safe read-modify-write via an update helper.
- Implement a file-backed store in src/core/state/fileStateStore.ts with default state creation and JSON load/save.
- Resolve the state path from AGENTS_COUNCIL_STATE_PATH or default to ~/.agents-council/state.json (expand ~), and ensure the parent directory exists.
- Add lockfile acquisition with retry + stale lock cleanup using mtime and release on completion.
- Write state updates atomically (temp file + fsync + rename in same directory).
- Run lint/format/typecheck after changes and fix any issues.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/bun/docs/runtime/file-io.md
- docs/bun/docs/guides/read-file/json.md
- docs/bun/docs/guides/read-file/exists.md
- docs/bun/docs/guides/write-file/basic.md
- docs/bun/docs/runtime/environment-variables.md

Implemented file-backed state store with lockfile + atomic writes in src/core/state/fileStateStore.ts, added update helper to store interface, and resolved state path via AGENTS_COUNCIL_STATE_PATH or ~/.agents-council/state.json. Lint/format/typecheck pass.
<!-- SECTION:NOTES:END -->
