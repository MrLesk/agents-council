---
id: task-14.5
title: 'Chat UI: Summon agent modal with saved options'
status: Done
assignee:
  - codex
created_date: '2025-12-26 16:37'
updated_date: '2026-01-05 17:29'
labels: []
milestone: v0.3 - Summon Claude
dependencies:
  - task-14.4
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the chat UI to summon a Claude agent with configurable agent/model. UI should read defaults from the server, persist changes, and trigger summon. Scope: UI only.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 UI presents agent selection (Claude) and model controls with defaults from saved settings.
- [x] #2 Selected values persist and reload with the same defaults after refresh.
- [x] #3 Summon action calls the server and shows success/error state without requiring re-selection each time.

- [x] #4 README.md or docs/council.md mention chat UI summon controls (agent/model) and that selections persist.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Extend chat UI API/types to fetch/update summon settings and trigger summon.
- Add summon modal controls for agent/model with defaults from server.
- Persist selections via update endpoint and trigger summon action; surface success/error feedback.
- Keep UI state in sync across refreshes using stored settings.
- Run bun run typecheck and bun run lint after changes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/claude-agent-sdk/typescript.md (model/maxThinkingTokens context for UI options).

Doc refs: docs/council.md (Chat UI section), README.md (chat usage).

Added chat UI summon agent modal with agent/model controls, defaults loaded from server, and persisted settings + summon actions.

Extended UI types and API helpers for summon settings and summon agent endpoints; added styles for select and header actions.

Checks: bun run typecheck, bun run lint
<!-- SECTION:NOTES:END -->
