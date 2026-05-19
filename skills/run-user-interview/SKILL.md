---
name: run-user-interview
description: Plan, configure, and launch a structured user interview with AI participants on Stunt Double, then read back the synthesised report.
---

# Run user interview

## When to use

- When you want qualitative research on a specific user journey or concept before shipping
- When you need a discussion guide run against a live URL by several realistic participants
- When a checklist or workflow surfaces something that needs deeper "why" exploration
- When you want a one-pass report — summary, themes, recommendations, per-question rollup — from a small panel

## Instructions

1. **Find the workspace and project:**
   - `list_workspaces()` → pick the workspace
   - `list_projects(workspace_id)` → pick the project the interview is about

2. **Create the interview:**
   - `create_interview(workspace_id, project_id, name, target_url, research_brief?)`
   - `name` — short, descriptive (e.g. "Onboarding clarity — week 1")
   - `target_url` — the live page participants should land on
   - `research_brief` — 1–3 paragraphs of context (what you're trying to learn, decisions it will inform)

3. **Build the discussion guide:**
   - For each topic, `add_interview_section(interview_id, title, intro_script?)`
   - For each section, add 2–5 items with `add_interview_item(section_id, type, prompt_text, expected_evidence?)`
     - `type: "question"` — open-ended prompt the participant answers in their own words
     - `type: "task"` — instruction the participant performs in the browser ("Sign up for a free account")
     - `expected_evidence` — optional note about what a successful answer looks like
   - Aim for 1–3 sections, 3–8 items total — interviews longer than ~15 items get expensive and noisy

4. **Recruit participants:**
   - For each participant, `add_interview_participant(interview_id, …)`:
     - Existing actor: pass `actor_id` (use `list_actors` to find one — useful when you've already shaped the persona via `create-actor-panel`)
     - Ad-hoc persona: pass `persona_spec` with `name`, `bio`, and 3–5 `traits`
   - 3–5 participants is the sweet spot. Vary segment, device, and locale for coverage.

5. **Launch the round:**
   - `launch_interview(interview_id)` → returns a trigger run ID; interview flips to `running`
   - This is async. Participants run in parallel and update independently.

6. **Watch progress:**
   - `get_interview(interview_id)` → shows status of every participant (`pending` / `running` / `completed` / `failed`)
   - For any participant you want to inspect, `get_interview_participant(participant_id)` → full transcript with interviewer turns, participant turns, and tool actions (clicks, navigations, screenshots)

7. **Read the report:**
   - Once all participants land, the synthesis task produces a report automatically
   - `get_interview_report(interview_id)` → `{ summary, themes, recommendations, per_question_rollup }`
   - If you change participants or fix a flaky run with `get_interview_participant`, call `regenerate_interview_report(interview_id)` to re-synthesise from the latest transcripts

## Example flow

```
# 1. Set up
list_workspaces()
list_projects(workspace_id="…")

# 2. Create
create_interview(
  workspace_id="…",
  project_id="…",
  name="Pricing page comprehension",
  target_url="https://acme.com/pricing",
  research_brief="Validate the new tiered pricing page. Looking for confusion between Pro and Team tiers, and whether the value props land for first-time visitors."
)
# → returns { id: "interview-…" }

# 3. Guide
add_interview_section(interview_id, title="First impressions")
add_interview_item(section_id, type="task", prompt_text="Open the pricing page and tell me what you think this product does.")
add_interview_item(section_id, type="question", prompt_text="Which plan would you pick and why?")

add_interview_section(interview_id, title="Tier comparison")
add_interview_item(section_id, type="task", prompt_text="Find the difference between Pro and Team and describe it in your own words.")

# 4. Participants
add_interview_participant(interview_id, actor_id="emma-first-time-saas-user")
add_interview_participant(interview_id, persona_spec={
  name: "Priya Shah",
  bio: "Engineering manager at a 40-person startup evaluating tools for her team.",
  traits: ["budget-conscious", "values team features", "compares 3 tools before deciding"]
})

# 5. Launch
launch_interview(interview_id)

# 6. Read
get_interview(interview_id)          # progress
get_interview_participant(p_id)      # individual transcripts
get_interview_report(interview_id)   # synthesised themes + recommendations
```

## Tips

- **Pair with `create-actor-panel`.** Create reusable actors once and attach them to many interviews — the persona stays consistent across rounds, and you can compare results over time.
- **Keep the guide short.** 3–5 questions per section, 2–3 sections. Long guides produce noisy reports.
- **Tasks beat questions for journey research.** A `task` puts the participant in the browser; the transcript captures what they actually did. Use `question` items for reactions and "why" after a task.
- **Mix segments.** One first-time user, one power user, one accessibility-focused participant exposes friction faster than five clones of the same persona.
- **Retry failed participants individually** (via the dashboard) before regenerating the report — the synthesis is only as good as the transcripts it summarises.
