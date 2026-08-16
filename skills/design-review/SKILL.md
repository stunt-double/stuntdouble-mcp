---
name: design-review
description: Run a design review session by gathering feedback from multiple Stunt Double actors on a proposed design or flow.
---

# Design review

## When to use

- When evaluating a new design, flow, or prototype before implementation
- When comparing two or more design options
- Before engineering handoff to validate the proposed UX
- When a PM or designer wants diverse user perspectives on a concept

## Instructions

1. **Set up the workspace and select actors:**
   - `list_workspaces()` → find the workspace
   - `list_actors(workspace_id)` → review available personas
   - Pick 3-5 actors representing different user segments (new user, power user, enterprise, accessibility, mobile, etc.)

2. **Brief the actors (if needed):**
   - `add_actor_knowledge(actor_id, title, content)` → share design context, screenshots, feature descriptions, or prototype links with each actor
   - This ensures actors have the right context to give informed feedback

3. **Run the review as an interview:**
   - `create_interview(workspace_id, project_id, name: "Design review: <feature>", target_url, research_brief)` → describe the proposed design clearly in the brief: what it does, how the user would interact with it, and what the key decision points are
   - `add_interview_section(interview_id, title)` then `add_interview_item(section_id, type, prompt_text)` → mix `task` items ("Find the annual price and start checkout") with specific questions ("Would you understand what this button does?", "What would you expect to happen next?", "Is anything confusing or missing?")
   - `add_interview_participant(interview_id, actor_id)` → one per selected actor, or `persona_spec` for an ad-hoc persona
   - `launch_interview(interview_id)` → async, poll `get_interview(interview_id)` until terminal

4. **Collect and read responses:**
   - `get_interview_report(interview_id)` → summary, themes, recommendations, per-question rollup
   - `get_interview_participant(participant_id)` → verbatim transcript evidence for a finding
   - Conversations are read-only over MCP: `list_conversations` / `get_conversation` read chats started in the dashboard

5. **Cross-reference with existing data:**
   - `list_feedback(project_id)` → check if the design addresses known issues
   - `list_workflows(workspace_id)` → verify that existing workflows cover the new flow

6. **Synthesize findings:**
   - Group feedback into themes
   - Note where actors agree (strong signal) vs disagree (segment-specific)
   - Identify friction points, confusion, and missing affordances
   - Recommend specific design changes with supporting quotes from actors

## Example output

```
Design Review: New Dashboard Layout

Actors consulted:
  - Emma (first-time user)
  - Carlos (enterprise admin)
  - Priya (developer/API user)
  - Sam (screen reader user)

Findings:

  Strong consensus:
  - All actors found the left sidebar navigation intuitive
  - All actors liked the quick-action buttons at the top

  Friction points:
  - Emma: "I don't know what 'Workflows' means. Can it say 'Automations' or have a subtitle?"
  - Sam: "The dashboard cards don't have heading levels. I can't navigate by headings."
  - Carlos: "I need to see team activity, not just my own. Add a team toggle."

  Split opinions:
  - Priya preferred a data-dense layout; Emma preferred the card-based layout
  - Recommendation: offer a "compact view" toggle for power users

  Existing feedback addressed:
  - FB-145 ("can't find settings") — new sidebar placement resolves this
  - FB-162 ("too many clicks to create project") — quick-action button addresses this

Recommendations:
  1. Add descriptive subtitles to sidebar items for new users
  2. Add proper heading structure (h2/h3) to dashboard cards for screen readers
  3. Add team/personal toggle for enterprise users
  4. Consider compact view option for power users
```

## Tips

- Ask participants both open-ended ("What stands out to you?") and specific ("Would you click this button?") questions
- Include at least one accessibility-focused actor in every design review
- Use transcript quotes as evidence in design documents and stakeholder presentations
- Keep the interview. Re-running it after the design changes gives a like-for-like comparison, which a one-off review cannot
