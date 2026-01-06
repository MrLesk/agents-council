---
id: task-15.3
title: Game-style buttons
status: Done
assignee: []
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:05'
labels: []
dependencies:
  - task-15.2
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement beveled game-style buttons with depth, gradient backgrounds, and glow effects on hover. Include primary action buttons and ghost/secondary button variants.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Primary buttons have beveled appearance with gradient background
- [x] #2 Border colors create 3D effect (light top/left, dark bottom/right)
- [x] #3 Hover state adds glow and slight lift
- [x] #4 Active/pressed state shows inset shadow
- [x] #5 Ghost button variant with border glow on hover
- [x] #6 Disabled state is clearly distinguishable
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Goal
Add game-style beveled buttons (`.btn-game` and `.btn-ghost`) to the existing CSS file following the UI specification.

### Steps
1. Add `.btn-game` class with:
   - Gradient background (light gold top to darker bottom)
   - Beveled border effect (light top/left, dark bottom/right)
   - Inner highlight shadow
   - Dark text color with subtle text shadow
   - Transition for animations

2. Add `.btn-game:hover` state with:
   - Brighter gradient
   - Glow effect via box-shadow
   - Slight lift (translateY -2px)

3. Add `.btn-game:active` state with:
   - Press down effect (translateY 2px)
   - Inset shadow

4. Update `.btn-ghost` class with:
   - Transparent/dark background
   - Gold border
   - Glow on hover

5. Add `.btn-ghost:hover` state with:
   - Border color change to gold
   - Glow effect

6. Add disabled states for both button types

### Files to modify
- `/Users/agavrilescu@funstage.com/projects/agents-council/src/interfaces/chat/ui/styles.css`

### Validation
- Run `bun run typecheck` and `bun run lint`
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made
Added game-style beveled buttons to `/src/interfaces/chat/ui/styles.css`:

**`.btn-game` class (lines 645-708)**
- Gradient background from light gold at top to darker at bottom
- Beveled border effect using `border-top-color` and `border-left-color` as light (gold-bright), and base border as dark (gold-dark)
- Inner highlight shadow via `inset 0 1px 0 rgba(255, 255, 255, 0.3)`
- Dark text color (ink) with subtle text shadow
- Smooth transitions for transform, box-shadow, and background

**`.btn-game:hover` state**
- Brighter gradient (gold-bright tones)
- Glow effect via `0 0 20px var(--gold-glow)`
- Slight lift with `translateY(-2px)`

**`.btn-game:active` state**
- Press down effect with `translateY(2px)`
- Inset shadow for pressed appearance

**`.btn-game:disabled` state**
- Reduced opacity (0.5)
- Muted gray gradient
- No transforms or shadows

**`.btn-ghost` class (lines 715-753)**
- Updated with full styling: transparent/dark background, gold border
- Proper typography (font-display, uppercase, letter-spacing)
- Transitions for border, box-shadow, and background

**`.btn-ghost:hover` state**
- Border color changes to gold
- Glow effect via `0 0 15px var(--gold-glow)`

**`.btn-ghost:active` state**
- Subtle press effect

**`.btn-ghost:disabled` state**
- Reduced opacity (0.4)
- Muted border and text colors

### Validation
- `bun run typecheck` passed
- `bun run lint` shows pre-existing warnings (not related to this task)
<!-- SECTION:NOTES:END -->
