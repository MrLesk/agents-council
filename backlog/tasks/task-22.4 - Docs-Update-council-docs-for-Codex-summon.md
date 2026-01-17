---
id: task-22.4
title: 'Docs: Update council docs for Codex summon'
status: Done
assignee:
  - codex
created_date: '2026-01-08 15:19'
updated_date: '2026-01-08 15:46'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
parent_task_id: task-22
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Document Codex summon support and prerequisites in the public docs (README/council docs).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Docs mention Codex as a summonable agent in MCP tool descriptions and chat UI guidance.
- [x] #2 Prerequisites and configuration for Codex summon are documented alongside Claude instructions.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Update README and docs/council.md to mention Codex summon support and prerequisites.
- Document Codex SDK/CLI requirements (Codex login or CODEX_API_KEY, optional model selection).
- Ensure MCP tool docs include Codex in summon_agent description where applicable.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated README.md and docs/council.md to mention Codex summon support, prerequisites, and model defaults.

Documented Codex login/API key requirements and config.toml model defaults alongside Claude instructions.

Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
