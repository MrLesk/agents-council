---
id: task-14.3
title: MCP summon_agent tool wired to core
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
Add a new MCP tool `summon_agent` that calls the core summon capability. Input schema should require `agent` (enum) and optionally accept a `model` override. Default agent should be the last used agent or an alphabetical fallback. Scope: MCP interface only.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `summon_agent` appears in the MCP tool list with required `agent` (enum) and optional `model` input.
- [x] #2 Default agent value is the last used agent when available; otherwise a stable alphabetical default is used.
- [x] #3 When optional `model` is omitted, the saved settings are used.

- [x] #4 Tool call triggers core summon and returns a clear success or failure response without exposing extra interfaces.

- [x] #5 docs/council.md lists summon_agent inputs (agent required; model optional) and defaulting behavior.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Review current MCP tool wiring (server.ts, dtos/types.ts, mapper.ts) to add a new summon_agent tool.
- Define summon_agent input schema with required agent enum and optional model; compute defaults from summon settings when omitted.
- Call the core summon runner and return a clear success/error payload (include feedback metadata).
- Update markdown/json tool formatting for summon_agent output.
- Run bun run typecheck and bun run lint after changes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/mcp.md (MCP reference), docs/claude-agent-sdk/mcp.md (stdio MCP configuration context).

Added summon_agent tool wiring in src/interfaces/mcp/server.ts with schema, default agent resolution, and response formatting.

Added SummonAgent DTOs and mapper functions; hooked tool to summonClaudeAgent core runner.

Checks: bun run typecheck, bun run lint
<!-- SECTION:NOTES:END -->
