---
name: setup-guardrails
description: Sets up continuous Stunt Double guardrails for business-critical flows, one focused checklist per flow confirmed green, plus an automation (workflow) that re-runs them on a schedule or on Vercel deploys and GitHub pull requests and notifies the team on failure. Use when the user wants regression monitoring, to stop signup, login, checkout or password reset from silently breaking, scheduled or on-deploy checks, synthetic monitoring, or to keep a just-verified change covered.
---

# Set up guardrails

Tools are on the `stuntdouble` MCP server and are named bare below: `create_workflow` is `stuntdouble:create_workflow` (in Claude Code, `mcp__stuntdouble__create_workflow`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace, project and actor
- [ ] Step 2: Reuse or create one checklist per flow
- [ ] Step 3: Read the project's guidelines
- [ ] Step 4: Get a green baseline
- [ ] Step 5: Create the workflow and its steps
- [ ] Step 6: Check the graph, then activate
- [ ] Step 7: Confirm coverage to the user
```

1. **Resolve context.** `list_workspaces` (use the only one silently), `list_projects(workspace_id)`, and an actor from `list_actors(workspace_id)`. No actor? `create_actor(workspace_id, name="QA tester", description=…)`.

2. **One checklist per flow.** `search(workspace_id, query="<flow>", types=["checklist"])` first and reuse what exists: its run history is the regression signal. Otherwise `create_checklist(workspace_id, name, actor_id, instructions, checks, url)` with 3 to 6 crisp pass/fail checks. Small checklists give clearer failure signals than one large one.

3. **Read the standards.** `list_project_guidelines(project_id)`. Guidelines reach every run, so checks can assert them rather than restate them. Add a missing standard with `add_project_guideline`.

4. **Green baseline.** `run_checklist(checklist_id)` for each, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Every checklist must reach `outcome: "passed"`. A check that fails for the wrong reason or flips between runs: reword it with `update_checklist` (keep its `id`) and run again. Do not automate until all are green; a noisy guardrail gets ignored. After 15 minutes without a terminal status, stop and give the user the run id.

5. **Create the workflow.** Pick the trigger in this order (ask the user which connections the workspace has if unsure):
   - **Deploys**, when Vercel is connected: `trigger_type="vercel_event"`, and set `use_deployment_url: true` on each `run_checklist` step so it tests the new deployment.
   - **Pull requests**, when GitHub is connected: `trigger_type="github_event"`.
   - **Daily schedule** otherwise (it also catches content-only regressions): `trigger_type="schedule"`, `trigger_config={ cron: "0 8 * * *", timezone }` with the IANA timezone from `get_me`.

   Default to **one workflow per flow**, because a condition step only sees the output of the step directly before it. `create_workflow(workspace_id, name, project_id, trigger_type, trigger_config)`, then `add_workflow_step(workflow_id, step_type, config)` three times, in run order (each call appends and connects):
   1. `run_checklist` with `{ checklist_id }`
   2. `condition` with `{ field: "previous_step.failed", operator: "gt", value: 0 }`
   3. `notification` with `{ channel: "email", recipients: { type: "all_members" }, template: "failed" }`, which lands on the condition's `true` path

   A notification step always sends when reached (the template only sets the wording), so without the condition the team gets an email on every run.

6. **Check, then activate.** `get_workflow(workflow_id)`: every step must be in `execution_order` and `unreachable_step_ids` must be empty. Then `toggle_workflow(workflow_id, is_active=true)`. Optionally `run_workflow(workflow_id)` once and poll `get_workflow_run(run_id)` every 60 seconds until `completed`, `failed` or `cancelled`.

7. **Confirm coverage**: what is covered, when it runs, where failures go, and how to extend it (another checklist with its own guardrail workflow). Everything is manageable at app.stuntdouble.io. Later changes: see `maintain-automations`.

## Example flow

```
list_workspaces()
list_projects(workspace_id="…")
get_me()                                               # timezone for the schedule

create_checklist(workspace_id, name="Signup", actor_id, url="https://acme.com", instructions="…", checks=[…])
create_checklist(workspace_id, name="Checkout", actor_id, url="https://acme.com", instructions="…", checks=[…])
run_checklist(signup_id); get_checklist_run(run_id)    # poll until outcome is passed
run_checklist(checkout_id); get_checklist_run(run_id)

# One workflow per flow; repeat for checkout
create_workflow(workspace_id, name="Signup guardrail", project_id,
  trigger_type="schedule", trigger_config={ cron: "0 8 * * *", timezone: "Australia/Sydney" })
add_workflow_step(workflow_id, step_type="run_checklist", config={ checklist_id: signup_id })
add_workflow_step(workflow_id, step_type="condition",
  config={ field: "previous_step.failed", operator: "gt", value: 0 })
add_workflow_step(workflow_id, step_type="notification",
  config={ channel: "email", recipients: { type: "all_members" }, template: "failed" })
get_workflow(workflow_id)                              # nothing unreachable
toggle_workflow(workflow_id, is_active=true)
```

## Gotchas

- **Baseline first.** Never automate a red or flaky checklist: it trains the team to ignore alerts.
- **A workflow with no steps does nothing** when it fires, and a step missing from `execution_order` never runs.
- **The standards skills build on this.** `check-brand`, `check-design-system`, `check-compliance` and `check-continuity` all end by wiring their checklists into a workflow this way.
