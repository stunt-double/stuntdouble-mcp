---
name: maintain-automations
description: "Change an existing Stunt Double automation or checklist without losing run history: retime triggers, edit and rewire workflow steps, build condition branches, update checks in place, and pause or retire what is no longer needed."
---

# Maintain automations

## When to use

- A workflow needs a different schedule, trigger, notification or set of checklists
- A checklist's checks drifted from the product (renamed buttons, new flow steps) and keep failing for the wrong reason
- You want a branch: notify only on failure, or run a follow-up only when a condition holds
- An automation or checklist is obsolete

## Instructions

1. **Find what exists:**

   - `search(workspace_id, query)` or `list_workflows(workspace_id)` / `list_checklists(workspace_id)`
   - `get_workflow(workflow_id)` shows the steps, their connections, `execution_order` (the order a run actually takes) and `unreachable_step_ids`. Read it before changing anything.

2. **Change the trigger or details:**

   - `update_workflow(workflow_id, name?, description?, trigger_config?)`. For a schedule, send `{ cron, timezone }` with the timezone from `get_me`, so the hour is the user's hour. The schedule syncs on save.

3. **Edit steps:**

   - `update_workflow_step(step_id, config)` replaces the config in full: send every key the step needs, not just the changed one.
   - `add_workflow_step(...)` appends and connects a new step; `remove_workflow_step(step_id)` removes one and repoints whatever led into it at whatever it led to.
   - `reorder_workflow_steps(workflow_id, step_ids)` sets one linear order. Pass every step id: one left out is disconnected. It flattens branches, so rebuild any fork afterwards.

4. **Build or repair a branch:**

   - `connect_workflow_steps(workflow_id, source_step_id, target_step_id, branch)`. On a condition step, `branch: 'true'` is the path when it holds and `'false'` when it does not; every other step uses `null`.
   - A step appended after a condition lands on its `true` path. The `false` handle is unconnected by default, so a condition that does not hold ends the run. Connect it when that outcome should do something too.
   - `source_step_id: null` means the trigger. `target_step_id: null` disconnects that handle.

5. **Update a checklist in place:**

   - `get_checklist(checklist_id)` first, then `update_checklist(checklist_id, checks=[…])` sending each existing check with its `id`. A check that keeps its id keeps its run history; one dropped from the list is deleted with its past results.
   - Also adjustable: `instructions`, `url`, `actor_id`, `pass_threshold`, `run_mode` (`code` replays a recorded run).

6. **Verify before leaving it:**

   - `get_workflow(workflow_id)` again: every step in `execution_order`, nothing in `unreachable_step_ids`.
   - `run_workflow(workflow_id)` or `run_checklist(checklist_id)` once and confirm the result is what the change intended.

7. **Pause or retire:**
   - Prefer `toggle_workflow(workflow_id)` to pause. `delete_workflow` and `delete_checklist` discard all run history, so use them only when the user asks for deletion.

## Example flow

```
get_workflow(workflow_id)                          # read execution_order first

# Move the daily run to 7am the user's time
update_workflow(workflow_id, trigger_config={ cron: "0 7 * * *", timezone: "Europe/London" })

# Notify only when something fails
add_workflow_step(workflow_id, step_type="condition",
  config={ field: "previous_step.failed", operator: "gt", value: 0 })     # appended after the checklists
add_workflow_step(workflow_id, step_type="notification",
  config={ channel: "email", recipients: { type: "all_members" }, template: "failed" })   # lands on the true path
# Ends quietly when nothing failed; to report a pass too, connect the false handle:
# connect_workflow_steps(workflow_id, source_step_id=condition_id, target_step_id=pass_notice_id, branch="false")

# Reword a check without losing its history
get_checklist(checklist_id)
update_checklist(checklist_id, checks=[{ id: "…", … }, …])

get_workflow(workflow_id)                          # nothing unreachable
run_workflow(workflow_id)
```

## Tips

- **Read, change, read again.** `get_workflow` before and after any edit is the cheapest way to catch a step no run will reach.
- **Keep check ids.** Rewording a check under its old id keeps it comparable with earlier runs; a new id starts its history over.
- **Pause, don't delete.** Deleting is irreversible and loses the history that shows when something regressed.
