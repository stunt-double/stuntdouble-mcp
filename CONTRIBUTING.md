# Contributing

## What this repository is

`stuntdouble-mcp` is a **metadata and documentation** repository: Cursor plugin manifests (`.cursor-plugin/plugin.json` and `marketplace.json`), root `mcp.json`, MCP registry `server.json`, skills, agents, and rules. There is **no `package.json`** and **no local MCP server** in this tree — the live Streamable HTTP endpoint is implemented in the main [Stunt Double](https://github.com/stunt-double/stuntdouble) application (`https://app.stuntdouble.io/api/mcp`).

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

CI runs the same JSON validation, Cursor plugin layout check and Prettier check on the core manifests, and `node scripts/build-openai-plugin.mjs --check` on the OpenAI plugin manifest.

## The Cursor plugin

`.cursor-plugin/plugin.json` plus root `mcp.json` is the Cursor plugin package. Cursor discovers `skills/`, `rules/` and `agents/` from the default folders; auth is OAuth against the hosted MCP server (no plugin variables). `.cursor-plugin/marketplace.json` lists this repo as a single-plugin marketplace for team installs. Submit the public repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) when ready for the public directory.

## The OpenAI plugin package

`.openai-plugin/plugin.json` is the source for the ChatGPT and Codex plugin. Run `node scripts/build-openai-plugin.mjs` to validate it and build `dist/stuntdouble-openai-plugin.zip` for the submission portal (`dist/` is ignored). The script fails on anything OpenAI would reject (field lengths, URLs, missing assets, the five positive and three negative test cases) and warns about material only a person can supply: screenshots of the cards and the demo video URL.

The test cases run against a dedicated review account and its seeded workspace (a Demo Shop project with a Checkout checklist that has a finished run, and stakeholder feedback). Reviewers sign in at `https://app.stuntdouble.io/login/review`, the password sign-in the main repository keeps for review accounts only. Credentials go into the portal, never into this repository.

After publication OpenAI rescans the live server for tool changes, so a new tool or schema change needs no new package. A new package version is only for listing, skill or test case changes.

## Releasing

Bump `version` in `server.json`, `.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json` and `.openai-plugin/plugin.json` together and add a matching `CHANGELOG.md` entry. When that merges to `main`, `.github/workflows/publish.yml` publishes `server.json` to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.stuntdouble/mcp-server` and creates a `v<version>` GitHub release from the changelog entry. A version the registry already has is skipped.

Publishing signs in with DNS auth for `stuntdouble.io`, using the `MCP_REGISTRY_PRIVATE_KEY` repository secret. The workflow file explains how to rotate it.

When the tools, prompts or resources change in the main Stunt Double repository, its `mcp-docs-sync` workflow opens a pull request here that updates the docs and bumps the version, so merging that pull request is the release.
