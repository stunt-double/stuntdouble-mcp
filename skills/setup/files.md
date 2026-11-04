# Stunt Double Studio files

Shared by the Studio skills (`/stuntdouble:setup`, `/stuntdouble:run`, `/stuntdouble:open`, `/stuntdouble:cloud` and `/stuntdouble:doctor`).

## The files

Everything lives in `.stuntdouble/` at the project root, committed except `.live/`. Actors and checklists are the hosted `create_actor` and `create_checklist` inputs with slugs in place of ids, so `cloud` pushes them unchanged, except `browser_config`, which the hosted inputs do not take yet. They are strict and carry the hosted limits: `start_run` names each field to fix.

```jsonc
// stuntdouble.json
{"format": "stuntdouble/1", "local_base_url": null, "headless": false, "model_screenshots": "on_request", "safety": "third_party",
 "cloud": {"workspace_id": null, "workspace_slug": null, "project_id": null}}
// actors/first-time-shopper.json
{"name": "First-time shopper", "description": "Price-sensitive, on a phone, new to the site",
 "system_prompt": "You are buying a gift on a tight budget and compare prices before features.",
 "knowledge": [{"kind": "account", "title": "Test login", "content": "Use the shopper account from supabase/seed.sql"}],
 "persist_login": false, "cloud": {"actor_id": null}}
// checklists/checkout.json
{"name": "Checkout", "actor": "first-time-shopper", "url": "http://localhost:3000",
 "instructions": "Buy the cheapest mug as a guest. Stop at the payment step.",
 "checks": [{"key": "guest-checkout", "description": "Guest checkout needs no account", "type": "pass_fail", "on_failure": "stop"},
            {"key": "shipping-early", "description": "Shipping cost is shown before payment", "type": "pass_fail"},
            {"key": "order-total", "description": "Record the order total", "type": "informational"}],
 "cloud": {"checklist_id": null, "check_ids": {}}}
```

A local run swaps the checklist URL's origin for `local_base_url` when it is set. `runs/<stamp>-<checklist>/` (`run.json`, `activity.jsonl`, `shots/`) is written by the server; never edit it. Read and write these files with Read and Write, never Bash, so only setup's URL check needs shell approval.

## hooks

The plugin ships two Claude Code hooks (`hooks/hooks.json`), off in every project until `.stuntdouble/hooks.json` switches them on. Without that file, or with a hook set to `false`, they exit at once with no output.

- `session_summary`: at session start, adds a few lines naming the checklists, the latest run's outcome and pass count, and that `/stuntdouble:run <checklist>` is there. Read-only.
- `suggest_after_edit`: after an Edit, Write or MultiEdit to a file matching `ui_globs`, adds a note to offer the checklists whose `checklists_for` globs match (else every checklist), once per checklist per session (markers in `.stuntdouble/.live/hooks/`). An edit no `checklists_for` entry matches offers the rest once per session. Edits made inside a subagent are skipped. It never starts a run: offer it, and run only if the person agrees.

Globs are relative to the project root and take `**`, `*`, `?` and `{a,b}`; `*.tsx` matches only the top level, so write `**/*.tsx`. To switch a hook off for the project, set it to `false`; to switch both off, delete `.stuntdouble/hooks.json`. The file is committed, so for one person only, set `STUNTDOUBLE_HOOKS=off` in their shell or in the `env` of `.claude/settings.local.json`.
