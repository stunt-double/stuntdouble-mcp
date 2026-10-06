/**
 * Checks the Cursor plugin layout: manifest fields, MCP wiring, and
 * frontmatter on skills, rules and agents that Cursor discovers by default.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let failed = false;

function fail(msg) {
  console.error('fail', msg);
  failed = true;
}

function ok(msg) {
  console.log('ok', msg);
}

function readJson(rel) {
  const abs = resolve(root, rel);
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    fail(`${rel}: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function parseFrontmatter(text, rel) {
  if (!text.startsWith('---')) {
    fail(`${rel}: missing YAML frontmatter`);
    return null;
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    fail(`${rel}: unclosed YAML frontmatter`);
    return null;
  }
  const block = text.slice(4, end).trim();
  /** @type {Record<string, string | boolean | string[]>} */
  const data = {};
  let key = null;
  let list = null;
  for (const line of block.split('\n')) {
    if (/^\s+-\s+/.test(line) && key && list) {
      list.push(line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    key = m[1];
    const raw = m[2].trim();
    if (raw === '' || raw === '|' || raw === '>') {
      list = [];
      data[key] = list;
      continue;
    }
    list = null;
    if (raw === 'true' || raw === 'false') {
      data[key] = raw === 'true';
    } else {
      data[key] = raw.replace(/^["']|["']$/g, '');
    }
  }
  return data;
}

const plugin = readJson('.cursor-plugin/plugin.json');
if (plugin) {
  for (const field of ['name', 'displayName', 'version', 'description', 'logo']) {
    if (!plugin[field]) fail(`.cursor-plugin/plugin.json missing ${field}`);
  }
  if (plugin.name !== 'stuntdouble') {
    fail(`.cursor-plugin/plugin.json name must be stuntdouble, got ${plugin.name}`);
  }
  if (!plugin.author?.name) fail('.cursor-plugin/plugin.json missing author.name');
  if (plugin.logo && !existsSync(resolve(root, plugin.logo))) {
    fail(`.cursor-plugin/plugin.json logo not found: ${plugin.logo}`);
  }
  ok('.cursor-plugin/plugin.json');
}

const marketplace = readJson('.cursor-plugin/marketplace.json');
if (marketplace) {
  if (marketplace.name !== 'stuntdouble') {
    fail(`.cursor-plugin/marketplace.json name must be stuntdouble`);
  }
  if (!marketplace.owner?.name) fail('.cursor-plugin/marketplace.json missing owner.name');
  const entry = marketplace.plugins?.find((p) => p.name === 'stuntdouble');
  if (!entry) fail('.cursor-plugin/marketplace.json missing stuntdouble plugin entry');
  else if (entry.source !== './' && entry.source !== '.') {
    fail(`.cursor-plugin/marketplace.json source should be ./ for this single-plugin repo`);
  }
  ok('.cursor-plugin/marketplace.json');
}

const mcp = readJson('mcp.json');
if (mcp) {
  const server = mcp.mcpServers?.stuntdouble;
  if (!server?.url) fail('mcp.json missing mcpServers.stuntdouble.url');
  else if (server.url !== 'https://app.stuntdouble.io/api/mcp') {
    fail(`mcp.json unexpected URL: ${server.url}`);
  } else if (server.type) {
    fail('mcp.json must not set type (Cursor negotiates Streamable HTTP from url alone)');
  } else {
    ok('mcp.json');
  }
}

const skillsDir = resolve(root, 'skills');
const skillDirs = readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const dir of skillDirs) {
  const rel = `skills/${dir.name}/SKILL.md`;
  const abs = resolve(root, rel);
  if (!existsSync(abs)) {
    fail(`${rel}: missing SKILL.md`);
    continue;
  }
  const fm = parseFrontmatter(readFileSync(abs, 'utf8'), rel);
  if (!fm) continue;
  if (!fm.name) fail(`${rel}: missing name`);
  else if (fm.name !== dir.name) fail(`${rel}: name ${fm.name} != folder ${dir.name}`);
  if (!fm.description) fail(`${rel}: missing description`);
  else ok(rel);
}

const rulesDir = resolve(root, 'rules');
for (const name of readdirSync(rulesDir).filter((f) => /\.(mdc|md|markdown)$/.test(f))) {
  const rel = `rules/${name}`;
  const fm = parseFrontmatter(readFileSync(resolve(root, rel), 'utf8'), rel);
  if (!fm) continue;
  if (!fm.description) fail(`${rel}: missing description`);
  if (typeof fm.alwaysApply !== 'boolean') fail(`${rel}: alwaysApply must be boolean`);
  else ok(rel);
}

const agentsDir = resolve(root, 'agents');
for (const name of readdirSync(agentsDir).filter((f) => /\.(md|mdc|markdown)$/.test(f))) {
  const rel = `agents/${name}`;
  const fm = parseFrontmatter(readFileSync(resolve(root, rel), 'utf8'), rel);
  if (!fm) continue;
  if (!fm.name) fail(`${rel}: missing name`);
  else if (fm.name !== basename(name, '.md') && fm.name !== basename(name, '.mdc')) {
    fail(`${rel}: name ${fm.name} should match file stem`);
  }
  if (!fm.description) fail(`${rel}: missing description`);
  else ok(rel);
}

if (failed) process.exit(1);
console.log('cursor plugin ok');
