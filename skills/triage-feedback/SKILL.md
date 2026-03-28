---
name: triage-feedback
description: Review, categorize, and manage Stunt Double feedback submissions across projects.
---

# Triage feedback

## When to use

- During weekly feedback review sessions
- After a deployment to check for new issues surfaced by actors
- When prioritizing UX improvements for the next sprint
- When closing the loop on fixed issues

## Instructions

1. **Pull untriaged feedback:**
   - `list_feedback(project_id, status: "new")` → get all new feedback items

2. **Review each item in detail:**
   - `get_feedback(feedback_id)` → read full details including actor context, screenshots, and evidence

3. **Assess each item:**
   - **Is it valid?** — Real UX issue vs expected behavior or test artifact
   - **How severe?** — Blocker (can't proceed), Major (significant friction), Minor (annoyance), Cosmetic (polish)
   - **Who's affected?** — One persona type or multiple
   - **Is it new?** — First occurrence or repeat of a known issue

4. **Update status:**
   - `update_feedback_status(feedback_id, status: "reviewed")` → triaged and needs action
   - `update_feedback_status(feedback_id, status: "resolved")` → issue has been fixed
   - `update_feedback_status(feedback_id, status: "dismissed")` → false positive or not actionable

5. **Cross-reference for patterns:**
   - `list_actors(workspace_id)` → check which personas are most affected
   - `list_workflows(workspace_id)` → identify workflows that cover the affected areas
   - Look for clusters: multiple feedback items about the same flow, same actor type, or same area

6. **Summarize findings:**
   - Total items reviewed, by status
   - Top patterns or clusters
   - Recommended actions (new workflows, actor updates, code fixes)

## Example output

```
Feedback Triage — March 28, 2026

Reviewed: 7 new items

Triaged:
  [reviewed] FB-301: Search returns empty for partial queries (Major, Power User)
  [reviewed] FB-302: Modal not keyboard-dismissable (Major, Accessibility User)
  [reviewed] FB-303: Onboarding tooltip overlaps CTA button (Minor, New User)
  [dismissed] FB-304: Duplicate of FB-298
  [reviewed] FB-305: Slow load on settings page (Major, Mobile User)
  [dismissed] FB-306: Expected behavior — empty state on fresh account
  [reviewed] FB-307: Confusing label on export button (Minor, Enterprise Admin)

Patterns:
  - 2 accessibility items this week (up from 0 last week) — consider an a11y checklist
  - Search issues recurring — needs a dedicated search workflow

Actions:
  1. Fix FB-302 keyboard trap before next release
  2. Create "Keyboard Navigation" checklist
  3. Add search-specific workflow with varied query patterns
```
