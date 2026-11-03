import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { globToRegExp, handle } from "./stuntdouble-hooks.mjs";

const script = join(import.meta.dirname, "stuntdouble-hooks.mjs");

test("globs: **, *, ? and {a,b}", () => {
  const yes = [
    ["app/**/*.tsx", "app/page.tsx"],
    ["app/**/*.tsx", "app/(shop)/cart/page.tsx"],
    ["src/**", "src/a/b/c.css"],
    ["{app,src}/**/*.{tsx,css}", "src/ui/button.css"],
    ["pages/*.vue", "pages/index.vue"],
    ["src/routes/+page.svelte", "src/routes/+page.svelte"],
    ["a?c.ts", "abc.ts"],
    ["{app/**/*.tsx,components/*}", "components/nav.tsx"],
  ];
  const no = [
    ["app/**/*.tsx", "app/page.ts"],
    ["pages/*.vue", "pages/blog/post.vue"],
    ["*.tsx", "app/page.tsx"],
    ["app/**", "lib/app/x.ts"],
    ["src/main.ts", "src/mainXts"],
    ["{app,src}/*.tsx", "lib/x.tsx"],
  ];
  for (const [g, p] of yes) assert.ok(globToRegExp(g).test(p), `${g} ~ ${p}`);
  for (const [g, p] of no) assert.ok(!globToRegExp(g).test(p), `${g} !~ ${p}`);
});

function project({ hooks, runs = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sd-hooks-"));
  const sd = join(dir, ".stuntdouble");
  mkdirSync(join(sd, "checklists"), { recursive: true });
  for (const slug of ["checkout", "sign-up"])
    writeFileSync(join(sd, "checklists", `${slug}.json`), "{}");
  if (hooks) writeFileSync(join(sd, "hooks.json"), JSON.stringify(hooks));
  for (const [id, run] of Object.entries(runs)) {
    mkdirSync(join(sd, "runs", id), { recursive: true });
    writeFileSync(join(sd, "runs", id, "run.json"), JSON.stringify(run));
  }
  return dir;
}

const config = {
  format: "stuntdouble.hooks/1",
  session_summary: true,
  suggest_after_edit: true,
  ui_globs: ["app/**/*.{tsx,css}"],
  checklists_for: { checkout: ["app/checkout/**"] },
};
const run = (id, checklist, outcome, statuses) => ({
  format: "stuntdouble.run/1",
  id,
  status: "completed",
  checklist,
  checklist_snapshot: {
    checks: statuses.map((_, i) => ({ key: `c${i}`, type: "pass_fail" })),
  },
  results: statuses.map((status, i) => ({ check: `c${i}`, status })),
  score: { score: null, outcome },
});
const parse = (out) => JSON.parse(out).hookSpecificOutput;

test("no config, or a hook switched off: no output", () => {
  const bare = project();
  const env = { CLAUDE_PROJECT_DIR: bare };
  assert.equal(handle({ hook_event_name: "SessionStart" }, env), "");
  const off = project({
    hooks: { ...config, session_summary: false, suggest_after_edit: false },
  });
  assert.equal(
    handle({ hook_event_name: "SessionStart" }, { CLAUDE_PROJECT_DIR: off }),
    "",
  );
  assert.equal(
    handle(
      {
        hook_event_name: "PostToolUse",
        tool_input: { file_path: join(off, "app/page.tsx") },
      },
      { CLAUDE_PROJECT_DIR: off },
    ),
    "",
  );
  // The real script: exit 0, nothing on stdout.
  const out = execFileSync("node", [script], {
    input: JSON.stringify({ hook_event_name: "SessionStart", cwd: bare }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: bare },
  });
  assert.equal(out.toString(), "");
});

test("SessionStart names the checklists and the latest run", () => {
  const dir = project({
    hooks: config,
    runs: {
      "20261101-090000-sign-up": run(
        "20261101-090000-sign-up",
        "sign-up",
        "passed",
        ["passed"],
      ),
      "20261102-090000-checkout": run(
        "20261102-090000-checkout",
        "checkout",
        "failed",
        ["passed", "passed", "passed", "failed"],
      ),
    },
  });
  const out = execFileSync("node", [script], {
    input: JSON.stringify({
      hook_event_name: "SessionStart",
      source: "startup",
      cwd: dir,
    }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
  }).toString();
  const { hookEventName, additionalContext } = parse(out);
  assert.equal(hookEventName, "SessionStart");
  assert.match(additionalContext, /Checklists: checkout, sign-up\./);
  assert.match(
    additionalContext,
    /Latest run: checkout, failed, 3 of 4 checks passed \(20261102-090000-checkout\)/,
  );
  assert.match(additionalContext, /\/stuntdouble run <checklist>/);
});

test("PostToolUse suggests the mapped checklist once per session", () => {
  const dir = project({ hooks: config });
  const env = { CLAUDE_PROJECT_DIR: dir };
  const edit = (path, session = "s1") =>
    handle(
      {
        hook_event_name: "PostToolUse",
        session_id: session,
        tool_name: "Edit",
        tool_input: { file_path: join(dir, path) },
      },
      env,
    );

  const first = parse(edit("app/checkout/page.tsx"));
  assert.equal(first.hookEventName, "PostToolUse");
  assert.match(first.additionalContext, /`\/stuntdouble run checkout`/);
  assert.doesNotMatch(first.additionalContext, /sign-up/);
  assert.equal(edit("app/checkout/form.tsx"), "", "checkout already suggested");

  // Unmapped UI file: every checklist not yet suggested.
  const rest = parse(edit("app/page.tsx")).additionalContext;
  assert.match(rest, /`\/stuntdouble run sign-up`/);
  assert.doesNotMatch(rest, /run checkout/);

  assert.equal(edit("lib/db.ts"), "", "not a UI file");
  assert.equal(edit("../elsewhere/app/x.tsx"), "", "outside the project");
  assert.ok(edit("app/checkout/page.tsx", "s2"), "a new session starts over");
  const state = JSON.parse(
    readFileSync(join(dir, ".stuntdouble/.live/hooks-state.json"), "utf8"),
  );
  assert.equal(state.session_id, "s2");
});
