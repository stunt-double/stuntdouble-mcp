// Lints skills/*/SKILL.md, agents/*.md and rules/*.mdc against the Agent Skills
// authoring rules this repository follows. Node built-ins only.
//
// Run from anywhere: node scripts/validate-skills.mjs

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// Every tool the hosted server registers: TOOL_SCOPES in the main Stunt Double
// repository (apps/web/lib/mcp/scopes.ts). Update this list when a tool is added,
// renamed or removed there.
const KNOWN_TOOLS = new Set([
  // mcp:read
  "get_actor",
  "get_checklist",
  "get_checklist_run",
  "get_conversation",
  "get_feedback",
  "get_index_report",
  "get_interview",
  "get_interview_participant",
  "get_interview_report",
  "get_me",
  "get_project",
  "get_pull_request",
  "get_workflow",
  "get_workflow_run",
  "get_workspace",
  "list_actor_knowledge",
  "list_actors",
  "list_checklists",
  "list_conversations",
  "list_feedback",
  "list_index_sessions",
  "list_interviews",
  "list_project_guidelines",
  "list_project_mcp_servers",
  "list_projects",
  "list_pull_requests",
  "list_workflows",
  "list_workspace_guidelines",
  "list_workspace_members",
  "list_workspaces",
  "search",
  "search_index_domains",
  // mcp:write
  "add_actor_knowledge",
  "add_interview_item",
  "add_interview_participant",
  "add_interview_section",
  "add_project_guideline",
  "add_workflow_step",
  "add_workspace_guideline",
  "comment_on_pr",
  "connect_workflow_steps",
  "create_actor",
  "create_checklist",
  "create_interview",
  "create_project",
  "create_workflow",
  "delete_checklist",
  "delete_workflow",
  "regenerate_interview_report",
  "remove_actor_knowledge",
  "remove_workflow_step",
  "remove_workspace_guideline",
  "reorder_workflow_steps",
  "set_project_guideline",
  "summarise_feedback",
  "toggle_workflow",
  "update_actor",
  "update_checklist",
  "update_feedback_status",
  "update_interview",
  "update_workflow",
  "update_workflow_step",
  "update_workspace_guideline",
  // mcp:run
  "launch_interview",
  "request_index_rerun",
  "run_checklist",
  "run_workflow",
]);

// Prompts the server registers (apps/web/lib/mcp/prompts), which rules name too.
const KNOWN_PROMPTS = new Set([
  "validate_design",
  "verify_change",
  "run_user_research",
  "triage_feedback",
  "setup_guardrails",
  "check_brand",
  "check_design_system",
  "check_compliance",
  "check_continuity",
  "stuntdouble_guide",
]);

// A backticked snake_case word with one of these verbs in front reads as a tool
// name, so it must be a real tool or prompt unless it is listed here (a
// parameter, field or value that happens to start with the same verb).
const TOOL_VERB =
  /^(add|comment|connect|create|delete|get|launch|list|regenerate|remove|reorder|request|run|search|set|summarise|toggle|update)_[a-z0-9_]+$/;
const NON_TOOL_IDENTIFIERS = new Set([
  "run_id",
  "run_mode",
  "request_user_input",
]);

const MAX_DESCRIPTION = 1024;
const MAX_BODY_LINES = 500;
const NAME_PATTERN = /^[a-z0-9-]{1,64}$/;
const EM_DASH = String.fromCharCode(0x2014);

const errors = [];
const fail = (file, line, message) =>
  errors.push(`${relative(root, file)}${line ? `:${line}` : ""}: ${message}`);

function listFiles(dir, predicate) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const entry of readdirSync(abs)) {
    const path = join(abs, entry);
    if (statSync(path).isDirectory())
      out.push(...listFiles(join(dir, entry), predicate));
    else if (predicate(path)) out.push(path);
  }
  return out;
}

/** Minimal frontmatter reader: top-level `key: value` pairs, quotes stripped. */
function readFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const data = {};
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    data[match[1]] = value;
  }
  return { data, bodyStart: end + 1 };
}

function checkFrontmatter(file, text, { expectedName }) {
  const fm = readFrontmatter(text);
  if (!fm) {
    fail(file, 1, "missing frontmatter (--- block with name and description)");
    return;
  }
  const { name, description } = fm.data;

  if (!name) fail(file, 1, "frontmatter `name` is missing");
  else {
    if (!NAME_PATTERN.test(name))
      fail(file, 1, `name "${name}" must match ${NAME_PATTERN}`);
    if (/anthropic|claude/i.test(name))
      fail(file, 1, `name "${name}" must not contain "anthropic" or "claude"`);
    if (expectedName && name !== expectedName)
      fail(
        file,
        1,
        `name "${name}" must equal its directory name "${expectedName}"`,
      );
  }

  if (!description)
    fail(file, 1, "frontmatter `description` is missing or empty");
  else {
    if (description.length > MAX_DESCRIPTION)
      fail(
        file,
        1,
        `description is ${description.length} characters (max ${MAX_DESCRIPTION})`,
      );
    if (/[<>]/.test(description))
      fail(file, 1, "description must not contain < or > (no XML tags)");
    if (!/use when/i.test(description))
      fail(file, 1, 'description must say when to use it ("Use when ...")');
  }

  const bodyLines = text.split("\n").length - fm.bodyStart;
  if (bodyLines >= MAX_BODY_LINES)
    fail(
      file,
      null,
      `body is ${bodyLines} lines (keep it under ${MAX_BODY_LINES})`,
    );
}

/** Every inline code span and fenced code line, with its 1-based line number. */
function codeFragments(text) {
  const fragments = [];
  let fenced = false;
  text.split("\n").forEach((line, index) => {
    const lineNo = index + 1;
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) {
      fragments.push({ lineNo, code: line, inline: false });
      return;
    }
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      fragments.push({ lineNo, code: match[1], inline: true });
    }
  });
  return fragments;
}

function checkToolReferences(file, text) {
  for (const { lineNo, code, inline } of codeFragments(text)) {
    for (const match of code.matchAll(
      /\b([a-z][a-z0-9]*(?:_[a-z0-9]+)+)\s*\(/g,
    )) {
      const id = match[1];
      if (!KNOWN_TOOLS.has(id))
        fail(
          file,
          lineNo,
          `\`${id}(\` is not a Stunt Double MCP tool (see KNOWN_TOOLS)`,
        );
    }
    const bare = code.trim();
    if (
      inline &&
      TOOL_VERB.test(bare) &&
      !KNOWN_TOOLS.has(bare) &&
      !KNOWN_PROMPTS.has(bare) &&
      !NON_TOOL_IDENTIFIERS.has(bare)
    ) {
      fail(
        file,
        lineNo,
        `\`${bare}\` looks like a tool name but is not a Stunt Double MCP tool or prompt`,
      );
    }
  }
}

function checkEmDashes(file, text) {
  text.split("\n").forEach((line, index) => {
    if (line.includes(EM_DASH))
      fail(
        file,
        index + 1,
        "em dash (U+2014): use a comma, colon, parentheses or a full stop",
      );
  });
}

const skillFiles = listFiles("skills", (p) => p.endsWith("/SKILL.md"));
const agentFiles = listFiles("agents", (p) => p.endsWith(".md"));
const ruleFiles = listFiles(
  "rules",
  (p) => p.endsWith(".mdc") || p.endsWith(".md"),
);

for (const dir of readdirSync(join(root, "skills"))) {
  const abs = join(root, "skills", dir);
  if (statSync(abs).isDirectory() && !existsSync(join(abs, "SKILL.md")))
    fail(abs, null, "skill directory has no SKILL.md");
}

for (const file of skillFiles) {
  const text = readFileSync(file, "utf8");
  const dirName = relative(join(root, "skills"), file).split("/")[0];
  checkFrontmatter(file, text, { expectedName: dirName });
}
for (const file of agentFiles) {
  checkFrontmatter(file, readFileSync(file, "utf8"), { expectedName: null });
}

for (const dir of ["skills", "agents", "rules"]) {
  for (const file of listFiles(dir, () => true))
    checkEmDashes(file, readFileSync(file, "utf8"));
}

for (const file of [...skillFiles, ...agentFiles, ...ruleFiles]) {
  checkToolReferences(file, readFileSync(file, "utf8"));
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  console.error(`\n${errors.length} problem(s) in skills, agents and rules.`);
  process.exit(1);
}

console.log(
  `ok ${skillFiles.length} skills, ${agentFiles.length} agents, ${ruleFiles.length} rules`,
);
