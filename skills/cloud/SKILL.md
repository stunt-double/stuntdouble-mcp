---
name: cloud
description: Push a Stunt Double Studio checklist and its actor to a Stunt Double workspace with /stuntdouble:cloud <checklist>, run it there with an independent judge, write the cloud ids back and pull the run in beside local ones.
argument-hint: "<checklist>"
---

# Stunt Double Studio: cloud

`/stuntdouble:cloud <checklist>`, one of the Studio skills (`/stuntdouble:setup`, `/stuntdouble:run`, `/stuntdouble:open`, `/stuntdouble:cloud` and `/stuntdouble:doctor`). It moves a local checklist to the hosted `stuntdouble` server's tools unchanged.

The `.stuntdouble/` file format is in the `setup` skill's [files.md](../setup/files.md) (`../setup/files.md` from this skill's folder): read it before writing back ids or a run.

1. **Disclose:** the push uploads the persona, the checklist and the target URL to Stunt Double, and Free-plan cloud runs may go into the research corpus. Go on only with consent.
2. **Sign in:** `list_workspaces()`. On first use Claude Code shows the hosted connector's Connect card (an emailed code or Google). The local package never holds a Stunt Double token. Pick the workspace (ask if there are several) and write `workspace_id` and `workspace_slug` to `stuntdouble.json`.
3. **Fix the target:** the cloud cannot reach localhost. If `url` is local, ask for a public or preview URL, write it to `url` and move the local origin to `local_base_url`, so local runs keep using it. Or explain that devices on the Startup plan reach private targets.
4. **Push the definitions,** reusing cloud ids already in the files, else `search(workspace_id, query)` first:
   - Project: `create_project(workspace_id, name, url)`.
   - Actor: `create_actor(workspace_id, name, description)`, `update_actor(actor_id, system_prompt)`, then `add_actor_knowledge(actor_id, title, content, kind)` per entry. With an `actor_id`, `update_actor` instead and add only the entries `list_actor_knowledge` lacks by title.
   - Checklist: `create_checklist(workspace_id, project_id, name, actor_id, instructions, url, checks)`, plus each of `pass_threshold`, `score_type`, `score_unit`, `score_bands`, `run_mode` and `record_session` the file sets, sending the checks in file order without `key` or `cloud`. With a `checklist_id`, `update_checklist(checklist_id, ...)` with the same fields and each check's `id` from `check_ids`.
   - If the checklist sets `browser_config`, say so before the run: no hosted input or dashboard setting takes it yet, so the cloud run uses the default 1280 x 720 desktop browser, and a check about a phone layout, touch or a locale can pass there and fail locally.
5. **Write ids back after every call:** `project_id`, `actor_id` and `checklist_id` into their files, then `get_checklist(checklist_id)` to fill `check_ids` as `{key: id}` in order. A retry or a teammate then updates rather than duplicating.
6. **Run:** `run_checklist(checklist_id)`, then poll `get_checklist_run(run_id)` every 30 to 60 seconds until `status` is `completed` or `failed`. Write `runs/<YYYYMMDD-HHMMSS>-<checklist>-cloud/run.json` in the local run's shape, so the viewer lists it beside local runs: `format: "stuntdouble.run/1"`, `id` (the folder name), `runner: {kind: "cloud", run_id, judged: true, url}` with `url` the dashboard link `https://app.stuntdouble.io/w/<workspace_slug>/checklists/<checklist_id>/runs/<run_id>`, `status`, the checklist `url`, `started_at` (its `started_at`, else `created_at`), `finished_at` (its `completed_at`), the `checklist` and `actor` slugs, `checklist_snapshot` (the checklist file without `cloud`), `results` as `{check: <key from check_ids>, status, evidence, at: <evaluated_at>}`, `score: {score, unit: <score_unit>, outcome, pass_threshold: <get_checklist's pass_threshold, or null with no weighted checks>, grade: null}` (or `null` with no outcome), `summary` and `cloud: null`. Report as `/stuntdouble:run` reports a local run, with the dashboard link.
7. **Relay refusals:** a plan limit (the Free plan's 2 actors or 60 compute minutes) comes back as text. Relay it as written with `https://app.stuntdouble.io/w/<workspace_slug>/settings/billing`, never work around it, and offer the local run.
