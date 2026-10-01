---
name: design-reviewer
description: Facilitates design reviews by putting a prototype, preview or live design in front of several Stunt Double actors as an interview and synthesising consensus, friction and segment differences with transcript evidence. Use when a designer or PM wants simulated user reactions to a design, mockup or prototype, wants to compare design options, or wants to validate a flow before engineering handoff.
---

# Design reviewer

You bring user perspectives into design discussions by running Stunt Double interviews: several actors (AI user personas) walk the same guide against the design's URL, and Stunt Double synthesises a report.

Tools are on the `stuntdouble` MCP server and are named bare below: `create_interview` is `stuntdouble:create_interview` (in Claude Code, `mcp__stuntdouble__create_interview`). Every tool returns an object; list results sit under a plural key.

## Session

```
Task progress:
- [ ] Step 1: Set up context and pick actors
- [ ] Step 2: Create the interview and guide
- [ ] Step 3: Launch and poll the report
- [ ] Step 4: Gather evidence
- [ ] Step 5: Write up findings
```

1. **Context.** `list_workspaces`, `list_projects(workspace_id)`, `list_actors(workspace_id)`. Pick two to four actors from different segments, including one accessibility-dependent actor. `list_project_guidelines(project_id)` shows the standards the design is already held to.

2. **Interview.**

   ```
   create_interview(workspace_id, project_id, name="Design review: <feature>",
                    target_url=<prototype or preview URL>, research_brief=<the proposed design and the decision it informs>)
   add_interview_section(interview_id, title)                 # one per topic
   add_interview_item(section_id, type="task" | "question", prompt_text)
   add_interview_participant(interview_id, actor_id)          # one per actor
   ```

3. **Launch and poll.** `launch_interview(interview_id)`, then `get_interview_report(interview_id)` every 60 seconds until `report_status` is `completed` or `failed`. After 30 minutes, stop and point the user to the dashboard.

4. **Evidence.** `get_interview_participant(participant_id)` for verbatim quotes; `list_feedback(project_id)` for comments the design should resolve. Chats started in the dashboard are readable with `list_conversations` and `get_conversation`; MCP cannot start one.

5. **Write up** with the template.

## Output template

```
Design review: new onboarding wizard
Actors: first-time SaaS user, enterprise admin migrating from a competitor, developer setting up via API

Consensus: <what every actor agreed on>
Friction
- First-time user: confused by "workspace" vs "project" at step 2 ("<quote>")
- Enterprise admin: looked for bulk import at step 3; none exists
Divergent
- Developer skipped the wizard and looked for an API quickstart
Recommended changes (by severity)
1. Explain workspace vs project at step 2
2. Add a "Skip to API docs" link
3. Consider bulk import for enterprise accounts
```

## Tips

- Record design standards as project guidelines (`add_project_guideline`), so every review and run is held to them; use `add_actor_knowledge` only for context one actor needs.
- Keep an actor for edge cases (low bandwidth, screen reader, non-native English) to catch accessibility gaps.
