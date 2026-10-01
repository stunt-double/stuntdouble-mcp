---
name: run-user-interview
description: Plans, builds and launches a structured Stunt Double user interview in which three to five actors work through a discussion guide of browser tasks and questions against a live URL, then reads back the synthesised report of themes, recommendations and per-question rollup. Use when the user wants qualitative user research, usability testing, a concept or pricing page test, to know why users struggle with a flow, persona reactions to a prototype or preview, or a repeatable research round to compare over time.
---

# Run user interview

Tools are on the `stuntdouble` MCP server and are named bare below: `create_interview` is `stuntdouble:create_interview` (in Claude Code, `mcp__stuntdouble__create_interview`). Every tool returns an object; list results sit under a plural key.

## Workflow

```
Task progress:
- [ ] Step 1: Find the workspace and project
- [ ] Step 2: Create the interview
- [ ] Step 3: Build the discussion guide
- [ ] Step 4: Add participants
- [ ] Step 5: Launch
- [ ] Step 6: Poll the report to a terminal status
- [ ] Step 7: Read and report
```

1. **Find the workspace and project.** `list_workspaces`, then `list_projects(workspace_id)`. `search(workspace_id, query, types=["interview"])` first: re-running an existing interview gives a comparison over time.

2. **Create the interview.** `create_interview(workspace_id, project_id, name, target_url, research_brief)`.
   - `name`: short and specific, for example "Pricing page comprehension".
   - `target_url`: the full URL participants start from (production, staging, a preview or a prototype link).
   - `research_brief`: one to three paragraphs on what the team wants to learn and which decision it informs. It steers both the interviewer and the report.

3. **Build the guide.** One to three sections, three to eight items in total; longer guides cost more and produce noisier reports.
   - `add_interview_section(interview_id, title, intro_script?)`
   - `add_interview_item(section_id, type, prompt_text, expected_evidence?)`. `type="task"` puts the participant in the browser ("Sign up for a free account"); `type="question"` asks for a reaction or a reason. Lead with a task, then ask why.

4. **Add participants.** Three to five, varied by segment, device and locale. `add_interview_participant(interview_id, …)` once each with either:
   - `actor_id` for an existing actor (from `list_actors`; see `create-actor-panel`), which keeps the persona consistent across rounds, or
   - `persona_spec={ name, bio, traits }` for an ad-hoc persona (three to five traits).
   - Optional `device` (`desktop`, `tablet`, `mobile`) and `locale`.

5. **Launch.** `launch_interview(interview_id)`. It needs at least one section with items and one participant. The interview moves to `running` and participants run in parallel.

6. **Poll.** `get_interview_report(interview_id)` every 60 seconds until `report_status` is `completed` or `failed` (usually several minutes). `get_interview(interview_id)` shows each participant's status if progress stalls. After 30 minutes, stop and tell the user the interview is still running.
   - `report_status` `failed`: read `report_error`. If participants finished, call `regenerate_interview_report(interview_id)` once and poll again.
   - A participant `failed`: retry it from the dashboard, then `regenerate_interview_report` so the report includes it.

7. **Read and report.** The report has `summary`, `themes`, `recommendations` and a per-question rollup. Back each theme with a quote from `get_interview_participant(participant_id)`, whose transcript includes the participant's clicks and navigations.

## Example flow

```
list_workspaces()
list_projects(workspace_id="…")

create_interview(workspace_id="…", project_id="…",
  name="Pricing page comprehension",
  target_url="https://acme.com/pricing",
  research_brief="Validate the new tiered pricing page. Looking for confusion between Pro and Team, and whether the value props land for first-time visitors.")

add_interview_section(interview_id, title="First impressions")
add_interview_item(section_id, type="task", prompt_text="Open the pricing page and say what you think this product does.")
add_interview_item(section_id, type="question", prompt_text="Which plan would you pick, and why?")

add_interview_participant(interview_id, actor_id="…")
add_interview_participant(interview_id, persona_spec={
  name: "Budget-conscious engineering manager",
  bio: "Runs a team of eight at a 40-person startup and is comparing three tools.",
  traits: ["budget-conscious", "values team features", "compares before deciding"]
})

launch_interview(interview_id)
get_interview_report(interview_id)   # poll until report_status is completed or failed
```

## Report template

```
Interview: Pricing page comprehension (4 participants, all completed)

Summary: <one or two sentences from the report>

Themes
1. Pro vs Team is unclear (3 of 4): "I can't tell what Team adds beyond seats." (first-time visitor)
2. ...

Recommendations
1. ...
```
