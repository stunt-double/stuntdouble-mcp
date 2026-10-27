---
name: run-ux-validation
description: Validate a user journey before merge or release by running Stunt Double workflows and checklists and reporting pass or fail with failure detail.
---

# Run UX validation

1. **Find validations:** `list_workspaces()`, `list_workflows(workspace_id)` (end-to-end journeys), `list_checklists(workspace_id)` (quality gates). Run both for a full pre-release pass.
2. **Trigger in parallel:** `run_workflow(workflow_id)`, `run_checklist(checklist_id)`; both are async.
3. **Poll:** `get_workflow_run(run_id)`, `get_checklist_run(run_id)` until terminal.
4. **Report:** pass or fail for each; for failures the failing step or check, what happened, and which actor hit it.
5. **Follow up:** `list_feedback(project_id)` and `get_feedback(feedback_id)` for related issues, `update_feedback_status(feedback_id, status: "reviewed")` for triaged items, then suggest fixes or flag for the team.
