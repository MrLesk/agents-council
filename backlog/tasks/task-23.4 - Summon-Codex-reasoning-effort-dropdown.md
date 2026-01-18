---
id: TASK-23.4
title: Summon Codex reasoning effort dropdown
status: Done
assignee:
  - '@codex'
created_date: '2026-01-18 15:04'
updated_date: '2026-01-18 15:13'
labels: []
milestone: 'm-3: v0.4 - Summon Codex'
dependencies: []
parent_task_id: TASK-23
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expose Codex model reasoning effort options (from model/list) in the summon UI, only when provided by the model list. Persist per-agent selection and pass to Codex SDK as modelReasoningEffort.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Summon settings response includes per-model supported_reasoning_efforts + default_reasoning_effort when Codex provides them.
- [x] #2 Summon modal shows a reasoning dropdown only when the selected model has supported_reasoning_efforts, defaulting to the model's default_reasoning_effort.
- [x] #3 Selected reasoning effort is persisted in summon settings and sent to Codex via modelReasoningEffort; when no options are available, no override is sent.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented reasoning effort support end-to-end: stored per agent, mapped through settings responses, derived from model/list supported_reasoning_efforts, and passed to Codex SDK as modelReasoningEffort. UI shows dropdown only when selected model exposes options and defaults to model default.
<!-- SECTION:NOTES:END -->
