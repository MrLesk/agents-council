---
id: task-23
title: 'Summon Codex: show CLI version + model list'
status: In Progress
assignee:
  - codex
created_date: '2026-01-08 21:14'
updated_date: '2026-01-08 21:15'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Display the Codex CLI version in the summon UI and surface an actual list of available Codex models for selection.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Summon settings payload includes Codex CLI version and a populated Codex model list when available.
- [ ] #2 Summon modal shows the Codex version label similar to Claude and uses the Codex model list for dropdown selection.
- [ ] #3 MCP summon tool description lists Codex models alongside Claude when available.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add Codex CLI version lookup in core summon service (resolve Codex binary path and parse `codex --version`).
- Extend Codex model discovery to return a real list (prefer API list via CODEX_API_KEY/OPENAI_BASE_URL, fallback to config.toml model/migrations).
- Plumb codex_cli_version + Codex models through summon settings response and update UI labels/dropdowns.
- Update MCP summon_agent model descriptions to include Codex list when available.
<!-- SECTION:PLAN:END -->
