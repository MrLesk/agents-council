---
id: TASK-26.2
title: >-
  Implement Electrobun app scaffold with desktop-default launch and CLI parity
  entrypoints
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - electrobun
  - runtime
  - cli
  - week-2
milestone: m-4
dependencies:
  - TASK-26.1
references:
  - src/cli/index.ts
  - scripts/cli.cjs
  - scripts/resolveBinary.cjs
  - package.json
documentation:
  - docs/council.md
  - docs/electrobun/guides/hello-world.md
  - docs/electrobun/guides/creating-ui.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Introduce the Electrobun runtime scaffold and wire command entrypoints so direct app launch opens the desktop window, while terminal invocation preserves CLI command behavior (`mcp`, `--help`, `--version`) and keeps `council chat` as desktop alias.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Project includes Electrobun build configuration and runtime entrypoints required to launch desktop UI.
- [ ] #2 Direct launch path opens desktop interface without requiring CLI flags.
- [ ] #3 Terminal command behavior remains compatible for existing CLI usage patterns, including `council mcp`.
- [ ] #4 `council chat` remains available and opens/focuses desktop UI instead of starting Bun.serve web chat.
- [ ] #5 No legacy web-chat server startup is required for primary UI operation.
<!-- AC:END -->
