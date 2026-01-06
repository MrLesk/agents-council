---
id: task-14.7
title: Chat UI render message content as markdown
status: Done
assignee:
  - '@codex'
created_date: '2026-01-04 21:11'
updated_date: '2026-01-04 22:38'
labels: []
milestone: v0.3 - Summon Claude
dependencies: []
parent_task_id: task-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Improve readability of council messages in the web UI by rendering markdown formatting instead of showing raw markdown text. Use `@uiw/react-markdown-preview` for markdown rendering in the chat UI and ensure untrusted content is safely handled (escape/sanitize HTML).

Docs:
- docs/council.md
- README.md
- https://uiwjs.github.io/react-markdown-preview/
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Message content in the chat UI renders common markdown formatting (headings, emphasis, lists, links, code) instead of raw markdown text.
- [x] #2 Rendering is safe for untrusted content (raw HTML is escaped or sanitized; scripts do not execute).
- [x] #3 Markdown rendering applies consistently to existing history and new incoming messages without breaking the layout.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
- Add `@uiw/react-markdown-preview` and load its base CSS from the chat UI entry so markdown styles are available.
- Swap the message body in `src/interfaces/chat/ui/pages/Hall.tsx` to render via `MarkdownPreview` with `skipHtml` enabled and a themed wrapper/class for styling.
- Adjust `src/interfaces/chat/ui/styles.css` to align markdown typography (lists, code blocks, blockquotes, tables) with the council UI without breaking layout.
- Run `bun run typecheck` and `bun run lint`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Replaced feedback message rendering with @uiw/react-markdown-preview (MarkdownPreview) and filtered out rehypeRaw so raw HTML is not rendered; markdown content now renders with headings/lists/links/code.

Adjusted chat UI styles to align markdown output with the council theme (colors, code blocks, blockquotes, tables) without layout regressions.

Tests: bun run typecheck, bun run lint.
<!-- SECTION:NOTES:END -->
