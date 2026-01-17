---
id: task-22.1
title: 'Docs: Sync Codex SDK docs into docs/'
status: Done
assignee:
  - codex
created_date: '2026-01-08 15:18'
updated_date: '2026-01-08 15:22'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
parent_task_id: task-22
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bring a local, offline copy of the Codex SDK documentation into the repo to match the existing bundled docs (bun/mcp/claude).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Codex SDK docs are copied under a `docs/codex-sdk/` (or equivalent) folder with the same structure as the source.
- [x] #2 An index file `docs/codex-sdk.md` links to the copied Codex SDK docs.
- [x] #3 Docs are available before feature implementation begins.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Fetch Codex SDK markdown sources from developers.openai.com and identify all referenced docs.
- Mirror the source doc structure under docs/codex-sdk/ with ASCII filenames.
- Create docs/codex-sdk.md index linking to the copied files.
- Verify the local docs tree is complete and consistent with the source list.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Copied Codex SDK docs into docs/codex-sdk/sdk.md and added docs/codex-sdk.md index for local reference.

Tests: bun run typecheck; bun run lint.

Added docs/codex-sdk/readme.md from the Codex SDK TypeScript repository and linked it in docs/codex-sdk.md.

Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
