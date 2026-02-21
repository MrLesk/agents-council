# Council Hall UI Canon

## Purpose

This document is the authoritative UI specification for Agents Council.

All new UI work must align with the redesign delivered in `Design Council Hall Interface`.
If implementation and this spec diverge, update implementation to match this spec.

## Canonical Sources

- Figma source: https://www.figma.com/design/ARa5aADoMQrMP4bPhEXDrE/Design-Council-Hall-Interface
- Local agency bundle: `Design Council Hall Interface`
- Canonical component files:
  - `Design Council Hall Interface/src/app/components/CouncilSidebar.tsx`
  - `Design Council Hall Interface/src/app/components/CouncilHall.tsx`
  - `Design Council Hall Interface/src/app/components/MessageBubble.tsx`
- Canonical style files:
  - `Design Council Hall Interface/src/styles/custom.css`
  - `Design Council Hall Interface/src/styles/fonts.css`
  - `Design Council Hall Interface/src/styles/theme.css`

## Information Architecture

The UI shell is a two-pane desktop layout:

1. Left sidebar (`CouncilSidebar`): session lifecycle and navigation.
2. Main hall (`CouncilHall`): active session title, participant presence, message stream, composer, summon modal.

### Sidebar Structure

- Product header (`Agents Council`, subtitle, emblem)
- Primary action: `Spawn Session`
- Session list grouped under `Active Chronicles`
- Archive placeholder section under `Archives`
- Footer identity row (`Human Operative`)

### Main Hall Structure

- Header with session title and `Council In Session` indicator
- Active agent avatar stack
- `Summon Agent` CTA in header
- Scrollable proceeding log
- Composer area with multiline input and send button
- Summon modal overlay for adding agent personas

## Design Tokens and Visual Language

### Core Palette (canonical)

- Base surfaces: dark stone/stygian neutrals (`stone-950`, `stone-900`, etc.)
- Primary accent: amber/gold for actions and highlights
- Secondary accent: indigo for summon CTA
- Agent accents:
  - Claude: amber family
  - Codex: blue family
  - Human: emerald family
  - System: neutral stone palette

Use color hierarchy from agency classes and avoid introducing alternate accent systems.

### Typography

- Display/fantasy heading font: `Cinzel` (`.font-cinzel`)
- Body/UI font: `Lato` (`.font-sans`)

Typography rules:

- Session/product titles use display font.
- Body content, chat text, and controls use sans font.
- Metadata remains compact, low-emphasis, and high-contrast against dark backgrounds.

### Surfaces and Depth

- Layered dark backgrounds with low-opacity texture overlays.
- Subtle blur/backdrop effects in headers and overlays.
- Rounded corners, soft borders, and glow-based emphasis for active states.

## Component Contracts

## `CouncilSidebar`

Responsibilities:

- Render all sessions and active session selection state.
- Provide session creation entry (`onNewSession`).
- Provide session switching (`onSelectSession`).

Interaction and styling contract:

- Fixed visual width on desktop (`w-80`).
- Active session row has distinct border/background and right-edge active indicator.
- Session metadata includes date and agent count.

## `CouncilHall`

Responsibilities:

- Render active session context.
- Render chronological message log.
- Capture user input and send messages.
- Open/close summon modal and invoke summon action.

Interaction contract:

- Auto-scroll log to bottom on new messages and typing changes.
- Enter sends message, Shift+Enter inserts newline.
- Summon modal closes on summon or explicit close action.

## `MessageBubble`

Message types:

- `text`: plain multiline content
- `code`: styled code block treatment with monospaced container
- `system`: centered low-emphasis system notices

Agent treatment:

- Human messages right-aligned.
- Non-human messages left-aligned.
- Avatar ring, type icon, and badge color depend on agent type.

## Interaction Flows

### Session Lifecycle

1. User spawns session from sidebar.
2. Session appears in `Active Chronicles` and becomes selected.
3. Hall updates to selected session context.

### Council Messaging

1. User submits via composer.
2. Message appears immediately in stream.
3. Assistant typing state appears while waiting for response.
4. Agent response is appended to stream.

### Summon Agent

1. User clicks `Summon Agent`.
2. Modal lists summonable agents.
3. Selecting an agent appends system notice and adds agent to session roster.
4. Duplicate summon attempts are blocked with error feedback.

## Motion and Feedback

- Entry and state transitions use restrained motion (`motion/react`).
- Typing feedback is animated with dot pulses.
- Hover/focus states are visible on all actionable controls.
- Toasts are used for summon success/failure feedback.

## Responsiveness

Required behavior:

- Desktop-first layout with fixed sidebar and flexible main hall.
- Main hall must preserve readability at reduced widths.
- Scroll regions must remain keyboard and pointer accessible.

Any mobile-specific adaptation must preserve the same IA and interaction semantics.

## Accessibility Requirements

- Maintain readable contrast on dark surfaces.
- Preserve focus visibility on buttons, inputs, and selectable session rows.
- Do not encode meaning by color alone; keep iconography/labels for status.
- Maintain keyboard operability for sending, modal control, and session switching.

## Implementation Consistency Rules

- New UI features must extend canonical components instead of introducing parallel patterns.
- New controls must follow existing button/input visual language.
- New session or message states must map into existing message/session structures before adding new primitives.
- Do not reintroduce alternate layout systems that conflict with the two-pane sidebar+hall architecture.
