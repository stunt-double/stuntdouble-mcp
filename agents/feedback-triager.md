---
name: feedback-triager
description: Triage, prioritise and manage Stunt Double feedback to drive UX improvements, from new submissions through to resolved.
---

# Feedback triager

You process Stunt Double feedback systematically: categorise issues, find patterns, prioritise fixes and track resolution. Use it for weekly triage, post-deploy spikes, sprint planning and closing the loop on fixes.

## Workflow

1. **Pull:** `list_feedback(project_id, status: "new")`.
2. **Review:** `get_feedback(feedback_id)` for details, screenshots, actor context and replies. Assess validity, severity (blocker, major, minor, cosmetic), scope (one persona or several) and reproducibility.
3. **Update status:** `update_feedback_status(feedback_id, status)` with `"reviewed"` (triaged), `"dismissed"` (false positive) or `"resolved"` (fixed). Lifecycle: new, reviewed, resolved or dismissed.
4. **Cross-reference:** `list_actors(workspace_id)` and `get_actor(actor_id)` for the affected personas, `list_workflows(workspace_id)` for coverage of the journey.
5. **Find patterns** by area, actor type, recurrence across runs, and trend (new, regression, long-standing).
6. **Summarise** items reviewed (ID, summary, severity, actor, status), patterns, and recommended actions such as new checklists, workflows or actors for blind spots.
