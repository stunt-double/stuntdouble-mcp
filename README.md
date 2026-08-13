# Stunt Double MCP Server

Deploy AI user personas to validate user journeys at scale. Find UX friction before real users do.

[Stunt Double](https://stuntdouble.io) deploys AI agents with realistic user personas to validate user journeys at scale. Create actors, run automated workflows and checklists against any web app, and surface friction points before real users encounter them. Integrates with Claude, Linear, GitHub, and Slack.

## This repository

This repo holds **plugin and MCP configuration** (`.cursor-plugin/plugin.json`, root `mcp.json`, `server.json`), plus skills, agents, and Cursor rules. There is **no `package.json`** and **no runnable server** here — the MCP endpoint is hosted at `https://app.stuntdouble.io/api/mcp` from the main Stunt Double codebase. See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to validate edits and avoid confusing this folder with a Node package.

## Quick Start

### Claude Code

```bash
claude mcp add --transport http stuntdouble https://app.stuntdouble.io/api/mcp
```

### Claude Desktop

Go to **Settings → Connectors → Add** and paste:

```
https://app.stuntdouble.io/api/mcp
```

### Cursor / Windsurf

Add the `mcpServers` block below to an MCP config file:

- **Project-local (recommended for this repo clone):** `.cursor/mcp.json` at the root of your project.
- **Global (all projects):** `~/.cursor/mcp.json` on macOS/Linux (see [Cursor MCP docs](https://cursor.com/docs/mcp.md) for your OS).

```json
{
  "mcpServers": {
    "stuntdouble": {
      "url": "https://app.stuntdouble.io/api/mcp"
    }
  }
}
```

Use only `url` for remote servers (Streamable HTTP is negotiated automatically). Extra keys such as `"type": "streamable-http"` are not part of [Cursor's documented `mcp.json` shape](https://cursor.com/docs/mcp.md) and can break plugin validation.

**Cursor marketplace (one-click install)** expects a [plugin layout](https://cursor.com/docs/reference/plugins.md): `.cursor-plugin/plugin.json` plus root `mcp.json`. Those files are in this repo. The plugin `logo` path is `assets/logo.png` (bundled in this repository). The `server.json` file is the separate [MCP registry](https://modelcontextprotocol.io/registry/about) manifest for `mcp-publisher` and directory listings; Cursor's installer does not use it.

## Authentication

Authentication is handled automatically via OAuth 2.1 with PKCE. The first time your AI client connects, a browser window will open for you to sign in and authorise access to your Stunt Double account. No API keys or tokens required.

For **Cursor**, the OAuth redirect URI is fixed to `cursor://anysphere.cursor-mcp/oauth/callback` ([docs](https://cursor.com/docs/mcp.md)).

## Available Tools

### Workspaces

| Tool                     | Description                         |
| ------------------------ | ----------------------------------- |
| `list_workspaces`        | List your workspaces                |
| `get_workspace`          | Get workspace details by ID or slug |
| `list_workspace_members` | List members of a workspace         |

### Search

| Tool     | Description                                                                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search` | Search a workspace across projects, actors, checklists, interviews, automations, issues, goals, feedback, actor knowledge, insights, design reviews, project resources and conversations. Ranked, with optional filters |

`search` takes a `workspace_id` plus an optional `query`, `types` filter, `project_id`
filter and `limit` (max 50). Terms are matched as prefixes, so a partial word is enough.
Omit `query` to browse the most recently updated items. Results carry the `id` you need
for the matching getter, so it is usually cheaper than listing an entity type and
filtering the list yourself. Reach for it before creating anything, to find the actor or
checklist that already covers the job.

### Projects

| Tool             | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `list_projects`  | List projects in a workspace                                               |
| `get_project`    | Get a project (the product tracked by checklists, workflows, feedback)     |
| `create_project` | Create a project (a product to track with checklists, workflows, feedback) |

### Actors

| Tool           | Description                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `list_actors`  | List active actors in a workspace                                                                               |
| `get_actor`    | Get actor details including system prompt and capabilities                                                      |
| `create_actor` | Create a new actor in a workspace                                                                               |
| `update_actor` | Update actor name, description, system prompt, capabilities, or status. Set status to "archived" to soft-delete |

### Knowledge

| Tool                     | Description                         |
| ------------------------ | ----------------------------------- |
| `list_actor_knowledge`   | List knowledge entries for an actor |
| `add_actor_knowledge`    | Add a knowledge entry to an actor   |
| `remove_actor_knowledge` | Remove a knowledge entry            |

### Conversations

| Tool                 | Description                                      |
| -------------------- | ------------------------------------------------ |
| `list_conversations` | List conversations, optionally filtered by actor |
| `get_conversation`   | Get a conversation with its messages             |

### Checklists

| Tool                | Description                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `list_checklists`   | List checklists in a workspace                                                             |
| `get_checklist`     | Get checklist details, checks, and recent runs                                             |
| `get_checklist_run` | Get a checklist run with per-check results                                                 |
| `run_checklist`     | Trigger a checklist run (async). Returns run ID                                            |
| `create_checklist`  | Create a browser-based QA checklist (host via project or URL, actor, instructions, checks) |
| `update_checklist`  | Update a checklist (pass `checks` to replace the full set)                                 |
| `delete_checklist`  | Delete a checklist and its checks and runs                                                 |

### Workflows

| Tool                   | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `list_workflows`       | List workflows in a workspace                      |
| `get_workflow`         | Get workflow details with steps and recent runs    |
| `run_workflow`         | Trigger a workflow run (async). Returns run ID     |
| `get_workflow_run`     | Get a workflow run with step-level details         |
| `create_workflow`      | Create a workflow (multi-step automation)          |
| `update_workflow`      | Update a workflow's name, description, or trigger  |
| `toggle_workflow`      | Activate or pause a workflow                       |
| `delete_workflow`      | Delete a workflow and its steps and runs           |
| `add_workflow_step`    | Append a step to a workflow                        |
| `update_workflow_step` | Update a workflow step type, config, or sort order |
| `remove_workflow_step` | Remove a step from a workflow                      |

### Feedback

| Tool                     | Description                                |
| ------------------------ | ------------------------------------------ |
| `list_feedback`          | List feedback for a project, newest first  |
| `get_feedback`           | Get a feedback submission with its replies |
| `update_feedback_status` | Update feedback status                     |

### GitHub

| Tool                 | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `list_pull_requests` | List pull requests for a GitHub repository                             |
| `get_pull_request`   | Get details for a GitHub pull request (title, author, branches, stats) |
| `comment_on_pr`      | Post a comment on a GitHub pull request                                |

### Interviews

Structured user interviews — actors or generated personas run through a discussion guide (sections + questions/tasks) against a target URL, then Stunt Double synthesises themes and recommendations.

| Tool                          | Description                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `list_interviews`             | List interviews in a workspace, optionally filtered by project                             |
| `get_interview`               | Get an interview with its discussion guide (sections + items) and participants             |
| `create_interview`            | Create a new interview in a project (name, target URL, research brief)                     |
| `update_interview`            | Update an interview's name, target URL, research brief, or status                          |
| `add_interview_section`       | Add a section to the discussion guide                                                      |
| `add_interview_item`          | Add a question or task to a section                                                        |
| `add_interview_participant`   | Attach a participant — either an existing actor or an ad-hoc `persona_spec`                |
| `get_interview_participant`   | Get a participant including their full transcript from the run                             |
| `get_interview_report`        | Get the current synthesised report (summary, themes, recommendations, per-question rollup) |
| `launch_interview`            | Launch the interview round (async). Returns the trigger run ID                             |
| `regenerate_interview_report` | Re-run synthesis on existing transcripts (async). Returns the trigger run ID               |

### Prompts

Most MCP clients (Claude, Claude Code, Cursor) surface these as slash commands. Each is a self-contained recipe: which tools to call, in what order, and how to report back.

| Prompt                | Description                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `validate_design`     | Validate a live design, prototype, or preview URL (Figma Make, Claude artifact, v0, staging) with AI personas             |
| `verify_change`       | Verify a shipped or previewed code change by running an actor through the affected flows, optionally commenting on the PR |
| `run_user_research`   | Run a structured multi-persona interview study and synthesise themes and recommendations                                  |
| `triage_feedback`     | Triage user feedback on a project: cluster it, reproduce issues with an actor, and update statuses                        |
| `setup_guardrails`    | Stand up checklists for critical flows plus a workflow that re-runs them on a schedule or on deploy/PR events             |
| `check_brand`         | Audit a product against brand and tone-of-voice guidelines, flagging deviations with evidence                             |
| `check_design_system` | Audit a live product against its design system (typography, colour, spacing, components) on rendered pages                |
| `check_compliance`    | Check a product against legal and compliance requirements and collect evidence for counsel to review                      |
| `check_continuity`    | Check continuity across surfaces (pricing, terminology, promises) between marketing, product, docs, and emails            |
| `stuntdouble_guide`   | Orientation for Stunt Double: what it does, when to reach for it, and the full tool catalogue                             |

> Workspace member administration (inviting/removing members) is available in the [web dashboard](https://app.stuntdouble.io).

## Transport

This server uses [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) transport. The endpoint is:

```
https://app.stuntdouble.io/api/mcp
```

## Links

- [Website](https://stuntdouble.io)
- [Documentation](https://stuntdouble.io/docs)
- [llms.txt](https://www.stuntdouble.io/llms.txt)

## Verifying changes

From the repo root:

```bash
node scripts/validate-json.mjs
npx --yes prettier@3.4.2 --check README.md mcp.json server.json .cursor-plugin/plugin.json
```

More context in [CONTRIBUTING.md](./CONTRIBUTING.md). GitHub Actions runs the same checks on push and pull requests.

## License

MIT
