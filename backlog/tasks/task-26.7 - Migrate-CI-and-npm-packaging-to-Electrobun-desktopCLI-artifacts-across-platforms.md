---
id: TASK-26.7
title: >-
  Migrate CI and npm packaging to Electrobun desktop+CLI artifacts across
  platforms
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:24'
labels:
  - ci
  - release
  - npm
  - week-6
milestone: m-4
dependencies:
  - TASK-26.2
  - TASK-26.4
references:
  - .github/workflows/ci.yml
  - .github/workflows/release.yml
  - scripts/cli.cjs
  - scripts/resolveBinary.cjs
  - package.json
documentation:
  - docs/electrobun/guides/bundling-and-distribution.md
  - docs/electrobun/guides/cross-platform-development.md
  - DEVELOPMENT.md
  - README.md
  - docs/council.md
parent_task_id: TASK-26
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update build and release automation so Electrobun-generated binaries/artifacts are published via the existing single user-facing npm package model (with platform optional dependencies) and validated across macOS, Windows, and Linux.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CI builds and validates platform artifacts for Electrobun runtime targets on macOS, Windows, and Linux.
- [ ] #2 Release workflow publishes a single user-facing npm package plus platform optional dependency packages for binaries/artifacts.
- [ ] #3 Install-sanity workflow verifies terminal CLI behavior (`--help`, `--version`, `mcp`) from published packages on all supported OS runners.
- [ ] #4 Release artifacts include desktop-launchable binaries/installers appropriate for each platform.
- [ ] #5 Packaging and release documentation reflects the new Electrobun-based distribution model.
- [ ] #6 Developer and release documentation is updated in the same task (`DEVELOPMENT.md` plus Electrobun packaging docs) to reflect the implemented desktop+CLI distribution workflow and cross-platform expectations.
<!-- AC:END -->
