---
name: setup-guardrails
description: Stand up continuous guardrails on Stunt Double — checklists for critical user flows plus a workflow that re-runs them on a schedule or on deploy/PR events, so regressions surface before users do.
---

# Set up guardrails

## When to use

- A flow is business-critical (signup, sign-in, checkout, password reset) and must not silently break
- You want regressions caught on every deploy or on a schedule, not by customers
- You already verified a change (see `verify-change`) and want to keep that coverage standing

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → match the product URL to a project, or let `create_checklist` find/create it

2. **Ensure an actor exists:**
   - `list_actors(workspace_id)`, else `create_actor(...)`

3. **One checklist per flow:**
   - `create_checklist(...)` per critical flow, each with focused instructions and 3–6 crisp pass/fail checks
   - Small, focused checklists give clearer failure signals than one giant checklist

4. **Confirm a green baseline before automating:**
   - `run_checklist(checklist_id)` for each, poll `get_checklist_run(run_id)` until terminal
   - Fix flaky checks now — a noisy guardrail gets ignored

5. **Automate re-runs with a workflow:**
   - `create_workflow(...)` with a trigger:
     - `schedule` with a cron (daily is a good default), or
     - event triggers (`vercel_event`, `github_event`) to run on deploys and pull requests when those connections are configured in the workspace
   - `add_workflow_step(...)` — one `run_checklist` step per checklist, plus a `notification` step so failures reach the team
   - `toggle_workflow(workflow_id)` to activate

6. **Confirm coverage to the user:**
   - What is covered, when it runs, where failures are reported, and how to extend it (add a checklist, then add a step)
   - Manage everything later at app.stuntdouble.io

## Example flow

```
list_workspaces()
list_projects(workspace_id="…")

# One checklist per critical flow
create_checklist(url="https://acme.com", name="Signup", instructions="…", checks=[…])   # 3–6 checks
create_checklist(url="https://acme.com", name="Checkout", instructions="…", checks=[…])

# Baseline
run_checklist(signup_id); get_checklist_run(run_id)   # confirm green
run_checklist(checkout_id); get_checklist_run(run_id)

# Automate
create_workflow(name="Critical flows", trigger_type="schedule", cron="0 8 * * *")
add_workflow_step(workflow_id, type="run_checklist", config={ checklist_id: signup_id })
add_workflow_step(workflow_id, type="run_checklist", config={ checklist_id: checkout_id })
add_workflow_step(workflow_id, type="notification", config={ … })
toggle_workflow(workflow_id)   # activate
```

## Tips

- **Baseline first.** Never automate a red or flaky checklist — you will just train the team to ignore alerts.
- **Prefer deploy/PR triggers** when the connection exists; a schedule is the fallback that also catches content-only regressions.
- **The standards skills build on this.** `check-brand`, `check-design-system`, `check-compliance`, and `check-continuity` all end by wiring their checklists into a workflow the same way.
