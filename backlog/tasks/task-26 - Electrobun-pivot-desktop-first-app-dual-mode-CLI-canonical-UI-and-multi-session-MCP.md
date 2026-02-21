---
id: TASK-26
title: >-
  Electrobun pivot: desktop-first app, dual-mode CLI, canonical UI, and
  multi-session MCP
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
labels:
  - electrobun
  - desktop
  - cli
  - mcp
  - ui
  - multi-session
milestone: m-4
dependencies: []
references:
  - src/cli/index.ts
  - src/interfaces/mcp/server.ts
  - src/interfaces/chat/server.ts
  - src/core/services/council/index.ts
  - src/core/state/fileStateStore.ts
  - Design Council Hall Interface/src/app/App.tsx
documentation:
  - docs/electrobun.md
  - docs/ui-spec.md
  - docs/ui-implementation-progress.md
  - docs/council.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deliver the product pivot from web UI + Bun-compiled CLI to an Electrobun desktop architecture while retaining terminal-based CLI use, adopting the canonical "Design Council Hall Interface", and enabling multi-session workflows with MCP session selection.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Launching the built app directly opens the desktop Council interface by default on supported platforms.
- [ ] #2 Invoking the binary from terminal preserves CLI usage for council operations, including MCP server startup behavior.
- [ ] #3 The production UI uses the canonical Council Sidebar + Council Hall structure from the design bundle and is wired to real council data/operations.
- [ ] #4 Council state supports multi-session workflows with explicit session targeting in MCP interactions.
- [ ] #5 Distribution remains a single user-facing npm package with platform-specific optional dependency packages and cross-platform release validation.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Week 1: TASK-26.1 (architecture + compatibility ADR) to lock runtime modes, design-bundle remediation, and platform constraints.

Week 2: TASK-26.2 (Electrobun scaffold + dual-mode entrypoints) and TASK-26.3 (multi-session core schema/service) begin after TASK-26.1.

Week 3-4: TASK-26.4 evolves MCP contract for explicit session targeting after TASK-26.3. TASK-26.5 builds desktop bridge after TASK-26.2 + TASK-26.3.

Week 5: TASK-26.6 ports canonical Council Hall UI and wires real data/summon flows after TASK-26.5.

Week 6: TASK-26.7 completes CI/release/npm packaging migration after TASK-26.2 + TASK-26.4. TASK-26.8 finalizes docs/migration guidance after TASK-26.4 + TASK-26.6 + TASK-26.7.

Delivery decisions locked with user:
- Timeline horizon: 6 weeks.
- Rollout scope: all platforms now.
- CLI behavior priority: preserve existing terminal contract.
- UI migration mode: canonical design + full functional integration.
- Session scope: multi-session now.
- Requirement priority: allow MCP contract changes to support session selection.
- Packaging: single user-facing npm package with platform optional dependency packages.
- `council chat`: retained as alias to desktop app behavior.
<!-- SECTION:PLAN:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Cross-platform smoke validation covers desktop launch mode and terminal CLI mode on macOS, Windows, and Linux.
- [ ] #2 Upgrade notes document MCP contract changes and migration expectations for clients.
<!-- DOD:END -->
