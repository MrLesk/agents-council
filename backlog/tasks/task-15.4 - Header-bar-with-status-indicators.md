---
id: task-15.4
title: Header bar with status indicators
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:09'
labels: []
dependencies:
  - task-15.5
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign the header bar as a command bar with emblem/logo, metallic title text, glowing status orb with pulse animation, user identity display, and settings icon.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Header has appropriate styling matching game UI aesthetic
- [x] #2 Status indicator is a glowing orb (not text pill)
- [x] #3 Status orb pulses when session is active
- [x] #4 User identity shows name with appropriate styling
- [x] #5 Settings button matches game UI style
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Summary
Redesign the header bar to match the game UI aesthetic by:
1. Replacing the text-based status pill with a glowing status orb
2. Adding a pulse animation for active session states
3. Updating header styling to match game aesthetic

### Files to Modify
1. `src/interfaces/chat/ui/styles.css` - Add status orb CSS classes and pulse animation
2. `src/interfaces/chat/ui/pages/Hall.tsx` - Update header JSX to use the new status orb

### Changes

#### CSS (styles.css)
1. Add `.status-orb` base class (12px circle with background color and box-shadow)
2. Add color variants:
   - `.status-orb-active` - emerald glow (session in progress)
   - `.status-orb-closed` - crimson (concluded/closed)
   - `.status-orb-none` - muted (no session)
   - `.status-orb-listening` - gold (waiting for voices)
   - `.status-orb-offline` - crimson (connection lost)
3. Add `@keyframes pulse-glow` animation that pulses the box-shadow
4. Apply animation to `.status-orb-active` variant
5. Update `.hero` styling if needed for proper alignment
6. Update `.identity` styling for game aesthetic

#### React Component (Hall.tsx)
1. Replace the status pill element with a status orb + text label
2. Map `sessionStatus` ('none', 'active', 'closed') to appropriate orb variants
3. Add connection-based orb variant (when offline)
4. Ensure proper accessibility (aria-label or title for status)

### Acceptance Criteria Mapping
- AC#1: Header styling matching game UI aesthetic - update .hero, .identity, btn-ghost usage
- AC#2: Status indicator as glowing orb - .status-orb class with glow via box-shadow
- AC#3: Pulse animation when active - @keyframes pulse-glow applied to .status-orb-active
- AC#4: User identity with appropriate styling - .identity uses display font, gold color
- AC#5: Settings button matches game UI - already uses btn-ghost
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**styles.css:**
- Added `.status-orb` base class (12px glowing circle)
- Added color variants: `.status-orb-active` (emerald), `.status-orb-closed` (crimson), `.status-orb-none` (muted), `.status-orb-listening` (gold), `.status-orb-offline` (crimson)
- Added `@keyframes pulse-glow-emerald` and `@keyframes pulse-glow-gold` animations that pulse the box-shadow intensity
- Added `.status-indicator` group class that combines orb + label with appropriate border colors per status
- Removed old `.status-pill` and related classes (replaced by new orb system)

**Hall.tsx:**
- Added `sessionOrbClass` computed property for orb styling
- Updated header to include the status indicator with glowing orb + label
- Removed duplicate status pill from Matter panel header (now shown in main header)
- Added `aria-hidden="true"` on orb span for accessibility (label provides text)
- Added `title` attribute for tooltip on status indicator

### Visual Result
- Header now shows a glowing status orb that pulses when session is active
- Emerald orb with pulse animation for active sessions
- Crimson orb (no pulse) for closed/concluded sessions
- Muted orb for no session state
- User identity and settings button remain styled consistently

### Verification
- `bun run typecheck` passes
- `bun run lint` shows no new issues (pre-existing warnings unrelated to this task)
<!-- SECTION:NOTES:END -->
