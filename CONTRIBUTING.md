# Contributing

## What this repository is

`stuntdouble-mcp` is a **metadata and documentation** repository: Cursor plugin manifest (`.cursor-plugin/`), root `mcp.json`, MCP registry `server.json`, skills, agents, and rules. There is **no `package.json`** and **no local MCP server** in this tree — the live Streamable HTTP endpoint is implemented in the main [Stunt Double](https://github.com/stunt-double/stuntdouble) application (`https://app.stuntdouble.io/api/mcp`).

Do **not** run `pnpm install` or `npm install` inside this directory expecting a Node app; if this folder sits inside a larger monorepo, package managers may attach to the parent workspace and behave confusingly.

## Secret hygiene

Never commit private keys, client secrets, or tokens. `*.pem` and `key.pem` are gitignored. Use environment variables or your client’s secret store.

## Verifying a change locally

From the repository root:

```bash
node scripts/validate-json.mjs
npx --yes prettier@3.4.2 --check README.md mcp.json server.json .cursor-plugin/plugin.json
```

Optional: format Markdown and JSON in `agents/`, `skills/`, and `rules/` with Prettier if you have it installed (some `.mdc` files may need a project-level Prettier override).

CI runs the same JSON validation and Prettier check on the core manifests.
