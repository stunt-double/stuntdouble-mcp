# Changelog

All notable changes to the Stunt Double MCP server configuration are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
