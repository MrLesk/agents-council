---
id: TASK-23.3
title: Summon MCP schema and UI use cached models
status: Done
assignee:
  - '@codex'
created_date: '2026-01-18 11:57'
updated_date: '2026-01-18 12:49'
labels:
  - summon
  - mcp
  - ui
dependencies: []
parent_task_id: TASK-23
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure MCP summon schema and UI dropdowns use cached model lists (or Default-only when cache empty) to stay offline-safe while keeping strict validation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Summon MCP schema uses cached models for enum validation.
- [x] #2 UI dropdown shows Default + cached models; saved model visible even if list empty.
- [x] #3 No online calls are required to open the summon modal or start MCP server.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Update MCP summon schema to validate against cached models only; disallow model overrides when the cache is empty.
- Update chat summon settings response to use cached models and add a refresh endpoint that triggers a synchronous refresh for the UI.
- Update summon modal to show a refresh models button, always include Default (when cache empty or for Codex), and keep saved models visible but not submitted when cache is empty.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
MCP uses cached models for validation and disallows overrides without a cache; UI shows Default + cached models with a refresh button and keeps saved models visible when lists are empty.
<!-- SECTION:NOTES:END -->
