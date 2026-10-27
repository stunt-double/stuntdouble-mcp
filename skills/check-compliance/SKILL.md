---
name: check-compliance
description: Check a product against legal and compliance requirements (cookie consent, privacy and terms access, required disclosures, claim substantiation, unsubscribe flows) and collect evidence for counsel to review.
---

# Check compliance

This produces evidence for the team and their counsel, not legal advice. Report observations against the stated requirements (met, not met, unclear), never legal conclusions, and quote the page verbatim on anything ambiguous.

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`. Match the URL to a project, or let `create_checklist` find or create it.
2. **Scope:** if no requirements were supplied, ask which regimes apply (e.g. GDPR cookie consent, AU Consumer Law pricing, financial disclaimers). Do not guess jurisdictions.
3. **Actor and rules:** `list_actors(workspace_id)`, else `create_actor(...)`. Check `list_workspace_guidelines(workspace_id)` first (an obligation shared by several products is one rule attached with `set_project_guideline`), then `add_project_guideline(project_id, category: "compliance", content, title)`, one obligation per guideline so a finding can name it.
4. **Checklist that exercises behaviour, not presence**, e.g. "A cookie banner appears before non-essential tracking and the reject option works", "Privacy policy and terms are linked from every footer", "Prices include mandatory taxes or say they do not", "Required disclaimers sit next to the claims they qualify". Actors have their own inboxes, so email flows can include "Marketing emails contain a working unsubscribe link".
5. **Run:** `run_checklist(checklist_id)`, poll `get_checklist_run(run_id)` until terminal.
6. **Report** per requirement with evidence, plus a list of items for counsel.
7. **Standing coverage:** offer `create_workflow` (schedule for content edits, deploy trigger for releases; see `setup-guardrails`).
