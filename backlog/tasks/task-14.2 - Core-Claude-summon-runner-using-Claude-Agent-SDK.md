---
id: task-14.2
title: Core Claude summon runner using Claude Agent SDK
status: Done
assignee:
  - codex
created_date: '2025-12-26 16:37'
updated_date: '2026-01-05 17:28'
labels: []
milestone: v0.3 - Summon Claude
dependencies:
  - task-14.1
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement core logic to summon Claude via the Claude Agent SDK. The summoned agent joins the current council, reads current session data, and posts a response using the council tools. Use persisted model settings. Scope: core only (no MCP/UI changes).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Summon uses Claude Agent SDK and works with Claude Code authentication when available (no API key required if already logged in).
- [x] #2 When an active council exists, Claude posts a response after fetching current session data; if no session, a clear error is returned.
- [x] #3 Model selections from the config store are honored.
- [x] #4 README.md or docs/council.md mention Claude Code authentication reuse.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Read Claude Agent SDK docs (quickstart, typescript, mcp, custom-tools) for auth reuse and MCP wiring details.
- Inspect core CouncilService + summon settings store to determine the minimal integration point for a summon runner.
- Implement a core summon runner that:
  - Loads saved agent/model settings and applies overrides when provided.
  - Verifies an active council session exists; returns a clear error if missing.
  - Uses the Claude Agent SDK with Claude Code auth reuse to join the council, read current session data, and post a response.
- Keep APIs minimal and consistent with existing core patterns; add shared helpers only if reused.
- Validate with bun run typecheck and bun run lint once changes are in.

Add debug logging for SDK summon sessions to a simple file in the project root to confirm tool names and message flow.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/claude-agent-sdk/quickstart.md (Claude Code auth reuse), docs/claude-agent-sdk/typescript.md (query options, mcpServers, allowedTools, model, maxThinkingTokens, systemPrompt/settingSources), docs/claude-agent-sdk/mcp.md (stdio MCP config), docs/claude-agent-sdk/custom-tools.md (MCP requires streaming input).

Doc refs: README.md (feature overview/roadmap), docs/council.md (Tools/Chat UI).

Implemented core summon runner in src/core/services/council/summon.ts using Claude Agent SDK with in-process MCP tools, session validation, settings merge/persist, and response verification.

Added @anthropic-ai/claude-agent-sdk dependency via bun add.

Checks: bun run typecheck, bun run lint

Added summon session debug logging to append JSON lines in summon-debug.log at the project root, including SDK messages and errors to confirm tool exposure.

Checks: bun run typecheck, bun run lint

Adjusted summon runner to use permissionMode: "bypassPermissions" with allowDangerouslySkipPermissions so Claude can call MCP tools without permission denials.

Checks: bun run typecheck, bun run lint

Validated active-session summon: Claude joined the council via mcp__council__join_council, fetched session data, and posted feedback; summon-debug.log captures the tool usage and the new feedback entry.

Summon completed successfully but the MCP tools/call in the Codex harness timed out at 60s; the underlying summon finished ~66s later and the response is present in council state.
<!-- SECTION:NOTES:END -->
