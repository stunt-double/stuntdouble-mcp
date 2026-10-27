---
name: check-continuity
description: Check continuity across surfaces (pricing, plan names, terminology, feature names, promises) between marketing site, product, docs and emails, with actors walking each surface and mismatches reported with evidence.
---

# Check continuity

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`. Match the surfaces to a project, or let `create_checklist` find or create it. Ensure a reviewer actor (`list_actors`, else `create_actor`).
2. **One checklist per surface with mirrored extraction checks** so values compare cleanly: "Record the price, billing period and plan names shown", "Record what the main feature is called on this page". On the primary surface add cross-surface assertions such as "The price at checkout matches the pricing page".
3. **Promise versus product:** use an interview. `create_interview(...)` with a task that walks from the marketing claim into using the feature ("The homepage says setup takes two minutes; sign up and see if that holds"), a persona participant, `launch_interview`, then `get_interview_report`.
4. **Run:** `run_checklist` per surface, poll `get_checklist_run` until terminal, then compare recorded values.
5. **Report** a discrepancy table (item, what each surface shows, which disagree, evidence), ranked by customer impact with billing mismatches first.
6. **Standing coverage:** offer a scheduled `create_workflow` (see `setup-guardrails`).
