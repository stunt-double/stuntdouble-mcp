# Stunt Double Studio submission preparation

Stunt Double Studio is a separate desktop-only package named `stuntdouble-studio`. Stunt Double Cloud remains the web/mobile submission and keeps its existing `stuntdouble` package identity. Do not replace the Cloud submission's archive with Studio.

The desktop runtime is the published `stuntdouble@0.1.2` npm package plus production dependencies locked by pnpm. It is bundled rather than downloaded through `npx` at startup. Node 22.18 or later and a separately installed Chrome are prerequisites. The runtime never calls a model. The assistant host performs the reasoning, so the CLI doctor's provider-specific billing line is not applicable to other hosts.

## Build

From this repository:

```sh
pnpm --dir .openai-plugin/desktop/runtime install --prod --ignore-scripts --frozen-lockfile
node scripts/build-openai-desktop-plugin.ts
node scripts/build-openai-plugin.mjs
```

Outputs are `dist/stuntdouble-studio-plugin.zip` and `dist/stuntdouble-cloud-plugin.zip`. Studio uses the portable root manifests. Each of its two servers owns its five positive and three negative cases; the plugin manifest does not duplicate case lists. Publisher, countries and translations inherit supplied source values without inventing missing declarations.

## Rehearse the local cases

1. Start from a clean desktop installation. Confirm the `local` and hosted `stuntdouble` connections are discovered. Set the local server's `STUNTDOUBLE_PROJECT_DIR` to an approved disposable test directory, or launch it with that working directory. Never use the plugin's installation directory as a user project.
2. With consent, create a fresh empty test directory and run `node <installed-plugin>/review/fixture.ts <test-directory>`. It seeds three deterministic checklists and serves a local page on port 4750. Leave it running. The fixture refuses to overwrite a nonempty directory. It has no accounts, external requests or commerce.
3. Restart the local MCP connection with that same project directory. Run the bundled CLI doctor, ignoring its provider-specific billing line for other hosts.
4. Run the five local cases in `mcp.json`, including the interrupted-run setup for resume. The phone checklist changes the browser viewport; it is not a test of the mobile assistant app. Local commands are desktop only.
5. Separately verify setup and doctor, then the consent boundary for cloud: do not upload without consent; after consent use a dedicated seeded review workspace and a reachable authorised test target. Run the hosted server's five positive and three negative cases too. Credentials belong in secure dashboard fields, never this package.
6. Record actual prompts, calls, outcomes and evidence as Passed, Failed, Blocked or Not run. Capture the three starter-prompt screenshots and a real reviewer-accessible demo recording. A script or a fixture is not recorded evidence.

## Outstanding requirements

- All prepared desktop review cases are **Not run** until exercised in the target host. Bundling does not establish a clean-install pass.
- The npm 0.1.2 local server registers tools without boolean `readOnlyHint`, `destructiveHint` or `openWorldHint`. These must be corrected in its owning source (`stunt-double/stuntkit`, `packages/local`) and published before this package can be declared ready. Do not patch compiled vendor code or add hints that conceal real behavior. Update the exact runtime pin and lockfile after that release.
- The default safety guard restricts third-party payment actions but is not a blanket technical payment ban on the target under test. Skill instructions prohibit transactions; review the engine's enforcement and the hosted run path before claiming commerce remediation is complete.
- The desktop organisation must be allowlisted for local MCP submissions. Confirm eligibility with OpenAI before uploading: https://developers.openai.com/plugins/deploy/desktop-only
- Confirm the verified publisher identity and intended countries in the selected submission. No missing country or translation values have been invented.
- Demo recording, listing screenshots, reviewer account access, domain verification, scans and developer attestations remain required where applicable. Existing hosted reviewer-access findings need rechecking; do not reuse yesterday's status as current evidence.

No upload, submission, account creation or publication is performed by the build scripts.

## Preparation checks on 3 November 2026

The locked pnpm install and both archive builds succeeded. The desktop archive's bundled Node entry point advertised 14 local tools. Doctor found Node and Chrome and a free viewer port. Direct MCP protocol smoke tests against the disposable loopback fixture completed a passing run, an intentional failing run, a mobile-viewport run, a resume that kept its run id and prior verdict, and a viewer lookup. Saved results contained evidence screenshots. No hosted calls were made by these smoke tests.

These are runtime smoke tests, not completed review cases in ChatGPT or Codex. The target-host cases remain Not run. All 14 advertised local tools lacked the three required safety hints, confirming the annotation blocker above.

Archive inspection confirmed separate identities (`stuntdouble` for Cloud and `stuntdouble-studio` for Studio), no local skill or runtime in the Cloud archive, the exact 0.1.2 runtime in the Studio archive, desktop-only metadata, and five positive plus three negative cases on each Studio server with no duplicate plugin-level case list. Neither package contains reviewer credentials or root app bindings.
