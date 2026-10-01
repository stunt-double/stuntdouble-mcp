---
name: triage-feedback
description: Triages the comments stakeholders and users leave on a product through the Stunt Double feedback widget, summarising them into severity-ranked themes and an implementation brief, assessing and updating each comment's status, reproducing issues with a checklist and closing them once a run proves the fix. Use when the user asks to review, triage, prioritise or summarise feedback, comments or widget submissions, turn stakeholder comments into tasks or a brief for a coding agent, or close the loop on fixed issues.
---

# Triage feedback

Tools are on the `stuntdouble` MCP server and are named bare below: `summarise_feedback` is `stuntdouble:summarise_feedback` (in Claude Code, `mcp__stuntdouble__summarise_feedback`). Every tool returns an object; list results sit under a plural key.

Feedback here means comments people leave through the feedback widget, each pinned to a page position (often a named element) with device details and an optional screenshot. Statuses: `new` (nobody has looked), `reviewed` (assessed, still open), `resolved` (confirmed fixed), `dismissed` (will not act).

## Workflow

```
Task progress:
- [ ] Step 1: Find the project
- [ ] Step 2: Summarise the open comments
- [ ] Step 3: Read the comments behind each theme
- [ ] Step 4: Assess and update statuses
- [ ] Step 5: Reproduce what is unclear
- [ ] Step 6: Report themes, decisions and open questions
```

1. **Find the project.** `list_workspaces`, then `list_projects(workspace_id)`.

2. **Summarise first.** `summarise_feedback(project_id)` covers open comments (`new` plus `reviewed`) by default and returns a headline, themes ranked by severity, open questions and an implementation brief written for a coding agent. Read it before reasoning over raw comments. If `coverage.included` is below `coverage.total`, say only the most recent were read. Leave `force` unset: an unchanged comment set returns the saved digest at no cost.

3. **Read the comments.** `list_feedback(project_id, status="new")` (narrow with `page_path` or `since`), then `get_feedback(feedback_id)` for replies, the page version and the screenshot.

4. **Assess and update** each comment:
   - Valid issue or expected behaviour? Severity: blocker (cannot proceed), major (significant friction), minor (annoyance), cosmetic (polish). Duplicate of another comment?
   - `update_feedback_status(feedback_id, status)`: `reviewed` once assessed, `dismissed` for duplicates and expected behaviour (sparingly), `resolved` only after a run proves the fix.

5. **Reproduce what is unclear.** For a reported bug, create a checklist on the comment's `page_url` (see `verify-change`), run it and poll `get_checklist_run(run_id)` until `completed` or `failed`. Reproduced: keep it `reviewed` and attach the evidence. Fixed later: re-run, then mark `resolved`.

6. **Report** with the template. Ask the user the brief's unanswered open questions rather than guessing: the brief leaves out work those questions hold up.

## Report template

```
Feedback triage: Acme web app
Headline: <summarise_feedback headline>
Reviewed 7 new comments: 5 reviewed, 2 dismissed

| Comment (page)                            | Severity | Status    | Note                      |
| ----------------------------------------- | -------- | --------- | ------------------------- |
| Modal cannot be closed by keyboard (/app) | Major    | reviewed  | Reproduced by checklist   |
| Search empty for partial words (/search)  | Major    | reviewed  |                           |
| Tooltip covers the Continue button (/onboarding) | Minor | reviewed |                    |
| Same as the export label comment          | n/a      | dismissed | Duplicate                 |
| Empty state on a fresh account            | n/a      | dismissed | Expected behaviour        |

Open questions for you: <from the digest>
Next: fix the keyboard trap before release; add a keyboard navigation checklist.
```
