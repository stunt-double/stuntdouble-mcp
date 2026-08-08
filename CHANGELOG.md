# Changelog

All notable changes to the Stunt Double MCP server configuration are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-08-08

### Added

- Documented the new `search` tool served by the hosted MCP service: one ranked search across projects, actors, checklists, interviews, automations, issues, goals, feedback, actor knowledge, insights, design reviews and conversations, with optional `types`, `project_id` and `limit` filters.
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
