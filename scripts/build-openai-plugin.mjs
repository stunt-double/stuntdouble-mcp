// Builds and checks the OpenAI plugin package (ChatGPT and Codex).
//
//   node scripts/build-openai-plugin.mjs           validate, then write dist/stuntdouble-openai-plugin.zip
//   node scripts/build-openai-plugin.mjs --check   validate only (CI)
//
// The source manifest is .openai-plugin/plugin.json, in the Agent Plugins
// format with OpenAI's listing and review fields under extensions.com.openai.
// The package is written in the Codex layout: .codex-plugin/plugin.json (the
// listing moved up to a root interface, review and publication kept under
// extensions.com.openai), a .mcp.json for the hosted server, the skills, and
// the assets the manifest names. The submission portal rejects the Agent
// Plugins layout's root plugin.json ("Plugin package must contain
// .codex-plugin/plugin.json ..."), whatever the docs say. Nothing else goes in:
// no agents, rules, other hosts' manifests or anything that could carry a
// credential.
//
// Limits are the ones in https://developers.openai.com/plugins/deploy/submission.
// Missing review material that only a person can supply (the demo video,
// screenshots) is a warning, so the package still builds while it is pending.

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const checkOnly = process.argv.includes("--check");
const MCP_URL = "https://app.stuntdouble.io/api/mcp";

const read = (rel) => JSON.parse(readFileSync(resolve(root, rel), "utf8"));
const manifest = read(".openai-plugin/plugin.json");
const claude = read(".claude-plugin/plugin.json");
const openai = manifest.extensions?.["com.openai"] ?? {};
const ui = openai.interface ?? {};
const review = openai.review ?? {};

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

function text(field, max, { required = true } = {}) {
  const value = ui[field];
  if (value == null || value === "") {
    if (required) fail(`interface.${field} is required`);
    return;
  }
  if (typeof value !== "string")
    return fail(`interface.${field} must be a string`);
  if (value.length > max)
    fail(`interface.${field} is ${value.length} characters (max ${max})`);
}

function httpsUrl(field) {
  const value = ui[field];
  if (
    typeof value !== "string" ||
    !value.startsWith("https://") ||
    value.length > 1024
  ) {
    fail(`interface.${field} must be an https URL of at most 1024 characters`);
  }
}

function asset(field, { required = true } = {}) {
  const value = ui[field];
  if (value == null) {
    if (required) fail(`interface.${field} is required`);
    return [];
  }
  const paths = Array.isArray(value) ? value : [value];
  for (const path of paths) {
    if (typeof path !== "string" || !path.startsWith("./")) {
      fail(`interface.${field}: ${path} must be a relative ./ path`);
    } else if (!existsSync(resolve(root, path))) {
      fail(`interface.${field}: ${path} does not exist`);
    }
  }
  return paths;
}

if (
  manifest.$schema !==
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
) {
  fail("$schema must be the Agent Plugins 1.0.0 plugin schema");
}
if (
  !/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(
    manifest.name ?? "",
  )
) {
  fail("name must be lowercase letters, digits, dots and hyphens");
}
// One version line across every host's manifest; see CONTRIBUTING.md.
if (manifest.version !== claude.version) {
  fail(
    `version ${manifest.version} does not match .claude-plugin/plugin.json ${claude.version}`,
  );
}

text("displayName", 30);
text("shortDescription", 30);
text("longDescription", 4000);
text("developerName", 80);
text("category", 80);
for (const field of [
  "websiteURL",
  "supportURL",
  "privacyPolicyURL",
  "termsOfServiceURL",
]) {
  httpsUrl(field);
}

const capabilities = ui.capabilities ?? [];
if (capabilities.length > 20)
  fail("interface.capabilities has more than 20 entries");
capabilities.forEach((c, i) => {
  if (typeof c !== "string" || c.length > 120)
    fail(`interface.capabilities[${i}] exceeds 120 characters`);
});

const prompts = ui.defaultPrompt ?? [];
if (prompts.length > 3) fail("interface.defaultPrompt has more than 3 entries");
prompts.forEach((p, i) => {
  if (typeof p !== "string" || p.length > 128)
    fail(`interface.defaultPrompt[${i}] exceeds 128 characters`);
});

for (const field of ["brandColor", "brandColorDark"]) {
  if (ui[field] != null && !/^#[0-9A-Fa-f]{6}$/.test(ui[field]))
    fail(`interface.${field} must be #RRGGBB`);
}

const assets = [
  ...asset("logo"),
  ...asset("composerIcon"),
  ...asset("logoDark", { required: false }),
  ...asset("composerIconDark", { required: false }),
  ...asset("screenshots", { required: false }),
];
if (!ui.screenshots?.length) {
  warnings.push(
    "no screenshots yet: capture the checklist run and Index cards in ChatGPT",
  );
}

const positive = review.test_cases?.positive ?? [];
const negative = review.test_cases?.negative ?? [];
if (positive.length !== 5)
  fail(`review needs 5 positive test cases (has ${positive.length})`);
if (negative.length !== 3)
  fail(`review needs 3 negative test cases (has ${negative.length})`);
positive.forEach((c, i) => {
  for (const key of [
    "description",
    "prompt",
    "tools_triggered",
    "expected_behavior",
  ]) {
    if (!c[key]) fail(`review.test_cases.positive[${i}].${key} is required`);
  }
});
negative.forEach((c, i) => {
  for (const key of ["description", "prompt"]) {
    if (!c[key]) fail(`review.test_cases.negative[${i}].${key} is required`);
  }
});
if (!review.demo_recording_url) {
  warnings.push(
    "review.demo_recording_url is not set: record the five positive cases before submitting",
  );
}

// Review rejects a listing whose name or description names another AI
// assistant, model or platform.
const OTHER_AI =
  /\b(chatgpt|claude|anthropic|gemini|perplexity|copilot|gpt-?\d|llama|mistral|grok)\b/i;
const listingText = [
  manifest.description,
  ui.displayName,
  ui.shortDescription,
  ui.longDescription,
  ...capabilities,
]
  .filter(Boolean)
  .join("\n");
const named = listingText.match(OTHER_AI);
if (named)
  fail(`the listing names another AI assistant or platform ("${named[0]}")`);

// House rule: no em dashes anywhere, and this copy is public.
if (JSON.stringify(manifest).includes("\u2014"))
  fail("the manifest contains an em dash");

for (const w of warnings) console.warn("warning:", w);
if (errors.length) {
  for (const e of errors) console.error("error:", e);
  process.exit(1);
}
console.log("ok .openai-plugin/plugin.json");
if (checkOnly) process.exit(0);

const stage = resolve(root, "dist/openai-plugin");
const zip = resolve(root, "dist/stuntdouble-openai-plugin.zip");
rmSync(stage, { recursive: true, force: true });
rmSync(zip, { force: true });
mkdirSync(stage, { recursive: true });

// Codex layout: presentation fields at the root, OpenAI's review and
// publication fields stay under the extension, no $schema.
const { $schema: _schema, extensions, ...identity } = manifest;
const { interface: listing, ...openaiRest } = extensions["com.openai"];
const codexManifest = {
  ...identity,
  skills: "./skills/",
  mcpServers: "./.mcp.json",
  interface: listing,
  extensions: { ...extensions, "com.openai": openaiRest },
};
mkdirSync(resolve(stage, ".codex-plugin"), { recursive: true });
writeFileSync(
  resolve(stage, ".codex-plugin/plugin.json"),
  `${JSON.stringify(codexManifest, null, 2)}\n`,
);
writeFileSync(
  resolve(stage, ".mcp.json"),
  `${JSON.stringify({ mcpServers: { stuntdouble: { url: MCP_URL } } }, null, 2)}\n`,
);
cpSync(resolve(root, "skills"), resolve(stage, "skills"), { recursive: true });
for (const path of new Set(assets)) {
  const dest = resolve(stage, path);
  mkdirSync(resolve(dest, ".."), { recursive: true });
  cpSync(resolve(root, path), dest);
}

execFileSync("zip", ["-rqX", zip, "."], { cwd: stage });
console.log("wrote", zip.replace(`${root}/`, ""));
