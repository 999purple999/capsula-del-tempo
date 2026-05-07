/**
 * TIME CAPSULE 5B INF — Cloudflare Worker
 *
 * Endpoints:
 *   GET /api/status   → { serverTime, releaseTimestamp, isReleased }
 *   GET /api/content  → { key } — only after release date
 *
 * Required Worker Secrets (set via wrangler secret put):
 *   CAPSULE_KEY        — 64-char hex string (32 bytes AES-256 key)
 *   RELEASE_DATE       — ISO 8601 string e.g. "2026-06-10T08:00:00Z"
 *
 * Optional:
 *   LIVE_SITE_URL      — canonical URL of the live site (for CORS)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── /api/status ──────────────────────────────────────────────
    if (url.pathname === '/api/status') {
      return handleStatus(env);
    }

    // ── /api/content ─────────────────────────────────────────────
    if (url.pathname === '/api/content') {
      return handleContent(request, env);
    }

    // ── health ───────────────────────────────────────────────────
    if (url.pathname === '/api/health') {
      return jsonResponse({ status: 'ok', ts: Date.now() });
    }

    return new Response('Not Found', { status: 404 });
  },
};

/* ── HANDLERS ─────────────────────────────────────────────────── */

function handleStatus(env) {
  const releaseDate = getReleaseDate(env);
  const releaseTimestamp = releaseDate.getTime();
  const serverTime = Date.now();
  const isReleased = serverTime >= releaseTimestamp;

  return jsonResponse({
    serverTime,
    releaseTimestamp,
    isReleased,
    // Include human-readable date for debugging (non-sensitive)
    releaseISO: releaseDate.toISOString(),
  });
}

function handleContent(request, env) {
  const releaseDate = getReleaseDate(env);
  const isReleased = Date.now() >= releaseDate.getTime();

  if (!isReleased) {
    return jsonResponse(
      { error: 'not_released', message: 'Content locked until release date.' },
      403
    );
  }

  // Validate that CAPSULE_KEY is set
  const key = env.CAPSULE_KEY;
  if (!key || key.length !== 64) {
    console.error('[TC] CAPSULE_KEY is missing or invalid');
    return jsonResponse(
      { error: 'server_error', message: 'Key not configured.' },
      500
    );
  }

  // Optional: rate limiting by IP (basic)
  // For production, use Cloudflare's built-in rate limiting rules.

  return jsonResponse({ key });
}

/* ── HELPERS ──────────────────────────────────────────────────── */

function getReleaseDate(env) {
  // Prefer env secret, fall back to hardcoded default
  const raw = env.RELEASE_DATE || '2036-05-07T00:00:00Z';
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    console.error('[TC] Invalid RELEASE_DATE:', raw);
    return new Date('2026-06-10T08:00:00Z');
  }
  return d;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}
