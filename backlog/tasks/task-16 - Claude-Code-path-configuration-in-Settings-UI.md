---
id: task-16
title: Claude Code path configuration in Settings UI
status: Done
assignee: []
created_date: '2026-01-06 16:12'
updated_date: '2026-01-06 16:12'
labels:
  - chat-ui
  - summon
  - settings
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow users to configure a custom path to the Claude Code executable via the Settings UI. This is useful when Claude Code is installed in a non-standard location or when multiple versions are available.

The path resolution follows this priority: Settings UI > CLAUDE_CODE_PATH env var > "claude" from PATH.

Also displays the detected Claude Code version in the Summon Agent modal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Settings UI has a 'Claude Code Path' input field
- [x] #2 Path is persisted to summon settings config
- [x] #3 Supports absolute paths and command names
- [x] #4 Resolves command names to absolute paths via which/where
- [x] #5 Displays Claude Code version in Summon Agent modal
- [x] #6 Works cross-platform (Unix and Windows path formats)
<!-- AC:END -->
