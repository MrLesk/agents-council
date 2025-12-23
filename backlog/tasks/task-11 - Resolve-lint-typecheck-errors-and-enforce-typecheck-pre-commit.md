---
id: task-11
title: Resolve lint/typecheck errors and enforce typecheck pre-commit
status: Done
assignee:
  - codex
created_date: '2025-12-23 18:58'
updated_date: '2025-12-23 19:00'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix current lint/typecheck failures and ensure typecheck runs as part of the pre-commit workflow.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Lint passes with no unused parameter warnings.
- [x] #2 Typecheck passes with no TS errors.
- [x] #3 Pre-commit hook runs typecheck alongside lint-staged.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Fix lint warnings by removing or marking unused parameters.
- Resolve TypeScript errors in CLI arg parsing and CouncilRequest status typing.
- Add typecheck to the pre-commit hook and confirm lint/typecheck pass locally.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed the unused parameter in formatCloseCouncil, hardened CLI arg parsing, fixed CouncilRequest status typing, and added typecheck to the pre-commit hook. Lint and typecheck pass locally.
<!-- SECTION:NOTES:END -->
