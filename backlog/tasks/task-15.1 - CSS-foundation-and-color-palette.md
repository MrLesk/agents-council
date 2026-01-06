---
id: task-15.1
title: CSS foundation and color palette
status: Done
assignee:
  - claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:02'
labels: []
dependencies: []
parent_task_id: task-15
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update CSS variables with the new color palette including glow variants, agent identity colors, and base typography settings. This establishes the foundation for all other UI components.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All base colors defined (night, stone, ash, ink, parchment)
- [x] #2 Gold accent colors with bright, glow, and dark variants
- [x] #3 Ember, crimson, emerald, sage accent colors with glow variants
- [x] #4 Agent identity colors defined (claude, codex, gemini, human, other)
- [x] #5 Font variables configured (display: Cinzel, body: Crimson Pro or similar)
- [x] #6 prefers-reduced-motion media query added
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

1. Update the `:root` CSS variables section with:
   - Base colors: night, stone, ash, ink, parchment, parchment-muted (verify current values match spec)
   - Gold accent colors: add gold-bright, gold-glow, gold-dark (gold already exists)
   - Add glow variants: ember-glow, crimson-glow, emerald-glow (base colors exist)
   - Add sage-glow variant
   - Agent identity colors: claude, codex, gemini, human, other
   - Font variables: keep Cinzel for display, add Crimson Pro for body
   
2. Add `prefers-reduced-motion` media query at the end of the file

3. Run typecheck and lint to verify no issues

Files to modify:
- `/Users/agavrilescu@funstage.com/projects/agents-council/src/interfaces/chat/ui/styles.css`
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Updated `/src/interfaces/chat/ui/styles.css` with the new color palette and typography settings as specified in the UI spec (`docs/ui-spec.md`).

### Changes Made:

1. **Google Fonts import** - Added Crimson Pro font family for body text

2. **Base colors** - Verified all base colors match spec:
   - `--night: #0e0b09`
   - `--stone: #1f1914`
   - `--ash: #2b231c`
   - `--ink: #120d0a`
   - `--parchment: #f1e7d3`
   - `--parchment-muted: rgba(241, 231, 211, 0.65)` (updated from 0.82 to match spec)

3. **Gold accent colors** - Added bright, glow, and dark variants:
   - `--gold-bright: #f4d794`
   - `--gold-glow: rgba(244, 215, 148, 0.5)`
   - `--gold-dark: #a68b4b`

4. **Accent color glow variants** - Added glow variants:
   - `--ember-glow: rgba(216, 138, 71, 0.5)`
   - `--crimson-glow: rgba(140, 59, 46, 0.4)`
   - `--emerald-glow: rgba(63, 141, 115, 0.5)`
   - `--sage-glow: rgba(127, 198, 170, 0.5)`

5. **Agent identity colors** - Added all five agent colors:
   - `--agent-claude: #9d7cd8` (Purple/violet)
   - `--agent-codex: #56b886` (Green)
   - `--agent-gemini: #6b9eff` (Blue)
   - `--agent-human: #d2b177` (Gold)
   - `--agent-other: #a0a0a0` (Silver)

6. **Font variables** - Updated typography:
   - `--font-display: "Cinzel", serif` (unchanged)
   - `--font-body: "Crimson Pro", serif` (changed from IM Fell English)
   - `--font-flavor: "IM Fell English", serif` (added for flavor text)

7. **prefers-reduced-motion** - Added accessibility media query to disable animations for users who prefer reduced motion

### Notes:
- TypeScript type checking passes
- The lint has a pre-existing error (noShorthandPropertyOverrides on body background) that was not introduced by these changes
- The !important usage in prefers-reduced-motion is intentional per WCAG guidelines to ensure accessibility overrides take precedence
<!-- SECTION:NOTES:END -->
