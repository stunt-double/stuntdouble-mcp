---
name: maintain-automations
description: Changes existing Stunt Double automations (workflows) and checklists without losing run history, covering schedule and trigger changes, editing, reordering and rewiring steps, condition branches such as notify only on failure, rewording checks in place, and pausing rather than deleting. Use when the user wants to change when a workflow runs, edit or reorder its steps, add a failure-only notification, fix checks that fail because the product changed (renamed buttons, new flow steps), or pause, retire or clean up automations.
---

# Maintain automations

Tools are on the `stuntdouble` MCP server and are named bare below: `get_workflow` is `stuntdouble:get_workflow` (in Claude Code, `mcp__stuntdouble__get_workflow`). Every tool returns an object; list results sit under a plural key.

An automation (workflow in the tools) is a graph: its steps run by following the connections between them. Read the graph before and after every edit.

## Workflow

```
Task progress:
- [ ] Step 1: Find the workflow or checklist and read it
- [ ] Step 2: Make the change (trigger, steps, branch or checks)
- [ ] Step 3: Read the graph again
- [ ] Step 4: Run once and confirm the result
```

1. **Find and read.** `search(workspace_id, query)`, or `list_workflows(workspace_id)` / `list_checklists(workspace_id)`. Then `get_workflow(workflow_id)`: it lists `steps`, their edges, `execution_order` (the order a run actually takes) and `unreachable_step_ids`.

2. **Make the change.** Pick the matching section below.

3. **Read again.** `get_workflow(workflow_id)`: every step must appear in `execution_order` and `unreachable_step_ids` must be empty. If not, fix the edge with `connect_workflow_steps` and read again.

4. **Run once.** `run_workflow(workflow_id)`, then poll `get_workflow_run(run_id)` every 60 seconds until `status` is `completed`, `failed` or `cancelled`. Or `run_checklist(checklist_id)` and poll `get_checklist_run(run_id)` every 30 to 60 seconds until `completed` or `failed`. Confirm the result is what the change intended. After 30 minutes without a terminal status, stop and give the user the run id.

### Trigger or details

`update_workflow(workflow_id, name?, description?, trigger_type?, trigger_config?)`. `trigger_config` replaces the stored config in full. For a schedule send `{ cron, timezone }` with the IANA timezone from `get_me`, so the hour is the user's hour. The schedule syncs on save.

### Steps

- `update_workflow_step(step_id, config)` replaces the config in full: send every key the step needs, not just the changed one.
- `add_workflow_step(workflow_id, step_type, config)` appends and connects; pass `sort_order` to splice it in at a position instead.
- `remove_workflow_step(step_id)` removes a step and reconnects whatever led into it to whatever it led to.
- `reorder_workflow_steps(workflow_id, step_ids)` sets one linear order. Pass every step id. It flattens branches, so rebuild any fork afterwards.

### Branches

- `connect_workflow_steps(workflow_id, source_step_id, target_step_id, branch)`. On a condition step, `branch: "true"` is the path when it holds and `"false"` when it does not; every other step uses `null`.
- A condition reads `previous_step.<key>` from the step directly before it only (a `run_checklist` step outputs `status`, `passed`, `failed`, `errors`), so put one after each checklist it should judge.
- A step appended after a condition lands on its `true` path. The `false` handle starts unconnected, so a condition that does not hold ends the run. Connect it when that outcome should do something.
- `source_step_id: null` is the trigger. `target_step_id: null` disconnects that handle.

### Checks

`get_checklist(checklist_id)` first, then `update_checklist(checklist_id, checks=[…])` sending every existing check with its `id`. A check that keeps its id keeps its run history; one left out of the list is deleted with its past results. Also adjustable: `instructions`, `url`, `actor_id`, `pass_threshold`, `run_mode` (`code` replays a recorded run; `agentic` judges each run afresh).

### Pause or retire

`toggle_workflow(workflow_id, is_active=false)` pauses and keeps everything; `is_active=true` resumes. `delete_workflow` and `delete_checklist` discard all run history: use them only when the user explicitly asks for deletion.

## Example flow

```
get_workflow(workflow_id)                          # read execution_order first

# Move the daily run to 7am the user's time
update_workflow(workflow_id, trigger_config={ cron: "0 7 * * *", timezone: "Europe/London" })

# Notify only when the checklist before it fails (a notification step always sends when reached)
add_workflow_step(workflow_id, step_type="condition",
  config={ field: "previous_step.failed", operator: "gt", value: 0 })     # appended after the run_checklist step
add_workflow_step(workflow_id, step_type="notification",
  config={ channel: "email", recipients: { type: "all_members" }, template: "failed" })   # lands on the true path
# To also report a pass, connect the false handle:
# connect_workflow_steps(workflow_id, source_step_id=condition_id, target_step_id=pass_notice_id, branch="false")

# Reword a check without losing its history
get_checklist(checklist_id)
update_checklist(checklist_id, checks=[{ id: "…", description: "…" }, …])

get_workflow(workflow_id)                          # nothing unreachable
run_workflow(workflow_id)
```

## Gotchas

- **Keep check ids.** Rewording a check under its old id keeps it comparable with earlier runs; a new id starts its history over.
- **Pause, don't delete.** Deleting is irreversible and loses the history that shows when something regressed.
