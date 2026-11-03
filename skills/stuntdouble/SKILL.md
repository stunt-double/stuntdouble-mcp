---
name: stuntdouble
description: Run Stunt Double checklists locally from Claude Code with /stuntdouble setup, run, open, cloud and doctor. An actor goes through localhost, staging or production in a local Chrome, each run is kept as files in .stuntdouble/ with a local viewer, and cloud pushes the same files to a Stunt Double workspace.
argument-hint: "setup | run <checklist> [resume] | open | cloud <checklist> | doctor"
---

# Stunt Double Local

`/stuntdouble <verb>`. Local runs use the person's own Claude plan: this session is the actor, and the plugin's `local` MCP server (`npx stuntdouble@0.1.2 mcp`) only drives a local Chrome, writes files and serves the viewer. Nothing else calls a model, and no account is needed. Say so before the first run in a session.

The `local` server ships only in the Claude Code plugin. Where its tools are missing, use the cloud skills. Schedules, deploy and PR triggers, teams, interviews and several actors at once are cloud work too: hand them to `setup-guardrails`, `maintain-automations`, `run-user-interview`, `design-review`, `create-actor-panel` or `run-qa-suite`.

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
            {"key": "shipping-early", "description": "Shipping cost is shown before payment", "type": "weighted", "weight": 2},
            {"key": "order-total", "description": "Record the order total", "type": "informational"}],
 "pass_threshold": 80, "cloud": {"checklist_id": null, "check_ids": {}}}
```

A local run swaps the checklist URL's origin for `local_base_url` when it is set. `runs/<stamp>-<checklist>/` (`run.json`, `activity.jsonl`, `shots/`) is written by the server; never edit it.

## setup

1. Run `npx -y stuntdouble@0.1.2 doctor` with Bash and relay it. A `FAIL` line blocks local runs until fixed.
2. Tell the person plainly: local runs count against their Claude plan (or the API key doctor names, when `ANTHROPIC_API_KEY` is set). Stunt Double makes no model calls.
3. Ask for the URL to test (localhost is fine), who the user is, and what must be true.
4. Write `stuntdouble.json`, a `.gitignore` holding `.live/`, the actor and the checklist, as above. Name the actor by role, never a human name. Write 3 to 8 checks as observable behaviour, each with a lowercase, hyphenated `key` that never changes, since verdicts and cloud ids follow it. Knowledge holds test accounts only, never real credentials: the files are committed.
5. Offer to skip the prompt on every browser action. With consent, add `"mcp__plugin_stuntdouble_local"` to `permissions.allow` in `.claude/settings.local.json`, keeping what is there.
6. Offer `/stuntdouble run <checklist>`.

## run <checklist> [resume]

1. `start_run(checklist, resume?)`, with `resume: true` when asked. Fix any field it names and call again.
2. Print the viewer link from its output: the person can watch the run and stop it there.
3. Dispatch the `stuntdouble:stuntdouble-actor` agent with the full `start_run` output as its prompt. Never drive the browser from this thread: page text and screenshots stay in the actor's context.
4. Report its result: outcome, score, each failed check with its evidence, and the viewer link. Say the verdicts are self-judged; a cloud run adds an independent judge. Offer to fix what failed and run again.

If the actor ends without `finish_run` (or was interrupted), `start_run(checklist, resume: true)` carries on with the run still open, and its output is the brief for a fresh dispatch: recorded verdicts stand. If the session closed mid-run, `/stuntdouble run <checklist> resume` judges only the checks left.

## open

`open_ui()` and print the link. Someone without Claude Code runs `npx stuntdouble view` in the project folder.

## doctor

Run `npx -y stuntdouble@0.1.2 doctor` with Bash and relay it. If the local tools are missing from this session, the `local` server did not start: check Node 22.18 or later and `npx`, then `/mcp`.

## cloud <checklist>

1. **Disclose:** the push uploads the persona, the checklist and the target URL to Stunt Double, and Free-plan cloud runs may go into the research corpus. Go on only with consent.
2. **Sign in:** `list_workspaces()`. On first use Claude Code shows the hosted connector's Connect card (an emailed code or Google). The local package never holds a Stunt Double token. Pick the workspace (ask if there are several) and write `workspace_id` and `workspace_slug` to `stuntdouble.json`.
3. **Fix the target:** the cloud cannot reach localhost. If `url` is local, ask for a public or preview URL, write it to `url` and move the local origin to `local_base_url`, so local runs keep using it. Or explain that devices on the Startup plan reach private targets.
4. **Push the definitions,** reusing cloud ids already in the files, else `search(workspace_id, query)` first:
   - Project: `create_project(workspace_id, name, url)`.
   - Actor: `create_actor(workspace_id, name, description)`, `update_actor(actor_id, system_prompt)`, then `add_actor_knowledge(actor_id, title, content, kind)` per entry. With an `actor_id`, `update_actor` instead and add only the entries `list_actor_knowledge` lacks by title.
   - Checklist: `create_checklist(workspace_id, project_id, name, actor_id, instructions, url, checks, pass_threshold, score_type)`, plus each of `score_unit`, `score_bands`, `run_mode` and `record_session` the file sets, sending the checks in file order without `key` or `cloud`. With a `checklist_id`, `update_checklist(checklist_id, ...)` with the same fields and each check's `id` from `check_ids`.
   - If the checklist sets `browser_config`, say so before the run: no hosted input or dashboard setting takes it yet, so the cloud run uses the default 1280 x 720 desktop browser, and a check about a phone layout, touch or a locale can pass there and fail locally.
5. **Write ids back after every call:** `project_id`, `actor_id` and `checklist_id` into their files, then `get_checklist(checklist_id)` to fill `check_ids` as `{key: id}` in order. A retry or a teammate then updates rather than duplicating.
6. **Run:** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Write `runs/<YYYYMMDD-HHMMSS>-<checklist>-cloud/run.json` in the local run's shape, so the viewer lists it beside local runs: `format: "stuntdouble.run/1"`, `id` (the folder name), `runner: {kind: "cloud", run_id, judged: true, url}` with `url` the dashboard link `https://app.stuntdouble.io/w/<workspace_slug>/checklists/<checklist_id>/runs/<run_id>`, `status`, the checklist `url`, `started_at`, `finished_at` (its `completed_at`), the `checklist` and `actor` slugs, `checklist_snapshot` (the checklist file without `cloud`), `results` as `{check: <key from check_ids>, status, evidence, at: <evaluated_at>}`, `score: {score, unit: <score_unit>, outcome, pass_threshold: <the file's, else 100>, grade: null}` (or `null` with no outcome), `summary` and `cloud: null`. Report as for a local run, with the dashboard link.
7. **Relay refusals:** a plan limit (the Free plan's 2 actors or 60 compute minutes) comes back as text. Relay it as written with `https://app.stuntdouble.io/w/<workspace_slug>/settings/billing`, never work around it, and offer the local run.
