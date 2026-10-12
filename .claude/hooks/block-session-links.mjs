#!/usr/bin/env node
// PreToolUse hook: this repository is public, so Claude Code session links and
// trailers must never reach a commit, PR, issue or comment. Blocks the tool call
// (exit 2) when its input, or a file it passes as a message or body, has one.
import { readFileSync } from 'node:fs';

const PATTERN = /claude\.ai\/code\/session_|Claude-Session:|\bsession_0[0-9A-Za-z]{20,}/i;

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const toolInput = input.tool_input ?? {};
const texts = [JSON.stringify(toolInput)];

// `git commit -F file`, `gh pr create --body-file file` and similar.
const command = typeof toolInput.command === 'string' ? toolInput.command : '';
for (const m of command.matchAll(/(?:-F|--file|--body-file)[ =]+(?:'([^']+)'|"([^"]+)"|(\S+))/g)) {
  try {
    texts.push(readFileSync(m[1] ?? m[2] ?? m[3], 'utf8'));
  } catch {
    // Unreadable or not a path; the command text itself was still checked.
  }
}

if (texts.some((text) => PATTERN.test(text))) {
  console.error(
    'Blocked: this repository is public. Remove Claude Code session links (claude.ai/code/session_...) and Claude-Session trailers from commit messages, PR titles and bodies, issues and comments, then retry.',
  );
  process.exit(2);
}
