---
name: verify-change
description: Verify a shipped or previewed code change by running a Stunt Double actor through the affected user flows, and optionally report results on the pull request.
---

# Verify change

## When to use

- A code change has landed on a preview deployment, staging, or production and needs checking before merge or release
- A PR has a preview URL and you want evidence the change works and nothing adjacent regressed
- You want a reusable regression suite for a flow, not a one-off manual pass

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace (use it silently if there is only one)
   - `list_projects(workspace_id)` → match the preview URL or product name against an existing project. Tools that take a `url` (like `create_checklist`) will find or create the project for you.

2. **Pick an actor:**
   - `list_actors(workspace_id)` → reuse a QA-style actor if one exists
   - `create_actor(...)` if the workspace has none; a plain "QA tester" actor is fine

3. **Create a checklist against the preview URL:**
   - `create_checklist(...)` with the preview URL as the host
   - `instructions` — describe how to exercise the changed flows as a real user would
   - `checks` — specific pass/fail statements covering: the new behaviour works, adjacent flows did not regress, and error states behave. 4–8 checks is the sweet spot.

4. **Run and poll:**
   - `run_checklist(checklist_id)` → returns a run ID (async)
   - `get_checklist_run(run_id)` → poll every 30–60s until terminal. Each check result carries evidence.

5. **Report:**
   - If any check fails, summarise the failure with its evidence and the likely fix. If you can edit the code, offer to fix and re-run the same checklist against the updated preview.
   - If a pull request is associated with the change, post the results with `comment_on_pr` (owner/repo#number): a short verdict line, then a table of checks with pass/fail and evidence highlights.

6. **Keep it as a regression suite:**
   - Suggest re-running the checklist on the next change to this area, or wire it to a schedule or GitHub events with `create_workflow` (see the `setup-guardrails` skill).

## Example output

```
Change verification — preview deploy (signup validation rework)

[PASS] New inline validation shows on blur, not just submit
[PASS] Valid email + password creates the account and lands on /welcome
[FAIL] Password < 8 chars: form submits anyway, no error shown (evidence: screenshot, network 200)
[PASS] Existing OAuth sign-in still works
[PASS] Duplicate email shows the "account exists" message

Verdict: 1 blocker. Client-side length check is bypassable — server accepts the weak password.
Posted to acme/web#482. Re-run this checklist after the fix.
```

## Tips

- **Small, focused checklists give clearer signals.** Cover one change area per checklist rather than one giant list.
- **Write checks a human could verify on the rendered page.** Actors see the product like a user does, so phrase checks by observable behaviour, not code.
- **Pair with `setup-guardrails`** once the checklist is green, to keep the flow covered on every future deploy.
