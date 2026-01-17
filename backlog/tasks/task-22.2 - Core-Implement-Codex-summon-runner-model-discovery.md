---
id: task-22.2
title: 'Core: Implement Codex summon runner + model discovery'
status: Done
assignee:
  - codex
created_date: '2026-01-08 15:19'
updated_date: '2026-01-08 18:22'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
parent_task_id: task-22
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add Codex SDK integration in the core summon service so the system can spawn Codex agents with saved per-agent settings.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Core exposes a Codex summon path and chooses the correct runner based on the agent selection.
- [x] #2 Supported Codex models are discoverable and cached similarly to the Claude flow.
- [x] #3 Summon settings persist per-agent model selection without breaking existing Claude settings.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Review local Codex SDK docs and inspect the TypeScript package API surface to understand initialization, auth, and run flow.
- Design a Codex summon runner that mirrors Claude behavior: fetch active session, run Codex with a council prompt, and record feedback in the council state.
- Add model discovery/caching for Codex and update summon settings shape if Codex-specific settings are required.
- Update core summon entry points to route by agent name and return a consistent SummonAgentResult.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added Codex summon runner using the Codex SDK with read-only sandbox defaults, plus a shared summon router that selects Claude vs Codex.

Implemented per-agent model discovery with caching; Codex models are read from ~/.codex/config.toml when present.

Updated summon flow defaults to persist per-agent model selection; tests: bun run typecheck; bun run lint.

Filtered Codex prompt feedback to the active request before building the prompt to avoid cross-request leakage.

Tests: bun run typecheck; bun run lint.

Pinned @openai/codex-sdk to 0.79.0 in package.json. Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
