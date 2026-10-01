---
name: check-continuity
description: Checks that pricing, plan names, feature terminology and promises match across a marketing site, product, docs and emails with Stunt Double, by having actors record the same facts on each surface and reporting a discrepancy table with evidence, billing mismatches first. Use when the user suspects drift between marketing and product, a pricing or naming change shipped on one surface only, asks whether the checkout price matches the pricing page, whether docs use old feature names, or whether a marketing promise (such as "set up in two minutes") holds.
---

# Check continuity

Tools are on the `stuntdouble` MCP server and are named bare below: `create_checklist` is `stuntdouble:create_checklist` (in Claude Code, `mcp__stuntdouble__create_checklist`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace and project
- [ ] Step 2: Pick or create the reviewing actor
- [ ] Step 3: Create one checklist per surface with mirrored checks
- [ ] Step 4: Interview for promises (if any are in scope)
- [ ] Step 5: Run everything and poll to terminal
- [ ] Step 6: Report a discrepancy table
- [ ] Step 7: Offer a standing workflow
```

1. **Resolve context.** `list_workspaces` (use the only one silently). `list_projects(workspace_id)` and match the surfaces to a project. No project? `create_checklist` with a `url` finds or creates one.

2. **Pick the actor.** Reuse a reviewer from `list_actors(workspace_id)`, else `create_actor(workspace_id, name="Continuity reviewer", description=…)`.

3. **Create one checklist per surface** with `create_checklist(workspace_id, name, actor_id, instructions, checks, url)`. Use the same recording checks on every surface so the values line up, and send them as informational checks (`{ description, type: "informational" }`) so the actor records what it saw rather than passing or failing:
   - "Record the price, billing period and plan names shown"
   - "Record what the main feature is called on this page"

   Add cross-surface assertions to the primary surface only:
   - "The price at checkout matches the price on the pricing page"
   - "The feature is never called by its old name"

4. **Promises need an interview, not a checklist.** `create_interview(workspace_id, project_id, name, target_url, research_brief)`, one section with a `task` item that walks from the claim to the feature ("The homepage says setup takes two minutes; sign up and see if that holds"), one participant, then `launch_interview(interview_id)`. Poll `get_interview_report(interview_id)` every 60 seconds until `report_status` is `completed` or `failed`.

5. **Run every checklist.** `run_checklist(checklist_id)` per surface, in parallel, then poll each `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Compare the recorded `evidence` across surfaces. After 15 minutes without a terminal status (30 for the interview), stop and give the user the run ids.

6. **Report a discrepancy table**: each item, what every surface shows, which disagree, with evidence. Rank by customer impact, billing first.

7. **Offer standing coverage.** A scheduled workflow catches drift as content ships (see `setup-guardrails`).

## Report template

```
Continuity check: marketing site vs app vs docs
Verdict: 4 discrepancies, 1 billing

| Item              | Marketing        | App (checkout)   | Docs            | Disagreement       |
| ----------------- | ---------------- | ---------------- | --------------- | ------------------ |
| Pro price / month | $29              | $39              | $29             | App differs        |
| Plan names        | Starter/Pro/Team | Starter/Pro/Team | Starter/Pro/Biz | Docs: "Biz"        |
| Core feature name | "Flows"          | "Flows"          | "Workflows"     | Docs: old name     |
| Setup promise     | "2-minute setup" | about 6 minutes in the interview transcript | | Promise exceeds reality |

Fix first: checkout charges $39 against $29 advertised.
Next: schedule these checklists so drift is caught as content ships.
```

## Gotchas

- **Mirror the recording checks** word for word across surfaces, or the values will not line up.
- **Billing mismatches rank first.** A price that differs between the pricing page and checkout is the highest-impact finding.
