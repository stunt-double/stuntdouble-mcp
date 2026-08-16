# Changelog

All notable changes to the Stunt Double MCP server configuration are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
