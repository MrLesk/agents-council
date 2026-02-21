---
id: TASK-26.1
title: Electrobun compatibility and architecture baseline for dual-mode runtime
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
labels:
  - electrobun
  - architecture
  - week-1
milestone: m-4
dependencies: []
references:
  - src/cli/index.ts
  - scripts/cli.cjs
  - .github/workflows/release.yml
  - Design Council Hall Interface/src/app/components/CouncilHall.tsx
documentation:
  - docs/electrobun.md
  - docs/electrobun/guides/cross-platform-development.md
  - docs/electrobun/apis/cli/build-configuration.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Establish and document the concrete runtime architecture for Electrobun in this repo, including mode detection, process boundaries, and platform constraints that impact desktop-launch vs terminal-CLI behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Architecture decision record defines desktop mode, CLI mode, and MCP mode lifecycle boundaries for macOS/Windows/Linux.
- [ ] #2 Known compatibility issues in the incoming design bundle are enumerated with explicit remediation decisions.
- [ ] #3 Mode-detection strategy is specified with platform-specific behavior and failure handling (including Windows console constraints).
- [ ] #4 The task output includes an approved implementation sequence for downstream subtasks without unresolved technical decisions.
<!-- AC:END -->
