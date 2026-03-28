---
name: run-qa-suite
description: Run the full Stunt Double QA suite — all workflows and checklists — and produce a release-readiness report.
---

# Run QA suite

## When to use

- Before a release to validate all critical user journeys
- After a major refactor to check for regressions
- On a scheduled cadence (weekly, per-sprint) for continuous quality monitoring
- When onboarding a new team member who wants to see current product quality

## Instructions

1. **Discover the workspace and all validations:**
   - `list_workspaces()` → find the target workspace
   - `list_workflows(workspace_id)` → get all journey workflows
   - `list_checklists(workspace_id)` → get all quality checklists

2. **Trigger all runs:**
   - `run_workflow(workflow_id)` → trigger each workflow (collect all run IDs)
   - `run_checklist(checklist_id)` → trigger each checklist (collect all run IDs)
   - Trigger all runs in parallel for speed

3. **Poll all runs to completion:**
   - `get_workflow_run(run_id)` → poll each workflow run
   - `get_checklist_run(run_id)` → poll each checklist run
   - Wait until all runs have completed

4. **Compile the QA report:**
   - List every workflow and checklist with pass/fail
   - For failures: include step name, actor, and what went wrong
   - Compare against previous runs if available: `list_workflow_runs(workflow_id)`

5. **Check for new feedback generated:**
   - `list_feedback(project_id, status: "new")` → see if runs surfaced new issues
   - Include any new feedback in the report

6. **Produce a release-readiness verdict:**
   - **GO** — all workflows and checklists pass, no new blockers
   - **CONDITIONAL** — minor issues found but no blockers, document known issues
   - **NO-GO** — blocker-level failures, list what must be fixed

## Example report

```
QA Suite Report — v2.5.0 Release Candidate
Environment: staging.example.com
Date: 2026-03-28

WORKFLOWS (4 total):
  [PASS] Signup → First Project ............ 6/6 steps
  [PASS] Checkout Flow .................... 5/5 steps
  [FAIL] Team Onboarding .................. 4/7 steps (step 5: invite email not received)
  [PASS] Account Settings ................. 4/4 steps

CHECKLISTS (3 total):
  [PASS] Core Accessibility ............... 10/10 checks
  [PASS] Performance Budget ............... 5/5 checks
  [FAIL] Content Quality .................. 7/8 checks (placeholder text on billing page)

VERDICT: CONDITIONAL
  - 1 workflow failure (team invite email delivery) — non-blocking, known infra issue
  - 1 checklist failure (placeholder text) — cosmetic, can ship with known issue

NEW FEEDBACK: 2 items surfaced during this run
  - FB-401: Invite flow shows "undefined" in success message
  - FB-402: Billing page has "Lorem ipsum" in FAQ section

RECOMMENDATION: Safe to release with documented known issues.
Fix invite email and billing placeholder in next patch.
```
