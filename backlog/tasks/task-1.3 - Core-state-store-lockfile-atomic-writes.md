---
id: task-1.3
title: Core state store + lockfile + atomic writes
status: To Do
assignee: []
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 12:54'
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
- [ ] #1 State is persisted with a versioned JSON schema in the configured path.
- [ ] #2 Lockfile serialization prevents concurrent writes and handles stale locks safely.
- [ ] #3 Atomic write behavior is in place for state updates.
- [ ] #4 State path override via environment variable works.
- [ ] #5 Core state layer contains no MCP-specific logic.
- [ ] #6 Linting passes (Biome).
- [ ] #7 Formatting check passes (Biome).

- [ ] #8 Type check passes.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/bun/docs/runtime/file-io.md
- docs/bun/docs/guides/read-file/json.md
- docs/bun/docs/guides/read-file/exists.md
- docs/bun/docs/guides/write-file/basic.md
- docs/bun/docs/runtime/environment-variables.md
<!-- SECTION:NOTES:END -->
