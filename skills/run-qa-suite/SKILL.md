---
name: run-qa-suite
description: Runs every Stunt Double workflow and checklist for a workspace or project in parallel, polls them to completion, compares each with its previous run and produces a GO, CONDITIONAL or NO-GO release-readiness report. Use when the user asks for release readiness, a go/no-go, a full regression or QA pass, a smoke test of everything before a release, or a quality snapshot after a major refactor.
---

# Run QA suite

Tools are on the `stuntdouble` MCP server and are named bare below: `run_checklist` is `stuntdouble:run_checklist` (in Claude Code, `mcp__stuntdouble__run_checklist`). Every tool returns an object; list results sit under a plural key.

For one change or one flow, use `run-ux-validation` or `verify-change` instead.

## Workflow

```
Task progress:
- [ ] Step 1: Discover the suite
- [ ] Step 2: Trigger every run
- [ ] Step 3: Poll every run to a terminal status
- [ ] Step 4: Compare with previous runs
- [ ] Step 5: Check new feedback on the release
- [ ] Step 6: Give the verdict
```

1. **Discover the suite.** `list_workspaces`, then `list_workflows(workspace_id)` and `list_checklists(workspace_id)`. Scope to the project being released when the user names one. Skip any checklist that a workflow in the suite already runs as a step, or it runs twice. More than 10 runs in total? Tell the user the count before triggering, since every run counts toward the plan.

2. **Trigger everything in parallel.** `run_workflow(workflow_id)` and `run_checklist(checklist_id)` for each, keeping every `run_id` with its name. A refusal for a plan limit or budget cap stops the suite: report it rather than retrying.

3. **Poll to terminal.**
   - `get_workflow_run(run_id)` every 60 seconds until `status` is `completed`, `failed` or `cancelled`; a failed step's `output` says why.
   - `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`; judge by `outcome` (`passed`, `failed`, `inconclusive`). `waiting_for_input` means an actor needs a person: tell the user to answer it in the run's live view.
   - After 30 minutes, stop polling and list anything still running as "not finished" in the report.

4. **Compare.** A completed checklist run carries `comparison`: `regression_count` and `changes` say what got worse since the last run, which is usually the headline. For workflows, `get_workflow(workflow_id)` gives `recent_runs`.

5. **New feedback.** `list_feedback(project_id, status="new", since=<release candidate deploy time>)` for comments left on the release candidate through the feedback widget. Include any that look like blockers.

6. **Verdict.** Apply the first rule that matches:
   - **NO-GO**: any failure on a business-critical flow (signup, sign-in, checkout, payment), or any new regression a customer would hit.
   - **CONDITIONAL**: failures only on non-critical checks, each one listed as a known issue.
   - **GO**: everything passed with no new regressions.

## Report template

```
QA suite: v2.5.0 release candidate (staging.example.com)
VERDICT: CONDITIONAL

Workflows (4)
  [PASS] Signup to first project ........ 6/6 steps
  [FAIL] Team onboarding ................ step 5: invite email not received
  [PASS] Checkout ....................... 5/5 steps
  [PASS] Account settings ............... 4/4 steps

Checklists (3)
  [PASS] Core accessibility ............. 10/10 checks
  [FAIL] Content quality ................ 7/8 (placeholder text on billing page, new since last run)
  [PASS] Performance budget ............. 5/5 checks

New feedback: 1 ("undefined" in the invite success message)

Known issues to ship with: invite email delivery, billing placeholder text.
```
