# Council CLI (v1)

## Overview

`agents-council` ships a local CLI named `council` that exposes an MCP stdio server.
The MCP adapter only forwards requests; business logic lives in the core service.

## Install

Local development:

```bash
bun install
```

Global install (if published):

```bash
npm install -g agents-council
```

## Build

```bash
bun run build
```

This produces a local binary at `dist/council`.

## Run

```bash
./dist/council mcp
```

If you run without `mcp`, the CLI exits with:

```
Startup error: you need to run 'council mcp' in order to start the mcp server
```

## Tools (v1)

The MCP server exposes three tools:

- `request_feedback` (starts a new session and resets any existing session state)
- `check_session` (polls for new requests/feedback)
- `provide_feedback` (adds feedback for a request)

There is no `reset_session` tool in v1. Each `request_feedback` resets the session state
by clearing requests, feedback, and participants.

## Architecture

Core vs MCP adapter split:

- `src/core/services/council`: domain logic and types
- `src/core/state`: persistence (lockfile + atomic writes)
- `src/interfaces/mcp`: DTOs, mappings, and MCP tool wiring

The MCP layer only translates DTOs and forwards calls to the core service.

## State

State is stored at:

```
~/.agents-council/state.json
```

Override with:

```
AGENTS_COUNCIL_STATE_PATH=/path/to/state.json
```

## SDK Requirement

The MCP adapter uses the TypeScript SDK v1.x (`@modelcontextprotocol/sdk`).
