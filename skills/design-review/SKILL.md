---
name: design-review
description: Run a design review of a proposed design, flow, prototype or live URL by interviewing several Stunt Double actors and synthesising themes, friction and recommendations.
---

# Design review

1. **Actors:** `list_workspaces()`, `list_actors(workspace_id)`. Pick 3 to 5 covering different segments, always including one accessibility-focused actor. Share design context with `add_actor_knowledge(actor_id, title, content)` if needed.
2. **Interview:** `create_interview(workspace_id, project_id, name: "Design review: <feature>", target_url, research_brief)`. The brief says what the design does, how users interact with it and the key decisions.
3. **Guide:** `add_interview_section(interview_id, title)`, then `add_interview_item(section_id, type, prompt_text)`, mixing `task` items ("Find the annual price and start checkout") with `question` items ("What would you expect to happen next?").
4. **Participants and launch:** `add_interview_participant(interview_id, actor_id)` per actor (or `persona_spec`), `launch_interview(interview_id)`, poll `get_interview(interview_id)` until terminal.
5. **Read:** `get_interview_report(interview_id)` for summary, themes, recommendations and per-question rollup; `get_interview_participant(participant_id)` for verbatim transcript quotes. Conversations are read-only over MCP.
6. **Cross-reference:** `list_feedback(project_id)` for known issues the design addresses, `list_workflows(workspace_id)` for coverage of the new flow.
7. **Synthesise:** group into themes, separate consensus (strong signal) from segment-specific splits, and recommend specific changes with actor quotes.

Keep the interview: re-running it after the design changes gives a like-for-like comparison.
