---
id: TASK-23
title: 'Summon Codex: show CLI version + model list'
status: Done
assignee:
  - codex
created_date: '2026-01-08 21:14'
updated_date: '2026-02-21 17:31'
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
- [x] #1 Summon settings payload includes Codex CLI version and a populated Codex model list when available.
- [x] #2 Summon modal shows the Codex version label similar to Claude and uses the Codex model list for dropdown selection.
- [x] #3 MCP summon tool description lists Codex models alongside Claude when available.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add Codex CLI version lookup in core summon service (resolve Codex binary path and parse `codex --version`).
- Extend Codex model discovery to return a real list (prefer API list via CODEX_API_KEY/OPENAI_BASE_URL, fallback to config.toml model/migrations).
- Plumb codex_cli_version + Codex models through summon settings response and update UI labels/dropdowns.
- Update MCP summon_agent model descriptions to include Codex list when available.

Subtasks: 23.1 offline-first model cache, 23.2 codex app-server model/list fetch, 23.3 MCP schema + UI cached models + refresh button. Sequence: cache layer → app-server fetch → MCP/UI wiring.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Offline-first requirement: model discovery must not block MCP startup; use cached lists and best-effort background refresh. Codex model list should come from app-server model/list when available, with offline-safe fallback.

Completed subtasks 23.1–23.3 (offline model cache, codex app-server model/list, MCP/UI cached models + refresh button). Remaining parent requirements still open (Codex CLI version display).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Codex CLI version support end-to-end: implemented `getCodexCliVersion()` in `src/core/services/council/summon.ts` (using `codex --version` and semver extraction) with caching.

Extended summon settings response payload to include `codex_cli_version` in `src/interfaces/chat/server.ts` and `src/interfaces/chat/ui/types.ts`; all summon settings endpoints now fetch and return both Claude and Codex versions.

Updated summon modal agent dropdown labels in `src/interfaces/chat/ui/pages/Hall.tsx` to show `Codex v<version>` similar to `Claude Code v<version>`.

Verified required checks pass: `bun run typecheck` and `bun run format:check`.
<!-- SECTION:FINAL_SUMMARY:END -->
