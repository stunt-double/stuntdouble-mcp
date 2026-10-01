---
name: check-design-system
description: Audits a live product against its design system with Stunt Double, recording typography, colour, spacing, component and iconography rules as project guidelines, checking them on rendered pages with evidence, and re-running the audit when a Figma library is published. Use when the user asks about design system adherence, UI consistency or visual drift, design tokens, component usage, whether screens match Figma or the style guide, or wants a design QA audit re-run on library publish, deploy or a schedule.
---

# Check design system

Tools are on the `stuntdouble` MCP server and are named bare below: `create_checklist` is `stuntdouble:create_checklist` (in Claude Code, `mcp__stuntdouble__create_checklist`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace and project
- [ ] Step 2: Record the rules as guidelines
- [ ] Step 3: Pick or create the reviewing actor
- [ ] Step 4: Create one checklist per surface
- [ ] Step 5: Run and poll to a terminal status
- [ ] Step 6: Report deviations by page
- [ ] Step 7: Wire it to Figma, deploys or a schedule
```

1. **Resolve context.** `list_workspaces` (use the only one silently). `list_projects(workspace_id)` and match the URL to a project. No project? `create_checklist` with a `url` finds or creates one.

2. **Record the rules as guidelines.**
   - `list_workspace_guidelines(workspace_id)` first, then attach an existing rule with `set_project_guideline(project_id, guideline_id)` or write one with `add_project_guideline(project_id, category="design_system", title, content)`. Token values and component dos and don'ts belong here.
   - The standard should also hold for design reviews raised from Slack or Linear (which carry no project)? `update_workspace_guideline(workspace_id, guideline_id, apply_to_design_reviews=true)`.
   - No rules supplied? Ask for the key tokens and component rules, or derive a draft from the most polished screens and confirm it with the user.

3. **Pick the actor.** Reuse a reviewer from `list_actors(workspace_id)`, else `create_actor(workspace_id, name="Design system reviewer", description=…)`.

4. **Create one checklist per surface** with `create_checklist(workspace_id, name, actor_id, instructions, checks, url)`. Actors see the rendered product, so phrase checks visually, never by class name or token:
   - "Body text uses the product sans-serif, no serif fallbacks anywhere"
   - "Primary buttons use the brand primary colour and sentence case"
   - "Form fields show a visible focus state"
   - "Empty states use the house illustration style, not stock icons"
   - "Spacing between sections is consistent across pages"

5. **Run and poll.** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Read each result's `evidence`. `waiting_for_input` means the actor needs a person: tell the user to answer it in the run's live view. After 15 minutes without a terminal status, stop and give the user the run id.

6. **Report deviations by page** with evidence and the rule each one breaks.

7. **Wire it into the design workflow.**
   - Figma connected to the workspace: `create_workflow(workspace_id, name, trigger_type="figma_event", trigger_config={ events: ["LIBRARY_PUBLISH"], file_key })`, then one `run_checklist` step per checklist (see `setup-guardrails` for steps and activation).
   - Otherwise a schedule or deploy trigger (see `setup-guardrails`).

## Report template

```
Design system audit: app.acme.com
Verdict: 3 deviations across 2 pages

Dashboard
  [FAIL] Card titles render in a serif font; rule: body and titles use Inter
  [PASS] Primary buttons use brand primary #4F46E5
  [FAIL] Section spacing 12px here against 24px on Settings

Settings
  [PASS] Focus states visible on all inputs
  [FAIL] "No integrations" empty state uses a stock plug icon, not the house illustrations

Next: re-run on every library publish with a figma_event workflow.
```

## Gotchas

- **Phrase checks visually.** "Body text is the product sans-serif" works; "uses `--font-body`" does not.
- **Guidelines hold the standard**, so every run and design review for the project enforces the same system.
- **A `LIBRARY_PUBLISH` trigger closes the loop**: the audit re-runs the moment the library changes. Narrow it with `library_item_types` (components, styles, variables) if every publish is too often.
