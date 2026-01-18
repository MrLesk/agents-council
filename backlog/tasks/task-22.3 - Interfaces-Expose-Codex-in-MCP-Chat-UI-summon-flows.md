---
id: task-22.3
title: 'Interfaces: Expose Codex in MCP + Chat UI summon flows'
status: Done
assignee:
  - codex
created_date: '2026-01-08 15:19'
updated_date: '2026-01-08 21:07'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
parent_task_id: task-22
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update MCP tool schema, chat server endpoints, and chat UI so users can choose Codex when summoning agents.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 MCP `summon_agent` accepts Codex in the agent input and routes to the Codex runner.
- [x] #2 Chat UI summon modal allows selecting Codex, displays Codex models, and handles errors without breaking Claude.
- [x] #3 Settings APIs/UI support any Codex-specific configuration needed for summoning.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Update MCP summon_agent tool to accept Codex and route to the new summon router.
- Extend chat server summon settings payload to provide per-agent model lists and Codex selection.
- Update chat UI summon modal to handle per-agent models, including free-form entry when no model list is available.
- Verify summon failures are surfaced consistently for Codex and Claude.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
MCP summon_agent now accepts Codex and routes through the shared summon handler; chat server returns per-agent model lists.

Summon modal supports per-agent model lists with a free-form input when no models are listed, keeping Claude behavior intact.

No additional Codex settings required; it relies on Codex CLI config/env. Tests: bun run typecheck; bun run lint.

Manual UI smoke via chrome-devtools: summon modal shows Codex option and Codex model entry from config.
<!-- SECTION:NOTES:END -->
