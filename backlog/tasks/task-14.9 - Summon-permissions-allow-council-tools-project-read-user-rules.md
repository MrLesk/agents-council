---
id: task-14.9
title: 'Summon permissions: allow council tools + project read + user rules'
status: Done
assignee:
  - '@codex'
created_date: '2026-01-05 13:00'
updated_date: '2026-01-05 13:30'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Adjust summon permissions so Claude is allowed to use council tools and read the current project while still honoring user permission rules. Remove default bypass-permissions behavior so summon is safer by default.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Summoned Claude can use council MCP tools without permission prompts.
- [x] #2 Summoned Claude can read the current project (Read/Glob/Grep) without permission prompts.
- [x] #3 User permission rules are loaded and enforced for other tools; bypassPermissions is not the default.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Update `src/core/services/council/summon.ts` to remove `bypassPermissions` defaults and load user permission rules via `settingSources: ['user']`.
- Add a `canUseTool` handler that auto-allows council MCP tools and read-only tools (Read/Glob/Grep) while denying others unless allowed by user rules.
- Keep the summon flow intact and ensure `permissionMode: 'default'` is used.
- Run `bun run typecheck` and `bun run lint`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated summon query permissions to use default mode with user settings loaded, auto-allowing council MCP tools plus Read/Glob/Grep and denying other tools unless user rules allow them.

Removed bypass-permissions defaults to keep summon safer by default.

Tests: bun run typecheck; bun run lint.

Gated summon debug logging behind AGENTS_COUNCIL_SUMMON_DEBUG and documented the env flag in README/docs.
<!-- SECTION:NOTES:END -->
