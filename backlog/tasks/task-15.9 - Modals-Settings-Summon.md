---
id: task-15.9
title: 'Modals (Settings, Summon)'
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:20'
labels: []
dependencies:
  - task-15.8
parent_task_id: task-15
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign modal dialogs with ornate frames, decorative headers with centered title, and styled form elements.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Modal uses ornate frame with gold border and glow
- [x] #2 Header is centered with display font and glow effect
- [x] #3 Header has gradient background
- [x] #4 Form inputs match overall aesthetic
- [x] #5 Action buttons use appropriate button styles
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Goal
Redesign modal dialogs (Settings popup, Summon modal) with ornate frames matching the game UI aesthetic.

### Analysis
Current modal classes identified:
- `.settings-backdrop`, `.settings-popup`, `.settings-header`, `.settings-close`, `.settings-form`, `.settings-actions`
- `.dialog-backdrop`, `.dialog-panel`, `.dialog-header`, `.dialog-close`, `.dialog-form`, `.dialog-actions`

Both modals need similar styling - we can create a unified `.modal-*` base class system.

### CSS Changes Required

1. **Unified Modal Panel Base** (`.modal-panel`)
   - 2px gold border
   - Outer glow via box-shadow (0 0 20px gold-glow)
   - Background gradient matching spec (160deg, ash to ink)

2. **Modal Header** (`.modal-header`)
   - Centered title with display font
   - Text glow effect (text-shadow)
   - Gradient background (linear-gradient from gold-10% to transparent)
   - Border below header (1px solid gold)

3. **Form Inputs** - Already have gold border styling, need to verify focus glow

4. **Action Buttons** - Update to use `.btn-game` for primary and `.btn-ghost` for cancel

5. **Close Button** - Add ornate styling with gold color and hover glow

### Files to Modify
- `/src/interfaces/chat/ui/styles.css` - Update modal CSS classes
- `/src/interfaces/chat/ui/pages/Hall.tsx` - Update button classes in modals
- `/src/interfaces/chat/ui/components/Settings.tsx` - Update button classes

### Approach
- Update existing `.settings-*` and `.dialog-*` classes to share common ornate styling
- Create new `.modal-panel` class as shared base (or update existing classes directly)
- Keep backward compatibility with existing class names
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### CSS Changes (`styles.css`)

1. **Modal Panel (`.dialog-panel`, `.settings-popup`)**:
   - 2px solid gold border
   - Outer glow via box-shadow (0 0 20px gold-glow)
   - Background gradient (160deg, rgba(43,35,28,0.98) to rgba(18,13,10,0.99))
   - Unified styling for both modal types

2. **Modal Header (`.dialog-header`, `.settings-header`)**:
   - Centered title with justify-content: center
   - Display font (Cinzel) with 18px size, 3px letter-spacing, uppercase
   - Gold-bright color with text-shadow glow (0 0 20px gold-glow)
   - Gradient background (linear-gradient from 12% gold opacity to transparent)
   - 1px solid gold border below header

3. **Form Inputs** (`.dialog-form .input/textarea/select`, `.settings-form .input/textarea/select`):
   - 1px solid gold border
   - Dark background (rgba(14, 10, 8, 0.85))
   - Focus state with gold-bright border and glow (0 0 15px gold-glow)
   - Label styling with gold color, display font, 13px size

4. **Close Button** (`.dialog-close`, `.settings-close`):
   - Positioned absolutely on right side of header
   - Gold color with transparent border
   - Hover state with gold-bright color, border, and glow

5. **Action Buttons**:
   - Updated Hall.tsx and Settings.tsx to use `.btn-game` for primary actions
   - Updated to use `.btn-ghost` for cancel buttons (removed `.btn` prefix)

### Files Modified
- `/src/interfaces/chat/ui/styles.css` - Updated modal CSS (~100 lines rewritten)
- `/src/interfaces/chat/ui/pages/Hall.tsx` - Updated button classes in 2 modals
- `/src/interfaces/chat/ui/components/Settings.tsx` - Updated button classes

### Verification
- `bun run typecheck` passes
- `bun run lint` reports only pre-existing issues (not related to this task)
<!-- SECTION:NOTES:END -->
