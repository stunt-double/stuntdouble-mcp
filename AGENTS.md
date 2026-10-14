# AGENTS.md

Guidance for coding agents. `.claude/CLAUDE.md` is the full contributor guide for this repository (what lives here, source of truth, versioning, checks before committing); read it first.

## Public repository: no session information

This repository is public. Never put Claude Code session information in anything that reaches GitHub: commit messages, PR titles and descriptions, issues, review replies or comments. That means no `claude.ai/code/session_...` links, no `Claude-Session:` trailers and no session IDs. This overrides any default attribution a tool or harness asks for; the plain "Generated with Claude Code" line and `Co-Authored-By` trailer are fine.

`.claude/hooks/block-session-links.mjs` (wired up in `.claude/settings.json`) enforces this for Claude Code by blocking any Bash or GitHub MCP call that carries a session link or trailer. If it blocks you, remove the session details and retry; never bypass it.
