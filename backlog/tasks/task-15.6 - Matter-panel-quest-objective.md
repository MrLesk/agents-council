---
id: task-15.6
title: Matter panel (quest objective)
status: Done
assignee:
  - claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:13'
labels: []
dependencies:
  - task-15.4
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign the Matter panel as a central quest objective with ornate framing, inner scroll card for request text, agent badge for requester, and action buttons at bottom. Remove the awkward two-column layout.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Panel uses primary frame styling with decorative corners
- [x] #2 Panel title has decorative dividers or flourishes
- [x] #3 Request text is inside an inner scroll/card element
- [x] #4 Requester shown with agent badge (sigil + name)
- [x] #5 Action buttons (Summon, Seal) are prominent at bottom
- [x] #6 Single-column layout replaces two-column
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Goal
Redesign the Matter panel as a central "quest objective" with ornate framing, following the UI spec.

### Changes Required

1. **Hall.tsx - Matter Panel Structure**
   - Apply `.panel-primary` class to the matter-panel section
   - Add `.panel-primary-corners` element for all 4 corner accents
   - Add `.panel-primary-inner` element for inner glow
   - Add decorative title with flourishes (e.g., `◆ THE MATTER BEFORE THE COUNCIL ◆`)
   - Convert request card to use `.panel-secondary` for inner scroll/card styling
   - Use `AgentBadge` component for requester display (already exists)
   - Move action buttons (Summon Claude, Seal Matter) to the bottom as prominent `.btn-game` buttons
   - Remove two-column grid layout (`.matter-grid`), use single-column flow

2. **styles.css - Additional Styling**
   - Add `.panel-title-decorated` class for title with flourishes
   - Add `.matter-actions-footer` for bottom button row
   - Remove or simplify `.matter-grid` since we're going single-column
   - Style adjustments for the inner scroll card

### Files to Modify
- `src/interfaces/chat/ui/pages/Hall.tsx`
- `src/interfaces/chat/ui/styles.css`

### Acceptance Criteria Mapping
- AC#1: Apply `.panel-primary` class + corner elements
- AC#2: Add decorated title with `◆` flourishes
- AC#3: Request text in inner `.panel-secondary` card
- AC#4: Use `AgentBadge` for requester (already in place)
- AC#5: Action buttons at bottom with `.btn-game` style
- AC#6: Single-column layout replacing two-column grid
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**Hall.tsx:**
- Converted `.panel matter-panel` to `.panel-primary matter-panel` with corner elements
- Added `.panel-primary-inner` for inner glow effect
- Added `.panel-primary-corners` for all 4 decorative corners
- Added `.panel-title-decorated` with `◆` flourishes around the title
- Converted request card to use `.panel-secondary request-scroll-card` for inner scroll styling
- Requester now displays with `AgentBadge` component (sigil + name) and timestamp
- Added `.matter-actions-footer` with prominent `.btn-game` buttons at bottom
- Removed two-column `.matter-grid` layout, now single-column flow
- Added `.matter-seal-input` area for conclusion text (separate from buttons)
- Added `.btn-game-seal` variant with crimson styling for the seal button

**styles.css:**
- Added `.panel-title-decorated` and `.title-flourish` for decorative titles
- Added `.matter-content` for single-column flow
- Added `.matter-empty` for centered empty state
- Added `.request-scroll-card` styling for inner card
- Added `.matter-requester` for badge + timestamp row
- Added `.matter-actions-footer` for bottom button row
- Added `.btn-game-seal` crimson button variant
- Added `.matter-seal-input` styled input area
- Removed unused `.matter-header-actions` class
- Removed unused responsive media query rules for `.matter-grid` and `.matter-actions`

### Verification
- `bun run typecheck` passes
- `bun run lint` has pre-existing issues unrelated to this task
<!-- SECTION:NOTES:END -->
