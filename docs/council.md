# Council CLI (v2 Session-Targeted MCP)

## Overview

`agents-council` ships a local CLI named `council` with dual-mode behavior:
- desktop mode by default (`council` with no command),
- MCP stdio mode via `council mcp`.

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

Build stable Electrobun desktop artifacts for the current host:

```bash
bun run desktop:build:stable
```

This produces an `artifacts/` folder with files prefixed `stable-<platform>-<arch>-...`.

## Packaging model

- Root package: `agents-council` (single user-facing npm package).
- Optional platform packages:
  - `agents-council-linux-x64`
  - `agents-council-linux-arm64`
  - `agents-council-darwin-x64`
  - `agents-council-darwin-arm64`
  - `agents-council-windows-x64`

Each optional package contains:

- `council` / `council.exe` CLI binary for terminal usage.
- `desktop-artifacts/*` Electrobun installer/update artifacts for that platform.

Install-sanity in release CI validates published package behavior for:

- `council --version`
- `council --help`
- `council mcp` startup on stdio

## Run

Desktop-default launch:

```bash
./dist/council
```

Explicit MCP mode:

```bash
./dist/council mcp
```

Optional default agent name:

```bash
./dist/council mcp --agent-name agent-a
```

`council chat` remains available as a compatibility alias and launches desktop mode:

```bash
./dist/council chat
```

Help and version flags are also supported without starting the server:

```bash
./dist/council --help
./dist/council --version
```

### Desktop UI

The MCP tools are meant for AI agent clients (Claude/Codex/Gemini/etc). The desktop UI is the human-facing
interface for participating in the same local council session.

The previous Bun.serve-backed web chat startup path is no longer the primary runtime path for UI launch.

The UI contract follows the Council Hall redesign:

- `CouncilSidebar`: session chronicle, active session selection, spawn action, archive section
- `CouncilHall`: session header, voice stream, composer, and summon entry
- `Summon modal`: agent selection and optional model overrides

Selections for summon agent/model persist between runs.

For implementation guidance, use:

- `docs/ui-spec.md` as the canonical UI specification
- `docs/ui-implementation-progress.md` as the parity tracker

## Tools (v2)

The MCP server exposes six tools:

- `start_council` (starts a new session and records the council request)
- `join_council` (joins a specific session via `session_id` and returns request + responses)
- `get_current_session_data` (returns data for a specific `session_id`, optionally from a cursor)
- `close_council` (closes a specific `session_id` with a conclusion)
- `send_response` (adds a response to a specific `session_id`)
- `summon_agent` (summons a Claude or Codex agent into the active council)

`summon_agent` inputs:
- `agent` (required, enum)
- `model` (optional override)

If `agent` is omitted by the caller, the last used agent is selected when available; otherwise the
alphabetical default is used. When `model` is omitted, the saved settings are used.

Codex model defaults come from `~/.codex/config.toml` (`model = "..."`) unless you override the model in the summon call.

`start_council` expects `request` and returns a new `session_id`. In v2, starting a council does **not**
reset prior sessions; multiple sessions are retained and can be targeted explicitly.

`join_council` requires `session_id` and `agent_name` unless the server was started with `--agent-name/-n`.
The server may append a suffix (`#1`, `#2`, ...) if the name is already in use in that session; reuse the
returned `agent_name` on subsequent calls.

`get_current_session_data`, `send_response`, and `close_council` require `session_id`.

When `--agent-name/-n` is set, tool inputs omit `agent_name` and the server reuses the default for all calls.
Without it, the resolved name from `start_council`/`join_council` is stored in memory for subsequent calls.

## Migration notes (implicit -> session-targeted)

From v2 onward, callers must provide `session_id` when operating on an existing session:

- `join_council`: now requires `session_id`
- `get_current_session_data`: now requires `session_id`
- `send_response`: now requires `session_id`
- `close_council`: now requires `session_id`

Migration flow:

1. Call `start_council` and store returned `session_id`.
2. Pass that `session_id` in all subsequent join/get/send/close calls for that conversation.
3. Update error handling to expect explicit target errors:
   - missing `session_id`
   - `Session not found.`
   - `Council session is closed.` / `Council session is already closed.`

## Initialization instructions

On initialization, the server returns an `instructions` string that summarizes how to use the tools:
- If you need feedback from other AI agents, start a council with `start_council`.
- If you are requested to join the council, call `join_council` with `session_id`, read the request, and `send_response` with the same `session_id` as soon as possible.
- Use `get_current_session_data` with `session_id` to poll for new responses; pass the cursor returned to fetch only newer messages.
- Use `close_council` with `session_id` to end that session with a conclusion.

## Response format

Use `--format` (or `-f`) with `markdown|json` on `council mcp` (default: `markdown`). Markdown responses are
plain text for agents:

- `start_council`:
  - `Your request is received. Return anon for replies, and look again in a few seconds.`
  - `Your assigned name is: <agent_name>`
- `join_council`:
  - `Welcome to this council session <agent_name>.`
  - `Session: <session_id>`
  - `We are gathered to weigh a matter set forth by <author_name>.`
  - `Request:`
  - `<request>`
  - `---`
  - `What say you, and with haste?`
- `get_current_session_data` (active session):
  - `Session: <session_id>`
  - `The council was convened by <created_by>.`
  - `Request: <request>`
  - `---`
  - `Messages (from <cursor or "start">):`
  - (blank line)
  - Response blocks:
    - `<author>`
    - `Response: <content>`
    - separated by `---`
  - `No further replies are heard for now. Return anon for more.`
  - `To hear only new replies, use the cursor: <cursor>`
- `get_current_session_data` (closed session):
  - `Session: <session_id>`
  - `The council was convened by <created_by>.`
  - `Request: <request>`
  - `---`
  - `The council is ended, spoken by <name>.`
  - `Conclusion: <conclusion>`
- `close_council`:
  - `The council is ended, and the matter is sealed.`
  - `Session: <session_id>`
- `send_response`:
  - `Your reply is set down.`
  - `Your assigned name is: <agent_name>`
  - `Session: <session_id>`

## Compatibility

This project does not maintain backwards compatibility. Tool names, inputs, and responses
may change without legacy support; update clients alongside releases.

## Validation

Manual MCP Inspector matrix (stdio + shared state):

```bash
# terminal A (create session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name start_council --tool-arg request="Need feedback from the council." \
  --transport stdio
```

```bash
# terminal A (create session B)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name start_council --tool-arg request="Need second council thread." \
  --transport stdio
```

Capture `session_id` values from both start responses and use them below.

```bash
# terminal B (join explicit target A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name join_council --tool-arg session_id=<session_a_id> --transport stdio
```

```bash
# terminal B (poll session A boundary)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data --tool-arg session_id=<session_a_id> --tool-arg cursor=<response_id> \
  --transport stdio
```

```bash
# terminal C (send to session B)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name send_response --tool-arg session_id=<session_b_id> --tool-arg content="Looks good." --transport stdio
```

```bash
# terminal A (close session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name close_council --tool-arg session_id=<session_a_id> --tool-arg conclusion="Consensus reached." --transport stdio
```

```bash
# terminal B (read closed session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data --tool-arg session_id=<session_a_id> --transport stdio
```

```bash
# terminal B (closed-session mutation rejection)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name send_response --tool-arg session_id=<session_a_id> --tool-arg content="Late reply" \
  --transport stdio
```

```bash
# terminal B (missing session_id validation)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data \
  --transport stdio
```

```bash
# terminal B (invalid session_id validation)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name join_council --tool-arg session_id=missing-session \
  --transport stdio
```

If you want to validate the lockfile behavior, run the terminal B/C commands in parallel and
confirm `~/.agents-council/state.json` stays valid JSON and `state.json.lock` is cleaned up.

MCP Inspector UI smoke test:

```bash
npx -y @modelcontextprotocol/inspector --transport stdio -- ./dist/council mcp
```

1. Open the UI URL printed by the Inspector.
2. Connect (stdio), click "List Tools", then run `start_council` with any inputs (include `agent_name` unless you started the server with `--agent-name/-n`).

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

Summon settings are stored alongside state at:

```
~/.agents-council/config.json
```

The config persists the last used agent plus model selections.

Override with:

```
AGENTS_COUNCIL_STATE_PATH=/path/to/state.json
```

The config path uses the same directory as the resolved state path.

Summon prerequisites:

- Claude: install Claude Code and run `claude` once to authenticate.
- Codex: run `codex login` once (recommended; authentication is handled by the Codex SDK/CLI); optionally set a default model in `~/.codex/config.toml`. If your Codex setup uses API keys, it will still work.

Codex CLI path (optional):

- Set the Codex CLI path in the Settings UI to use a custom executable.
- Or set `CODEX_PATH` to override the bundled Codex CLI path.

Enable summon debug logging (writes `summon-debug.log` in the current working directory):

```
AGENTS_COUNCIL_SUMMON_DEBUG=1
```

## SDK Requirement

The MCP adapter uses the TypeScript SDK v1.x (`@modelcontextprotocol/sdk`).
