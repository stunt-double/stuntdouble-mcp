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

Use only `url` for remote servers (Streamable HTTP is negotiated automatically). Extra keys such as `"type": "streamable-http"` are not part of [Cursor’s documented `mcp.json` shape](https://cursor.com/docs/mcp.md) and can break plugin validation.

**Cursor marketplace (one-click install)** expects a [plugin layout](https://cursor.com/docs/reference/plugins.md): `.cursor-plugin/plugin.json` plus root `mcp.json`. Those files are in this repo. The plugin `logo` path is `assets/logo.png` (bundled in this repository). The `server.json` file is the separate [MCP registry](https://modelcontextprotocol.io/registry/about) manifest for `mcp-publisher` and directory listings; Cursor’s installer does not use it.

## Authentication

Authentication is handled automatically via OAuth 2.1 with PKCE. The first time your AI client connects, a browser window will open for you to sign in and authorise access to your Stunt Double account. No API keys or tokens required.

For **Cursor**, the OAuth redirect URI is fixed to `cursor://anysphere.cursor-mcp/oauth/callback` ([docs](https://cursor.com/docs/mcp.md)); the Stunt Double OAuth app must allow that redirect or sign-in from Cursor will fail after install.

## Available Tools

### Workspaces

| Tool                     | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `list_workspaces`        | List all workspaces you belong to, including your role in each |
| `get_workspace`          | Get details of a specific workspace by ID or slug              |
| `list_workspace_members` | List all members of a workspace with their roles and profiles  |
| `invite_member`          | Invite a new member to a workspace                             |
| `remove_member`          | Remove a member from a workspace                               |

### Actors

| Tool            | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `list_actors`   | List active actors in a workspace                                     |
| `get_actor`     | Get full details of an actor including system prompt and capabilities |
| `create_actor`  | Create a new actor in a workspace                                     |
| `update_actor`  | Update an actor's name, description, system prompt, or capabilities   |
| `archive_actor` | Archive an actor (soft delete)                                        |

### Knowledge

| Tool                     | Description                            |
| ------------------------ | -------------------------------------- |
| `list_actor_knowledge`   | List knowledge entries for an actor    |
| `add_actor_knowledge`    | Add a knowledge entry to an actor      |
| `remove_actor_knowledge` | Remove a knowledge entry from an actor |

### Conversations

| Tool                  | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `list_conversations`  | List conversations in a workspace, optionally filtered by actor |
| `get_conversation`    | Get a conversation with its messages                            |
| `create_conversation` | Create a new conversation with an actor                         |
| `delete_conversation` | Delete a conversation and all its messages                      |

### Checklists

| Tool                | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `list_checklists`   | List checklists in a workspace                          |
| `get_checklist`     | Get a checklist with its checks and recent runs         |
| `get_checklist_run` | Get a checklist run with per-check results and evidence |
| `run_checklist`     | Trigger a new checklist run (async, returns run ID)     |

### Workflows

| Tool                 | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `list_workflows`     | List workflows in a workspace                                 |
| `get_workflow`       | Get a workflow with its steps and recent runs                 |
| `create_workflow`    | Create a new workflow in a workspace                          |
| `update_workflow`    | Update a workflow name, description, or trigger configuration |
| `delete_workflow`    | Delete a workflow and all its steps and runs                  |
| `run_workflow`       | Trigger a new workflow run (async, returns run ID)            |
| `list_workflow_runs` | List runs for a workflow                                      |
| `get_workflow_run`   | Get a workflow run with step-level details                    |

### Feedback

| Tool                     | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `list_feedback`          | List feedback for a project, newest first       |
| `get_feedback`           | Get a specific feedback submission with details |
| `update_feedback_status` | Update the status of a feedback submission      |

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
