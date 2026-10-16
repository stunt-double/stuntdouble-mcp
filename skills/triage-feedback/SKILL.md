---
name: triage-feedback
description: Review, categorise and manage Stunt Double feedback submissions (new items, severity, status, patterns) across projects.
---

# Triage feedback

1. **Pull:** `list_feedback(project_id, status: "new")`, then `get_feedback(feedback_id)` for actor context, screenshots and evidence.
2. **Assess each item:** valid issue or expected behaviour or test artefact; severity (blocker, major, minor, cosmetic); which personas are affected; new or a repeat.
3. **Set status:** `update_feedback_status(feedback_id, status)` with `"reviewed"` (triaged, needs action), `"resolved"` (fixed) or `"dismissed"` (false positive, duplicate or not actionable).
4. **Find patterns:** `list_actors(workspace_id)` and `list_workflows(workspace_id)` to see which personas and flows cover the affected areas; look for clusters by flow, persona or area.
5. **Summarise:** counts by status, top clusters, and recommended actions (new workflows, actor updates, fixes).
