# Development

## Prerequisites

- Bun (latest recommended)

## Install

```bash
bun install
```

## Build

```bash
bun run build
```

The compiled binary is written to `dist/council`.

## Run locally

```bash
./dist/council mcp
```

Optional default agent name:

```bash
./dist/council mcp --agent-name "Arden"
```

## Quality checks

```bash
bun run lint
bun run format
bun run format:check
bun run typecheck
```

## Pre-commit hooks

Husky hooks are installed during `bun install`.

## Notes

- State is stored at `~/.agents-council/state.json` by default.
- Override with `AGENTS_COUNCIL_STATE_PATH=/path/to/state.json`.
