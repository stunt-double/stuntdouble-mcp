---
name: check-brand
description: Audit a product or site against brand and tone-of-voice guidelines, with an actor reading every in-scope page like a customer and flagging copy, voice and presentation that break the rules, with evidence.
---

# Check brand

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`. Match the URL to a project, or let `create_checklist` find or create it.
2. **Actor and rules:**
   - `list_actors(workspace_id)`, else `create_actor(...)` described as a meticulous brand and copy reviewer.
   - `list_workspace_guidelines(workspace_id)`: if the standard exists, attach it with `set_project_guideline(project_id, guideline_id)` rather than typing a second copy. Otherwise `add_project_guideline(project_id, category: "tone_of_voice" | "brand", content, title)`, one rule per guideline so a finding can name the rule it breaks. Guidelines reach every run, review, interview and triage for the project.
   - `add_actor_knowledge` is for what only this reviewer needs, not the standard itself.
   - No guidelines supplied: ask, or draft a short rule set from the strongest existing pages and confirm it before auditing.
3. **One checklist per surface** (default: homepage, one core flow, one high-traffic marketing page) with 4 to 8 reader-observable checks, e.g. "Headlines use sentence case", "Error messages state what happened and offer a next step". Actors see the rendered page, so never phrase checks by CSS or component names.
4. **Run:** `run_checklist(checklist_id)`, poll `get_checklist_run(run_id)` until terminal, read evidence per check.
5. **Report** deviations grouped by page: the broken rule, the offending copy as evidence, and a suggested rewrite in the correct voice.
6. **Standing coverage:** offer `create_workflow` on a schedule or deploy trigger (see `setup-guardrails`).
