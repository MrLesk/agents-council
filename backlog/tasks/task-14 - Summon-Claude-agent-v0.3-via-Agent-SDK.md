---
id: task-14
title: Summon Claude agent (v0.3) via Agent SDK
status: Done
assignee:
  - codex
created_date: '2025-12-26 16:36'
updated_date: '2026-01-05 17:30'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deliver the summon-Claude capability end-to-end: core logic can summon Claude into the current council using the Claude Agent SDK with Claude Code authentication, then MCP/chat interfaces expose it without adding new business logic. This is a parent task for coordinated subtasks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Claude can be summoned into an active council and provide feedback.
- [x] #2 Claude Code authentication is used when available (no API key required if already logged in).
- [x] #3 Summon options (agent/model) persist across runs next to the state file.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan:
- Review current core/service, MCP, chat API, and UI entry points to confirm where summon integrates and keep changes minimal.
- Implement core summon runner via Claude Agent SDK using saved summon settings; require an active session and return clear errors.
- Wire MCP summon_agent tool to the core runner, with defaults from config.
- Extend chat server endpoints to read/update summon settings and trigger summon.
- Update chat UI to surface summon controls and persist selections.
- Update README/docs with summon usage, auth reuse, and settings location.
- Run bun run typecheck and bun run lint after changes.

Subtask breakdown/sequence: task-14.1 (config store) → task-14.2 (core summon runner) → task-14.3 (MCP summon_agent tool) → task-14.4 (chat API endpoints) → task-14.5 (chat UI summon modal) → task-14.6 (docs updates) → task-14.7 (markdown rendering) → task-14.8 (UI clarity pass) → task-14.9 (summon permissions).

Added subtask task-14.10 to simplify summon settings to agent/model only and switch model selection to supported-model dropdowns for chat/MCP.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Doc refs: docs/claude-agent-sdk.md (index), docs/claude-agent-sdk/overview.md, docs/claude-agent-sdk/quickstart.md (Claude Code auth reuse), docs/claude-agent-sdk/typescript.md (Options/model/maxThinkingTokens/mcpServers), docs/claude-agent-sdk/mcp.md, docs/claude-agent-sdk/custom-tools.md (streaming input for MCP), docs/mcp.md.

Validated end-to-end summon: Claude joins the active council, pulls session data, and posts feedback; responses are visible in council state and summon-debug.log captures tool names and SDK message flow.

Summon runs longer than the 60s Codex harness timeout, but completes successfully (~66s) and posts feedback. Let me know if you want async/timeout adjustments.

Reopened to track new subtask task-14.7 (markdown rendering for chat UI messages).

Completed subtask task-14.7 to render chat UI messages with @uiw/react-markdown-preview and safe HTML handling.

Archived task-15 and recreated the work as subtask task-14.8 per request.

Completed subtask task-14.8 for chat UI request/response clarity updates (request callout, summon placement, response header spacing/dividers, lighter code backgrounds).

Completed subtask task-14.9 to remove bypass-permissions defaults and load user settings, auto-allowing council MCP tools + Read/Glob/Grep via canUseTool.

Tests: bun run typecheck; bun run lint.
<!-- SECTION:NOTES:END -->
