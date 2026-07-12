---
name: check-compliance
description: Check a product against legal and compliance requirements on Stunt Double (cookie consent, privacy and terms access, required disclosures, claim substantiation, unsubscribe flows) and collect evidence for counsel to review.
---

# Check compliance

## When to use

- You need evidence of whether a product meets stated legal or regulatory requirements
- A release or content change may have affected consent, disclosures, or required flows
- You want compliance regressions caught continuously, not discovered in an audit

## Important framing

This produces **evidence for the team and their counsel to review**. It is not legal advice. Present findings as observations against the stated requirements, never as legal conclusions. Do not guess which jurisdictions or regimes apply — ask.

## Instructions

1. **Resolve context:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → match the URL to a project, or let `create_checklist` find/create it

2. **Confirm the requirements in scope:**
   - If none were supplied, ask which regimes apply (e.g. GDPR cookie consent, AU Consumer Law pricing, financial-services disclaimers) before running

3. **Set up a compliance-reviewer actor:**
   - `list_actors(workspace_id)`, else `create_actor(...)`
   - `add_actor_knowledge(actor_id, ...)` — store the requirement list

4. **Create a checklist that exercises behaviour, not just presence:**
   - "A cookie banner appears before any non-essential tracking and the reject option works"
   - "Privacy policy and terms are reachable from every page footer"
   - "Prices include mandatory taxes or state clearly that they do not"
   - "Required disclaimers appear adjacent to the claims they qualify"
   - "The signup flow states how personal data will be used"
   - If email flows are in scope, actors have their own inboxes: include "Marketing emails contain a working unsubscribe link"

5. **Run and keep the evidence:**
   - `run_checklist(checklist_id)` → poll `get_checklist_run(run_id)` until terminal
   - On anything ambiguous, quote exactly what the page showed

6. **Report per requirement — met, not met, or unclear:**
   - Each with evidence, and a list of items for counsel to review

7. **Offer standing coverage:**
   - `create_workflow` — a schedule catches regressions from content edits; a deploy trigger catches them from releases (see `setup-guardrails`)

## Example output

```
Compliance evidence — acme.com (scope: GDPR cookie consent, price display)
Note: observations for counsel to review, not legal advice.

[NOT MET] Analytics (GA) fires on load before the cookie banner is shown. Reject button then does not stop it (evidence: network trace, screenshot).
[MET]     Privacy policy and terms linked in the footer on every audited page.
[UNCLEAR] Prices shown as "from $19" with no tax statement — quote: "from $19 / month". Flag for counsel: is a tax-inclusive/exclusive note required here?
[MET]     Signup states data use with a link to the privacy policy.

For counsel: items 1 and 3. Offer: schedule this weekly to catch consent regressions from content edits.
```

## Tips

- **Never state a legal conclusion.** Report met / not met / unclear against the stated requirements and hand ambiguous items to counsel with a verbatim quote.
- **Test behaviour, not just presence.** "The reject button actually stops tracking" is stronger evidence than "a cookie banner exists".
- **Use the actor inbox** for unsubscribe and email-consent checks when email flows are in scope.
