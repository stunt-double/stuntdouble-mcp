---
name: run
description: Run a Stunt Double Studio checklist in a local Chrome with /stuntdouble:run <checklist> [resume]: an actor goes through localhost, staging or production, and the result comes back with each failed check's evidence and a viewer link.
argument-hint: "<checklist> [resume]"
---

# Stunt Double Studio: run

`/stuntdouble:run <checklist> [resume]`, one of the Studio skills (`/stuntdouble:setup`, `/stuntdouble:run`, `/stuntdouble:open`, `/stuntdouble:cloud` and `/stuntdouble:doctor`). Local runs use the person's own Claude plan: this session is the actor, and the plugin's `local` MCP server (`npx stuntdouble@0.1.3 mcp`) only drives a local Chrome, writes files and serves the viewer. Nothing else calls a model, and no account is needed. Say so before the first run in a session.

The `local` server ships only in the Claude Code plugin. Where its tools are missing, use the cloud skills. With no `.stuntdouble/stuntdouble.json`, offer `/stuntdouble:setup` first. To fix a field `start_run` names, the file format is in the `setup` skill's [files.md](../setup/files.md) (`../setup/files.md` from this skill's folder).

1. `start_run(checklist, resume?)`, with `resume: true` when asked. Fix any field it names and call again.
2. Print only the viewer link from its output: the person can watch the run and stop it there.
3. Dispatch the `stuntdouble:stuntdouble-actor` agent with the full `start_run` output as its prompt. Never drive the browser from this thread: page text and screenshots stay in the actor's context.
4. Lead with the result from its reply: "Failed: 3 of 4 checks passed", then the score, or "no score" where `score` is null, explained in one clause (the checklist has no weighted checks, so it passes only when every pass/fail check passes). Then each failed and not-judged check with its evidence, and the viewer link. Say the verdicts are self-judged; a cloud run adds an independent judge. Offer to fix what failed and run again.

If the actor ends without `finish_run` (or was interrupted), `start_run(checklist, resume: true)` carries on with the run still open, and its output is the brief for a fresh dispatch: recorded verdicts stand. If the session closed mid-run, `/stuntdouble:run <checklist> resume` judges only the checks left.
