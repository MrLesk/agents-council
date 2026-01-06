---
id: task-14.10
title: 'Summon settings: agent/model only + model dropdowns'
status: Done
assignee:
  - '@codex'
created_date: '2026-01-05 17:07'
updated_date: '2026-01-05 17:33'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplify summon configuration to agent/model only and add model dropdowns for chat + MCP. Clean up documentation and Backlog records to remove the dropped field from the narrative.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Summon config store and types only include model; legacy configs with the removed field are ignored safely.
- [x] #2 Chat UI and MCP summon_agent no longer expose the removed field; model selection uses supported-model dropdowns/enum values.
- [x] #3 Documentation and Backlog task records no longer mention the removed field.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Remove the extra summon field from core settings/types and summon runner; ignore legacy config fields on load.
- Add a supported-models loader using Claude Code (supportedModels) with caching and safe fallback.
- Update chat API + UI to render model as a dropdown fed by supported models; remove the extra field.
- Update MCP summon_agent schema to enumerate supported models when available; remove the extra field.
- Scrub the removed field from docs and Backlog task records.
- Run bun run typecheck and bun run lint.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed the extra summon field from core settings, MCP/Chat DTOs, and the summon runner so agent/model are the only stored options.

Added a supported-model loader via Claude Code supportedModels and wired chat + MCP to use dropdown/enum model lists with a default fallback.

Updated docs and Backlog task records to remove the dropped field from the summon narrative.

Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
