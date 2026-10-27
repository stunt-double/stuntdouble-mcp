---
name: check-design-system
description: Audit a live product against its design system (typography, colour, spacing, components, iconography) on rendered pages with evidence, and re-check automatically when the Figma library publishes.
---

# Check design system

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`. Match the URL to a project, or let `create_checklist` find or create it.
2. **Actor and rules:**
   - `list_actors(workspace_id)`, else `create_actor(...)` described as a design-system reviewer.
   - `list_workspace_guidelines(workspace_id)` first, then attach with `set_project_guideline(project_id, guideline_id)` or write `add_project_guideline(project_id, category: "design_system", content, title)`. Token values and component dos and don'ts belong here.
   - `update_workspace_guideline(workspace_id, guideline_id, apply_to_design_reviews: true)` when the standard must also hold for design reviews from Slack or Linear, which carry no project.
   - No rules supplied: ask for key tokens and component rules, or derive a draft from the most polished screens and confirm it.
3. **One checklist per surface.** Actors see only the rendered product, so phrase checks visually ("Primary CTAs use the brand primary colour and sentence case", "Form fields show a visible focus state"), never by class names or tokens.
4. **Run:** `run_checklist(checklist_id)`, poll `get_checklist_run(run_id)` until terminal, collect evidence per deviation.
5. **Report** deviations by page with evidence and the rule each breaks.
6. **Wire in:** if Figma is connected, `create_workflow` with a `figma_event` trigger so the audit re-runs on library publish; otherwise a schedule or deploy trigger (see `setup-guardrails`).
