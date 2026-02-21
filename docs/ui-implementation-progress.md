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
| App shell | Two-pane layout with persistent session sidebar + hall | Missing | Current production UI is single-column hall without canonical sidebar. |
| Session navigation | Sidebar session list, active marker, archive section | Missing | Requires session list model and sidebar rendering. |
| Session creation CTA | `Spawn Session` from sidebar | Missing | Production starts from gate + active session flow. |
| Hall header | Session title + live status + avatar stack + summon CTA | Partial | Header exists, but does not use canonical avatar-stack/session title pattern. |
| Message rendering | Bubble-style per-agent cards (`MessageBubble`) with text/code/system modes | Partial | Production uses markdown cards and pending placeholders; canonical bubble contract differs. |
| Composer behavior | Enter to send, Shift+Enter newline, footer hint | Partial | Enter/Shift+Enter behavior and compact composer style not fully mirrored. |
| Summon modal UX | Header summon entry, selectable agent list modal | Partial | Summon modal exists but model/agent settings UX differs from canonical agency interaction. |
| Visual token system | Agency palette, typography (`Cinzel` + `Lato`), stone/amber theme | Partial | Production uses redesign-themed tokens but not the exact canonical token system. |
| Motion/feedback | `motion/react` transitions, typing pulse, toast feedback | Partial | Production has animations and feedback, but not fully aligned to canonical motion contracts. |

## Immediate Alignment Priorities

1. Implement canonical shell architecture (sidebar + hall split) before adding major UI features.
2. Normalize message rendering contract to canonical message modes (`text`, `code`, `system`).
3. Align summon UX flow and entry points with canonical modal model.
4. Align typography and component-level token usage to canonical sources.

## Change Control

Before shipping UI feature work:

1. Update this matrix row status for touched areas.
2. Confirm the feature uses canonical component boundaries from `docs/ui-spec.md`.
3. If canonical behavior changes, update `docs/ui-spec.md` first, then this tracker.
