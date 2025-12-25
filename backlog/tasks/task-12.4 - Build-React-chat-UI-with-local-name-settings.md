---
id: task-12.4
title: Build React chat UI with local name settings
status: Done
assignee:
  - '@Codex'
created_date: '2025-12-23 22:03'
updated_date: '2025-12-25 21:27'
labels: []
milestone: v0.2.0 Chat UI
dependencies: []
parent_task_id: task-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the human-facing chat interface with a settings screen for the user name. The UI should capture a Tolkien-esque medieval council chamber vibe - where wise beings gather to deliberate weighty matters. The human user is another council member (equal to AI agents) who can convene, participate in, or observe the council.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Gate page shows council image prominently and uses ceremonial language ("Announce yourself", "The council awaits")
- [x] #2 Hall page elevates the petition to hero status with thematic language ("The Matter Before the Council", "Voices of the Council")
- [x] #3 Actions use immersive language: "Convene the Council", "Speak", "Seal the Matter"
- [x] #4 Status indicators are atmospheric: "The council is in session", "Connected"

- [x] #5 Settings popup allows updating name with thematic styling
- [x] #6 UI refreshes automatically via WebSocket on state changes
- [x] #7 Responsive layout works on desktop and mobile
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Phase 1: Code Structure (DONE)
- [x] Move UI from src/ui/chat to src/interfaces/chat/ui
- [x] Create useCouncil hook for shared state/WebSocket logic
- [x] Create Gate page component
- [x] Create Hall page component  
- [x] Create Settings popup component
- [x] Wire up routing in app.tsx
- [x] Fix lint errors
- [x] Move React to devDependencies with pinned versions

### Phase 2: Gate Page Redesign
- [ ] Add council image (agents-council-logo.png) prominently above the card
- [ ] Change "Choose your name" → "Announce yourself"
- [ ] Add atmospheric tagline: "The council awaits"
- [ ] Add subtitle: "You join as an equal voice among the wise"
- [ ] Enhance visual styling for immersive entry experience

### Phase 3: Hall Page Redesign
- [ ] Rename "Petition" → "The Matter Before the Council"
- [ ] Change "Set by X" → "Summoned by X"
- [ ] Rename "Council Replies" → "Voices of the Council"
- [ ] Change empty state: "The chamber is quiet" / "No council is in session"
- [ ] Rename "Identity" section → "Your Role" with "You are: [Name]"
- [ ] Change "Change name" → "Settings" (gear icon)
- [ ] Rename "Rituals" → "Convene" section
- [ ] Change "Start council" → "Summon the Council"
- [ ] Change "Join council" → "Join the Council"  
- [ ] Change "Council request" → "What matter shall we deliberate?"
- [ ] Rename "Your response" → "Your counsel"
- [ ] Change "Send response" → "Speak"
- [ ] Rename "Seal the matter" → keep (good already)
- [ ] Change "Close council" → "Seal the Matter"
- [ ] Update status pills: "SESSION: ACTIVE" → "In session", "SIGNAL: LIVE" → "Connected"
- [ ] Style conclusion section more ceremonially when council is closed

### Phase 4: Visual Polish
- [ ] Ensure council image displays correctly
- [ ] Verify responsive layout on mobile
- [ ] Test all flows: idle → active → closed
- [ ] Verify WebSocket reconnection with status banners

### Reference
- See docs/ui-proposal.md for detailed design spec
- See .github/agents-council.jpg for visual mood reference
- MCP interface (src/interfaces/mcp/server.ts) has good thematic language to match
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Session Notes

### 2025-12-25: Code Refactoring Complete
- Moved UI to src/interfaces/chat/ui (proper architecture)
- Split monolithic App component (465 lines → 27 lines)
- Created: useCouncil.ts hook, Gate.tsx, Hall.tsx, Settings.tsx
- Fixed all 9 lint errors
- Moved React to devDependencies with pinned versions
- All typecheck and lint pass

### 2025-12-25: UI Proposal Created
- Analyzed current UI via Chrome DevTools
- Compared with agents-council.jpg mood board
- Created detailed proposal at docs/ui-proposal.md
- Key insight: UI feels like "dashboard with medieval fonts" but should feel like "Tolkien council chamber"
- Ready to implement Phase 2 (Gate) and Phase 3 (Hall)

### 2025-12-25: UI Redesign Complete
- Gate page: Added "The council awaits", "Announce Yourself", "You join as an equal voice among the wise"
- Hall page: "The Matter Before the Council", "Voices of the Council", "Speak", "Seal the Matter"
- Status pills: "In session", "Connected", "The chamber is quiet"
- "Your Role" with "You are: [Name]" and Settings button
- "Convene" section with "Summon the Council" and "Join the Council"
- Responsive layout tested on mobile (375x812)
- All lint/typecheck passing

### 2025-12-25: Single Column Layout
- Replaced 3-column dashboard layout with single-column ceremonial flow
- Compact header: logo + title + status pills + identity button
- Vertical narrative: Matter → Voices → Counsel → Seal
- State-based views for idle/active/closed
- Max-width 720px centered for intimate feel
- Mobile responsive at 600px breakpoint
<!-- SECTION:NOTES:END -->
