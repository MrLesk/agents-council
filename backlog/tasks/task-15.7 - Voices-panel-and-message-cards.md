---
id: task-15.7
title: Voices panel and message cards
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:15'
labels: []
dependencies:
  - task-15.6
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign the Voices panel with primary frame styling and message cards that use secondary frame styling with colored left border per agent, agent badge in header, and clear content separation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Voices panel uses primary frame styling
- [x] #2 Voice count badge is visible and styled
- [x] #3 Message cards have colored left border matching agent
- [x] #4 Message header shows agent badge and timestamp
- [x] #5 Message header has subtle background differentiation
- [x] #6 Message content area has proper padding and typography
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Changes to Hall.tsx:
1. Change voices panel from `.panel.voices-panel` to `.panel-primary.voices-panel`
2. Add `.panel-primary-inner` and `.panel-primary-corners` elements for decorative corners
3. Update panel header to use decorated title styling
4. Change message wrapper from `.message` to `.message-card.panel-secondary` with agent type class
5. Restructure message header to use new `.message-card-header` with background
6. Wrap content in `.message-card-content` div

### Changes to styles.css:
1. Add `.voices-panel` specific styles (panel title alignment)
2. Update `.voices-count` badge to be more prominent with gold accent
3. Add `.message-card` class for message cards
4. Add `.message-card-header` with subtle background differentiation
5. Add `.message-card-content` for proper padding
6. Remove message divider (each card is now visually separate)

### Key CSS from UI spec for message cards:
```css
.message-card {
  background: rgba(20, 14, 11, 0.85);
  border: 1px solid rgba(210, 177, 119, 0.25);
  border-left: 3px solid var(--agent-color);
  border-radius: 8px;
  overflow: hidden;
}

.message-card-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(210, 177, 119, 0.15);
  background: rgba(0, 0, 0, 0.2);
}
```
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made:

**Hall.tsx:**
- Changed Voices panel from `.panel.voices-panel` to `.panel-primary.voices-panel` for ornate framing with decorative corners
- Added `.panel-primary-inner` and `.panel-primary-corners` elements for the gold corner accents
- Updated panel header title to use decorated style with flourishes (matching Matter panel)
- Restructured message cards to use `.panel-secondary` with dynamic `agent-{type}` class for colored left borders
- Added proper header/content structure: `.message-card-header` with agent badge and timestamp, `.message-card-content` wrapper
- Removed message dividers (cards are now visually distinct)

**styles.css:**
- Updated `.voices-count` badge: larger padding, gold color with glow effect, display font for consistency
- Added `.message-card` class with `overflow: hidden` for proper border-radius clipping
- Added `.message-card-header` with flexbox layout, subtle dark background (`rgba(0,0,0,0.2)`), and bottom border
- Added `.message-card-content` with proper 16px padding

### How it works:
- Voices panel now uses the same primary frame styling as the Matter panel (gold border, decorative corners, inner glow)
- Each message card uses `.panel-secondary` which provides the colored left border via CSS variable `--agent-color`
- Agent type classes (`.agent-claude`, `.agent-codex`, etc.) set the `--agent-color` variable per the existing system
- Message headers have a subtle background differentiation to visually separate header from content

### Verification:
- `bun run typecheck` passes
- `bun run lint` shows only pre-existing warnings (not introduced by this task)
<!-- SECTION:NOTES:END -->
