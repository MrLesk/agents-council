---
id: task-15.2
title: Frame design system
status: Done
assignee:
  - claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:04'
labels: []
dependencies:
  - task-15.1
parent_task_id: task-15
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the ornate frame system with primary frames (main panels), secondary frames (cards/messages), and decorative corner accents using CSS pseudo-elements.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Primary frame style with double border effect and inner glow
- [x] #2 Decorative corner accents on primary frames (all 4 corners)
- [x] #3 Secondary frame style for cards and messages
- [x] #4 Background gradients applied correctly
- [x] #5 Box shadows create depth and glow effects
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Primary Frame (`.panel-primary`)
- Double border effect: 2px solid gold border
- Background gradient: linear-gradient from ash (lighter) to ink (darker)
- Box shadows: outer glow (gold), inner glow, drop shadow for depth
- Corner accents: Use ::before and ::after for top corners, wrapper element `.panel-primary-corners` with its own pseudo-elements for bottom corners
- Each corner: 20px L-shaped accent in gold-bright

### Secondary Frame (`.panel-secondary`)
- Background: semi-transparent dark
- Border: 1px solid with reduced gold opacity
- Left border: 3px solid using CSS variable --agent-color (defaults to gold)
- Box shadow: subtle drop shadow + inner highlight
- No corner decorations (simpler style)

### Files to modify
- `src/interfaces/chat/ui/styles.css` - Add new CSS classes after existing `.panel` styles
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Added ornate frame system to `src/interfaces/chat/ui/styles.css`:

### Primary Frame (`.panel-primary`)
- **Double border effect**: 2px solid gold border with inner glow
- **Background gradient**: 160deg gradient from ash (rgba 43,35,28) to ink (rgba 18,13,10)
- **Box shadows**: Three-layer effect - outer gold glow, inner subtle glow, and deep drop shadow
- **Decorative corners**: All 4 corners with L-shaped gold-bright accents using:
  - `::before` and `::after` pseudo-elements for top-left and top-right corners
  - `.panel-primary-corners` wrapper element with its own pseudo-elements for bottom corners
- **Inner glow**: Optional `.panel-primary-inner` element for radial gradient overlay

### Secondary Frame (`.panel-secondary`)
- **Background**: Semi-transparent dark (rgba 20,14,11 at 85%)
- **Border**: 1px solid gold at 40% opacity with 3px left accent
- **Agent color support**: CSS variable `--agent-color` with class variants (`.agent-claude`, `.agent-codex`, `.agent-gemini`, `.agent-human`, `.agent-other`)
- **Shadows**: Subtle drop shadow + inner highlight line

### Usage

**Primary frame with all 4 corners:**
```html
<div class="panel-primary">
  <div class="panel-primary-corners"></div>
  <!-- content -->
</div>
```

**Secondary frame with agent color:**
```html
<div class="panel-secondary agent-claude">
  <!-- content -->
</div>
```

### Verification
- TypeScript check: Passed
- Lint: Pre-existing warnings only (not from this task)
<!-- SECTION:NOTES:END -->
