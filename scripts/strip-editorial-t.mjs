#!/usr/bin/env node
/**
 * Strips editorial i18n strings from the T object in src/index.html
 * and adds them to content.json so they are only available after decryption.
 *
 * Pre-release keys kept in T: pre.*, timer.*, status.*, transition.*
 * Everything else moves to content.json it/en sections.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const htmlPath    = join(ROOT, 'src', 'index.html');
const contentPath = join(__dirname, 'content.json');

let html    = readFileSync(htmlPath, 'utf8');
const contentJson = JSON.parse(readFileSync(contentPath, 'utf8'));

// We'll surgically cut out the editorial part of T for both IT and EN.
// The pre-release section ends after 'transition.sub'. The last editorial key
// before the closing } of each language section ends near 'credits.micro'.
// Strategy: replace the entire T object with a trimmed version.

// ── Regex to locate the T = { ... } block ────────────────────────────────
// We know it starts with "const T = {" and ends with "};" on its own line.
const T_START = /const T = \{/;
const T_END   = /^\};\s*$/m;  // the `};` that closes T

const tStartMatch = T_START.exec(html);
if (!tStartMatch) { console.error('T block not found'); process.exit(1); }

// Find the matching closing brace
let depth = 0;
let tEndIdx = -1;
for (let i = tStartMatch.index; i < html.length; i++) {
  if (html[i] === '{') depth++;
  if (html[i] === '}') {
    depth--;
    if (depth === 0) { tEndIdx = i; break; }
  }
}
if (tEndIdx === -1) { console.error('Could not find T closing brace'); process.exit(1); }

const tBlock = html.slice(tStartMatch.index, tEndIdx + 1);

// ── Extract all key:value lines from the block ───────────────────────────
// We parse each "it: { ... }" and "en: { ... }" sub-block
function extractLangObj(block, lang) {
  const langRe = new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)\\}\\s*[,}]`);
  const m = langRe.exec(block);
  if (!m) return {};

  const pairs = {};
  // Match 'key': 'value' or 'key': "value" — handles escaped quotes via non-greedy
  const kvRe = /'([^']+)':\s*'((?:[^'\\]|\\.)*)'/g;
  let km;
  while ((km = kvRe.exec(m[1])) !== null) {
    pairs[km[1]] = km[2].replace(/\\n/g, '\n').replace(/\\'/g, "'");
  }
  return pairs;
}

// Pre-release key prefixes to KEEP inside T
const PRE_RELEASE_PREFIXES = ['pre.','timer.','status.','transition.'];
function isPreRelease(key) {
  return PRE_RELEASE_PREFIXES.some(p => key.startsWith(p));
}

const itPairs = extractLangObj(tBlock, 'it');
const enPairs = extractLangObj(tBlock, 'en');

const editorialIT = {}, editorialEN = {};
for (const [k, v] of Object.entries(itPairs)) {
  if (!isPreRelease(k)) editorialIT[k] = v;
}
for (const [k, v] of Object.entries(enPairs)) {
  if (!isPreRelease(k)) editorialEN[k] = v;
}

console.log(`Editorial strings found — IT: ${Object.keys(editorialIT).length}, EN: ${Object.keys(editorialEN).length}`);

// ── Merge into content.json ───────────────────────────────────────────────
if (!contentJson.it) contentJson.it = {};
if (!contentJson.en) contentJson.en = {};
Object.assign(contentJson.it, editorialIT);
Object.assign(contentJson.en, editorialEN);
writeFileSync(contentPath, JSON.stringify(contentJson, null, 2), 'utf8');
console.log('✓ content.json updated with editorial strings');

// ── Build a new T block keeping only pre-release keys ────────────────────
function buildLangBlock(lang, pairs) {
  const kept = Object.entries(pairs).filter(([k]) => isPreRelease(k));
  const lines = kept.map(([k, v]) => {
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `    '${k}': '${escaped}'`;
  });
  return `  ${lang}: {\n${lines.join(',\n')},\n  }`;
}

const newT = `const T = {\n${buildLangBlock('it', itPairs)},\n${buildLangBlock('en', enPairs)}\n}`;
const newHtml = html.slice(0, tStartMatch.index) + newT + html.slice(tEndIdx + 1);
writeFileSync(htmlPath, newHtml, 'utf8');
console.log('✓ src/index.html T object stripped to pre-release keys only');
