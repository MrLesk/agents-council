---
id: task-15.10
title: Animations and transitions
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:22'
labels: []
dependencies:
  - task-15.9
parent_task_id: task-15
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement subtle animations including panel enter effects, new message slide-in, status pulse glow, button hover transitions, and modal open animations.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Panels fade in with slight rise on page load
- [x] #2 New messages slide in with brief glow highlight
- [x] #3 Status orb has continuous pulse animation when active
- [x] #4 Buttons have smooth hover transition (lift + glow)
- [x] #5 Modals fade in backdrop and scale panel
- [x] #6 All animations respect prefers-reduced-motion
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Current State Analysis
1. **Status orb pulse** - Already implemented: `pulse-glow-emerald` and `pulse-glow-gold` keyframes exist and are applied to `.status-orb-active` and `.status-orb-listening`
2. **Modal animations** - Already exist: `fadeIn` (line 1434) for backdrop and `fadeRise` (line 1261) for panel
3. **prefers-reduced-motion** - Already exists (line 1513-1520)
4. **Button hover transitions** - Partially implemented: `.btn-game` has transition (line 817-820) but needs verification

### Tasks to Implement

1. **Panel enter animation** - Add `@keyframes panel-enter` as specified in UI spec and apply to `.panel-primary` classes

2. **New message animation** - Create `@keyframes message-enter` with slide-from-left and brief glow highlight, apply via `.message-new` class. Modify Hall.tsx to apply the class to new messages.

3. **Status orb pulse** - Verify existing implementation matches spec (already done)

4. **Button hover transitions** - Verify `.btn-game` and `.btn-ghost` have proper transitions on base state. Current `.btn-game` has transition but verify lift effect (-2px translateY)

5. **Modal animations** - Verify existing `fadeIn` and `fadeRise` work correctly (already done)

6. **Verify prefers-reduced-motion** - Confirm all animations respect this media query

### Files to Modify
- `/src/interfaces/chat/ui/styles.css` - Add keyframes and apply animations
- Minimal or no changes to `Hall.tsx` (message-new class can be handled via CSS only since messages already animate via fadeRise)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

1. **Panel enter animation** (AC #1)
   - Added `@keyframes panel-enter` with fade-in and translateY(20px) rise
   - Applied to `.panel-primary` with 0.4s ease-out timing

2. **New message animation** (AC #2)
   - Added `@keyframes message-enter` with:
     - Slide from left (translateX -20px to 0)
     - Brief gold glow at 50% keyframe that fades by 100%
   - Applied to `.message-card` with 0.5s ease-out timing

3. **Status orb pulse** (AC #3)
   - Already implemented in previous task (task-15.4)
   - Verified: `pulse-glow-emerald` and `pulse-glow-gold` keyframes exist
   - Applied to `.status-orb-active` and `.status-orb-listening`

4. **Button hover transitions** (AC #4)
   - `.btn-game` already had proper transitions (transform, box-shadow, background)
   - Enhanced `.btn-ghost` to include `transform` in transitions and `translateY(-1px)` on hover

5. **Modal animations** (AC #5)
   - Already implemented: `fadeIn` for backdrop, `fadeRise` for panel
   - Applied to `.dialog-backdrop`, `.settings-backdrop`, `.dialog-panel`, `.settings-popup`

6. **prefers-reduced-motion** (AC #6)
   - Already implemented in task-15.1
   - Media query sets animation-duration and transition-duration to 0.01ms

### Files Modified
- `/src/interfaces/chat/ui/styles.css`

### Verification
- `bun run typecheck` passes
- `bun run lint` shows only pre-existing warnings (not from this task)
<!-- SECTION:NOTES:END -->
