---
name: run-ux-validation
description: Validate a user journey by running Stunt Double workflows or checklists and reporting the results.
---

# Run UX validation

## When to use

- Before merging changes that affect user-facing flows
- After deploying to a staging environment
- When investigating reported UX friction
- As a pre-release quality gate

## Instructions

1. **Find the workspace and available validations:**
   - `list_workspaces()` → identify the target workspace
   - `list_workflows(workspace_id)` → find journey-level workflow tests
   - `list_checklists(workspace_id)` → find point-in-time quality checks

2. **Choose what to run:**
   - Workflows for end-to-end journeys (signup, checkout, onboarding)
   - Checklists for quality gates (accessibility, performance, content)
   - Run both if doing a full pre-release validation

3. **Trigger runs:**
   - `run_workflow(workflow_id)` → returns a run ID (async)
   - `run_checklist(checklist_id)` → returns a run ID (async)
   - You can trigger multiple runs in parallel

4. **Poll for results:**
   - `get_workflow_run(run_id)` → check status and step-level results
   - `get_checklist_run(run_id)` → check status and per-check results
   - Poll every few seconds until status shows complete

5. **Report results:**
   - List each workflow/checklist with pass/fail status
   - For failures, include the specific step that failed and what happened
   - Note which actor (persona) encountered the issue

6. **Follow up on failures:**
   - `list_feedback(project_id)` → check for related feedback
   - `get_feedback(feedback_id)` → read full context on issues
   - `update_feedback_status(feedback_id, status: "reviewed")` → mark triaged items
   - Suggest code changes or flag for the team

## Example output

```
UX Validation Results — staging (2026-03-28)

Workflows:
  [PASS] Signup → First Project (6/6 steps)
  [FAIL] Checkout Flow (failed at step 4: payment form timeout)
  [PASS] Team Invite (3/3 steps)

Checklists:
  [PASS] Performance (5/5 checks)
  [FAIL] Accessibility (6/8 checks — contrast ratio, focus order failed)

Summary: 2 failures found. Payment form timeout is a blocker.
Recommend fixing before release.
```
