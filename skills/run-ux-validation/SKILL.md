---
name: run-ux-validation
description: Validate a user journey by running Stunt Double workflows or checklists and reporting the results.
---

# Run UX validation

## When to use

- Before merging changes that affect user-facing flows
- After deploying to a staging environment
- When investigating reported UX friction

## Instructions

1. Use `list_workspaces` to identify the target workspace.
2. Use `list_workflows` or `list_checklists` to find the relevant validation.
3. Trigger the run with `run_workflow` or `run_checklist`.
4. Poll `get_workflow_run` or `get_checklist_run` until the run completes.
5. Summarize the results, highlighting any failed steps or flagged friction points.
6. If issues are found, check `list_feedback` for additional context and suggest fixes.
