---
id: task-14.4
title: Chat API endpoints for summon + agent settings
status: Done
assignee:
  - codex
created_date: '2025-12-26 16:37'
updated_date: '2026-01-05 17:29'
labels: []
milestone: v0.3 - Summon Claude
dependencies:
  - task-14.1
  - task-14.2
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend the chat HTTP server to read/update summon settings and trigger a summon using core services. Provide endpoints suitable for the chat UI; scope limited to server API (no UI changes).

Docs:
- docs/council.md
- docs/claude-agent-sdk/typescript.md
- docs/mcp.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Endpoints allow reading and updating agent settings (agent/model) and return persisted values.
- [x] #2 Summon endpoint triggers core summon and returns a clear success or error response.
- [x] #3 Endpoints validate input and handle missing or invalid data without crashing.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Review chat server routing patterns (server.ts) and existing API payload validation helpers.
- Add endpoints to load summon settings and to update agent/model selections.
- Add summon endpoint that calls core summon runner and returns a clear success/error payload.
- Validate inputs and handle missing/invalid data gracefully.
- Run bun run typecheck and bun run lint after changes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/mcp.md (MCP reference for naming/transport conventions).

Added chat server endpoints for summon settings (get/update) and summon agent, with input validation and default agent handling.

Mapped summon settings payloads with supported/default agent metadata; summon endpoint returns mapped summon response.

Checks: bun run typecheck, bun run lint
<!-- SECTION:NOTES:END -->
