---
name: run-ux-validation
description: Validates one user journey or area with the Stunt Double workflows and checklists that already cover it, runs them, polls to completion and reports pass or fail per step and check with the actor's evidence. Use when the user asks whether a flow still works (signup, checkout, onboarding), wants a smoke test after a staging deploy, wants to reproduce reported UX friction or a bug with an actor, or wants a quick quality gate on one area before merging.
---

# Run UX validation

Tools are on the `stuntdouble` MCP server and are named bare below: `run_workflow` is `stuntdouble:run_workflow` (in Claude Code, `mcp__stuntdouble__run_workflow`). Every tool returns an object; list results sit under a plural key.

This runs existing coverage. No checklist covers the flow yet? Use `verify-change` to create one. Need everything at once? Use `run-qa-suite`.

## Workflow

```
Task progress:
- [ ] Step 1: Find the coverage for the journey
- [ ] Step 2: Trigger the runs
- [ ] Step 3: Poll each run to a terminal status
- [ ] Step 4: Report per step and check
- [ ] Step 5: Follow up on failures
```

1. **Find the coverage.** `list_workspaces`, then `search(workspace_id, query="<journey>", types=["workflow", "checklist"])`. Fall back to `list_workflows(workspace_id)` and `list_checklists(workspace_id)`. Workflows cover end-to-end journeys; checklists cover one flow or a quality gate (accessibility, content). Nothing matches? Say so and offer `verify-change`.

2. **Trigger.** `run_workflow(workflow_id)` and `run_checklist(checklist_id)`, in parallel, keeping each `run_id`.

3. **Poll to terminal.**
   - `get_workflow_run(run_id)` every 60 seconds until `status` is `completed`, `failed` or `cancelled`.
   - `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`; judge by `outcome`. `waiting_for_input` means the actor needs a person: tell the user to answer it in the run's live view.
   - After 15 minutes without a terminal status, stop and report the run ids as still running.

4. **Report** with the template below: pass or fail per workflow and checklist, and for each failure the step or check, what the actor saw (`evidence`), and which actor ran it. A completed checklist run's `comparison.changes` says whether a failure is new since the last run.

5. **Follow up on failures.**
   - `list_feedback(project_id, page_path=…)` for comments already left on the failing page; `get_feedback(feedback_id)` for the details and screenshot.
   - Once a fix is verified by a passing run, `update_feedback_status(feedback_id, status="resolved")`.
   - Can you edit the code? Offer to fix and re-run the same checklist.

## Report template

```
UX validation: checkout on staging
Verdict: 1 blocker

Workflows
  [PASS] Signup to first project (6/6 steps)
  [FAIL] Checkout (step 4: payment form timed out after submit; new since last run)

Checklists
  [FAIL] Accessibility (6/8: contrast on Pay button, focus order in card modal)

Blocker: payment form timeout. Fix before release.
```
