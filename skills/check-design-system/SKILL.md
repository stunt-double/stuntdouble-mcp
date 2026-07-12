---
name: check-design-system
description: Audit a live product against its design system on Stunt Double — typography, colour usage, spacing, component and iconography rules, checked on rendered pages with evidence, and re-checked automatically on library publishes.
---

# Check design system

## When to use

- You have a design system (tokens, component rules, a Figma library) and want to know where the live product drifts from it
- Screens shipped independently and visual consistency has eroded
- You want design-system adherence enforced when the library is published or files change

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → match the URL to a project, or let `create_checklist` find/create it

2. **Set up a design-guardian actor:**
   - `list_actors(workspace_id)`, else `create_actor(...)` described as a design-system reviewer
   - `add_actor_knowledge(actor_id, ...)` — store the token values and component dos and don'ts
   - If no rules were supplied, ask for the key tokens and component rules, or derive a draft from the most polished screens and confirm it

3. **Create a checklist per surface:**
   - Actors see the rendered product the way a user does, so phrase checks visually, not in terms of code or class names:
     - "Body text uses the product font stack, no serif fallbacks anywhere"
     - "Primary CTAs use the brand primary colour and sentence case"
     - "Form fields show a visible focus state"
     - "Empty states use the illustration style, not stock icons"
     - "Spacing between sections is consistent across pages"

4. **Run and collect evidence:**
   - `run_checklist(checklist_id)` → poll `get_checklist_run(run_id)` until terminal; collect evidence for each deviation

5. **Report deviations by page:**
   - With screenshots or extracted evidence and the rule each one breaks

6. **Wire it into the design workflow:**
   - If the workspace has Figma connected, `create_workflow` with a `figma_event` trigger so the audit re-runs when the design library is published or files change
   - Otherwise offer a schedule or deploy trigger (see `setup-guardrails`)

## Example output

```
Design-system audit — app.acme.com

Dashboard:
  [FAIL] Card titles render in Georgia (serif) — should use Inter. Font stack is missing on /dashboard.
  [PASS] Primary buttons use brand primary #4F46E5
  [FAIL] Section spacing 12px here vs 24px on Settings — inconsistent vertical rhythm

Settings:
  [PASS] Focus states visible on all inputs
  [FAIL] Empty "no integrations" state uses a stock plug icon, not the house illustration set

4 deviations. If Figma is connected, offer a figma_event workflow so this re-runs on library publish.
```

## Tips

- **Phrase checks visually.** The actor cannot see class names or tokens — only the rendered result. "Body text is the product sans-serif" works; "uses `--font-body`" does not.
- **Store rules as actor knowledge** so every run enforces the same system.
- **A `figma_event` trigger closes the loop** — the audit re-runs the moment the library changes.
