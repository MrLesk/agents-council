---
id: task-9
title: Fix Windows smoke-test PowerShell quoting in CI
status: Done
assignee:
  - codex
created_date: '2025-12-23 17:55'
updated_date: '2025-12-23 18:59'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Windows CI smoke-test fails because PowerShell variables are expanded by bash before execution. Adjust the workflow to pass the PowerShell script safely so the command runs correctly on windows-latest.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CLI supports `--version`/`-v` and `--help`/`-h` with exit code 0.
- [x] #2 CI smoke test validates the binary using `--version` and `--help` on all OS targets.
- [x] #3 Release install-sanity uses `council --version` (or equivalent) instead of expecting a startup error on Windows.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add minimal CLI support for `--version`/`-v` and `--help`/`-h` so `council` exits 0 and prints usage/version.
- Update `.github/workflows/ci.yml` smoke-test to call `--version` and `--help` on all OS targets instead of relying on startup-error behavior.
- Update `.github/workflows/release.yml` install-sanity to run the locally installed `council` binary (`./node_modules/.bin/council` or `council.cmd`) with `--version`/`--help`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Escaped PowerShell $ variables in the Windows smoke-test command so bash no longer strips them before execution.

Reopened to address Windows smoke-test logic because the CLI returns a non-zero exit code for the expected startup error in PowerShell; need to align with Backlog.md smoke test approach.

Added --help/--version handling in the CLI and updated CI/release smoke tests to call those flags using the local council binary on all OSes.
<!-- SECTION:NOTES:END -->
