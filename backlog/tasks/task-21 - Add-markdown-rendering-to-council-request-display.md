---
id: task-21
title: Add markdown rendering to council request display
status: Done
assignee:
  - Claude
created_date: '2026-01-06 18:23'
updated_date: '2026-01-06 18:28'
labels:
  - chat-ui
  - ux
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently the chat UI uses MarkdownPreview to render feedback/responses in the "Voices of the Council" section, but the original request in "The Matter Before the Council" section is displayed as plain text.

Add markdown rendering to the request display for consistency and to support formatted requests (code blocks, lists, etc.).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Request content in Matter panel uses MarkdownPreview component
- [x] #2 Same markdown configuration as feedback messages (skipHtml, pluginsFilter, dark mode)
- [x] #3 Styling consistent with feedback message cards
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Simple change: Replace `<p className="request-text">` with `MarkdownPreview` component using same config as feedback messages.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation

Replaced plain text `<p>` element with `MarkdownPreview` in `Hall.tsx:335-341`:

```tsx
<MarkdownPreview
  className="message-content"
  source={currentRequest.content}
  skipHtml
  pluginsFilter={filterMarkdownPlugins}
  wrapperElement={{ "data-color-mode": "dark" }}
/>
```

Uses identical configuration to feedback messages for consistency.
<!-- SECTION:NOTES:END -->
