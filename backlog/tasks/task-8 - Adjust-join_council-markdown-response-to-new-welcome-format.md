---
id: task-8
title: Adjust join_council markdown response to new welcome format
status: In Progress
assignee:
  - codex
created_date: '2025-12-21 22:32'
updated_date: '2025-12-22 20:54'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the join_council markdown response to use the requested welcome-style messaging so first-time participants receive a clearer call-to-action and request context.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All tool markdown responses use the updated tone (start_council, join_council, get_current_session_data active/closed, send_response, close_council).
- [x] #2 join_council markdown response uses the exact welcome/request/---/prompt wording provided by the user.
- [x] #3 get_current_session_data markdown response keeps the same structure (request, messages, cursor) with updated tone and separators and does not include the assigned name line.
- [x] #4 The MCP server uses a single agentName state and resolves start/join vs stored name without duplicate variables.
- [x] #5 Only json and markdown response formats are supported and described.

- [x] #6 start_council and join_council tool descriptions reflect whether agent_name is required and do not mention response format flags.
- [x] #7 start_council response text tells agents to check back after a few seconds.
- [x] #8 close_council response omits the assigned agent name.

- [x] #9 Docs reflect updated tool schemas, response wording, and agent_name flag behavior.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Review current MCP server state (agent-name handling, schemas, and response formatters) and identify gaps against updated requirements.
- Simplify agent-name state to a single variable, adjust start/join/stored-name resolution, and gate schemas so agent_name only appears when required; ensure strict schemas reject unexpected fields.
- Tighten response-format handling to only json/markdown and remove any mention of format flags from tool descriptions.
- Update markdown response strings (start/join/get_current_session_data/send_response/close_council) to the approved wording, including the “check back after a few seconds” note and no agent name in close.
- Update docs (docs/council.md and any other references) to match tool schemas and new response text, then verify no stale references remain.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated MCP markdown responses to the new phrasing, split join_council formatting, added --agent-name/-n flag with schema gating and stored-name reuse, and refreshed docs/plan to match. Tests not run (not requested).

Simplified agent-name handling to a single state variable, tightened response-format validation, updated tool descriptions/instructions, and refreshed markdown responses + docs (start_council check-back note, close_council omits name).

Removed the assigned-name line from get_current_session_data markdown output and updated docs to match.

Removed resolveStartOrJoinAgentName/resolveStoredAgentName helpers and inlined name resolution logic in each tool handler.
<!-- SECTION:NOTES:END -->
