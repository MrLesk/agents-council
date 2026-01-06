---
id: task-15.8
title: Composer panel
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:17'
labels: []
dependencies:
  - task-15.7
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Redesign the composer/input panel with primary frame styling, styled textarea, and prominent game-style submit button.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Composer panel uses primary frame styling
- [x] #2 Textarea has appropriate styling matching aesthetic
- [x] #3 Submit button uses primary game-style button
- [x] #4 Button is right-aligned and prominent
- [x] #5 Placeholder text is styled appropriately
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Analysis

The current composer section (lines 370-389 in Hall.tsx) is inside the Voices panel and uses basic styling:
- A simple `div.composer` wrapper
- Basic `.label` for the "Your Counsel" heading
- Standard `.textarea` for input
- `.btn.btn-primary` for the submit button

According to the UI spec (lines 391-406), the Composer Panel should:
1. Be a separate framed panel with primary styling
2. Have a decorated title "YOUR COUNSEL"
3. Feature a styled textarea inside an inner card-like area
4. Have the submit button right-aligned using `.btn-game` styling

### Changes Required

1. **Hall.tsx** - Restructure the composer as a standalone panel:
   - Extract composer from inside the Voices panel
   - Wrap in `.panel-primary` with corner decorations
   - Add decorated panel title
   - Keep textarea with existing styling (already matches aesthetic)
   - Update submit button to use `.btn-game` class
   - Right-align the button

2. **styles.css** - Add composer-specific styles:
   - `.composer-panel` for layout
   - `.composer-actions` for right-aligned button container
   - Textarea focus state already exists (gold glow)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**styles.css:**
- Added `.composer-panel` class for the composer panel layout (flex column with gap)
- Added `.composer-actions` for right-aligned button container
- Added `.composer-textarea` with gold border, dark background, inset shadow, and gold glow focus state
- Added placeholder styling with muted parchment color and italic style

**Hall.tsx:**
- Extracted the composer from inside the Voices panel into its own standalone `<section>`
- Applied `.panel-primary` with decorative corners (`.panel-primary-inner` and `.panel-primary-corners`)
- Added decorated panel title "Your Counsel" with flourish elements
- Changed submit button from `.btn.btn-primary` to `.btn-game` for game-style appearance
- Button is now right-aligned in `.composer-actions` container
- Added validation to disable button when textarea is empty
- Removed unnecessary React Fragment from Voices panel (fixed lint warning)

### Visual Result
The composer now appears as a separate ornate panel with:
- Gold border with decorative corner accents
- Centered decorated title with diamond flourishes
- Gold-bordered textarea with glow on focus
- Prominent game-style "Join and Speak" / "Speak" button, right-aligned
- Muted italic placeholder text
<!-- SECTION:NOTES:END -->
