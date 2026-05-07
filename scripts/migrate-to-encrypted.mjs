#!/usr/bin/env node
/**
 * One-time migration: extracts #post-release innerHTML from src/index.html
 * into content.json, then empties the div in the template so the source
 * reveals nothing until the AES-256-GCM key is provided at release time.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const htmlPath    = join(ROOT, 'src', 'index.html');
const contentPath = join(__dirname, 'content.json');

let html = readFileSync(htmlPath, 'utf8');
const content = JSON.parse(readFileSync(contentPath, 'utf8'));

// Find the boundaries of #post-release innerHTML
const OPEN_TAG   = '<div id="post-release"';
const CLOSE_TAG  = '</div><!-- /post-release -->';
const openTagIdx = html.indexOf(OPEN_TAG);
if (openTagIdx === -1) { console.error('Could not find #post-release'); process.exit(1); }

const afterOpenTag = html.indexOf('>', openTagIdx) + 1;   // just past the >
const closeTagIdx  = html.indexOf(CLOSE_TAG);
if (closeTagIdx === -1) { console.error('Could not find close tag'); process.exit(1); }

const innerHtml = html.slice(afterOpenTag, closeTagIdx).trim();
console.log(`Extracted ${innerHtml.length} chars of post-release HTML`);

// Save to content.json
content.html = innerHtml;
writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
console.log('✓ content.json updated with html field');

// Hollow out the div in the template — nothing but a comment placeholder
const newHtml =
  html.slice(0, afterOpenTag) +
  '\n  <!-- CONTENT_INJECTED_AT_RUNTIME_VIA_AES_DECRYPT -->\n' +
  html.slice(closeTagIdx);
writeFileSync(htmlPath, newHtml, 'utf8');
console.log('✓ src/index.html #post-release emptied');
