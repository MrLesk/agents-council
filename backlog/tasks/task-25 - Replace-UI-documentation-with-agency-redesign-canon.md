---
id: TASK-25
title: Replace UI documentation with agency redesign canon
status: Done
assignee: []
created_date: '2026-02-21 19:58'
updated_date: '2026-02-21 20:01'
labels:
  - docs
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rewrite UI-related documentation so it matches the new agency-delivered "Design Council Hall Interface" and remove legacy UI references. Update canonical UI docs and user-facing UI sections in README and council docs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `docs/ui-spec.md` fully rewritten to reflect the new agency interface architecture, components, tokens, and interaction patterns.
- [x] #2 `docs/ui-implementation-progress.md` replaced with redesign parity tracker content based on the new interface.
- [x] #3 UI sections in `README.md` and `docs/council.md` updated to match the new interface language and behavior, with no legacy UI guidance.
- [x] #4 All changes pass `bun run typecheck` and `bun run format:check`.
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced legacy UI documentation with agency redesign canon. Overwrote `docs/ui-spec.md` with canonical component/layout/token contracts from `Design Council Hall Interface`, replaced `docs/ui-implementation-progress.md` with a redesign parity tracker, and updated UI sections in `README.md` and `docs/council.md` to the new Council Sidebar + Council Hall model. Added a Biome include exclusion for `Design Council Hall Interface/**` so repository checks ignore third-party agency bundle files. Validation: `bun run typecheck` and `bun run format:check` both pass.
<!-- SECTION:FINAL_SUMMARY:END -->
