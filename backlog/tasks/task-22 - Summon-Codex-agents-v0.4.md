---
id: task-22
title: Summon Codex agents (v0.4)
status: Done
assignee: []
created_date: '2026-01-08 15:18'
updated_date: '2026-01-08 15:46'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enable summoning Codex agents alongside Claude so councils can pull Codex feedback via MCP and the chat UI. This milestone expands summon capabilities to include the Codex SDK while preserving existing Claude behavior and settings.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 MCP and chat interfaces allow selecting Codex or Claude when summoning, with per-agent model selections preserved.
- [x] #2 Core summon logic supports Codex via SDK with comparable error handling to the existing Claude flow.
- [x] #3 User-facing docs describe Codex summon availability and prerequisites.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented Codex summon support alongside Claude across core, MCP, and chat UI; per-agent model handling now supported.

Codex defaults read from ~/.codex/config.toml; Codex summon runs in read-only mode and stores responses via council state.

Docs updated in README.md and docs/council.md. Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
