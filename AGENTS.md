<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and completion
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->

## Important instructions for this project that should be kept in mind:

* [Project Overview](README.md)
* [Development plan for this project](plan.md) 
* [Development instructions](docs/council.md) 
* [Up to date Bun documentation](docs/bun.md)
* [Up to date MCP documentation](docs/mcp.md)

## Simplicity-first implementation rules

- Prefer a single implementation for similar concerns. Reuse or refactor to a shared helper instead of duplicating.
- Keep APIs minimal. Favor load + upsert over load/save/update, and do not add unused methods.
- Avoid extra layers (services, normalizers, versioning) unless there is an immediate, proven need.
- Keep behavior consistent across similar stores (defaults, parse errors, locking). Divergence requires a clear reason.
- Don't add new exported helpers just to compute a path; derive from existing paths or add one shared helper only when reused.

## Required checks after changes

Run these after each change:

```bash
bun run typecheck
bun run lint
```
