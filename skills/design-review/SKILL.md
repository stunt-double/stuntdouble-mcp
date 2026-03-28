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

3. **Create review conversations:**
   - `create_conversation(workspace_id, actor_id, title: "Design review: <feature>")` → one per actor
   - Describe the proposed design clearly: what it does, how the user would interact with it, and what the key decision points are
   - Ask specific questions: "Would you understand what this button does?", "What would you expect to happen next?", "Is anything confusing or missing?"

4. **Collect and read responses:**
   - `get_conversation(conversation_id)` → read each actor's feedback

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

- Ask actors both open-ended ("What stands out to you?") and specific ("Would you click this button?") questions
- Include at least one accessibility-focused actor in every design review
- Use conversation responses as quotable evidence in design documents and stakeholder presentations
- After the review, clean up with `delete_conversation` if conversations were one-off
