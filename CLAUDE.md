# CLAUDE.md

## What this repository is

The public face of Stunt Double's hosted MCP server (`https://app.stuntdouble.io/api/mcp`): plugin manifests, docs, rules, skills and agents, plus the MCP Registry entry. It is **metadata and documentation only**. There is no `package.json` and no server code here; the server is `apps/web/lib/mcp` in [stunt-double/stuntdouble](https://github.com/stunt-double/stuntdouble). Never run `pnpm install` or `npm install` here.

| Path                                                          | What                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `server.json`                                                 | MCP Registry entry, published as `io.stuntdouble/mcp-server` (a `streamable-http` remote) |
| `.claude-plugin/plugin.json`, `marketplace.json`, `.mcp.json` | Claude Code plugin and Claude directory listing                                           |
| `.cursor-plugin/plugin.json`, `mcp.json`                      | Cursor plugin                                                                             |
| `README.md`                                                   | Install steps, the Available Tools tables, prompts, resources, scopes, example prompts    |
| `skills/`, `agents/`, `rules/`                                | Shipped with the plugins; guidance that names tools must match what the server registers  |
| `CHANGELOG.md`                                                | Keep a Changelog, one entry per released version                                          |
| `.github/workflows/ci.yml`, `publish.yml`                     | JSON and Prettier checks; registry publish and GitHub release                             |

## Source of truth

The server decides what exists. Before documenting a tool, prompt, resource or scope, read its definition in the monorepo (`apps/web/lib/mcp/tools/`, `prompts/`, `resources/`, `scopes.ts`). Never name a tool the server does not register (1.9.1 was a release to undo exactly that).

Most updates arrive automatically: when those files change on the monorepo's `main`, its `mcp-docs-sync.yml` runs Claude Code and opens a PR here from the rolling `sync/mcp-tools` branch, adding later changes to it as commits until it merges. Review the generated wording rather than rewriting it from scratch, and avoid a hand-made version bump while that PR is open, since the two will conflict.

## Versioning and releases

- `server.json`, `.cursor-plugin/plugin.json` and `.claude-plugin/plugin.json` always share one version, bumped by semver: minor for new tools, prompts, resources or scopes; patch for changed descriptions, parameters or fixes; major only for removals that break callers. Each bump gets a `## [x.y.z] - YYYY-MM-DD` CHANGELOG entry. Repo-only changes (CI, contributor docs) go under `## [Unreleased]` and ship with the next bump.
- Merging a version bump to `main` is the release. `publish.yml` refuses if the manifests or CHANGELOG disagree with `server.json`, then publishes to registry.modelcontextprotocol.io and creates the `v<version>` GitHub release from the CHANGELOG entry. A version the registry already has is skipped, so a manual re-run (`gh workflow run publish.yml`) is safe.
- Registry auth is DNS: the `v=MCPv1; k=ed25519; p=...` TXT record on `stuntdouble.io` (Cloudflare) must match the `MCP_REGISTRY_PRIVATE_KEY` secret. Rotation steps are in the header of `publish.yml`; on macOS use Homebrew's `openssl@3`, since the system LibreSSL cannot generate Ed25519 keys. Never commit a key (`*.pem` is gitignored).

## Before committing

```bash
node scripts/validate-json.mjs
npx --yes prettier@3.4.2 --check README.md CONTRIBUTING.md SECURITY.md CHANGELOG.md mcp.json .mcp.json server.json .cursor-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

Use the pinned Prettier version; CI checks with it. Commits follow conventional prefixes (`docs:`, `ci:`, `fix:`, `feat:`). Never use emdash characters, matching the monorepo.

This repository is public. Commits, pull request bodies and comments carry no AI tool attribution: no `Co-Authored-By` or `Claude-Session` trailers, no "Generated with" footers and no session links.
