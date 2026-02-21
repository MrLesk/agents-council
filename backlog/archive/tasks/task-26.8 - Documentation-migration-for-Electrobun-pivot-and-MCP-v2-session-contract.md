---
id: TASK-26.8
title: Documentation migration for Electrobun pivot and MCP v2 session contract
status: To Do
assignee: []
created_date: '2026-02-21 21:12'
updated_date: '2026-02-21 21:24'
labels:
  - docs
  - mcp
  - desktop
  - week-6
milestone: m-4
dependencies:
  - TASK-26.4
  - TASK-26.6
  - TASK-26.7
references:
  - src/cli/index.ts
  - src/interfaces/mcp/server.ts
  - src/interfaces/chat/server.ts
documentation:
  - README.md
  - docs/council.md
  - DEVELOPMENT.md
  - docs/ui-spec.md
parent_task_id: TASK-26
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rewrite user/developer documentation to remove obsolete web-chat guidance, explain Electrobun desktop usage, and provide explicit migration guidance for MCP contract changes introduced by multi-session session targeting.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README and council docs describe desktop launch behavior, terminal CLI behavior, and `council chat` alias behavior.
- [ ] #2 Developer docs describe Electrobun build/run workflow and cross-platform release expectations.
- [ ] #3 MCP documentation explicitly details the new session-selection contract with updated examples.
- [ ] #4 Migration notes call out breaking changes and expected client updates.
- [ ] #5 All documentation changes are internally consistent with implemented command and tool behavior.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Archived by backlog-workflow correction: documentation must be captured in the owning implementation tasks, not deferred to a docs-only follow-up. Scope redistributed to TASK-26.2 (user-facing launch/CLI docs), TASK-26.4 (MCP contract + migration docs), and TASK-26.7 (developer/release docs).
<!-- SECTION:NOTES:END -->
