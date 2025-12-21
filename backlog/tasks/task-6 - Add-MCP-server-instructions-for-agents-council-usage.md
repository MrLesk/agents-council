---
id: task-6
title: Add MCP server instructions for agents-council usage
status: Done
assignee:
  - '@codex'
created_date: '2025-12-21 21:14'
updated_date: '2025-12-21 21:47'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expose MCP `instructions` during initialization so clients receive basic guidance on how to use agents-council tools (when to start a council, how to join/poll, and how to respond).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Server initialization includes a non-empty `instructions` string describing how to use the agents-council tools.
- [x] #2 Instructions cover when to use `start_council`, `join_council`, `get_current_session_data` (cursor usage), and `send_response`.
- [x] #3 Instructions mention the server-level `--format/-f` flag for Markdown vs JSON text output.
- [x] #4 Docs mention that the server provides `instructions` on initialization and summarize the guidance.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Confirm MCP SDK exposes initialize instructions and how to set them (SDK types/source).
- Add an instructions string to McpServer initialization covering when to use start_council, how to join/poll with get_current_session_data + cursor, how to send_response, and mention --format/-f for markdown vs json text output.
- Update docs/council.md to note that initialization includes instructions and summarize the guidance.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added MCP initialization instructions via McpServer options and documented the guidance in docs/council.md. Tests not run (not requested).

Validated instructions via MCP client stdio smoke test (Client.getInstructions) and ran `bun run build`.
<!-- SECTION:NOTES:END -->
