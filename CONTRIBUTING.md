# Contributing

## What this repository is

`stuntdouble-mcp` is a **metadata and documentation** repository: Cursor plugin manifest (`.cursor-plugin/`), root `mcp.json`, MCP registry `server.json`, skills, agents, and rules. There is **no `package.json`** and **no local MCP server** in this tree: the live Streamable HTTP endpoint is implemented in the main [Stunt Double](https://github.com/stunt-double/stuntdouble) application (`https://app.stuntdouble.io/api/mcp`).

Do **not** run `pnpm install` or `npm install` inside this directory expecting a Node app; if this folder sits inside a larger monorepo, package managers may attach to the parent workspace and behave confusingly.

## Secret hygiene

Never commit private keys, client secrets, or tokens. `*.pem` and `key.pem` are gitignored. Use environment variables or your client’s secret store.

## Verifying a change locally

From the repository root:

```bash
node scripts/validate-json.mjs
node scripts/validate-skills.mjs
npx --yes prettier@3.4.2 --check README.md CONTRIBUTING.md SECURITY.md CHANGELOG.md mcp.json .mcp.json server.json .cursor-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

Optional: format Markdown and JSON in `agents/`, `skills/`, and `rules/` with Prettier if you have it installed (some `.mdc` files may need a project-level Prettier override).

`validate-skills.mjs` checks every `skills/*/SKILL.md` and `agents/*.md`: frontmatter `name` (lowercase, hyphenated, matching the skill's directory) and `description` (at most 1024 characters, no XML tags, and a "Use when" clause), a body under 500 lines, no em dashes anywhere in `skills/`, `agents/` or `rules/`, and that every tool named in code is a real Stunt Double MCP tool. When a tool is added, renamed or removed in the main repository, update `KNOWN_TOOLS` in the script to match `TOOL_SCOPES` in `apps/web/lib/mcp/scopes.ts`.

CI runs the same JSON, skills and Prettier checks.

## Releasing

Bump `version` in `server.json`, `.cursor-plugin/plugin.json` and `.claude-plugin/plugin.json` together and add a matching `CHANGELOG.md` entry. When that merges to `main`, `.github/workflows/publish.yml` publishes `server.json` to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.stuntdouble/mcp-server` and creates a `v<version>` GitHub release from the changelog entry. A version the registry already has is skipped.

Publishing signs in with DNS auth for `stuntdouble.io`, using the `MCP_REGISTRY_PRIVATE_KEY` repository secret. The workflow file explains how to rotate it.

When the tools, prompts or resources change in the main Stunt Double repository, its `mcp-docs-sync` workflow opens a pull request here that updates the docs and bumps the version, so merging that pull request is the release.
