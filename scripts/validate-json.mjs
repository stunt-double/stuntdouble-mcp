import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = ['mcp.json', 'server.json', '.cursor-plugin/plugin.json'];

let failed = false;
for (const rel of files) {
  const abs = resolve(root, rel);
  try {
    JSON.parse(readFileSync(abs, 'utf8'));
    console.log('ok', rel);
  } catch (e) {
    console.error('invalid', rel, e instanceof Error ? e.message : e);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
