// Build separately from the hosted web/mobile submission. Node >=22.18.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, ".openai-plugin/desktop");
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const hosted = read(resolve(root, ".openai-plugin/plugin.json"));
const { $schema, ...identity } = hosted;
const original = hosted.extensions["com.openai"];
const runtime = read(resolve(source, "runtime/package.json"));
const localCases = read(resolve(source, "review.json"));
const hostedCases = original.review.test_cases;
const stage = resolve(root, "dist/openai-desktop-plugin");
const zip = resolve(root, "dist/stuntdouble-studio-plugin.zip");

for (const [name, positive, negative] of [
  ["local", localCases.testCases, localCases.negativeTestCases],
  ["hosted", hostedCases.positive, hostedCases.negative],
] as const) {
  if (positive.length !== 5 || negative.length !== 3)
    throw new Error(`${name} needs five positive and three negative cases.`);
}
const modules = resolve(source, "runtime/node_modules");
const installed = resolve(modules, "stuntdouble/package.json");
if (!existsSync(installed))
  throw new Error(
    "Install the desktop runtime first: pnpm --dir .openai-plugin/desktop/runtime install --prod --ignore-scripts --frozen-lockfile",
  );
const engine = read(installed);
if (engine.version !== runtime.dependencies.stuntdouble)
  throw new Error("Installed desktop engine does not match its exact pin.");

const hostedReview = {
  testCases: hostedCases.positive.map((c: Record<string, string>) => ({
    description: c.description,
    userPrompt: c.prompt,
    toolsTriggered: c.tools_triggered,
    expectedOutput: c.expected_behavior,
    ...(c.file_attachment_urls
      ? { fileAttachmentUrls: c.file_attachment_urls }
      : {}),
    ...(c.expected_output_url
      ? { expectedOutputUrl: c.expected_output_url }
      : {}),
  })),
  negativeTestCases: hostedCases.negative.map((c: Record<string, string>) => ({
    description: c.description,
    userPrompt: c.prompt,
  })),
};
const { test_cases: _cases, ...review } = original.review;
const manifest = {
  ...identity,
  $schema,
  name: "stuntdouble-studio",
  description:
    "Test a product in a local browser and keep verdicts, screenshots and activity in your project.",
  extensions: {
    "com.openai": {
      requires_local_executor: true,
      interface: {
        ...original.interface,
        displayName: "Stunt Double Studio",
        shortDescription: "Test flows in local Chrome",
        longDescription:
          "Run product checks in Chrome on your own computer and keep the evidence in your project. Use /stuntdouble setup to create an actor and checklist, /stuntdouble run to exercise a flow, /stuntdouble run <checklist> resume to continue an interrupted run, /stuntdouble open to inspect saved evidence, and /stuntdouble doctor to check prerequisites. Local runs need no Stunt Double account and make no additional model calls: your assistant session judges the checks. Local verdicts are self-judged.\n\nWith explicit consent, /stuntdouble cloud sends the actor and checklist to a connected Stunt Double workspace and starts a hosted run. Hosted workflows require an account and its existing permissions and allowance. Public Index reports do not require an account.\n\nDesktop only. Requires Node 22.18 or later, Chrome and an approved project directory. Local files and screenshots may contain test data. The bundled viewer stays on loopback. This plugin does not buy products, subscribe, change plans or manage payments.",
        capabilities: [
          "Run local product checks with browser evidence",
          "Resume interrupted local runs",
          "Inspect saved local verdicts, screenshots and activity",
          "Send a checklist to a connected workspace with consent",
        ],
        defaultPrompt: [
          "Set up a local checklist for my test sign-up page.",
          "Run my local sign-up checklist and show the evidence.",
          "Open my saved local Stunt Double runs.",
        ],
        screenshots: undefined,
      },
      review: {
        ...review,
        prompts: [
          "/stuntdouble setup",
          "/stuntdouble run welcome-pass",
          "/stuntdouble run welcome-pass resume",
          "/stuntdouble open",
          "/stuntdouble doctor",
          "/stuntdouble cloud sign-up",
        ],
        commerce_description:
          "Local commands test authorised product flows without purchasing or subscribing. Hosted access uses existing workspace entitlements; the plugin does not promote upgrades or manage billing.",
      },
      publication: {
        ...original.publication,
        release_notes: `Initial desktop package with the local command suite and bundled stuntdouble ${engine.version} runtime. The hosted web/mobile submission remains separate.`,
      },
    },
  },
};
const mcp = {
  $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  mcpServers: {
    local: {
      type: "stdio",
      command: "node",
      args: [
        "${PLUGIN_ROOT}/runtime/node_modules/stuntdouble/dist/cli.js",
        "mcp",
      ],
      extensions: { "com.openai": { review: localCases } },
    },
    stuntdouble: {
      type: "streamable-http",
      url: "https://app.stuntdouble.io/api/mcp",
      extensions: { "com.openai": { review: hostedReview } },
    },
  },
};

rmSync(stage, { recursive: true, force: true });
rmSync(zip, { force: true });
mkdirSync(stage, { recursive: true });
writeFileSync(
  resolve(stage, "plugin.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(resolve(stage, "mcp.json"), `${JSON.stringify(mcp, null, 2)}\n`);
cpSync(resolve(root, "LICENSE"), resolve(stage, "LICENSE"));
cpSync(resolve(source, "skills"), resolve(stage, "skills"), {
  recursive: true,
});
cpSync(resolve(source, "review"), resolve(stage, "review"), {
  recursive: true,
});
cpSync(modules, resolve(stage, "runtime/node_modules"), {
  recursive: true,
  dereference: true,
  filter: (path) => !path.split(/[\\/]/).includes(".bin"),
});
for (const file of ["package.json", "pnpm-lock.yaml"])
  cpSync(resolve(source, "runtime", file), resolve(stage, "runtime", file));
cpSync(
  resolve(source, "DESKTOP-REVIEW.md"),
  resolve(stage, "DESKTOP-REVIEW.md"),
);
const ui = manifest.extensions["com.openai"].interface;
for (const field of [
  "logo",
  "logoDark",
  "composerIcon",
  "composerIconDark",
] as const) {
  const path = ui[field];
  if (!path) continue;
  const dest = resolve(stage, path);
  if (!dest.startsWith(`${stage}/`))
    throw new Error("Icon escapes the package.");
  mkdirSync(resolve(dest, ".."), { recursive: true });
  cpSync(resolve(root, path), dest);
}
// Remove package-manager bookkeeping; the deployed runtime never installs code.
for (const file of readdirSync(resolve(stage, "runtime/node_modules"))) {
  if (file.startsWith("."))
    rmSync(resolve(stage, "runtime/node_modules", file), {
      recursive: true,
      force: true,
    });
}
for (const dependency of Object.keys(engine.dependencies)) {
  if (
    !existsSync(
      resolve(stage, "runtime/node_modules", dependency, "package.json"),
    )
  )
    throw new Error(`Runtime dependency is not bundled: ${dependency}`);
}
execFileSync("zip", ["-rqX", zip, "."], { cwd: stage });
console.log(
  `Wrote ${zip}\nDraft only: see DESKTOP-REVIEW.md for outstanding review requirements.`,
);
