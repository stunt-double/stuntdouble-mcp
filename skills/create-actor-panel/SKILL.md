---
name: create-actor-panel
description: Create and configure a Stunt Double actor (AI persona) with knowledge entries for realistic user simulation.
---

# Create actor panel

## When to use

- When setting up a new user persona for journey testing
- When you need an actor representing a specific user segment (enterprise admin, first-time user, accessibility user, etc.)
- When expanding test coverage to include underrepresented user types
- When a design review or feedback triage reveals a missing persona

## Instructions

1. **Identify the workspace:**
   - `list_workspaces()` → find the target workspace

2. **Check existing actors to avoid duplicates:**
   - `list_actors(workspace_id)` → review current personas

3. **Create the actor:**
   - `create_actor(workspace_id, name, description)` → create with a clear, human name and description
   - Name format: "FirstName - Role/Trait" (e.g., "Emma - First-time SaaS user")
   - Description should capture goals, frustrations, and technical comfort level

4. **Configure the actor's identity:**
   - `update_actor(actor_id, system_prompt, capabilities)` → set the system prompt that defines how this persona behaves, thinks, and reacts
   - System prompt should include: background, goals, pain points, technical skill level, and communication style

5. **Add knowledge entries:**
   - `add_actor_knowledge(actor_id, title, content)` → give the actor context about your product
   - Common knowledge: product docs, feature guides, pricing pages, FAQ content
   - Persona-specific knowledge: their company context, past experience, specific needs

6. **Verify the setup:**
   - `get_actor(actor_id)` → confirm system prompt and capabilities
   - `list_actor_knowledge(actor_id)` → confirm knowledge entries
   - `create_conversation(workspace_id, actor_id, title: "Setup verification")` → test with a quick conversation

## Example actor configurations

### First-time user
```
Name: "Emma - First-time SaaS user"
Description: "Non-technical user trying a project management tool for the first time.
Works at a small marketing agency. Comfortable with email and spreadsheets but
hasn't used specialized SaaS tools before."
System prompt: "You are Emma, a 28-year-old marketing coordinator at a 10-person agency.
You've been asked by your boss to find a project management tool. You're not very
technical — you mainly use Google Sheets and email. You get frustrated by jargon
and prefer clear, simple interfaces. You'll abandon a flow if it takes more than
a few minutes without showing value."
```

### Enterprise admin
```
Name: "Carlos - Enterprise IT admin"
Description: "Technical user responsible for evaluating and deploying tools across a
500-person organization. Cares about SSO, permissions, audit logs, and compliance."
System prompt: "You are Carlos, a 42-year-old IT director at a mid-size financial
services company. You evaluate SaaS tools for security, compliance, and scalability.
You need SSO/SAML, role-based access control, and audit logs. You'll reject any
tool that can't explain its data handling. You're thorough and ask pointed questions."
```

### Accessibility user
```
Name: "Sam - Screen reader user"
Description: "Visually impaired user who navigates entirely with a screen reader and
keyboard. Tests for WCAG compliance and accessible UX patterns."
System prompt: "You are Sam, a 35-year-old software developer who is blind. You use
NVDA screen reader with Firefox. You navigate by headings, landmarks, and tab order.
You expect proper ARIA labels, logical focus management, and meaningful alt text.
You get frustrated by unlabeled buttons, focus traps, and content that only makes
sense visually."
```

## Tips

- Create at least 3-4 diverse actors per product to cover different user segments
- Give actors realistic constraints (slow internet, mobile-only, non-English speaker) for edge case coverage
- Update actor knowledge when your product changes so personas stay current
- Use `remove_actor_knowledge` to clean up outdated knowledge entries
