---
id: task-14.8
title: Chat UI clarity pass for request and response metadata
status: Done
assignee:
  - '@codex'
created_date: '2026-01-05 10:25'
updated_date: '2026-01-05 11:54'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Improve clarity in the chat UI so the council request stands out and each response clearly shows author + timestamp, while aligning to current theme and layout expectations. Include moving the summon control into the request panel and applying the specified visual tweaks (divider between responses, lighter code blocks, larger header/body spacing).

Docs:
- docs/council.md
- README.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Request area is visually distinct with a clear label and metadata (requested by + timestamp) so the active request is immediately recognizable.
- [x] #2 Summon Claude control appears in the request panel (not the voices panel) without breaking existing flow.
- [x] #3 Each response shows author and timestamp together on the left in a consistent header treatment, and the header is more separated from the body.
- [x] #4 A subtle divider line appears between responses to improve scannability.
- [x] #5 Code blocks use a lighter background while keeping overall theme consistency.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Update request panel layout in `src/interfaces/chat/ui/pages/Hall.tsx` to add a clearer request callout with metadata and move the Summon Claude control into this panel.
- Adjust response rendering in `src/interfaces/chat/ui/pages/Hall.tsx` to place author + timestamp together on the left and insert a divider element between responses.
- Update `src/interfaces/chat/ui/styles.css` to increase header/body spacing, style the divider, and lighten code block backgrounds while preserving the existing theme.
- Run `bun run typecheck` and `bun run lint`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Moved Summon Claude control into the request card, added request metadata pills, and styled the voices count as a pill for clearer status cues.

Updated response header layout to keep author + timestamp together on the left, increased header/body spacing, and added a divider line between responses.

Lightened code block and inline code backgrounds to improve readability while preserving the theme.

Tests: bun run typecheck, bun run lint.
<!-- SECTION:NOTES:END -->
