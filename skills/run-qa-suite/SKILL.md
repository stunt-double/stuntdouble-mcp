---
name: run-qa-suite
description: Run every Stunt Double workflow and checklist in a workspace and produce a GO, CONDITIONAL or NO-GO release-readiness report.
---

# Run QA suite

1. **Discover:** `list_workspaces()`, `list_workflows(workspace_id)`, `list_checklists(workspace_id)`.
2. **Trigger all in parallel:** `run_workflow(workflow_id)` and `run_checklist(checklist_id)` for each, collecting run IDs.
3. **Poll to completion:** `get_workflow_run(run_id)`, `get_checklist_run(run_id)`.
4. **Report:** each workflow and checklist with pass or fail; for failures the step or check, actor and what went wrong. `get_workflow(workflow_id)` returns `recent_runs` for comparison.
5. **New feedback:** `list_feedback(project_id, status: "new")` for issues the runs surfaced, and include them.
6. **Verdict:** GO (all pass, no new blockers), CONDITIONAL (minor issues only, list known issues), NO-GO (blocker failures, list what must be fixed).
