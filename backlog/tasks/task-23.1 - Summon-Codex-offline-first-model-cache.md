---
id: TASK-23.1
title: Summon Codex offline-first model cache
status: Done
assignee:
  - '@codex'
created_date: '2026-01-18 11:56'
updated_date: '2026-01-18 12:48'
labels:
  - summon
  - codex
  - offline
dependencies: []
parent_task_id: TASK-23
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement an offline-first cache for summon model lists so startup never blocks on online discovery. Use cached lists for MCP schema/UX and refresh in background only when available.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 MCP startup uses cached model lists (no blocking network calls).
- [x] #2 Cache persists per agent and survives restarts.
- [x] #3 Background refresh updates cache without breaking offline usage.
- [x] #4 When cache is empty, model override is disallowed except for Default (no model).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add summon models cache to SummonSettings (per-agent models + updatedAt) and normalize/persist it in config.json.
- Create helpers to read cached models and to upsert cache entries, including a Codex config-model seed when cache is empty (offline-safe).
- Use cached models in MCP startup and chat summon settings responses; ensure no blocking model discovery on startup.
- Add background refresh hook (fire-and-forget) that can update cache when online, without impacting offline behavior.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented persistent summon model cache, seeded Codex from config, and moved startup/model list to cached sources with background refresh hooks.
<!-- SECTION:NOTES:END -->
