---
id: TASK-26.5
title: >-
  Implement desktop bridge for council actions, summon flows, and live state
  updates
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - desktop
  - bridge
  - summon
  - week-4
milestone: m-4
dependencies:
  - TASK-26.2
  - TASK-26.3
references:
  - src/interfaces/chat/server.ts
  - src/interfaces/chat/ui/api.ts
  - src/interfaces/chat/ui/hooks/useCouncil.ts
  - src/core/services/council/summon.ts
  - src/core/state/watcher.ts
documentation:
  - docs/electrobun/apis/browser-view.md
  - docs/electrobun/apis/browser/electroview-class.md
  - docs/electrobun/apis/events.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Provide the Electrobun-side application bridge between desktop renderer and core council services, including council actions, summon/settings operations, and live state notifications without Bun.serve HTTP/WebSocket dependencies.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Desktop renderer can execute start/join/get/send/close council actions through the new bridge.
- [ ] #2 Summon settings and summon-agent flows are fully accessible through desktop bridge APIs.
- [ ] #3 Live update notifications propagate to renderer when council state changes.
- [ ] #4 Desktop bridge error handling provides actionable messages equivalent to current UI behavior.
- [ ] #5 Legacy Bun.serve-specific transport dependencies are removed from the primary UI path.
<!-- AC:END -->
