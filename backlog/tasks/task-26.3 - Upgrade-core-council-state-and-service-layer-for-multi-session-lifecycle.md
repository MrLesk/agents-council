---
id: TASK-26.3
title: Upgrade core council state and service layer for multi-session lifecycle
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - core
  - state
  - multi-session
  - week-2
  - week-3
milestone: m-4
dependencies:
  - TASK-26.1
references:
  - src/core/services/council/index.ts
  - src/core/services/council/types.ts
  - src/core/state/fileStateStore.ts
  - src/core/state/fileStore.ts
documentation:
  - docs/council.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolve the council domain model from single-session state to multi-session lifecycle management, including active-session selection, archive-ready history, and migration from existing persisted state.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Core state schema supports multiple sessions with clear active-session semantics.
- [ ] #2 Existing single-session persisted state is migrated safely without data loss or invalid state.
- [ ] #3 Council service operations can create, list, retrieve, and update sessions using deterministic rules.
- [ ] #4 Participant/request/feedback relationships remain consistent per session.
- [ ] #5 State locking and atomic-write guarantees remain intact after schema evolution.
<!-- AC:END -->
