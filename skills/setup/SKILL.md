---
name: setup
description: Set up Stunt Double Studio in this project in one pass with /stuntdouble:setup: find the dev server, draft an actor and checklists from the app's routes, and add the CLAUDE.md notes, tool permission and session hooks, each change shown before it is written.
---

# Stunt Double Studio: setup

`/stuntdouble:setup`, one of the Studio skills (`/stuntdouble:setup`, `/stuntdouble:run`, `/stuntdouble:open`, `/stuntdouble:cloud` and `/stuntdouble:doctor`). Local runs use the person's own Claude plan: this session is the actor, and the plugin's `local` MCP server (`npx stuntdouble@0.1.3 mcp`) only drives a local Chrome, writes files and serves the viewer. Nothing else calls a model, and no account is needed. Say so before the first run in a session.

The `local` server ships only in the Claude Code plugin. Where its tools are missing, use the cloud skills. Schedules, deploy and PR triggers, teams, interviews and several actors at once are cloud work: hand them to `setup-guardrails`, `maintain-automations`, `run-user-interview`, `design-review`, `create-actor-panel` or `run-qa-suite`.

The `.stuntdouble/` file format and the hooks are in [files.md](files.md), in this skill's folder: read it before writing any file.

Setup is the whole onboarding: it leaves the project ready to run and future sessions knowing how. Infer everything the code answers and show it; ask only what it cannot (usually who the user is, and the port when nothing names one). Show each change (the file and what goes in it, or the lines added) and write it only once the person approves; they can approve several at once. Never overwrite a file that exists: merge or append as each step says.

1. Run the `doctor` skill (`/stuntdouble:doctor`) and relay it. A `FAIL` line blocks local runs until fixed.
2. Tell the person plainly: local runs count against their Claude plan, or their API key when Claude Code uses one (doctor notes when `ANTHROPIC_API_KEY` is set). Stunt Double makes no model calls.
3. **Find the dev server.** Read `package.json` (in a monorepo, the app's; ask which app if several have a UI): the `dev`, then `start`, then `preview` script. A `--port`, `-p` or `PORT=` in the script, or `server.port` in the framework config, wins; else the framework default: Next.js 3000, Vite 5173, Remix 3000 (5173 on Vite), Astro 4321, SvelteKit 5173, Rails 3000 (`Gemfile`), Django 8000 (`manage.py`), Laravel 8000 (`artisan`). With none of these, ask. Show it as one line: "Next.js, `pnpm dev`, http://localhost:3000".
4. **Write `.stuntdouble/stuntdouble.json`** in the shape [files.md](files.md) shows, with `local_base_url` set to that origin, and `.stuntdouble/.live/` added to the project's `.gitignore` (append the line if missing; create the file if there is none). Add no other keys: the file is strict.
5. **Draft the actor and two to four checklists** from the app itself: the README for who it is for, and the real routes (`app/`, `pages/`, `src/routes/`, `src/pages/`, `config/routes.rb`, `urls.py`, `routes/web.php` or the router config). Pick the flows that matter most (sign-up, the core task, checkout) and give each its route URL on the dev origin. Name the actor by role, never a human name. Write 3 to 8 checks per checklist as observable behaviour, each with a lowercase, hyphenated `key` that never changes, since verdicts and cloud ids follow it. Default to `pass_fail` checks and no `pass_threshold`: the run then passes when every pass/fail check passes. Use `weighted` checks (with `weight` and a `pass_threshold`) only for two or more where a partial pass means something; one weighted check makes the score all or nothing. Knowledge holds test accounts only (seed files, fixtures), never real credentials: the files are committed. Show the drafts together, then write them.
6. **Check each checklist's URL responds,** with one Bash call the person approves: `curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' --max-time 5 <url> ...`. A connection error means the dev server is not running: say which command starts it and carry on. A 404 means the route is wrong: fix the checklist.
7. **Tell future sessions.** Append this section to the project's `CLAUDE.md` (create it if missing; if `CLAUDE.md` only imports `AGENTS.md`, append to `AGENTS.md`), unless a `## Stunt Double Studio` heading is already there. Fill in the checklists; keep it plain Markdown so any agent can read it:

   ```markdown
   ## Stunt Double Studio

   `.stuntdouble/` holds Stunt Double checklists that an actor runs in a local Chrome against the dev server (<origin>, started with `<command>`): <checklist>, <checklist>.

   - After changing a page or flow a checklist covers, offer `/stuntdouble:run <checklist>` before finishing. Never start a run unasked: it uses the person's Claude plan.
   - Lead with the result ("Failed: 3 of 4 checks passed"), then each failed check with its evidence. Fix what failed and offer to run it again.
   - Runs are kept in `.stuntdouble/runs/`; never edit them. `/stuntdouble:open` shows them all.
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

   See [hooks](files.md#hooks).

10. Show what was written in one short list, then offer the first run: `/stuntdouble:run <checklist>`, naming the checklist most likely to find something.

Run again, setup keeps what is there: it adds only what is missing and offers changes to the rest.
