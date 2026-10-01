---
name: check-compliance
description: Collects evidence of whether a live product meets stated legal and compliance requirements with Stunt Double, such as cookie consent that actually blocks tracking, privacy policy and terms access, required disclosures, price and tax display, claim substantiation and unsubscribe flows, and reports each requirement as met, not met or unclear for counsel to review. Use when the user mentions GDPR, a cookie banner, consent, privacy policy, disclaimers, consumer law, accessibility or regulatory requirements, a compliance audit, or wants compliance regressions caught after releases.
---

# Check compliance

Tools are on the `stuntdouble` MCP server and are named bare below: `create_checklist` is `stuntdouble:create_checklist` (in Claude Code, `mcp__stuntdouble__create_checklist`). Every tool returns an object; list results sit under a plural key.

**This produces evidence for the team and their counsel, not legal advice.** Report observations against the stated requirements, never legal conclusions. Do not guess which jurisdictions or regimes apply: ask.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace and project
- [ ] Step 2: Confirm the requirements in scope
- [ ] Step 3: Record each requirement as a guideline
- [ ] Step 4: Pick or create the reviewing actor
- [ ] Step 5: Create a checklist that tests behaviour
- [ ] Step 6: Run and poll to a terminal status
- [ ] Step 7: Report per requirement
- [ ] Step 8: Offer a standing workflow
```

1. **Resolve context.** `list_workspaces` (use the only one silently). `list_projects(workspace_id)` and match the URL to a project. No project? `create_checklist` with a `url` finds or creates one.

2. **Confirm the requirements.** If none were supplied, ask which regimes apply (for example GDPR cookie consent, Australian Consumer Law price display, financial-services disclaimers) before running anything.

3. **Record the requirements.** `list_workspace_guidelines(workspace_id)` first: an obligation that applies to several products is one rule attached to each with `set_project_guideline(project_id, guideline_id)`. Otherwise `add_project_guideline(project_id, category="compliance", title, content)`, one obligation per guideline so a finding can name the requirement.

4. **Pick the actor.** Reuse a reviewer from `list_actors(workspace_id)`, else `create_actor(workspace_id, name="Compliance reviewer", description=…)`.

5. **Create a checklist that exercises behaviour, not just presence.** `create_checklist(workspace_id, name, actor_id, instructions, checks, url)`, for example:
   - "A cookie banner appears before any non-essential tracking, and the reject option stops it"
   - "Privacy policy and terms are reachable from every page footer"
   - "Prices include mandatory taxes or state clearly that they do not"
   - "Required disclaimers appear next to the claims they qualify"
   - "The signup flow states how personal data will be used"
   - Email flows in scope? Actors have their own inboxes, so add "Marketing emails contain a working unsubscribe link".

6. **Run and poll.** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Read each result's `evidence`; on anything ambiguous, quote exactly what the page showed. `waiting_for_input` means the actor needs a person: tell the user to answer it in the run's live view. After 15 minutes without a terminal status, stop and give the user the run id.

7. **Report per requirement** as met, not met or unclear, with evidence, and list the items for counsel.

8. **Offer standing coverage.** A scheduled workflow catches regressions from content edits; a deploy trigger catches them from releases (see `setup-guardrails`).

## Report template

```
Compliance evidence: acme.com (scope: GDPR cookie consent, price display)
Observations for counsel to review, not legal advice.

[NOT MET] Analytics fires on load before the cookie banner shows; Reject does not stop it (evidence: network trace, screenshot)
[MET]     Privacy policy and terms linked in the footer on every audited page
[UNCLEAR] Prices shown as "from $19 / month" with no tax statement. For counsel: is a tax note required here?
[MET]     Signup states data use and links the privacy policy

For counsel: items 1 and 3. Next: schedule weekly to catch consent regressions from content edits.
```

## Gotchas

- **Never state a legal conclusion.** Hand ambiguous items to counsel with a verbatim quote.
- **Test behaviour, not presence.** "The reject button stops tracking" is stronger evidence than "a cookie banner exists".
