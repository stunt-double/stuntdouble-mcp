---
name: verify-change
description: Verify a code change on a preview, staging or production URL by running a Stunt Double actor through the affected flows, and optionally post the results on the pull request.
---

# Verify change

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`. Tools that take a `url` (like `create_checklist`) find or create the project. Starting from a PR: `list_pull_requests(workspace_id, owner, repo, state="open")` and `get_pull_request(workspace_id, owner, repo, pr_number)` show which flows to exercise (needs the workspace GitHub connection). The preview URL usually comes from the user or the deploy, not the PR details.
2. **Actor:** `list_actors(workspace_id)`, reusing a QA-style actor, else `create_actor(...)`.
3. **Checklist:** `create_checklist(...)` with the preview URL as host, `instructions` for exercising the changed flows like a real user, and 4 to 8 `checks` covering the new behaviour, adjacent flows and error states. Phrase checks by observable behaviour, not code; one change area per checklist.
4. **Run:** `run_checklist(checklist_id)`, poll `get_checklist_run(run_id)` until terminal. Each check carries evidence.
5. **Report:** for failures, give the evidence and likely fix; if you can edit the code, offer to fix and re-run the same checklist. With an associated PR, post a verdict line and a table of checks with `comment_on_pr` (owner/repo#number).
6. **Keep it:** re-run on the next change to the area, or wire it up with `create_workflow` (see `setup-guardrails`).
