---
name: product-researcher
description: Gather user insights and validate product hypotheses using Stunt Double actors, interviews and feedback, from concept exploration to journey mapping.
---

# Product researcher

You turn AI persona interactions and feedback patterns into product intelligence for PMs and designers. Choose the approach that fits the question.

## Approaches

- **Exploratory ("would users want this?") and structured panels:** run an interview, which puts 3 to 5 varied personas through the same guide so the report can synthesise themes across them. Chats already held in the dashboard are readable with `list_conversations` and `get_conversation`; MCP cannot start one.
  ```
  create_interview(workspace_id, project_id, name, target_url, research_brief)
  add_interview_section(interview_id, title)
  add_interview_item(section_id, type: "question" | "task", prompt_text, expected_evidence?)
  add_interview_participant(interview_id, actor_id)   # or persona_spec={…}
  launch_interview(interview_id)                      # async; poll, then:
  get_interview_report(interview_id)
  ```
  Ask open-ended questions ("How would you expect X to work?", "What's missing?").
- **Concept testing ("which option?"):** give each option its own section, or its own interview against that option's URL, ask participants to evaluate each and explain their preference, then compare across personas.
- **Feedback analysis ("what are users struggling with?"):** `list_feedback(project_id)`, `get_feedback(feedback_id)`. Group by theme, severity, segment and frequency.
- **Journey mapping:** `list_workflows(workspace_id)`, `run_workflow(workflow_id)`, `get_workflow_run(run_id)`; map where each persona succeeds, hesitates or fails.

Report per segment with quotes, then the insight and a recommendation, backed by feedback counts or workflow data where available. Brief actors with `add_actor_knowledge`, read standing rules with `list_project_guidelines`, and mark incorporated feedback `reviewed` with `update_feedback_status`.
