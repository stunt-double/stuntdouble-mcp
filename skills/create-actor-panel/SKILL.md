---
name: create-actor-panel
description: Creates and configures a panel of Stunt Double actors (persistent AI user personas with their own browser, inbox and memory), each with a persona description, optional extra instructions and knowledge entries, then proves each one with a short checklist run. Use when the user wants to set up personas or user segments for testing or research (first-time user, enterprise admin, screen reader user, mobile shopper), add test credentials or product context to an actor, or when a review or feedback triage shows a segment nobody covers.
---

# Create actor panel

Tools are on the `stuntdouble` MCP server and are named bare below: `create_actor` is `stuntdouble:create_actor` (in Claude Code, `mcp__stuntdouble__create_actor`). Every tool returns an object; list results sit under a plural key.

An actor is a persistent AI user persona. Checklists, interviews and workflows all run through actors, so one well-made actor is reused everywhere.

## Workflow

```
Task progress:
- [ ] Step 1: Find the workspace and existing actors
- [ ] Step 2: Choose the segments the panel needs
- [ ] Step 3: Create each missing actor
- [ ] Step 4: Add extra instructions where needed
- [ ] Step 5: Add knowledge entries
- [ ] Step 6: Verify each actor with a short run
```

1. **Find what exists.** `list_workspaces`, then `list_actors(workspace_id)`. Reuse an actor that already covers a segment; do not create a near-duplicate.

2. **Choose segments.** Default panel of three to four: a first-time user, an experienced or power user, an accessibility-dependent user, and the segment the product is built for (for example an enterprise admin or a mobile-only shopper). Add realistic constraints (slow connection, mobile only, non-native English) for edge cases.

3. **Create each actor.** `create_actor(workspace_id, name, description)`.
   - `name`: the role, never a human name, for example "First-time SaaS user". It also seeds the actor's inbox address.
   - `description`: a person, not a job title: background, goals, frustrations and tech comfort.

4. **Add extra instructions (optional).** `update_actor(actor_id, system_prompt=…)` layers behaviour on top of the description (how they react, when they give up). `capabilities` replaces the stored object in full, so read it with `get_actor` first and send it back whole.

5. **Add knowledge.** `list_actor_knowledge(actor_id)` to avoid duplicates, then `add_actor_knowledge(actor_id, title, content)` per entry: product context, test credentials for staging, or what this persona knows from past experience. Project-wide standards (brand, design system, compliance) belong in project guidelines (`add_project_guideline`), not here.

6. **Verify.** `get_actor(actor_id)` and `list_actor_knowledge(actor_id)` to confirm the setup, then a small `create_checklist` plus `run_checklist` against the product. Poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`, and read the `evidence` to check the actor behaved as written. If it did not, tighten the description or instructions and run again.

## Example actors

```
Name: First-time SaaS user
Description: Marketing coordinator at a 10-person agency choosing a project
management tool for the first time. Lives in email and spreadsheets, dislikes
jargon, and abandons any flow that takes more than a few minutes to show value.

Name: Enterprise IT admin
Description: IT director at a mid-size financial services firm evaluating tools
for 500 staff. Needs SSO/SAML, role-based access and audit logs, rejects any
tool that cannot explain its data handling, and asks pointed questions.

Name: Screen reader user
Description: Blind software developer using NVDA with Firefox, navigating by
headings, landmarks and tab order. Expects labelled controls, logical focus and
meaningful alt text; frustrated by unlabelled buttons and focus traps.
```

## Gotchas

- **Keep knowledge current.** When the product changes, `remove_actor_knowledge(knowledge_id)` stale entries rather than adding contradicting ones.
- **Archive, do not abandon.** `update_actor(actor_id, status="archived")` retires an actor; `"active"` restores it.
- **Plan limits apply.** `create_actor` fails when the plan's actor limit is reached; reuse or archive before asking the user to upgrade.
