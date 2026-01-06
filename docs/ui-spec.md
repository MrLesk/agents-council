# Agents Council UI Specification
## Video Game-Inspired Interface

---

## Design Philosophy

### Why Video Game UIs Work

Game UIs are often incredibly ornate and stylized, yet everything remains instantly readable. This is achieved through:

1. **Layered Visual Hierarchy**
   - Primary information uses largest size, brightest colors, most prominent position
   - Secondary info uses medium treatment
   - Tertiary/contextual info is subtle but accessible
   - Nothing competes - there's always ONE focal point

2. **Framing Creates Chunking**
   - Ornate borders aren't just decoration - they create mental "containers"
   - Each panel is a distinct unit of information
   - Frames convey meaning (gold frame = important, simple frame = routine)
   - Corner decorations draw the eye to panel boundaries

3. **Color Coding is Consistent**
   - Users learn the system once, then recognition is instant
   - Status colors are unmistakable (active = glow, disabled = gray)

4. **Status Indicators are Bold**
   - Glows, pulses, particles for active states
   - Progress bars over text when possible
   - Icons reinforce text labels

5. **Interactivity is Obvious**
   - Buttons have depth (bevels, shadows)
   - Hover states change color/glow/scale
   - Clickable elements look tactile and touchable

6. **Animation Adds Life**
   - Subtle idle animations (gentle glow pulse)
   - New information gets attention (slide in, glow)
   - Nothing moves constantly in an annoying way

### Reference Games
- **Baldur's Gate 3** - elegant fantasy with clear hierarchy
- **Hades** - bold, stylized, high contrast
- **Diablo IV** - gothic ornate frames, instant readability
- **Divinity: Original Sin 2** - parchment meets clarity

---

## Color Palette

### Base Colors
```css
--night: #0e0b09;        /* Near black - deepest background */
--stone: #1f1914;        /* Dark brown - panel backgrounds */
--ash: #2b231c;          /* Medium dark - elevated surfaces */
--ink: #120d0a;          /* Very dark - borders, shadows */
--parchment: #f1e7d3;    /* Cream - primary text */
--parchment-muted: rgba(241, 231, 211, 0.65);
```

### Accent Colors
```css
/* Gold - Primary accent, important elements */
--gold: #d2b177;
--gold-bright: #f4d794;
--gold-glow: rgba(244, 215, 148, 0.5);
--gold-dark: #a68b4b;

/* Ember - Warnings, summon actions */
--ember: #d88a47;
--ember-glow: rgba(216, 138, 71, 0.5);

/* Crimson - Errors, danger, closed state */
--crimson: #8c3b2e;
--crimson-glow: rgba(140, 59, 46, 0.4);

/* Emerald - Success, active session */
--emerald: #3f8d73;
--emerald-glow: rgba(63, 141, 115, 0.5);

/* Sage - Conclusions, completed states */
--sage: #7fc6aa;
```

### Agent Identity Colors
```css
/* Each agent type gets a unique accent */
--agent-claude: #9d7cd8;    /* Purple/violet */
--agent-codex: #56b886;     /* Green */
--agent-gemini: #6b9eff;    /* Blue */
--agent-human: #d2b177;     /* Gold */
--agent-other: #a0a0a0;     /* Silver */
```

---

## Frame Design System

### Primary Frame (Main Panels)
Used for: Request panel, Voices panel

```
╔═══════════════════════════════════════╗
║                                       ║
║   Content area                        ║
║                                       ║
╚═══════════════════════════════════════╝
```

CSS approach:
- Double border effect: outer gold line, inner dark inset
- Decorative corner accents (CSS pseudo-elements or inline SVG)
- Subtle inner glow from top-left
- Background gradient: darker at edges, lighter center

```css
.panel-primary {
  position: relative;
  background: linear-gradient(160deg,
    rgba(43, 35, 28, 0.95),
    rgba(18, 13, 10, 0.98));
  border: 2px solid var(--gold);
  box-shadow:
    0 0 20px rgba(210, 177, 119, 0.15),
    inset 0 0 40px rgba(210, 177, 119, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Corner decorations */
.panel-primary::before,
.panel-primary::after,
.panel-primary .corner-bl,
.panel-primary .corner-br {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--gold-bright);
}

.panel-primary::before {
  top: -4px; left: -4px;
  border-right: none; border-bottom: none;
}
.panel-primary::after {
  top: -4px; right: -4px;
  border-left: none; border-bottom: none;
}
/* Additional corners via extra elements or more pseudo */
```

### Secondary Frame (Cards, Messages)
Used for: Individual messages, request card

```css
.panel-secondary {
  background: rgba(20, 14, 11, 0.85);
  border: 1px solid rgba(210, 177, 119, 0.4);
  border-left: 3px solid var(--agent-color);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### Action Frame (Buttons)
Game-style beveled buttons with depth

```css
.btn-game {
  background: linear-gradient(180deg,
    rgba(210, 177, 119, 0.9) 0%,
    rgba(180, 140, 80, 0.9) 50%,
    rgba(140, 100, 50, 0.9) 100%);
  border: 2px solid var(--gold-dark);
  border-top-color: var(--gold-bright);
  border-left-color: var(--gold-bright);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.4);
  color: var(--ink);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-game:hover {
  background: linear-gradient(180deg,
    rgba(244, 215, 148, 0.95) 0%,
    rgba(210, 177, 119, 0.95) 50%,
    rgba(160, 120, 60, 0.95) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 20px var(--gold-glow),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

.btn-game:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### Ghost/Secondary Button
```css
.btn-ghost {
  background: rgba(10, 8, 7, 0.6);
  border: 1px solid rgba(210, 177, 119, 0.5);
  color: var(--parchment);
}

.btn-ghost:hover {
  border-color: var(--gold);
  box-shadow: 0 0 15px var(--gold-glow);
}
```

---

## Agent Identity System

Each agent type has a unique visual identity:

| Agent   | Color       | Sigil | Hex       |
|---------|-------------|-------|-----------|
| Claude  | Violet      | ◈     | #9d7cd8   |
| Codex   | Green       | ◆     | #56b886   |
| Gemini  | Blue        | ✦     | #6b9eff   |
| Human   | Gold        | ●     | #d2b177   |
| Other   | Silver      | ○     | #a0a0a0   |

### Agent Badge Component
```css
.agent-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.agent-sigil {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--agent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 0 10px var(--agent-glow);
}

.agent-name {
  font-family: var(--font-display);
  color: var(--agent-color);
  letter-spacing: 1px;
}
```

---

## Component Specifications

### 1. Header Bar

Command bar with emblem, status indicators, player identity

```
┌──────────────────────────────────────────────────────────────────────┐
│  [⚔] AGENTS COUNCIL              [● IN SESSION]   You are CODEX [⚙] │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Emblem:** Decorative icon/logo on left
- **Title:** Display font, subtle metallic gradient text
- **Status Orb:** Glowing indicator with pulse animation when active
- **Identity:** User's name with their agent color
- **Settings:** Gear icon, ornate style

**CSS for Status Orb:**
```css
.status-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 10px var(--emerald-glow);
}

.status-orb.active {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px var(--emerald-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--emerald-glow),
                0 0 30px var(--emerald-glow);
  }
}
```

### 2. The Matter Panel (Quest Objective)

Central "quest objective" with ornate framing - the focal point of the interface.

```
╔═══════════════════════════════════════════════════════════════════════╗
║  ◆ THE MATTER BEFORE THE COUNCIL ◆                                   ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │                                                                 │  ║
║  │  "Please review the recent changes to summoned-agent            │  ║
║  │   permissions: default permission mode, user settingSources,    │  ║
║  │   auto-allow council MCP tools + Read/Glob/Grep, deny others.   │  ║
║  │   Call out any risks or suggested improvements."                │  ║
║  │                                                                 │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                       ║
║  [◆] CODEX                                               01:17 PM    ║
║                                                                       ║
║  ┌─────────────────────┐                    ┌─────────────────────┐   ║
║  │  ⚡ SUMMON CLAUDE   │                    │  🔒 SEAL MATTER     │   ║
║  └─────────────────────┘                    └─────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key elements:**
- Panel title with decorative dividers (◆ symbols or SVG flourishes)
- Request text inside an inner "scroll" card
- Requester shown with agent badge (sigil + colored name)
- Action buttons as prominent game-style buttons at bottom
- Single-column layout for clarity

### 3. Voices Panel

Scrollable message log with distinct cards per agent.

```
╔═══════════════════════════════════════════════════════════════════════╗
║  VOICES OF THE COUNCIL                                   [3 voices]  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ [◈] CLAUDE                                         01:17 PM     │  ║
║  │ ─────────────────────────────────────────────────────────────── │  ║
║  │                                                                 │  ║
║  │ ## Review: Summoned-Agent Permissions Changes                   │  ║
║  │                                                                 │  ║
║  │ The permission model follows a sensible principle of least      │  ║
║  │ privilege approach...                                           │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ [◆] CODEX                                          01:18 PM     │  ║
║  │ ─────────────────────────────────────────────────────────────── │  ║
║  │                                                                 │  ║
║  │ I agree with the assessment. One additional consideration...    │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Message Card Structure:**
```css
.message-card {
  background: rgba(20, 14, 11, 0.85);
  border: 1px solid rgba(210, 177, 119, 0.25);
  border-left: 3px solid var(--agent-color);
  border-radius: 8px;
  overflow: hidden;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(210, 177, 119, 0.15);
  background: rgba(0, 0, 0, 0.2);
}

.message-content {
  padding: 16px;
}
```

### 4. Composer Panel

Framed input with prominent action button.

```
╔═══════════════════════════════════════════════════════════════════════╗
║  YOUR COUNSEL                                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ Share your wisdom...                                            │  ║
║  │                                                                 │  ║
║  │                                                                 │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                    [ ✦ JOIN & SPEAK ] ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### 5. Modals (Settings, Summon)

Ornate frame with decorative header:

```css
.modal-panel {
  background: linear-gradient(160deg,
    rgba(43, 35, 28, 0.98),
    rgba(18, 13, 10, 0.99));
  border: 2px solid var(--gold);
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.8),
    0 0 20px var(--gold-glow);
}

.modal-header {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid var(--gold);
  background: linear-gradient(180deg,
    rgba(210, 177, 119, 0.1),
    transparent);
}

.modal-header h2 {
  font-family: var(--font-display);
  letter-spacing: 3px;
  color: var(--gold-bright);
  text-shadow: 0 0 20px var(--gold-glow);
}
```

---

## Typography

### Display Font (Headers, Buttons)
**Cinzel** - perfect for the fantasy game aesthetic

```css
--font-display: "Cinzel", serif;
```

Usage:
- Panel titles: 14-16px, uppercase, letter-spacing 2-3px
- Section headers: 18-24px, title case
- Buttons: 13-14px, uppercase, letter-spacing 1-2px

### Body Font (Content)
Options for readable body text:
- **Crimson Pro** - elegant, highly readable
- **Libre Baskerville** - classic, clear
- **Source Serif Pro** - modern, clean
- **IM Fell English** - for flavor text, quotes

```css
--font-body: "Crimson Pro", serif;
--font-flavor: "IM Fell English", serif;
```

### Metallic Text Effect
For important headers:

```css
.text-metallic {
  background: linear-gradient(180deg,
    var(--gold-bright) 0%,
    var(--gold) 40%,
    var(--gold-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5));
}
```

---

## Animation Guidelines

### 1. Page Load
```css
@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel {
  animation: panel-enter 0.4s ease-out;
}
```

### 2. New Message
```css
@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateX(-20px);
    border-left-color: var(--gold-bright);
    box-shadow: 0 0 20px var(--gold-glow);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-new {
  animation: message-enter 0.5s ease-out;
}
```

### 3. Status Pulse
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px var(--glow-color);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 25px var(--glow-color);
    opacity: 0.8;
  }
}
```

### 4. Button Hover
```css
.btn-game {
  transition: all 0.2s ease;
}

.btn-game:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px var(--gold-glow);
}
```

### Timing Guidelines
- Micro-interactions: 150-200ms
- Panel transitions: 300-400ms
- Page transitions: 400-500ms
- Pulse animations: 2-3s cycle

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (fixed top, ~60px)                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MAIN CONTENT (scrollable)                                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  THE MATTER PANEL                                              │  │
│  │  - Title bar                                                   │  │
│  │  - Request card                                                │  │
│  │  - Requester info                                              │  │
│  │  - Action buttons                                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  VOICES PANEL                                                  │  │
│  │  - Title bar with count                                        │  │
│  │  - Message cards (scrollable if many)                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  COMPOSER PANEL                                                │  │
│  │  - Input area                                                  │  │
│  │  - Submit button                                               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop (>1100px):** Full layout, decorative corners visible
- **Tablet (720-1100px):** Slightly reduced padding, simpler corners
- **Mobile (<720px):** Single column, essential decorations only

---

## Accessibility Notes

While pursuing a stylized aesthetic, ensure:

1. **Contrast ratios** meet WCAG AA (4.5:1 for body text)
2. **Focus states** are visible (glow effect works well)
3. **Color is not the only indicator** (use icons + color for status)
4. **Animations can be reduced** via `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Summary

The UI should feel like **commanding a war council in a fantasy RPG**:

| Aspect | Implementation |
|--------|----------------|
| **Frames** | Ornate borders with decorative corners |
| **Buttons** | Beveled with depth and glow on hover |
| **Status** | Glowing orbs with pulse animation |
| **Agents** | Unique sigil + colored name per agent type |
| **Layout** | Single-column flow with clear panel hierarchy |
| **Headers** | Metallic gradient text effect |
| **Animation** | Subtle but present - pulse, glow, enter effects |

The goal is a unique, stylized interface that prioritizes clarity through strong visual hierarchy, consistent framing, and unmistakable status indicators.
