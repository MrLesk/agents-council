---
id: TASK-26.7
title: >-
  Migrate CI and npm packaging to Electrobun desktop+CLI artifacts across
  platforms
status: To Do
assignee: []
created_date: '2026-02-21 21:11'
updated_date: '2026-02-21 21:12'
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
<!-- AC:END -->
