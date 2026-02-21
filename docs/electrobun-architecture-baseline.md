# Electrobun Architecture Baseline (TASK-26.1)

Status: Approved baseline for implementation handoff  
Owner: TASK-26.1  
Date: 2026-02-21

## 1. Purpose and Scope

This document is the architecture decision record for the Electrobun pivot baseline. It locks runtime boundaries and compatibility decisions required before implementation tasks (`TASK-26.2` through `TASK-26.7`).

In scope:
- Runtime mode boundaries (Desktop, CLI, MCP).
- Process boundaries across Bun/Electrobun runtime surfaces.
- Platform constraints for macOS, Windows, Linux.
- Known design-bundle compatibility blockers and explicit remediation decisions.
- Approved downstream execution sequence and dependency gates.

Out of scope:
- Implementing entrypoints, state migrations, bridge APIs, or UI rewrites.
- CI/release artifact migration implementation.

## 2. Runtime Modes and Process Boundaries

### 2.1 Runtime Modes (Locked)

1. Desktop mode
- Trigger: direct app launch with no CLI command intent.
- Result: desktop Council interface opens by default.
- Primary surface: Electrobun window/view runtime.

2. CLI mode
- Trigger: terminal invocation with command intent (`--help`, `--version`, `chat`, unknown command handling).
- Result: command parser executes CLI behavior and exits with deterministic status.
- Primary surface: Bun CLI command path.

3. MCP mode
- Trigger: terminal invocation `council mcp`.
- Result: stdio MCP server starts and runs until terminated.
- Primary surface: MCP adapter + shared core service/state.

### 2.2 Process Boundary Model (Locked)

1. Launcher/runtime boundary
- Electrobun launcher starts the Bun runtime context.
- Runtime mode selection happens before behavior dispatch.

2. Core-domain boundary
- `src/core/**` remains the single source for council domain/state semantics.
- Desktop, CLI, and MCP paths consume the same core service/state layer.

3. Desktop bridge boundary
- Desktop renderer must communicate through a dedicated bridge (TASK-26.5 target).
- Bun.serve HTTP/WebSocket transport is not part of the target primary desktop path.

4. MCP boundary
- MCP remains terminal-oriented stdio behavior.
- Contract evolution for multi-session targeting is owned by TASK-26.4 after TASK-26.3.

## 3. Platform Lifecycle Boundaries (macOS / Windows / Linux)

| Platform | Desktop Startup | CLI/MCP Startup | Shutdown Boundary | Baseline Constraint |
|---|---|---|---|---|
| macOS | Direct launch opens desktop UI | Terminal invocation runs CLI/MCP path | App/window lifecycle + explicit process exits for CLI/MCP | Native renderer default acceptable |
| Windows | Direct launch opens desktop UI (GUI subsystem behavior) | Terminal invocation must preserve CLI/MCP behavior | Deterministic CLI/MCP exit codes, desktop quit lifecycle | Console attachment policy is required (see section 5) |
| Linux | Direct launch opens desktop UI | Terminal invocation runs CLI/MCP path | Deterministic CLI/MCP exit codes, desktop quit lifecycle | Bundle CEF by default for production reliability |

Renderer baseline:
- macOS: default `native`.
- Windows: default `native`.
- Linux: default bundled `cef` for distribution reliability.

## 4. Design-Bundle Compatibility Inventory and Decisions

Incoming bundle source: `Design Council Hall Interface`.

| Compatibility Issue | Impact | Decision (Locked) | Downstream Owner |
|---|---|---|---|
| `figma:asset/*` imports in canonical components | Non-standard import path will fail in production runtime/bundling | Replace with repository-managed/static asset paths during integration | TASK-26.6 |
| Mock data and synthetic async behavior (`setTimeout`) in bundle app | Diverges from real council/session workflow and can mask runtime bugs | Remove mock flows; wire to real session/service data only | TASK-26.6 (depends on TASK-26.3 + TASK-26.5) |
| Bundle dependency graph is template-heavy (Vite + broad UI stack) | Unnecessary dependency sprawl and higher integration risk | Reduce to required production subset and align with repo runtime/toolchain constraints | TASK-26.6 |
| Remote font import assumptions (`fonts.googleapis.com`) | Non-deterministic desktop rendering/offline risk | Define deterministic desktop-safe font strategy during adoption (local or explicitly accepted remote policy) | TASK-26.6 |
| Current production UI transport is Bun.serve HTTP + WebSocket | Conflicts with target desktop-first runtime architecture | Replace primary UI transport with desktop bridge APIs and state notifications | TASK-26.5 |
| Existing UI currently single-hall oriented while pivot requires multi-session | UI behavior mismatch with parent scope and MCP evolution | UI session navigation and selection must align to post-TASK-26.3 session model | TASK-26.6 (depends on TASK-26.3) |

No open compatibility decisions remain at baseline level.

## 5. Mode Detection and Failure Strategy (Locked)

### 5.1 Deterministic Mode Selection

Mode selection precedence:
1. Parse argv for explicit command intent.
2. If intent is `mcp`, run MCP mode.
3. If intent is `--help`/`--version` or unknown command path, run CLI mode semantics.
4. If intent is `chat`, preserve compatibility alias but route to desktop open/focus behavior (not Bun.serve web chat startup).
5. If no command intent is present, run desktop mode by default.

### 5.2 Platform-Specific Handling

Windows:
- Stable/canary desktop launch runs as GUI subsystem and does not present console by default.
- CLI/MCP terminal behavior must remain usable and deterministic when invoked from terminal.
- Debug/diagnostic policy for production builds uses `ELECTROBUN_CONSOLE=1` when console visibility is needed.

macOS/Linux:
- Terminal invocation keeps normal stdout/stderr behavior for CLI/MCP.
- Direct launch remains desktop-first.

### 5.3 Failure and Exit Behavior

| Scenario | Required Behavior |
|---|---|
| Invalid or unknown CLI command in terminal context | Print help/usage and exit non-zero |
| MCP startup failure | Print actionable error to stderr and exit non-zero |
| Desktop launch failure (window/bridge init) | Surface actionable startup error and terminate app startup path |
| Unsupported runtime assumptions for platform target | Fail fast with explicit message rather than silent fallback |

## 6. Approved Downstream Sequence and Dependency Gates

Gate A (this task):
- Architecture baseline locked.
- Compatibility decisions locked.
- Mode detection/failure strategy locked.

Wave 1 (parallel after Gate A):
1. TASK-26.2: Electrobun scaffold + dual-mode runtime/entrypoints.
2. TASK-26.3: Core multi-session schema/service evolution.

Wave 2:
3. TASK-26.4 after TASK-26.3: MCP contract evolution for explicit session targeting.

Wave 3:
4. TASK-26.5 after TASK-26.2 + TASK-26.3: desktop bridge, summon flows, and live state updates.

Wave 4:
5. TASK-26.6 after TASK-26.5 (+ TASK-26.3 readiness): canonical UI adoption with design-bundle remediation.

Wave 5:
6. TASK-26.7 after TASK-26.2 + TASK-26.4: CI/release/npm migration for desktop + CLI artifacts.

Required handoff checkpoints:
- Runtime parity checkpoint (desktop default + terminal CLI/MCP parity).
- Session schema/migration checkpoint (pre-MCP contract update).
- MCP migration-note checkpoint.
- Bridge/live-update parity checkpoint.
- UI parity-tracker update checkpoint.
- Cross-platform packaging/install sanity checkpoint.

## 7. Risks to Track in TASK-26.2 / TASK-26.3

1. Boundary drift risk
- Runtime routing work (TASK-26.2) and bridge/session work (TASK-26.3/26.5) can overlap unless process boundaries stay strict.

2. Windows behavior risk
- GUI subsystem defaults can hide runtime diagnostics; CLI parity must be validated from actual terminal invocation paths.

3. Linux renderer reliability risk
- If CEF default is not enforced in distribution, runtime behavior may diverge across distros.

4. Sequence risk
- Starting MCP contract work before session schema stabilization increases rework probability.

## 8. Decision Summary

This baseline explicitly approves:
- Desktop-first launch semantics for no-arg invocation.
- Preserved terminal CLI/MCP behavior for explicit command intents.
- `council chat` compatibility alias mapped to desktop open/focus behavior.
- Linux production default renderer strategy using bundled CEF.
- Full compatibility-remediation ownership mapping for the incoming design bundle.
- Six-step downstream execution sequence with dependency gates and no unresolved architecture decisions.
