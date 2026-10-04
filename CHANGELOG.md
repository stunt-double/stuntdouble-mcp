# Changelog

All notable changes to the Stunt Double MCP server configuration are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.openai-plugin/plugin.json`: the ChatGPT and Codex plugin manifest (Agent Plugins format), with the directory listing, five positive and three negative review test cases, and release notes.
- `scripts/build-openai-plugin.mjs`: validates that manifest against OpenAI's submission limits and builds the package ZIP for the submission portal; CI runs it in check mode.
- A ChatGPT and Codex section in the README.

## [1.14.0] - 2026-10-01

### Added

- `check-agent-readiness` skill: read a site's Stunt Double Index report, explain weak categories and providers from the agent sessions behind them, compare against the sector, and re-score after fixes ship.
- `maintain-automations` skill: change existing automations and checklists without losing run history, covering trigger changes, step edits, reordering, condition branches, in-place check updates, and pausing rather than deleting.
- A Skills section in the README with `npx skills add stunt-double/stuntdouble-mcp` install steps and a table of every skill.
- An MCP Registry section in the README, and a link to the MCP server reference on stuntdouble.io.
- `.github/workflows/publish.yml`: publishes `server.json` to the MCP Registry and creates a GitHub release whenever a new version lands on `main`, after checking that the plugin manifests and `CHANGELOG.md` agree with it.
- A Releasing section in `CONTRIBUTING.md`.
- `CLAUDE.md`: what this repository is, where the source of truth lives, and how versioning, the docs sync and registry publishing fit together.

### Changed

- `verify-change` can start from a pull request, using `list_pull_requests` and `get_pull_request` to pick the flows to exercise.
- Bumped `.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json` and `server.json` to 1.14.0.

## [1.13.0] - 2026-09-28

### Added

- Documented the Stunt Double Index tools: `get_index_report` (a site's score, band, rank, category and provider scores, frictions and failing checks), `list_index_sessions` (the agent sessions behind a score), `search_index_domains` (find a site or browse the leaderboard) and `request_index_rerun` (re-score a domain you own, `mcp:run`, once every 10 minutes).
- An agent-readiness example prompt, and Index guidance in `rules/stuntdouble-basics.mdc`.

### Changed

- The `mcp:run` scope description now includes Index re-runs.
- Bumped `.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json` and `server.json` to 1.13.0.

## [1.12.0] - 2026-09-28

### Added

- Claude plugin layout: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `.mcp.json` (the hosted server as a `type: http` remote), so the repository can be installed with `claude plugin install` and submitted to the Claude directory as a plugin alongside the connector listing.
- README sections the Claude directory asks for: example prompts, a Privacy Policy section and Support contacts.

### Changed

- Removed `assets/claude_mcp.mov`. Nothing referenced it, and at 7 MB it is over the directory's 5 MiB per-file limit, which stops plugin validation.
- `scripts/validate-json.mjs` and CI now check the Claude manifests too.
- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.12.0.

## [1.11.0] - 2026-09-24

### Added

- Documented the resources now served by the hosted MCP service: `stuntdouble://guide` (the orientation and tool catalogue, also available as the `stuntdouble_guide` prompt), `stuntdouble://connection` (the account, granted scopes and the tools each unlocks), and, with `mcp:read`, `stuntdouble://workspaces` and the `stuntdouble://workspaces/{workspace_id}/projects` template.

### Changed

- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.11.0.

## [1.10.0] - 2026-09-18

### Added

- Documented `reorder_workflow_steps` (set the order a workflow's steps run in) and `connect_workflow_steps` (wire one step to another, which is what a condition's True and False paths take).

### Changed

- The workflow docs now say that a workflow is a graph rather than a list: its steps run by following the connections between them, and `get_workflow` returns `execution_order` plus `unreachable_step_ids` so a step nothing reaches is visible before the automation is activated. `add_workflow_step` and `remove_workflow_step` maintain those connections themselves, so building an automation is still one call per step, in order.
- `update_workflow_step` no longer takes `sort_order`: it changes a step in place, and moving one is `reorder_workflow_steps`.

### Fixed

- `setup-guardrails` called `add_workflow_step` with a `type` argument. The parameter is `step_type`, and the example's `notification` config is now a real one.
- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.10.0.

## [1.9.1] - 2026-08-16

### Fixed

- The agents, skills and rules told clients to call three tools the hosted service does not serve: `create_conversation`, `delete_conversation` and `list_workflow_runs`. Conversations are read-only over MCP (`list_conversations`, `get_conversation`), and a workflow's run history comes back on `get_workflow` as `recent_runs`.
- `design-review`, `design-reviewer` and `product-researcher` now run a panel through an interview rather than opening a conversation per actor. Every participant answers the same guide, so the report synthesises themes across personas instead of leaving a pile of transcripts to compare by hand.
- `create-actor-panel` verifies a new persona with a small checklist run rather than a conversation it cannot start.

### Changed

- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.9.1.

## [1.9.0] - 2026-08-16

### Added

- Documented the guideline tools now served by the hosted MCP service: `list_workspace_guidelines`, `add_workspace_guideline`, `update_workspace_guideline`, `remove_workspace_guideline` and `set_project_guideline`, alongside the existing `list_project_guidelines` and `add_project_guideline`. Guidelines are owned by the workspace and attached to the projects they apply to, so one rule can hold for several products without being retyped.
- Documented `get_me` (the account a connection acts as, with the timezone a scheduled workflow should be created in and where notifications reach that person) and `list_project_mcp_servers` (which MCP servers a project's runs can reach).
- Documented the `settings` block `get_workspace` now returns: the admin-set ceilings for public sharing, the feedback widget, self-hosted workers and the network policy.
- Added "Guidelines" and "Workspace and project scope" sections to the `stuntdouble-basics` rule, covering the two switches that decide whether a rule is in force, the `apply_to_design_reviews` flag for reviews with no project, and the fact that a project is archived rather than deleted.

### Changed

- The standards skills (`check-brand`, `check-design-system`, `check-compliance`) and `setup-guardrails` now codify a standard as a guideline rather than as actor knowledge, and check the workspace library before writing a near-duplicate rule. Actor knowledge remains for what one actor needs to remember.
- `setup-guardrails` passes the account's timezone when creating a scheduled workflow, so a daily run happens at the user's hour rather than in UTC.
- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.9.0.

## [1.8.0] - 2026-08-08

### Added

- Documented the new `search` tool served by the hosted MCP service: one ranked search across projects, actors, checklists, interviews, automations, issues, goals, feedback, actor knowledge, insights, design reviews, project resources and conversations, with optional `types`, `project_id` and `limit` filters.
- Added a "Finding things" section to the `stuntdouble-basics` rule so clients reach for `search` instead of listing an entity type and filtering it themselves, and search before creating near-duplicates.

### Changed

- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.8.0.

## [1.7.0] - 2026-07-12

### Added

- Documented the full prompt suite now served by the hosted MCP service in the README "Prompts" table: `validate_design`, `verify_change`, `run_user_research`, `triage_feedback`, `setup_guardrails`, `check_brand`, `check_design_system`, `check_compliance`, `check_continuity` (previously only `stuntdouble_guide` was listed).
- Added skills mirroring the new standards and guardrails recipes: `verify-change`, `setup-guardrails`, `check-brand`, `check-design-system`, `check-compliance`, and `check-continuity`.
- Added "Standards and guardrails" and "Prompts" sections to the `stuntdouble-basics` rule so clients know the checklist and workflow machinery also enforces brand, design-system, compliance, and continuity standards, and which prompt recipes exist.

### Changed

- Bumped `.cursor-plugin/plugin.json` and `server.json` to 1.7.0.

## [1.6.0] - 2026-06-16

### Added

- Documented the GitHub tools now exposed by the hosted MCP service: `list_pull_requests`, `get_pull_request`, and `comment_on_pr`.
- Documented the project write tools `get_project` and `create_project`.
- Documented the checklist management tools `create_checklist`, `update_checklist`, and `delete_checklist`.
- Documented the workflow management tools `create_workflow`, `update_workflow`, `toggle_workflow`, `delete_workflow`, `add_workflow_step`, `update_workflow_step`, and `remove_workflow_step`.

### Changed

- Updated the "Available Tools" tables in `README.md` to match the full tool set served from `https://app.stuntdouble.io/api/mcp`.
- Reworded the admin operations note: workflow and checklist create/update/delete are now available over MCP, so only workspace member administration remains dashboard-only.
- Synced `.cursor-plugin/plugin.json` to the current version (it had drifted to 1.1.0).

## [1.5.0]

- Previous release. Added interview tools and the `run-user-interview` skill.
