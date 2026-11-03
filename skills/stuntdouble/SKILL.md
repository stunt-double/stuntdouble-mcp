---
name: stuntdouble
description: Run Stunt Double checklists locally from Claude Code with /stuntdouble setup, run, open, cloud and doctor. Setup readies a project in one pass (dev server, first actor and checklists, CLAUDE.md notes, tool permissions and session hooks). An actor goes through localhost, staging or production in a local Chrome, each run is kept as files in .stuntdouble/ with a local viewer, and cloud pushes the same files to a Stunt Double workspace.
argument-hint: "setup | run <checklist> [resume] | open | cloud <checklist> | doctor"
---

# Stunt Double Studio

`/stuntdouble <verb>`. Local runs use the person's own Claude plan: this session is the actor, and the plugin's `local` MCP server (`npx stuntdouble@0.1.3 mcp`) only drives a local Chrome, writes files and serves the viewer. Nothing else calls a model, and no account is needed. Say so before the first run in a session.

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
            {"key": "shipping-early", "description": "Shipping cost is shown before payment", "type": "pass_fail"},
            {"key": "order-total", "description": "Record the order total", "type": "informational"}],
 "cloud": {"checklist_id": null, "check_ids": {}}}
```

A local run swaps the checklist URL's origin for `local_base_url` when it is set. `runs/<stamp>-<checklist>/` (`run.json`, `activity.jsonl`, `shots/`) is written by the server; never edit it. Read and write these files with Read and Write, never Bash, so only setup's URL check needs shell approval.

## setup

Setup is the whole onboarding: it leaves the project ready to run and future sessions knowing how. Infer everything the code answers and show it; ask only what it cannot (usually who the user is, and the port when nothing names one). Show each change (the file and what goes in it, or the lines added) and write it only once the person approves; they can approve several at once. Never overwrite a file that exists: merge or append as each step says.

1. Run [doctor](#doctor) and relay it. A `FAIL` line blocks local runs until fixed.
2. Tell the person plainly: local runs count against their Claude plan, or their API key when Claude Code uses one (doctor notes when `ANTHROPIC_API_KEY` is set). Stunt Double makes no model calls.
3. **Find the dev server.** Read `package.json` (in a monorepo, the app's; ask which app if several have a UI): the `dev`, then `start`, then `preview` script. A `--port`, `-p` or `PORT=` in the script, or `server.port` in the framework config, wins; else the framework default: Next.js 3000, Vite 5173, Remix 3000 (5173 on Vite), Astro 4321, SvelteKit 5173, Rails 3000 (`Gemfile`), Django 8000 (`manage.py`), Laravel 8000 (`artisan`). With none of these, ask. Show it as one line: "Next.js, `pnpm dev`, http://localhost:3000".
4. **Write `stuntdouble.json`** as above with `local_base_url` set to that origin, and `.stuntdouble/.live/` added to the project's `.gitignore` (append the line if missing; create the file if there is none). Add no other keys: the file is strict.
5. **Draft the actor and two to four checklists** from the app itself: the README for who it is for, and the real routes (`app/`, `pages/`, `src/routes/`, `src/pages/`, `config/routes.rb`, `urls.py`, `routes/web.php` or the router config). Pick the flows that matter most (sign-up, the core task, checkout) and give each its route URL on the dev origin. Name the actor by role, never a human name. Write 3 to 8 checks per checklist as observable behaviour, each with a lowercase, hyphenated `key` that never changes, since verdicts and cloud ids follow it. Default to `pass_fail` checks and no `pass_threshold`: the run then passes when every pass/fail check passes. Use `weighted` checks (with `weight` and a `pass_threshold`) only for two or more where a partial pass means something; one weighted check makes the score all or nothing. Knowledge holds test accounts only (seed files, fixtures), never real credentials: the files are committed. Show the drafts together, then write them.
6. **Check each checklist's URL responds,** with one Bash call the person approves: `curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' --max-time 5 <url> ...`. A connection error means the dev server is not running: say which command starts it and carry on. A 404 means the route is wrong: fix the checklist.
7. **Tell future sessions.** Append this section to the project's `CLAUDE.md` (create it if missing; if `CLAUDE.md` only imports `AGENTS.md`, append to `AGENTS.md`), unless a `## Stunt Double Studio` heading is already there. Fill in the checklists; keep it plain Markdown so any agent can read it:

   ```markdown
   ## Stunt Double Studio

   `.stuntdouble/` holds Stunt Double checklists that an actor runs in a local Chrome against the dev server (<origin>, started with `<command>`): <checklist>, <checklist>.

   - After changing a page or flow a checklist covers, offer `/stuntdouble run <checklist>` before finishing. Never start a run unasked: it uses the person's Claude plan.
   - Lead with the result ("Failed: 3 of 4 checks passed"), then each failed check with its evidence. Fix what failed and offer to run it again.
   - Runs are kept in `.stuntdouble/runs/`; never edit them. `/stuntdouble open` shows them all.
   ```

8. **Skip the prompt on every browser action.** Add `"mcp__plugin_stuntdouble_local"` to `permissions.allow` in the project's `.claude/settings.json`: read the file, add the entry to the list (create `permissions` or `allow` only if missing) and write it back with every other key as it was. Create the file with just that rule if there is none. That file is shared with the team; offer `.claude/settings.local.json` to someone who wants the rule for themselves only. If the file does not parse as plain JSON (comments, trailing commas, a merge conflict), never rewrite it: show the line and where it goes, and let the person add it. If the write is refused, show the same line, or point them to `/permissions` (Allow, add `mcp__plugin_stuntdouble_local`).
9. **Enable the hooks** the person wants (both by default) by writing `.stuntdouble/hooks.json`, with `ui_globs` covering the UI files found in step 5 and `checklists_for` mapping each checklist to the files of its routes:

   ```json
   {
     "format": "stuntdouble.hooks/1",
     "session_summary": true,
     "suggest_after_edit": true,
     "ui_globs": ["app/**/*.{tsx,jsx,css}", "components/**/*.{tsx,jsx}"],
     "checklists_for": { "checkout": ["app/checkout/**", "components/cart/**"] }
   }
   ```

   See [hooks](#hooks).

10. Show what was written in one short list, then offer the first run: `/stuntdouble run <checklist>`, naming the checklist most likely to find something.

Run again, setup keeps what is there: it adds only what is missing and offers changes to the rest.

## run <checklist> [resume]

1. `start_run(checklist, resume?)`, with `resume: true` when asked. Fix any field it names and call again.
2. Print only the viewer link from its output: the person can watch the run and stop it there.
3. Dispatch the `stuntdouble:stuntdouble-actor` agent with the full `start_run` output as its prompt. Never drive the browser from this thread: page text and screenshots stay in the actor's context.
4. Lead with the result from its reply: "Failed: 3 of 4 checks passed", then the score, or "no score" where `score` is null, explained in one clause (the checklist has no weighted checks, so it passes only when every pass/fail check passes). Then each failed and not-judged check with its evidence, and the viewer link. Say the verdicts are self-judged; a cloud run adds an independent judge. Offer to fix what failed and run again.

If the actor ends without `finish_run` (or was interrupted), `start_run(checklist, resume: true)` carries on with the run still open, and its output is the brief for a fresh dispatch: recorded verdicts stand. If the session closed mid-run, `/stuntdouble run <checklist> resume` judges only the checks left.

## open

`open_ui()` and print the link. Someone without Claude Code runs `npx stuntdouble view` in the project folder.

## doctor

Call `doctor()` from the `local` server and relay its lines. Only if this session has no `doctor` tool, run `npx -y stuntdouble@0.1.3 doctor` with Bash, or ask the person to run it in a terminal where Bash is not allowed. If the local tools are missing altogether, the `local` server did not start: check Node 22.18 or later and `npx`, then `/mcp`. A slow first tool listing is `npx` starting up (about 1.5 seconds), not the server.

## hooks

The plugin ships two Claude Code hooks (`hooks/hooks.json`), off in every project until `.stuntdouble/hooks.json` switches them on. Without that file, or with a hook set to `false`, they exit at once with no output.

- `session_summary`: at session start, adds a few lines naming the checklists, the latest run's outcome and pass count, and that `/stuntdouble run <checklist>` is there. Read-only.
- `suggest_after_edit`: after an Edit, Write or MultiEdit to a file matching `ui_globs`, adds a note to offer the checklists whose `checklists_for` globs match (else every checklist), once per checklist per session (markers in `.stuntdouble/.live/hooks/`). An edit no `checklists_for` entry matches offers the rest once per session. Edits made inside a subagent are skipped. It never starts a run: offer it, and run only if the person agrees.

Globs are relative to the project root and take `**`, `*`, `?` and `{a,b}`; `*.tsx` matches only the top level, so write `**/*.tsx`. To switch a hook off for the project, set it to `false`; to switch both off, delete `.stuntdouble/hooks.json`. The file is committed, so for one person only, set `STUNTDOUBLE_HOOKS=off` in their shell or in the `env` of `.claude/settings.local.json`.

## cloud <checklist>

1. **Disclose:** the push uploads the persona, the checklist and the target URL to Stunt Double, and Free-plan cloud runs may go into the research corpus. Go on only with consent.
2. **Sign in:** `list_workspaces()`. On first use Claude Code shows the hosted connector's Connect card (an emailed code or Google). The local package never holds a Stunt Double token. Pick the workspace (ask if there are several) and write `workspace_id` and `workspace_slug` to `stuntdouble.json`.
3. **Fix the target:** the cloud cannot reach localhost. If `url` is local, ask for a public or preview URL, write it to `url` and move the local origin to `local_base_url`, so local runs keep using it. Or explain that devices on the Startup plan reach private targets.
4. **Push the definitions,** reusing cloud ids already in the files, else `search(workspace_id, query)` first:
   - Project: `create_project(workspace_id, name, url)`.
   - Actor: `create_actor(workspace_id, name, description)`, `update_actor(actor_id, system_prompt)`, then `add_actor_knowledge(actor_id, title, content, kind)` per entry. With an `actor_id`, `update_actor` instead and add only the entries `list_actor_knowledge` lacks by title.
   - Checklist: `create_checklist(workspace_id, project_id, name, actor_id, instructions, url, checks)`, plus each of `pass_threshold`, `score_type`, `score_unit`, `score_bands`, `run_mode` and `record_session` the file sets, sending the checks in file order without `key` or `cloud`. With a `checklist_id`, `update_checklist(checklist_id, ...)` with the same fields and each check's `id` from `check_ids`.
   - If the checklist sets `browser_config`, say so before the run: no hosted input or dashboard setting takes it yet, so the cloud run uses the default 1280 x 720 desktop browser, and a check about a phone layout, touch or a locale can pass there and fail locally.
5. **Write ids back after every call:** `project_id`, `actor_id` and `checklist_id` into their files, then `get_checklist(checklist_id)` to fill `check_ids` as `{key: id}` in order. A retry or a teammate then updates rather than duplicating.
6. **Run:** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Write `runs/<YYYYMMDD-HHMMSS>-<checklist>-cloud/run.json` in the local run's shape, so the viewer lists it beside local runs: `format: "stuntdouble.run/1"`, `id` (the folder name), `runner: {kind: "cloud", run_id, judged: true, url}` with `url` the dashboard link `https://app.stuntdouble.io/w/<workspace_slug>/checklists/<checklist_id>/runs/<run_id>`, `status`, the checklist `url`, `started_at` (its `started_at`, else `created_at`), `finished_at` (its `completed_at`), the `checklist` and `actor` slugs, `checklist_snapshot` (the checklist file without `cloud`), `results` as `{check: <key from check_ids>, status, evidence, at: <evaluated_at>}`, `score: {score, unit: <score_unit>, outcome, pass_threshold: <get_checklist's pass_threshold, or null with no weighted checks>, grade: null}` (or `null` with no outcome), `summary` and `cloud: null`. Report as for a local run, with the dashboard link.
7. **Relay refusals:** a plan limit (the Free plan's 2 actors or 60 compute minutes) comes back as text. Relay it as written with `https://app.stuntdouble.io/w/<workspace_slug>/settings/billing`, never work around it, and offer the local run.
