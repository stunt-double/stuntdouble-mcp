---
name: product-researcher
description: Gathers qualitative user insight and tests product hypotheses with Stunt Double, running structured interviews across several actors, mining feedback widget comments for themes, and walking journeys with workflows to see where each segment succeeds or stalls. Use when a PM or designer asks whether users would want a feature, which of two concepts users prefer, what users struggle with, how different segments experience a flow, or needs evidence for a roadmap or stakeholder review.
---

# Product researcher

You turn actor (AI user persona) research rounds and feedback into product insight backed by evidence.

Tools are on the `stuntdouble` MCP server and are named bare below: `create_interview` is `stuntdouble:create_interview` (in Claude Code, `mcp__stuntdouble__create_interview`). Every tool returns an object; list results sit under a plural key.

## Choose the method

| Question                                    | Method                 |
| ------------------------------------------- | ---------------------- |
| Would users want this? Which option wins?   | Interview              |
| What are users struggling with?             | Feedback analysis      |
| How do segments experience this flow today? | Journey run (workflow) |

## Interview (default)

Every participant answers the same guide, so the report synthesises themes across actors.

```
list_actors(workspace_id)                                  # 3 to 5 varied segments
list_project_guidelines(project_id)                        # standards already in force
create_interview(workspace_id, project_id, name, target_url, research_brief)
add_interview_section(interview_id, title)                 # one per topic or per concept
add_interview_item(section_id, type="task" | "question", prompt_text, expected_evidence?)
add_interview_participant(interview_id, actor_id)          # or persona_spec={ name, bio, traits }
launch_interview(interview_id)
get_interview_report(interview_id)                         # poll every 60s until report_status is completed or failed
get_interview_participant(participant_id)                  # verbatim quotes
```

- Exploration: open questions ("How would you expect X to work?", "What would you do if Y happened?").
- Concept test: one section per option, or one interview per option URL with the same guide; ask participants to compare and explain their preference.
- Stop polling after 30 minutes and point the user to the dashboard. On `report_status` `failed`, read `report_error` and call `regenerate_interview_report` once if participants finished.
- Existing actor chats are readable with `list_conversations` and `get_conversation`; starting a chat is a dashboard action.

## Feedback analysis

```
summarise_feedback(project_id)                 # themes by severity, open questions, implementation brief
list_feedback(project_id, status="new")        # or since=<date>, page_path=<path>
get_feedback(feedback_id)                      # replies, screenshot, page version
```

Group comments by theme (navigation, performance, comprehension, trust), severity and page, and count how many comments share each theme.

## Journey run

```
search(workspace_id, query="<journey>", types=["workflow"])
run_workflow(workflow_id)
get_workflow_run(run_id)                       # poll every 60s until completed, failed or cancelled
```

Map where each actor succeeds, hesitates or fails, using each step's `output`.

## Output template

```
Research: should we add a team dashboard?
Method: interview, 4 actors

- Enterprise admin: "I need to see who is active and where projects are stuck. I'd check it daily."
- Solo creator: "Not useful; I'm the only person here."
- Team lead: "Only if it shows what needs my attention, not just charts."
- First-time user: "I don't know what it would show me yet."

Insight: strong pull from team and enterprise segments, none from solo users.
Recommendation: role-based default view; start with an "attention needed" widget.
Supporting feedback: 12 comments mention team visibility.
```

## Tips

- Brief actors with `add_actor_knowledge` only for context a single actor needs; product-wide standards belong in project guidelines.
- Cross-reference interview findings with checklist and workflow results for harder evidence.
- Mark comments you have folded into research as `reviewed` with `update_feedback_status`.
