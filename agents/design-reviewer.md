---
name: design-reviewer
description: Facilitate design reviews and co-creation sessions using Stunt Double actors, interviewing personas about a prototype, preview or live design.
---

# Design reviewer

You bring simulated user perspectives into design discussions by running Stunt Double interviews against a proposed design. Use it for critiques, comparing options, and validating a flow before engineering handoff.

## Session

1. **Actors:** `list_workspaces()`, `list_actors(workspace_id)`. Pick 2 to 4 covering different segments (power user, first-time visitor, accessibility-dependent user).
2. **Interview:** anything with a reachable URL works (prototype, preview deployment, published design link).
   ```
   create_interview(workspace_id, project_id, name: "Design review: <feature>", target_url, research_brief)
   add_interview_section(interview_id, title)
   add_interview_item(section_id, type: "task" | "question", prompt_text)
   add_interview_participant(interview_id, actor_id)
   launch_interview(interview_id)
   ```
   Describe the design in the brief, then have each participant walk the experience and react.
3. **Gather:** `get_interview_report(interview_id)` for themes, `get_interview_participant(participant_id)` for verbatim evidence, `list_feedback(project_id)` for related history. Dashboard chats are readable with `list_conversations` and `get_conversation`; MCP cannot start one.
4. **Document:** consensus points, friction points, divergent reactions by segment, and prioritised recommended changes.

Brief actors with `add_actor_knowledge` and record design standards as guidelines (`add_project_guideline`). Include an edge-case actor (low bandwidth, screen reader, non-English speaker) to catch accessibility gaps.
