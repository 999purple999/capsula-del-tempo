#!/usr/bin/env node
/**
 * TIME CAPSULE 5B INF — Content Encryption Script
 *
 * Usage:
 *   node scripts/encrypt-content.mjs
 *
 * What it does:
 *   1. Reads CAPSULE_KEY from environment variable
 *   2. Reads content from scripts/content.json (optional override content)
 *   3. Encrypts with AES-256-GCM
 *   4. Injects the encrypted blob into src/index.html
 *   5. Writes output to dist/index.html
 *
 * Environment:
 *   CAPSULE_KEY  — 64-char hex string (32 bytes)
 *                  Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * This script runs at build time (GitHub Actions).
 * The key is stored as a GitHub Secret and injected via env.
 */

import { webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const subtle = webcrypto.subtle;
const getRandomValues = (buf) => webcrypto.getRandomValues(buf);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ── CONFIG ─────────────────────────────────────────────────── */

const CAPSULE_KEY = process.env.CAPSULE_KEY;
const WORKER_URL  = process.env.WORKER_URL || 'WORKER_URL_PLACEHOLDER';

if (!CAPSULE_KEY) {
  console.error('\n❌ CAPSULE_KEY environment variable is required.\n');
  console.error('   Generate one with:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.error('\n   Then set it:\n   export CAPSULE_KEY="your-64-char-hex"\n');
  process.exit(1);
}

if (CAPSULE_KEY.length !== 64 || !/^[0-9a-f]+$/i.test(CAPSULE_KEY)) {
  console.error('❌ CAPSULE_KEY must be a 64-character hex string (32 bytes).');
  process.exit(1);
}

/* ── OPTIONAL EXTRA CONTENT ─────────────────────────────────── */
// If you want to override/extend i18n content for the post-release version,
// place additional translations in scripts/content.json.
// Format: { "it": { "key": "value" }, "en": { "key": "value" } }
// These will be decrypted and merged into the i18n system at runtime.

let extraContent = null;
const contentPath = join(__dirname, 'content.json');
if (existsSync(contentPath)) {
  try {
    extraContent = JSON.parse(readFileSync(contentPath, 'utf8'));
    console.log('✓ Loaded extra content from scripts/content.json');
  } catch (e) {
    console.warn('⚠ Could not parse content.json:', e.message);
  }
}

// If no extra content, create a minimal placeholder that signals "full version"
if (!extraContent) {
  extraContent = {
    _meta: { version: '1.0', encrypted: true, buildTime: new Date().toISOString() }
  };
}

/* ── ENCRYPT ─────────────────────────────────────────────────── */

async function encrypt(plaintext, keyHex) {
  const keyBytes = hexToBytes(keyHex);
  const iv = getRandomValues(new Uint8Array(12));

  const key = await subtle.importKey(
    'raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']
  );

  const encoded = new TextEncoder().encode(JSON.stringify(plaintext));
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Concatenate iv + ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return bytesToBase64(combined);
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/* ── MAIN ────────────────────────────────────────────────────── */

async function main() {
  console.log('\n🔐 TIME CAPSULE — Build & Encrypt\n');

  // Read source HTML
  const srcPath = join(ROOT, 'src', 'index.html');
  if (!existsSync(srcPath)) {
    console.error(`❌ Source not found: ${srcPath}`);
    process.exit(1);
  }
  let html = readFileSync(srcPath, 'utf8');

  // Encrypt content
  console.log('⚙  Encrypting content...');
  const encryptedBlob = await encrypt(extraContent, CAPSULE_KEY);
  console.log('✓  Encrypted blob length:', encryptedBlob.length, 'chars');

  // Replace placeholder
  html = html.replace(
    '"data":"ENCRYPTED_BLOB_PLACEHOLDER"',
    `"data":"${encryptedBlob}"`
  );

  // Replace Worker URL
  if (WORKER_URL !== 'WORKER_URL_PLACEHOLDER') {
    html = html.replace(
      '"workerUrl": "WORKER_URL_PLACEHOLDER"',
      `"workerUrl": "${WORKER_URL}"`
    );
    console.log(`✓  Worker URL set: ${WORKER_URL}`);
  } else {
    console.warn('⚠  WORKER_URL not set — site will use local time fallback.');
  }

  // Write to dist/
  const distDir = join(ROOT, 'dist');
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

  const outPath = join(distDir, 'index.html');
  writeFileSync(outPath, html, 'utf8');
  console.log(`✓  Written: ${outPath}`);

  // Also copy locked.html to dist/locked.html unchanged
  const lockedSrc = join(ROOT, 'src', 'locked.html');
  if (existsSync(lockedSrc)) {
    let locked = readFileSync(lockedSrc, 'utf8');
    if (WORKER_URL !== 'WORKER_URL_PLACEHOLDER') {
      locked = locked.replace('const WORKER = null', `const WORKER = '${WORKER_URL}'`);
    }
    writeFileSync(join(distDir, 'locked.html'), locked, 'utf8');
    console.log(`✓  Written: ${distDir}/locked.html`);
  }

  console.log('\n✅ Build complete!\n');
  console.log('   dist/index.html  — live version (with encrypted payload)');
  console.log('   dist/locked.html — public locked version\n');
}

main().catch(e => {
  console.error('❌ Build failed:', e);
  process.exit(1);
});
