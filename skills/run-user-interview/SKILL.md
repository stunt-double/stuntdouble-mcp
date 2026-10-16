---
name: run-user-interview
description: Plan, configure and launch a structured user interview with AI participants against a live URL on Stunt Double, then read the synthesised report (summary, themes, recommendations).
---

# Run user interview

1. **Context:** `list_workspaces()`, `list_projects(workspace_id)`.
2. **Create:** `create_interview(workspace_id, project_id, name, target_url, research_brief?)`. `target_url` is where participants land; the brief is 1 to 3 paragraphs on what you want to learn and what it informs.
3. **Guide:** `add_interview_section(interview_id, title, intro_script?)`, then 2 to 5 items each via `add_interview_item(section_id, type, prompt_text, expected_evidence?)`. `type: "task"` has the participant act in the browser; `"question"` is an open-ended answer. Tasks beat questions for journey research; use questions for reactions and "why". Keep to 1 to 3 sections and about 15 items at most.
4. **Participants:** `add_interview_participant(interview_id, …)` with an `actor_id` (from `list_actors`, see `create-actor-panel`) or a `persona_spec` (`name`, `bio`, 3 to 5 `traits`). Use 3 to 5, varying segment, device and locale.
5. **Launch:** `launch_interview(interview_id)` is async; participants run in parallel.
6. **Watch:** `get_interview(interview_id)` shows each participant's status (`pending`, `running`, `completed`, `failed`). `get_interview_participant(participant_id)` returns the full transcript with actions.
7. **Report:** once all participants land, `get_interview_report(interview_id)` returns `{ summary, themes, recommendations, per_question_rollup }`. After changing participants or fixing a failed one, `regenerate_interview_report(interview_id)`. Retry failed participants (dashboard) before regenerating.
