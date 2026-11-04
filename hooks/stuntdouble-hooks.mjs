// Stunt Double Studio hooks for Claude Code, wired up in hooks/hooks.json.
//
//   SessionStart  names the project's checklists and the latest run's result.
//   PostToolUse   after an Edit, Write or MultiEdit to a UI file, suggests the
//                 checklists that cover it, once per checklist per session.
//
// Both are off unless the project has .stuntdouble/hooks.json (written by
// /stuntdouble:setup) with the hook switched on, and off for one person with
// STUNTDOUBLE_HOOKS=off in their environment. Off, the script exits 0 with no
// output. Neither hook starts a run or writes outside .stuntdouble/.live/.
// Node built-ins only: the plugin ships no node_modules.

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const FORMAT = "stuntdouble.hooks/1";
// Repo-controlled names reach the model's context, so only plain slugs and
// known outcomes go in.
const SLUG = /^[a-z0-9][a-z0-9._-]{0,63}$/i;
const OUTCOMES = new Set([
  "passed",
  "failed",
  "inconclusive",
  "running",
  "completed",
  "stopped",
]);
const MAX_LISTED = 8;
// Marker for "every checklist was offered for an unmapped edit"; not a slug.
const ANY = "_any";

const escape = (s) => s.replace(/[.+^$(){}|[\]\\]/g, "\\$&");

// ponytail: **, *, ? and one level of {a,b}; no nested braces, character
// classes or negation, and globs match the whole project-relative path (so
// `*.tsx` is top level only; write `**/*.tsx`). Swap in path.matchesGlob once
// Node 22.18 is the floor everywhere this runs.
function globSource(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      i++;
      if (glob[i + 1] === "/") {
        i++;
        re += "(?:.*/)?";
      } else re += ".*";
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else if (c === "{" && glob.indexOf("}", i) > i) {
      const end = glob.indexOf("}", i);
      re += `(?:${glob
        .slice(i + 1, end)
        .split(",")
        .map(globSource)
        .join("|")})`;
      i = end;
    } else re += escape(c);
  }
  return re;
}

export const globToRegExp = (glob) => new RegExp(`^${globSource(glob)}$`);

export const matchesAny = (path, globs) =>
  Array.isArray(globs) && globs.some((g) => globToRegExp(g).test(path));

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
};

/** The hooks config, or null when there is none or it is not ours. */
export function readConfig(project) {
  const config = readJson(join(project, ".stuntdouble", "hooks.json"));
  return config?.format === FORMAT ? config : null;
}

const listChecklists = (project) => {
  try {
    return readdirSync(join(project, ".stuntdouble", "checklists"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.slice(0, -5))
      .filter((slug) => SLUG.test(slug))
      .sort();
  } catch {
    return [];
  }
};

/** The newest run.json (run folders start with a sortable stamp), or null. */
function latestRun(project) {
  const dir = join(project, ".stuntdouble", "runs");
  let ids;
  try {
    ids = readdirSync(dir).sort().reverse();
  } catch {
    return null;
  }
  for (const id of ids) {
    const run = readJson(join(dir, id, "run.json"));
    if (run?.format === "stuntdouble.run/1") return run;
  }
  return null;
}

/** Passed over scored checks, as the engine's tallyRun counts them. */
export function tally(run) {
  const status = new Map((run.results ?? []).map((r) => [r.check, r.status]));
  const scored = (run.checklist_snapshot?.checks ?? []).filter(
    (c) => c.type !== "informational" && status.get(c.key) !== "skipped",
  );
  return {
    passed: scored.filter((c) => status.get(c.key) === "passed").length,
    total: scored.length,
  };
}

export function sessionStart(project, config) {
  if (config.session_summary !== true) return null;
  const checklists = listChecklists(project);
  if (!checklists.length) return null;
  const more = checklists.length - MAX_LISTED;
  const listed = checklists.slice(0, MAX_LISTED).join(", ");
  const lines = [
    `Stunt Double Studio is set up in this project. Checklists: ${listed}${more > 0 ? `, +${more} more` : ""}.`,
  ];
  const run = latestRun(project);
  const outcome =
    run?.status === "running"
      ? "running"
      : (run?.score?.outcome ?? run?.status);
  if (
    run &&
    SLUG.test(run.checklist) &&
    SLUG.test(run.id) &&
    OUTCOMES.has(outcome)
  ) {
    const { passed, total } = tally(run);
    lines.push(
      `Latest run: ${run.checklist}, ${outcome === "running" ? "still running" : outcome}, ${passed} of ${total} checks passed (${run.id}).`,
    );
  } else if (!run) lines.push("No runs yet.");
  lines.push(
    "`/stuntdouble:run <checklist>` runs one in a local Chrome. Offer it after UI changes; never start one unasked.",
  );
  return lines.join("\n");
}

/**
 * The session's marker folder under .stuntdouble/.live/hooks/, or null when
 * any part of that path is a symlink or not a folder, so a crafted repo
 * cannot point the hook's writes outside the project.
 */
function markerDir(project, sessionId) {
  const session =
    String(sessionId ?? "")
      .replace(/[^A-Za-z0-9-]/g, "")
      .slice(0, 64) || "none";
  let dir = project;
  for (const part of [".stuntdouble", ".live", "hooks", session]) {
    dir = join(dir, part);
    try {
      const stat = lstatSync(dir);
      if (stat.isSymbolicLink() || !stat.isDirectory()) return null;
    } catch {
      try {
        mkdirSync(dir);
      } catch {
        return null;
      }
    }
  }
  return dir;
}

/**
 * Records that `name` was offered this session. True the first time; false
 * once it exists, or when it cannot be written. One empty file per name,
 * created with O_EXCL: parallel edits cannot both win, and it never follows
 * a symlink.
 */
function claim(dir, name) {
  try {
    writeFileSync(join(dir, name), "", { flag: "wx" });
    return true;
  } catch {
    return false;
  }
}

export function postToolUse(project, config, input) {
  if (config.suggest_after_edit !== true) return null;
  // A subagent has no one to offer a run to, and claiming here would hide
  // the suggestion from the main thread.
  if (input.agent_id) return null;
  const file = input.tool_input?.file_path;
  if (typeof file !== "string") return null;
  const rel = relative(project, isAbsolute(file) ? file : join(project, file))
    .split(sep)
    .join("/");
  if (rel.startsWith("../") || rel.startsWith(".stuntdouble/")) return null;
  if (!matchesAny(rel, config.ui_globs)) return null;

  const checklists = listChecklists(project);
  if (!checklists.length) return null;
  const mapped = Object.entries(config.checklists_for ?? {})
    .filter(
      ([slug, globs]) => checklists.includes(slug) && matchesAny(rel, globs),
    )
    .map(([slug]) => slug);

  // ponytail: one marker folder per session, never cleaned up; .live/ is
  // ignored scratch. Prune old sessions if anyone ever notices the folders.
  const dir = markerDir(project, input.session_id);
  if (!dir) return null;
  let fresh;
  if (mapped.length) fresh = mapped.filter((slug) => claim(dir, slug));
  else if (claim(dir, ANY))
    // Unmapped: offer what is not yet offered, but claim only the generic
    // marker, so a later edit to a mapped area still names its checklist.
    fresh = checklists.filter((slug) => !existsSync(join(dir, slug)));
  else fresh = [];
  if (!fresh.length) return null;
  const list = fresh.map((s) => `\`/stuntdouble:run ${s}\``).join(" or ");
  return `${rel} is covered by Stunt Double Studio. Before you finish, offer ${list} to check the change in a local Chrome. Do not start a run unless the person agrees.`;
}

/** The hook's stdout for one input, or "" for none. */
export function handle(input, env = process.env) {
  if (env.STUNTDOUBLE_HOOKS === "off") return "";
  const project = env.CLAUDE_PROJECT_DIR || input.cwd;
  if (!project) return "";
  const config = readConfig(project);
  if (!config) return "";
  const event = input.hook_event_name;
  const context =
    event === "SessionStart"
      ? sessionStart(project, config)
      : event === "PostToolUse"
        ? postToolUse(project, config, input)
        : null;
  if (!context) return "";
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: event, additionalContext: context },
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  // Most projects have no hooks config: leave before reading stdin.
  const dir = process.env.CLAUDE_PROJECT_DIR;
  if (process.env.STUNTDOUBLE_HOOKS === "off" || (dir && !readConfig(dir)))
    process.exit(0);
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    try {
      const out = handle(JSON.parse(raw));
      if (out) process.stdout.write(`${out}\n`);
    } catch {
      // A hook never gets in the way: bad input means no context.
    }
  });
}
