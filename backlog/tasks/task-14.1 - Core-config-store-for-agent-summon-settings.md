---
id: task-14.1
title: Core config store for agent summon settings
status: Done
assignee:
  - '@codex'
created_date: '2025-12-26 16:36'
updated_date: '2026-01-05 17:26'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a persistent config file stored alongside the council state file to hold summon settings (last used agent, per-agent model). Provide core read/update APIs that other layers can call. Scope: core only (no MCP/UI changes).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Config file location is derived from the resolved council state path directory and persists across runs.
- [x] #2 Config stores last used agent and per-agent settings (model) with sensible defaults when missing.
- [x] #3 Missing or invalid config data does not crash the app; defaults are returned and can be overwritten.

- [x] #4 docs/council.md notes the summon settings file location (next to state) and that agent/model choices are persisted.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Derive config path from the resolved state path directory.
- Implement load/upsert helpers for summon settings with defaults and safe parsing.
- Ensure missing/invalid config never crashes and can be overwritten.
- Update docs/council.md to document config location and persisted fields.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/council.md (State section), README.md (Roadmap/usage), docs/claude-agent-sdk.md (index).

Implemented summon settings config store alongside the resolved state path with safe defaults and overwrite behavior.

Updated docs to note config location and persisted summon settings fields.

Tests (retro verification): bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
