---
name: check-continuity
description: Check continuity across surfaces on Stunt Double — pricing, terminology, feature names, and promises should match between marketing site, product, docs, and emails. Actors walk each surface and the mismatches surface with evidence.
---

# Check continuity

## When to use

- Marketing, product, docs, and emails may have drifted out of sync (pricing, plan names, feature terminology, promises)
- A pricing or naming change shipped on one surface but maybe not the others
- You want cross-surface drift caught as content ships, not by customers

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → match the surfaces to a project, or let `create_checklist` find/create it

2. **Ensure a reviewer actor exists:**
   - `list_actors(workspace_id)`, else `create_actor(...)`

3. **Create a checklist per surface with mirrored extraction checks:**
   - Record the same facts on each surface so they can be compared:
     - "Record the price, billing period, and plan names shown"
     - "Record what the main feature is called on this page"
   - Plus cross-surface assertions on the primary surface:
     - "The price at checkout matches the price on the pricing page"
     - "The feature is named consistently; it is never called by an old name"

4. **For promise-versus-product continuity, use an interview:**
   - `create_interview(...)` with a task that walks from the marketing claim to using the feature ("The homepage says setup takes two minutes; sign up and see if that holds"), a persona participant, and `launch_interview`
   - Poll and read `get_interview_report`

5. **Run everything and compare recorded values across surfaces:**
   - `run_checklist` per surface → poll `get_checklist_run` until terminal

6. **Report a discrepancy table:**
   - Each item, what every surface shows, which surfaces disagree, with evidence
   - Rank by customer impact (billing mismatches first)

7. **Offer standing coverage:**
   - A scheduled `create_workflow` so drift is caught as content ships (see `setup-guardrails`)

## Example output

```
Continuity check — marketing site vs app vs docs

| Item              | Marketing        | App (checkout)   | Docs             | Disagree?     |
| ----------------- | ---------------- | ---------------- | ---------------- | ------------- |
| Pro price / month | $29              | $39              | $29              | App ≠ others  |
| Plan names        | Starter/Pro/Team | Starter/Pro/Team | Starter/Pro/Biz  | Docs: "Biz"   |
| Core feature name | "Flows"          | "Flows"          | "Workflows"      | Docs: old name|
| Setup promise     | "2-minute setup" | ~6 min in interview transcript |    | Promise > reality |

Ranked: billing mismatch first (App charges $39 vs $29 advertised). Then docs plan-name + feature-name drift.
Offer: schedule this so drift is caught as content ships.
```

## Tips

- **Mirror the extraction checks** across surfaces so the recorded values line up cleanly for comparison.
- **Billing mismatches rank first** — a price that disagrees between the pricing page and checkout is the highest-impact discrepancy.
- **Interviews beat checklists for promises.** A task that walks from the marketing claim to the real experience captures whether the promise holds.
