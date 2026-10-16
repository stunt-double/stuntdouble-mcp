---
name: setup-guardrails
description: Set up continuous guardrails on Stunt Double for critical flows (signup, checkout, sign-in): checklists plus a workflow that re-runs them on a schedule or on deploy and PR events.
---

# Set up guardrails

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`; `list_actors(workspace_id)`, else `create_actor(...)`.
2. **One checklist per flow:** `create_checklist(...)` with focused instructions and 3 to 6 crisp pass/fail checks. Small checklists give clearer failure signals.
3. **Standards:** `list_project_guidelines(project_id)`, then `add_project_guideline(...)` for anything missing. Guidelines reach every run, so checks can assert them without restating them.
4. **Green baseline first:** `run_checklist(checklist_id)` for each and poll `get_checklist_run(run_id)`. Fix flaky checks now; a noisy guardrail gets ignored.
5. **Automate:** `create_workflow(...)` with a trigger: `schedule` with `{ cron, timezone }` in `trigger_config` (timezone from `get_me`; daily is a good default), or `vercel_event` / `github_event` for deploys and PRs when those connections exist (preferred; a schedule also catches content-only regressions).
6. **Steps:** `add_workflow_step(workflow_id, step_type, config)` appends and connects, so add in run order: one `run_checklist` step per checklist (`config={ checklist_id }`), then a `notification` step (`config={ channel: "email", recipients: { type: "all_members" }, template: "failed" }`).
7. **Check and activate:** `get_workflow(workflow_id)`: `execution_order` must cover every step and `unreachable_step_ids` be empty. Then `toggle_workflow(workflow_id)`.
8. **Tell the user** what is covered, when it runs, where failures go, and how to extend it. Everything is manageable at app.stuntdouble.io.
