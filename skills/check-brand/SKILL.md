---
name: check-brand
description: Audit a product or site against brand and tone-of-voice guidelines — a Stunt Double actor reads every in-scope page like a customer and flags copy, voice, and presentation that break the rules, with evidence.
---

# Check brand

## When to use

- You have brand and tone-of-voice guidelines and want to know where the live product breaks them
- Copy has drifted as pages shipped independently and you want a consistent voice again
- You want brand adherence enforced continuously, not audited once

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → match the URL to a project, or let `create_checklist` find/create it

2. **Set up a brand-guardian actor and record the rules:**
   - `list_actors(workspace_id)`, else `create_actor(...)` described as a meticulous brand and copy reviewer
   - `list_workspace_guidelines(workspace_id)` — the standard may already be written down; attach it with `set_project_guideline(project_id, guideline_id)` rather than typing a second copy
   - Otherwise `add_project_guideline(project_id, category: "tone_of_voice" | "brand", content, title)`, one rule per guideline so a finding can name the rule it breaks. Guidelines are workspace-owned and reach every checklist run, design review, interview and triage for the project
   - Use `add_actor_knowledge(actor_id, ...)` for what only this reviewer needs to remember, not for the standard itself
   - If no guidelines were supplied, ask for them, or draft a short rule set from the strongest existing pages and confirm it before auditing

3. **Create a checklist per surface in scope:**
   - `create_checklist(...)` for each page or flow (default scope: homepage, one core product flow, one high-traffic marketing page)
   - Phrase each check as an observable assertion a reader could verify on the rendered page:
     - "Headlines use sentence case"
     - "Copy addresses the reader as you, never the user"
     - "Error messages state what happened and offer a next step"
     - "No unexplained jargon on pricing"
   - 4–8 checks per checklist

4. **Run and collect evidence:**
   - `run_checklist(checklist_id)` → poll `get_checklist_run(run_id)` until terminal; read the evidence per check

5. **Report deviations grouped by page:**
   - Each with the broken rule, the offending copy or element as evidence, and a suggested rewrite in the correct voice

6. **Make it standing:**
   - Offer `create_workflow` on a schedule or deploy trigger so the brand stays on-voice as pages change (see `setup-guardrails`)

## Example output

```
Brand & voice audit — acme.com

Pricing page:
  [FAIL] "The User can upgrade at any time" — addresses reader in third person.
         Rewrite: "You can upgrade any time."
  [FAIL] Headline "GET STARTED NOW!!!" — all caps + exclamation, breaks sentence-case + no-exclamation rules.
         Rewrite: "Get started"

Onboarding:
  [PASS] Sentence-case headlines throughout
  [FAIL] Error "Invalid input" — states no cause and no next step.
         Rewrite: "That email is already in use. Try signing in instead."

3 deviations across 2 pages. Offer: schedule this checklist weekly to hold the voice.
```

## Tips

- **Store the rules on the actor, not just in the checklist.** Actor knowledge makes every future run enforce the same standard automatically.
- **Checks must be reader-observable.** Actors see the rendered page, so phrase rules by what a customer would read, not by CSS or component names.
- **One checklist per surface** keeps failures attributable to a page.
