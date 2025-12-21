---
id: task-1.2
title: Define core domain model + CouncilService interface
status: Done
assignee:
  - codex
created_date: '2025-12-21 11:24'
updated_date: '2025-12-21 17:19'
labels: []
milestone: Council v1 (stdio)
dependencies:
  - task-1.1
parent_task_id: task-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define the council core service layout with service-scoped domain types and a CouncilService interface + implementation, keeping DTOs in the MCP interface layer and core free of transport concerns.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `src/core/services/council` exists with `index.ts` and `types.ts`; `src/core/state` remains for persistence.
- [x] #2 Domain types cover session, request, feedback, participant, and state in `src/core/services/council/types.ts`.
- [x] #3 `CouncilService` interface and implementation live in `src/core/services/council/index.ts` and expose requestFeedback, checkSession, and provideFeedback.
- [x] #4 MCP DTOs live under `src/interfaces/mcp/dtos` and core services do not depend on them.
- [x] #5 No MCP-specific types or transport logic exist in `src/core`.
- [x] #6 Linting passes (Biome).

- [x] #7 Formatting check passes (Biome).

- [x] #8 Type check passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan (subtask 1.2):
- Create src/core/services/council with types.ts (domain types) and index.ts (CouncilService interface + implementation skeleton).
- Define service-scoped domain types for session, request, feedback, participant, and state in types.ts.
- Add MCP DTOs under src/interfaces/mcp/dtos; map DTOs to domain objects in the interface layer (no DTOs in core).
- Update core state store types/imports to reference the council service domain types.
- Run lint/format/typecheck after changes and fix any issues.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
References:
- docs/mcp/docs/learn/architecture.md

Refactored core layout to service-scoped types: added src/core/services/council/types.ts and src/core/services/council/index.ts (interface + implementation skeleton), added MCP DTOs in src/interfaces/mcp/dtos/types.ts, updated state store import, and removed old core types/service files. Lint/format/typecheck pass.
<!-- SECTION:NOTES:END -->
