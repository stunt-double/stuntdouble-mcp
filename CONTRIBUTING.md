# Contributing

## What this repository is

`stuntdouble-mcp` is a **metadata and documentation** repository: Cursor plugin manifests (`.cursor-plugin/plugin.json` and `marketplace.json`), root `mcp.json`, MCP registry `server.json`, skills, agents, and rules. There is **no `package.json`** and **no local MCP server** in this tree: the live Streamable HTTP endpoint is implemented in the main [Stunt Double](https://github.com/stunt-double/stuntdouble) application (`https://app.stuntdouble.io/api/mcp`).

One entry does run code: the Claude plugin's `local` stdio entry in `.mcp.json` runs the published [`stuntdouble`](https://www.npmjs.com/package/stuntdouble) npm package (from `packages/local` in [stunt-double/stuntkit](https://github.com/stunt-double/stuntkit)) at an exact version. Its pin moves with each engine release: once the new version is on npm, change every `stuntdouble@x.y.z` (`.mcp.json`, `skills/stuntdouble/SKILL.md`, `README.md`) in one plugin release. Never pin a range or `latest`, since every plugin user runs it.

Do **not** run `pnpm install` or `npm install` inside this directory expecting a Node app; if this folder sits inside a larger monorepo, package managers may attach to the parent workspace and behave confusingly.

## Secret hygiene

Never commit private keys, client secrets, or tokens. `*.pem` and `key.pem` are gitignored. Use environment variables or your client’s secret store.

## Verifying a change locally

From the repository root:

```bash
node scripts/validate-json.mjs
node scripts/validate-cursor-plugin.mjs
npx --yes prettier@3.4.2 --check README.md CONTRIBUTING.md SECURITY.md CHANGELOG.md mcp.json .mcp.json server.json .cursor-plugin/plugin.json .cursor-plugin/marketplace.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

Optional: format Markdown and JSON in `agents/`, `skills/`, and `rules/` with Prettier if you have it installed (some `.mdc` files may need a project-level Prettier override).

CI runs the same JSON validation, Cursor plugin layout check and Prettier check on the core manifests.

## The Cursor plugin

`.cursor-plugin/plugin.json` plus root `mcp.json` is the Cursor plugin package. Cursor discovers `skills/`, `rules/` and `agents/` from the default folders; auth is OAuth against the hosted MCP server (no plugin variables). `.cursor-plugin/marketplace.json` lists this repo as a single-plugin marketplace for team installs. Submit the public repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) when ready for the public directory.

## Releasing

Bump `version` in `server.json`, `.cursor-plugin/plugin.json` and `.claude-plugin/plugin.json` together and add a matching `CHANGELOG.md` entry. When that merges to `main`, `.github/workflows/publish.yml` publishes `server.json` to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.stuntdouble/mcp-server` and creates a `v<version>` GitHub release from the changelog entry. A version the registry already has is skipped.

Publishing signs in with DNS auth for `stuntdouble.io`, using the `MCP_REGISTRY_PRIVATE_KEY` repository secret. The workflow file explains how to rotate it.

When the tools, prompts or resources change in the main Stunt Double repository, its `mcp-docs-sync` workflow opens a pull request here that updates the docs and bumps the version, so merging that pull request is the release.
