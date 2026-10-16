---
name: create-actor-panel
description: Create and configure Stunt Double actors (AI personas) with system prompts and knowledge entries, to cover user segments such as first-time users, enterprise admins or accessibility users.
---

# Create actor panel

1. **Avoid duplicates:** `list_workspaces()`, then `list_actors(workspace_id)`.
2. **Create:** `create_actor(workspace_id, name, description)`. Name like "Emma - First-time SaaS user"; the description captures goals, frustrations and technical comfort.
3. **Identity:** `update_actor(actor_id, system_prompt, capabilities)`. The system prompt covers background, goals, pain points, skill level and communication style, written in second person ("You are Emma, a 28-year-old marketing coordinator... You abandon a flow that takes more than a few minutes without showing value").
4. **Knowledge:** `add_actor_knowledge(actor_id, title, content)` for product docs, pricing and FAQ, plus persona context. Standards (brand, compliance) belong in project guidelines instead. Keep entries current; `remove_actor_knowledge` drops outdated ones.
5. **Verify:** `get_actor(actor_id)`, `list_actor_knowledge(actor_id)`, then exercise the persona with a small `create_checklist` and `run_checklist` to confirm it behaves as written.

Aim for 3 or 4 diverse actors per product, with realistic constraints (mobile only, slow connection, non-English speaker, screen reader user).
