---
id: TASK-26.6
title: >-
  Adopt canonical Design Council Hall UI in desktop renderer with full feature
  integration
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - ui
  - desktop
  - design-system
  - week-5
milestone: m-4
dependencies:
  - TASK-26.5
  - TASK-26.3
references:
  - Design Council Hall Interface/src/app/components/CouncilSidebar.tsx
  - Design Council Hall Interface/src/app/components/CouncilHall.tsx
  - Design Council Hall Interface/src/app/components/MessageBubble.tsx
  - src/interfaces/chat/ui/pages/Hall.tsx
  - src/interfaces/chat/ui/components/Settings.tsx
documentation:
  - docs/ui-spec.md
  - docs/ui-implementation-progress.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the current production chat UI implementation with the canonical "Design Council Hall Interface" structure and visuals, adapted for repository compatibility and fully wired to real council/summon workflows.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Desktop renderer uses canonical two-pane sidebar + hall layout aligned with `docs/ui-spec.md`.
- [ ] #2 UI supports real session selection/listing, message rendering, composer behavior, and council closure flows.
- [ ] #3 Summon modal and settings integrate model/reasoning controls and version visibility from current production capabilities.
- [ ] #4 Design-bundle compatibility blockers (including non-standard asset imports) are resolved without introducing broken runtime references.
- [ ] #5 Parity tracker in `docs/ui-implementation-progress.md` is updated to reflect implemented status for touched areas.
<!-- AC:END -->
