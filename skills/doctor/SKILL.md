---
name: doctor
description: Check that Stunt Double Studio can run locally with /stuntdouble:doctor: Node, Chrome, the viewer port and how local runs are billed.
---

# Stunt Double Studio: doctor

`/stuntdouble:doctor`, one of the Studio skills (`/stuntdouble:setup`, `/stuntdouble:run`, `/stuntdouble:open`, `/stuntdouble:cloud` and `/stuntdouble:doctor`).

Call `doctor()` from the `local` server and relay its lines. Only if this session has no `doctor` tool, run `npx -y stuntdouble@0.1.3 doctor` with Bash, or ask the person to run it in a terminal where Bash is not allowed. If the local tools are missing altogether, the `local` server did not start: check Node 22.18 or later and `npx`, then `/mcp`. A slow first tool listing is `npx` starting up (about 1.5 seconds), not the server.
