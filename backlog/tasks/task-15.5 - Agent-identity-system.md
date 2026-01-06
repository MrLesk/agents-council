---
id: task-15.5
title: Agent identity system
status: Done
assignee:
  - Claude
created_date: '2026-01-06 12:49'
updated_date: '2026-01-06 13:07'
labels: []
dependencies:
  - task-15.3
parent_task_id: task-15
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the agent badge component with unique sigils and colors for each agent type (Claude=violet/◈, Codex=green/◆, Gemini=blue/✦, Human=gold/●, Other=silver/○).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Agent badge component displays sigil and colored name
- [x] #2 Each agent type has correct color and sigil mapping
- [x] #3 Sigil has subtle glow effect matching agent color
- [x] #4 Agent names use display font with agent color
- [x] #5 System correctly identifies agent type from name
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Goal
Implement the agent badge component with unique sigils and colors for each agent type.

### Agent Identity Mapping
| Agent   | Color (CSS var)    | Sigil |
|---------|-------------------|-------|
| Claude  | --agent-claude    | ◈     |
| Codex   | --agent-codex     | ◆     |
| Gemini  | --agent-gemini    | ✦     |
| Human   | --agent-human     | ●     |
| Other   | --agent-other     | ○     |

### Approach
Given the simplicity-first rules, I'll add the helper function directly to Hall.tsx rather than creating a new component file.

### Steps
1. **CSS Classes** - Add to styles.css:
   - `.agent-badge` - inline-flex container with gap
   - `.agent-sigil` - sigil element with subtle glow effect
   - `.agent-name` - display font with agent color
   - Agent-specific sigil glow colors (using existing --agent-* vars)

2. **Helper Functions** - Add to Hall.tsx:
   - `getAgentType(name: string)` - determine agent type from name (case-insensitive contains check)
   - `AgentBadge` component or inline JSX with sigil + name

3. **Integration** - Update Hall.tsx to use the badge:
   - Replace "Requested by {name}" with badge
   - Replace message author display with badge
   - Replace conclusion author with badge

4. **Verification**:
   - Run typecheck
   - Run lint
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Changes Made

**src/interfaces/chat/ui/styles.css:**
- Added `.agent-badge` class - inline-flex container with 8px gap
- Added `.agent-sigil` class with agent-specific color variants that apply the sigil color and subtle text-shadow glow
- Added `.agent-name` class with display font and agent-specific color variants
- Agent types: claude (violet), codex (green), gemini (blue), human (gold), other (silver)

**src/interfaces/chat/ui/pages/Hall.tsx:**
- Added `AgentType` type and `AGENT_SIGILS` constant mapping each type to its sigil character
- Added `getAgentType(name)` helper that determines agent type via case-insensitive name matching
- Added `AgentBadge` component that renders sigil + name with appropriate CSS classes
- Integrated AgentBadge in three locations:
  - Request metadata ("Requested by")
  - Message author in voices list
  - Conclusion author

### Verification
- TypeScript: Passes (`bun run typecheck`)
- Lint: Pre-existing issues only, no new issues from agent badge code
<!-- SECTION:NOTES:END -->
