---
name: check-brand
description: Audits a live product or website against brand and tone-of-voice guidelines with Stunt Double, recording the rules as project guidelines, having an actor read each page like a customer and reporting every deviation with the offending copy and a rewrite. Use when the user asks whether copy is on brand or on voice, wants a brand voice, tone of voice, copy consistency or style guide audit, mentions copy drift across pages, or wants brand adherence checked on every deploy or on a schedule.
---

# Check brand

Tools are on the `stuntdouble` MCP server and are named bare below: `create_checklist` is `stuntdouble:create_checklist` (in Claude Code, `mcp__stuntdouble__create_checklist`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace and project
- [ ] Step 2: Record the rules as guidelines
- [ ] Step 3: Pick or create the reviewing actor
- [ ] Step 4: Create one checklist per surface
- [ ] Step 5: Run and poll to a terminal status
- [ ] Step 6: Report deviations by page
- [ ] Step 7: Offer a standing workflow
```

1. **Resolve context.** `list_workspaces` (use the only one silently). `list_projects(workspace_id)` and match the URL to a project. No project? `create_checklist` with a `url` finds or creates one.

2. **Record the rules as guidelines.**
   - `list_workspace_guidelines(workspace_id)` first: if the standard is already written down, attach it with `set_project_guideline(project_id, guideline_id)` rather than typing a second copy.
   - Otherwise `add_project_guideline(project_id, category, title, content)` with `category` `tone_of_voice` or `brand`, one rule per guideline so a finding can name the rule it breaks. Guidelines reach every run, design review, interview and triage for the project.
   - No guidelines supplied? Ask for them, or draft a short rule set from the strongest existing pages and confirm it with the user before auditing.

3. **Pick the actor.** `search(workspace_id, query="brand")` or `list_actors(workspace_id)` and reuse a reviewer. Otherwise `create_actor(workspace_id, name="Brand and copy reviewer", description=…)`. Use `add_actor_knowledge` only for what this actor alone needs, never for the standard itself.

4. **Create one checklist per surface.** Default scope: homepage, one core product flow, one high-traffic marketing page. `create_checklist(workspace_id, name, actor_id, instructions, checks, url)` with 4 to 8 checks, each an observable assertion about the rendered page:
   - "Headlines use sentence case"
   - "Copy addresses the reader as you, never the user"
   - "Error messages state what happened and offer a next step"
   - "No unexplained jargon on pricing"

5. **Run and poll.** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Judge by `outcome`, and read each result's `evidence`. `waiting_for_input` means the actor needs a person: tell the user to answer it in the run's live view. After 15 minutes without a terminal status, stop and give the user the run id.

6. **Report deviations by page** using the template below: the broken rule, the offending copy as evidence, and a rewrite in the correct voice.

7. **Make it standing.** Offer a workflow on a schedule or deploy trigger (see `setup-guardrails`).

## Report template

```
Brand and voice audit: acme.com
Verdict: 3 deviations across 2 pages

Pricing page
  [FAIL] "The User can upgrade at any time": third person. Rule: address the reader as you.
         Rewrite: "You can upgrade any time."
  [FAIL] Headline "GET STARTED NOW!!!": breaks sentence case and no-exclamation rules.
         Rewrite: "Get started"

Onboarding
  [PASS] Sentence-case headlines throughout
  [FAIL] Error "Invalid input": no cause, no next step.
         Rewrite: "That email is already in use. Try signing in instead."

Next: schedule these checklists weekly to hold the voice.
```

## Gotchas

- **Guidelines, not actor knowledge, hold the standard.** A guideline reaches every run for the project; actor knowledge only reaches that actor.
- **Checks must be reader-observable.** Actors see the rendered page, so phrase rules by what a customer reads, not by CSS or component names.
- **One checklist per surface** keeps each failure attributable to a page.
