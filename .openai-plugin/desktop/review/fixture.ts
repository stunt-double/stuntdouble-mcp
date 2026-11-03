// Creates a disposable review project and serves one deterministic test page.
import { createServer } from "node:http";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const projectArg = process.argv[2];
if (!projectArg) throw new Error("Pass a fresh, approved test directory.");
const project = resolve(projectArg);
mkdirSync(project, { recursive: true });
if (readdirSync(project).length)
  throw new Error("The test directory must be empty.");

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Stunt Double review fixture</title><style>body{font:18px system-ui;margin:24px;max-width:40rem}button{font:inherit;padding:12px}</style><main><h1>Welcome</h1><p>This is a local test page. No accounts or payments.</p><button type="button" onclick="document.getElementById('result').hidden=false">Continue</button><p id="result" hidden>Ready</p></main></html>`;
const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(4750, "127.0.0.1", () => {
  const root = join(project, ".stuntdouble");
  for (const folder of ["actors", "checklists"])
    mkdirSync(join(root, folder), { recursive: true });
  const save = (path: string, data: unknown) =>
    writeFileSync(join(root, path), `${JSON.stringify(data, null, 2)}\n`);
  save("stuntdouble.json", {
    format: "stuntdouble/1",
    local_base_url: null,
    headless: true,
    model_screenshots: "on_request",
    safety: "third_party",
  });
  writeFileSync(join(root, ".gitignore"), ".live/\n");
  save("actors/first-time-user.json", {
    name: "First-time user",
    description: "New visitor to the test page",
    system_prompt:
      "Inspect only the local review fixture and report observable evidence.",
    knowledge: [],
    persist_login: false,
  });
  const heading = {
    key: "heading-visible",
    description: "The Welcome heading is visible",
    type: "pass_fail",
  };
  const ready = {
    key: "ready-visible",
    description: "Clicking Continue reveals Ready",
    type: "pass_fail",
  };
  for (const slug of ["welcome-pass", "welcome-fail", "welcome-phone"]) {
    save(`checklists/${slug}.json`, {
      name: slug,
      actor: "first-time-user",
      url: "http://127.0.0.1:4750",
      instructions:
        "Inspect the local page and click Continue when the checks require it. No accounts, payments or external navigation.",
      checks: [
        heading,
        slug === "welcome-fail"
          ? {
              key: "help-link",
              description: "A Help link is visible",
              type: "pass_fail",
            }
          : ready,
      ],
      pass_threshold: 100,
      ...(slug === "welcome-phone"
        ? { browser_config: { preset: "mobile" } }
        : {}),
    });
  }
  console.log(
    `Review fixture: http://127.0.0.1:4750\nProject: ${project}\nLaunch the local MCP server with STUNTDOUBLE_PROJECT_DIR set to this directory. Stop this fixture with Ctrl+C.`,
  );
});
