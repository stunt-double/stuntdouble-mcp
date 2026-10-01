---
name: verify-change
description: Verifies a code change on a preview deployment, staging or production by having a Stunt Double actor exercise the affected flows through a focused checklist, reporting each check with evidence, and optionally posting the verdict on the GitHub pull request. Use when the user has a PR, a Vercel or Netlify preview URL or a fresh deploy and asks whether the change works, wants to check for regressions before merging, wants an actor to test a fix, or wants results commented on the PR.
---

# Verify change

Tools are on the `stuntdouble` MCP server and are named bare below: `create_checklist` is `stuntdouble:create_checklist` (in Claude Code, `mcp__stuntdouble__create_checklist`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace, project and the change
- [ ] Step 2: Pick an actor
- [ ] Step 3: Create or reuse a checklist on the preview URL
- [ ] Step 4: Run and poll to a terminal status
- [ ] Step 5: Fix and re-run until it passes (if you can edit the code)
- [ ] Step 6: Report, and comment on the PR if there is one
- [ ] Step 7: Offer standing coverage
```

1. **Resolve context.**
   - `list_workspaces` (use the only one silently), then `list_projects(workspace_id)` and match the preview URL or product name. No project? `create_checklist` with a `url` finds or creates one.
   - Starting from a pull request rather than a diff: `list_pull_requests(workspace_id, owner, repo)` finds it and `get_pull_request(workspace_id, owner, repo, pr_number)` gives its title, description, branches and change stats, which say which flows to exercise. Both need the workspace's GitHub connection. The preview URL comes from the user or the deploy; the PR details do not include it.

2. **Pick an actor.** Reuse a QA-style actor from `list_actors(workspace_id)`; otherwise `create_actor(workspace_id, name="QA tester", description=…)`.

3. **Create the checklist.** `search(workspace_id, query="<flow>", types=["checklist"])` first: an existing checklist for this flow can be pointed at the preview with `update_checklist(checklist_id, url)` and keeps its history. Otherwise `create_checklist(workspace_id, name, actor_id, url=<preview URL>, instructions, checks)`:
   - `instructions`: how a real user would exercise the changed flows.
   - `checks`: 4 to 8 observable pass/fail statements covering the new behaviour, adjacent flows that must not regress, and error states.

4. **Run and poll.** `run_checklist(checklist_id)`, then `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed` (usually a few minutes). Judge by `outcome` (`passed`, `failed`, `inconclusive`) and read each result's `evidence`. `waiting_for_input` means the actor needs a person: tell the user to answer it in the run's live view. After 15 minutes without a terminal status, stop and give the user the run id.

5. **Feedback loop.** On a failure you can fix: fix the code, wait for the new preview, re-run the same checklist and poll again. Repeat until `outcome` is `passed`, or stop after three attempts and hand over with the evidence. A check that fails because it is worded wrongly (not because the product is wrong): correct it with `update_checklist`, keeping its `id`.

6. **Report** with the template below. With a PR: `comment_on_pr(workspace_id, owner, repo, pr_number, body)` with the verdict line first, then the checks table; link the run rather than pasting transcripts.

7. **Offer standing coverage.** Re-run this checklist on the next change to the area, or wire it to deploys or pull requests (see `setup-guardrails`).

## Report template

```
Change verification: signup validation rework (preview)
Verdict: 1 blocker

| Check                                               | Result | Evidence                          |
| --------------------------------------------------- | ------ | --------------------------------- |
| Inline validation shows on blur                     | PASS   | Error shown after leaving field   |
| Valid email and password create the account         | PASS   | Landed on /welcome                |
| Password under 8 characters is rejected             | FAIL   | Form submitted, no error shown    |
| OAuth sign-in still works                           | PASS   |                                   |
| Duplicate email shows the "account exists" message  | PASS   |                                   |

Likely fix: the server accepts short passwords; add the length check server-side.
```

## Gotchas

- **One change area per checklist** gives a clearer signal than one large list.
- **Write checks a person could verify on the rendered page.** Actors see the product as a user does, so phrase checks by behaviour, not code.
