---
id: task-4
title: Add join_council tool for first-time session access
status: Done
assignee:
  - codex
created_date: '2025-12-21 21:05'
updated_date: '2025-12-21 21:12'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Introduce a `join_council` tool as a friendly entry point for agents joining a session the first time. It should mirror `get_current_session_data` output but does not accept a cursor input, so callers get the full current session view on first contact.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 `join_council` is exposed as a tool with input schema containing only `agent_name`.
- [x] #2 `join_council` returns the same response shape and text formatting as `get_current_session_data` when called without a cursor, including `next_cursor` for follow-up calls.
- [x] #3 `join_council` respects the server `--format/-f` flag for Markdown vs JSON text output and always populates `structuredContent`.
- [x] #4 Docs and validation examples mention `join_council` as the first-call tool and show how to continue with `get_current_session_data` using the returned cursor.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add a `join_council` tool in the MCP server with input schema `{ agent_name }`, wiring it to the same core function as `get_current_session_data` but without a cursor.
- Reuse the existing response DTO/mapper and formatting path so the output matches `get_current_session_data` when no cursor is provided.
- Update docs and validation examples to introduce `join_council` as the first-call tool and show follow-up calls using the returned cursor.
<!-- SECTION:PLAN:END -->
