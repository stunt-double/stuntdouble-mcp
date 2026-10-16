---
name: maintain-automations
description: "Change an existing Stunt Double workflow or checklist without losing run history: retime triggers, edit and rewire steps, build condition branches, update checks in place, pause or retire."
---

# Maintain automations

1. **Find and read:** `search(workspace_id, query)`, `list_workflows`, `list_checklists`. `get_workflow(workflow_id)` shows steps, connections, `execution_order` and `unreachable_step_ids`; read it before changing anything.
2. **Trigger and details:** `update_workflow(workflow_id, name?, description?, trigger_config?)`. For a schedule send `{ cron, timezone }` with the timezone from `get_me`.
3. **Steps:**
   - `update_workflow_step(step_id, config)` replaces the config in full: send every key.
   - `add_workflow_step(...)` appends and connects; `remove_workflow_step(step_id)` repoints its inputs at its outputs.
   - `reorder_workflow_steps(workflow_id, step_ids)` sets one linear order. Pass every id (one left out is disconnected); it flattens branches.
4. **Branches:** `connect_workflow_steps(workflow_id, source_step_id, target_step_id, branch)`. On a condition step `branch` is `'true'` or `'false'`; otherwise `null`. A step appended after a condition lands on `true`; `false` is unconnected by default, so a failed condition ends the run unless you connect it. `source_step_id: null` is the trigger; `target_step_id: null` disconnects.
5. **Checklists:** `get_checklist(checklist_id)`, then `update_checklist(checklist_id, checks=[…])` sending each existing check with its `id`. A kept id keeps run history; a dropped check is deleted with its results. Also adjustable: `instructions`, `url`, `actor_id`, `pass_threshold`, `run_mode`.
6. **Verify:** `get_workflow` again (all steps in `execution_order`, none unreachable), then `run_workflow` or `run_checklist` once.
7. **Pause or retire:** prefer `toggle_workflow` to pause. `delete_workflow` and `delete_checklist` discard all run history, so use them only when the user asks.

Example, notify only on failure: `add_workflow_step(workflow_id, step_type="condition", config={ field: "previous_step.failed", operator: "gt", value: 0 })`, then `add_workflow_step(workflow_id, step_type="notification", config={ channel: "email", recipients: { type: "all_members" }, template: "failed" })`.
