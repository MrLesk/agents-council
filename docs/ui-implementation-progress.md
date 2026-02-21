# Council Hall Redesign Parity Tracker

## Scope

This tracker measures parity between the canonical redesign in `Design Council Hall Interface` and the production UI in `src/interfaces/chat/ui`.

Use this file to decide where new UI features should be implemented and what must be aligned first.

## Canonical Baseline

- Canonical spec: `docs/ui-spec.md`
- Canonical design source: `Design Council Hall Interface`

## Status Legend

- `Aligned`: production behavior matches canonical redesign.
- `Partial`: implemented, but structure or behavior diverges.
- `Missing`: not implemented in production UI.

## Parity Matrix

| Area | Canonical Behavior | Production Status | Notes |
|------|--------------------|-------------------|-------|
| App shell | Two-pane layout with persistent session sidebar + hall | Aligned | Desktop renderer now uses canonical sidebar + hall split (`CouncilSidebar` + `CouncilHall`). |
| Session navigation | Sidebar session list, active marker, archive section | Aligned | Session chronicle is sourced from real multi-session bridge APIs with active/archived grouping. |
| Session creation CTA | `Spawn Session` from sidebar | Aligned | Sidebar `Spawn Session` opens council-start modal and creates/selects live sessions. |
| Hall header | Session title + live status + avatar stack + summon CTA | Aligned | Hall header now renders session title/state, participant stack, and summon CTA in canonical structure. |
| Message rendering | Bubble-style per-agent cards (`MessageBubble`) with text/code/system modes | Aligned | Message stream uses canonical bubble contract with per-agent styling and system notices. |
| Composer behavior | Enter to send, Shift+Enter newline, footer hint | Aligned | Composer supports Enter send + Shift+Enter newline with explicit footer hint. |
| Summon modal UX | Header summon entry, selectable agent list modal | Aligned | Summon modal remains fully wired to agent/model/reasoning controls and version visibility. |
| Visual token system | Agency palette, typography (`Cinzel` + `Lato`), stone/amber theme | Aligned | Production theme now uses canonical font pair and stone/amber visual language for shell and panels. |
| Motion/feedback | `motion/react` transitions, typing pulse, toast feedback | Partial | Interaction feedback is present (pending/system updates), but motion-specific parity remains intentionally restrained in runtime implementation. |

## Immediate Alignment Priorities

1. Keep bridge/API compatibility stable while TASK-26.7 finalizes packaging/release automation for desktop artifacts.
2. Expand optional motion polish only if runtime performance/packaging constraints remain unaffected.

## Change Control

Before shipping UI feature work:

1. Update this matrix row status for touched areas.
2. Confirm the feature uses canonical component boundaries from `docs/ui-spec.md`.
3. If canonical behavior changes, update `docs/ui-spec.md` first, then this tracker.
