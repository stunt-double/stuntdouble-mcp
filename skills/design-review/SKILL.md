---
name: design-review
description: Runs a persona-based design review with Stunt Double by putting a prototype, preview or live design in front of three to five actors as an interview, then synthesising consensus, friction and split opinions with transcript quotes. Use when the user wants feedback on a design, mockup, prototype, Figma Make or v0 link, Vercel preview or redesign before handoff, wants to compare design options (A/B), or asks how different user segments would react to a proposed flow.
---

# Design review

Tools are on the `stuntdouble` MCP server and are named bare below: `create_interview` is `stuntdouble:create_interview` (in Claude Code, `mcp__stuntdouble__create_interview`). Every tool returns an object; list results sit under a plural key.

The review runs as an interview: every actor walks the same guide against the design's URL, and Stunt Double synthesises a report. Anything with a reachable URL works.

## Workflow

```
Task progress:
- [ ] Step 1: Resolve workspace, project and actors
- [ ] Step 2: Create the interview with a design brief
- [ ] Step 3: Build the guide (tasks plus questions)
- [ ] Step 4: Add participants and launch
- [ ] Step 5: Poll the report to a terminal status
- [ ] Step 6: Cross-reference known feedback
- [ ] Step 7: Synthesise and recommend
```

1. **Resolve context.** `list_workspaces`, `list_projects(workspace_id)`, then `list_actors(workspace_id)`. Pick three to five actors from different segments, always including one accessibility-dependent actor. Missing segments? See `create-actor-panel`, or use `persona_spec` in step 4.

2. **Create the interview.** `list_project_guidelines(project_id)` first so questions do not contradict the standards the project already holds. Then `create_interview(workspace_id, project_id, name="Design review: <feature>", target_url, research_brief)`. The brief describes the proposed design: what it does, how a user interacts with it, and the decisions the review should inform.

3. **Build the guide.** `add_interview_section(interview_id, title)`, then `add_interview_item(section_id, type, prompt_text)`. Lead with `task` items ("Find the annual price and start checkout"), follow with `question` items ("What did you expect to happen next?", "Was anything confusing or missing?"). Keep it to 3 to 8 items. Comparing options? One section per option, or one interview per option URL with the same guide.

4. **Add participants and launch.** `add_interview_participant(interview_id, actor_id)` per actor (or `persona_spec={ name, bio, traits }` for an ad-hoc persona), then `launch_interview(interview_id)`.

5. **Poll.** `get_interview_report(interview_id)` every 60 seconds until `report_status` is `completed` or `failed` (usually several minutes). `get_interview(interview_id)` shows each participant's status if it stalls. After 30 minutes, stop and tell the user where to find it in the dashboard. On `failed`, read `report_error`; if participants finished, `regenerate_interview_report(interview_id)` once.

6. **Cross-reference.** `list_feedback(project_id)` for comments the design should resolve; `get_interview_participant(participant_id)` for verbatim quotes behind a finding.

7. **Synthesise** using the template: agreement across actors is a strong signal; disagreement is segment-specific.

## Report template

```
Design review: new dashboard layout
Actors: first-time user, enterprise admin, developer, screen reader user

Consensus
- All four found the left sidebar navigation clear

Friction
- First-time user: "I don't know what 'Workflows' means." (no subtitle or help)
- Screen reader user: dashboard cards have no headings, so heading navigation fails

Split
- Developer wanted a dense table; first-time user preferred cards. Offer a compact view.

Known feedback addressed: "can't find settings" (resolved by the sidebar)

Recommendations
1. Add subtitles to sidebar items
2. Give each card a heading (h2/h3)
3. Add a compact view toggle
```

## Gotchas

- **Conversations are read-only over MCP.** `list_conversations` and `get_conversation` read chats started in the dashboard; an interview is how to ask actors new questions.
- **Keep the interview.** Re-running it after the design changes gives a like-for-like comparison.
