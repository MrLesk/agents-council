---
id: task-14.6
title: 'Docs: Summon Claude feature and auth prerequisites'
status: Done
assignee:
  - codex
created_date: '2025-12-26 16:37'
updated_date: '2026-01-05 17:29'
labels: []
dependencies:
  - task-14.3
  - task-14.4
  - task-14.5
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update README and docs/council.md to describe summon-Claude usage, Claude Code authentication reuse, and config persistence location. Scope: documentation only.

Docs:
- README.md
- docs/council.md
- docs/claude-agent-sdk/quickstart.md
- docs/claude-agent-sdk/typescript.md
- docs/claude-agent-sdk/mcp.md
- docs/mcp.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README and docs/council.md describe how to summon Claude and that Claude Code authentication is reused when available.
- [x] #2 Docs note config persistence location (next to the state file) and saved options (agent/model).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Update README.md with summon Claude usage and Claude Code auth reuse note.
- Update docs/council.md with summon_agent tool inputs/defaults, chat UI summon controls, and config persistence details.
- Mention summoned agent restrictions only if still applicable (omit tools-only restriction per latest direction).
- Run bun run typecheck and bun run lint after doc edits if needed.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/claude-agent-sdk.md (index), docs/claude-agent-sdk/quickstart.md (Claude Code auth reuse), docs/claude-agent-sdk/typescript.md (Options), docs/claude-agent-sdk/mcp.md, docs/mcp.md.

Updated README.md and docs/council.md with summon agent usage, chat UI summon controls, auth reuse note, and summon_agent inputs/defaulting.

Checks: bun run typecheck, bun run lint
<!-- SECTION:NOTES:END -->
