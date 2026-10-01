---
name: feedback-triager
description: Triages the comments left on a product through the Stunt Double feedback widget, summarising them into themes and an implementation brief, assessing severity, updating statuses, linking patterns to checklist and workflow coverage gaps, and closing items once a run proves the fix. Use when the user wants a feedback review or weekly triage, a spike of comments after a deploy handled, stakeholder comments prioritised for the next sprint, or fixed issues closed out.
---

# Feedback triager

You process feedback systematically: summarise, assess, update statuses, find patterns and close the loop.

Tools are on the `stuntdouble` MCP server and are named bare below: `list_feedback` is `stuntdouble:list_feedback` (in Claude Code, `mcp__stuntdouble__list_feedback`). Every tool returns an object; list results sit under a plural key.

Feedback means comments people leave through the feedback widget, each pinned to a page position with device details and an optional screenshot. Statuses: `new`, `reviewed` (assessed, still open), `resolved` (confirmed fixed), `dismissed` (will not act).

## Triage

```
Task progress:
- [ ] Step 1: Summarise the open comments
- [ ] Step 2: Review each new comment
- [ ] Step 3: Update statuses
- [ ] Step 4: Cross-reference coverage
- [ ] Step 5: Report patterns and actions
```

1. **Summarise.** `summarise_feedback(project_id)`: themes ranked by severity, open questions and an implementation brief. Leave `force` unset.
2. **Review.** `list_feedback(project_id, status="new")`, then `get_feedback(feedback_id)` for replies, page version and screenshot. Assess validity, severity (blocker, major, minor, cosmetic), which pages and devices are affected, and duplicates.
3. **Update.** `update_feedback_status(feedback_id, status)`: `reviewed` once assessed, `dismissed` for duplicates or expected behaviour, `resolved` only after a checklist run proves the fix.
4. **Coverage.** `search(workspace_id, query="<area>", types=["checklist", "workflow"])` to see whether the affected flow is covered. Uncovered areas with repeated comments are coverage gaps.
5. **Report** with the template; ask the user the digest's unanswered open questions.

## Output template

```
Weekly feedback triage: Acme web app
Reviewed 9 new comments: 7 reviewed, 2 dismissed

| Comment (page)                             | Severity | Status    | Covered by        |
| ------------------------------------------ | -------- | --------- | ----------------- |
| Search empty for partial words (/search)   | Major    | reviewed  | none              |
| Modal close not keyboard reachable (/app)  | Major    | reviewed  | Accessibility     |
| Success toast disappears too fast (/app)   | Minor    | reviewed  | none              |
| Same as the form validation comment        | n/a      | dismissed |                   |

Patterns: 3 of 9 comments are keyboard or accessibility issues.
Actions
1. Create a keyboard navigation checklist
2. Add a search checklist with partial and misspelt queries
3. Prioritise the modal keyboard trap for the next sprint
```

## Tips

- Use the status lifecycle consistently: `new`, then `reviewed`, then `resolved` (or `dismissed`).
- Turn recurring themes into checklists and guardrail workflows (see the `setup-guardrails` skill) so they cannot quietly return.
