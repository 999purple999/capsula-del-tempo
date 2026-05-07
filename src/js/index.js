/* ================================================================
   TIME CAPSULE 5B INF — Main Application
   ================================================================ */
(function() {
'use strict';

/* ── CONFIG ── */
const rawConfig = JSON.parse(
  document.getElementById('capsule-config').textContent
);
const CONFIG = {
  workerUrl: rawConfig.workerUrl !== 'WORKER_URL_PLACEHOLDER'
    ? rawConfig.workerUrl : null,
  releaseDate: new Date(rawConfig.releaseDate),
  previewParam: rawConfig.previewParam,
};

/* ── STATE ── */
let currentLang = localStorage.getItem('tc-lang') || 'it';
let releaseTs = CONFIG.releaseDate.getTime();
let serverTimeOffset = 0;
let released = false;
let timerInterval = null;

/* ════════════════════════════════════════
   I18N
   ════════════════════════════════════════ */
const T = {
  it: {
    'pre.label': 'TIME CAPSULE',
    'pre.phrase': 'Il futuro si conserva nel codice.\nIl passato si rivela al momento giusto.',
    'timer.years': 'ANNI',
    'timer.days': 'GIORNI',
    'timer.hours': 'ORE',
    'timer.minutes': 'MINUTI',
    'timer.seconds': 'SECONDI',
    'status.sealed': '⬡  CAPSULA SIGILLATA',
    'status.locked': '⬡  ARCHIVIO BLOCCATO',
    'status.pending': '⬡  RILASCIO IN ATTESA',
    'status.synced': '⬡  MEMORIA SINCRONIZZATA',
    'status.scheduled': '⬡  ACCESSO PROGRAMMATO',
    'transition.text': 'ARCHIVIO IN APERTURA',
    'transition.sub': 'DECIFRAZIONE — RILASCIO AUTORIZZATO',
  },
  en: {
    'pre.label': 'TIME CAPSULE',
    'pre.phrase': 'The future is preserved in code.\nThe past reveals itself at the right moment.',
    'timer.years': 'YEARS',
    'timer.days': 'DAYS',
    'timer.hours': 'HOURS',
    'timer.minutes': 'MINUTES',
    'timer.seconds': 'SECONDS',
    'status.sealed': '⬡  CAPSULE SEALED',
    'status.locked': '⬡  ARCHIVE LOCKED',
    'status.pending': '⬡  RELEASE PENDING',
    'status.synced': '⬡  MEMORY SYNCHRONIZED',
    'status.scheduled': '⬡  ACCESS SCHEDULED',
    'transition.text': 'ARCHIVE UNLOCKING',
    'transition.sub': 'DECRYPTING — RELEASE AUTHORIZED',
  }
};

function t(key) {
  return (T[currentLang] && T[currentLang][key]) ||
         (T['it'] && T['it'][key]) || key;
}

function setLang(lang) {
  if (!T[lang]) return;
  currentLang = lang;
  localStorage.setItem('tc-lang', lang);
  document.documentElement.lang = lang;
  applyTranslations();
  updateLangButtons();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

/* ════════════════════════════════════════
   MATRIX RAIN
   ════════════════════════════════════════ */
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none'; return;
  }

  const ctx = canvas.getContext('2d');

  /* ── Exact Matrix film charset: half-width katakana + numerals ── */
  const KATAKANA = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
  const NUMS     = '0123456789';
  const LATIN    = 'ABCDEFZ';
  const PUNCT    = ':."=*+-<>';
  const CA       = (KATAKANA + NUMS + LATIN + PUNCT).split('');
  const FS       = 16;

  let W, H, cols;
  let streams = [];

  /* Each column can hold multiple independent streams */
  function mkStream(col, startY) {
    return {
      col,
      y:      startY !== undefined ? startY : -(4 + Math.random() * 60),
      speed:  0.7 + Math.random() * 1.1,          // chars/frame at ~10fps
      len:    14 + Math.floor(Math.random() * 26), // trail length
      chars:  Array.from({length: 50}, () => CA[Math.floor(Math.random() * CA.length)]),
      active: true,
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols    = Math.floor(W / FS);

    /* Seed: one stream per column, staggered vertically */
    streams = [];
    for (let c = 0; c < cols; c++) {
      /* Random initial Y spread across full height */
      streams.push(mkStream(c, -(Math.random() * (H / FS + 20))));
    }
  }

  resize();
  let rsT;
  window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(resize, 200); });

  /* Shimmer: a tiny set of bright-flash positions updated every draw */
  const shimmer = new Set();

  function rndCh() { return CA[Math.floor(Math.random() * CA.length)]; }

  /* ── Color palette: exact film gradient ─────────────────────── */
  //  j=0 → head (white blink), j=1…n → trail fading to black
  const TRAIL_COLORS = [
    null,            // 0 = head (handled separately)
    '#ccffcc',       // 1: very close to head
    '#88ee88',       // 2
    '#00ff41',       // 3-4: classic Matrix green
    '#00ff41',
    '#00dd38',       // 5-6
    '#00bb30',
    '#009928',       // 7-9: medium green
    '#008020',
    '#006818',
    '#004d12',       // 10-13: dark
    '#003308',
    '#002206',
    '#001504',
    '#000e02',       // 14+: near-black
  ];
  function trailColor(j, len) {
    const idx = Math.min(Math.round((j / len) * (TRAIL_COLORS.length - 1)), TRAIL_COLORS.length - 1);
    return TRAIL_COLORS[idx] || '#000e02';
  }

  let frame     = 0;
  let blinkOn   = true;
  let lastBlink = 0;
  const BLINK_MS = 85; // ~12 Hz — snappy terminal blink

  function draw(ts) {
    requestAnimationFrame(draw);
    frame++;

    /* Render at ~10 fps: skip every 6th animation frame */
    if (frame % 6 !== 0) return;

    /* Blink toggle */
    if (ts - lastBlink > BLINK_MS) { blinkOn = !blinkOn; lastBlink = ts; }

    /* Background fade — lower = longer trail */
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FS}px 'Share Tech Mono',monospace`;

    /* Regenerate shimmer set (~0.5% of cells flash white this frame) */
    shimmer.clear();
    const shimCount = Math.floor(cols * 0.004);
    for (let s = 0; s < shimCount; s++) {
      shimmer.add(Math.floor(Math.random() * cols) * 1000 + Math.floor(Math.random() * 30));
    }

    for (let si = 0; si < streams.length; si++) {
      const st = streams[si];
      const x  = st.col * FS;
      const hRow = Math.floor(st.y);

      /* ── Draw trail (from tail → just-behind-head) ─────────── */
      for (let j = st.len; j >= 1; j--) {
        const row = hRow - j;
        const py  = row * FS + FS; // +FS so row=0 is on screen
        if (py < 0 || py > H + FS) continue;

        /* Randomly mutate character (~5% chance per frame) */
        if (Math.random() < 0.05) st.chars[j] = rndCh();

        /* Shimmer flash: occasional bright white flicker */
        const shimKey = st.col * 1000 + j;
        if (shimmer.has(shimKey)) {
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur  = 8;
          ctx.fillStyle   = '#ccffcc';
        } else {
          ctx.shadowBlur  = 0;
          ctx.fillStyle   = trailColor(j, st.len);
        }
        ctx.fillText(st.chars[j], x, py);
      }

      /* ── Head character: white + shell-cursor blink ─────────── */
      const hy = hRow * FS + FS;
      if (hy >= 0 && hy <= H + FS) {
        /* Head always gets a fresh random char */
        st.chars[0] = rndCh();

        if (blinkOn) {
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur  = 18;
          ctx.fillStyle   = '#ffffff';
        } else {
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur  = 10;
          ctx.fillStyle   = '#aaffaa';
        }
        ctx.fillText(st.chars[0], x, hy);
        ctx.shadowBlur = 0;
      }

      /* ── Advance stream ─────────────────────────────────────── */
      st.y += st.speed;

      /* Reset when entire trail is off-screen */
      if ((hRow - st.len) * FS > H) {
        /* Occasionally spawn a second simultaneous stream on same col */
        if (Math.random() < 0.08) {
          streams.push(mkStream(st.col, -(2 + Math.random() * 20)));
        }
        Object.assign(st, mkStream(st.col));
      }
    }

    /* Prune extra streams: never more than cols * 1.5 */
    if (streams.length > cols * 1.5) {
      streams = streams.filter((s, i) => i < cols || s.y > 0);
    }

    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(draw);
}

/* ════════════════════════════════════════
   TIMER
   ════════════════════════════════════════ */
function getNow() { return Date.now() + serverTimeOffset; }

function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

function renderTimer(ms) {
  if (ms < 0) ms = 0;

  // Calculate years properly (accounting for leap years)
  const nowDate     = new Date(getNow());
  const releaseDate = new Date(releaseTs);

  let years = releaseDate.getFullYear() - nowDate.getFullYear();
  // Walk back if we haven't reached the anniversary month/day yet
  const afterYears = new Date(nowDate);
  afterYears.setFullYear(afterYears.getFullYear() + years);
  if (afterYears > releaseDate) years = Math.max(0, years - 1);

  const baseDate = new Date(nowDate);
  baseDate.setFullYear(baseDate.getFullYear() + years);
  const remainMs   = Math.max(0, releaseDate - baseDate);
  const totalSecs  = Math.floor(remainMs / 1000);
  const days       = Math.floor(totalSecs / 86400);
  const hours      = Math.floor((totalSecs % 86400) / 3600);
  const minutes    = Math.floor((totalSecs % 3600) / 60);
  const seconds    = totalSecs % 60;

  setDigit('timer-years',   String(Math.max(0, years)).padStart(2, '0'));
  setDigit('timer-days',    String(days).padStart(3, '0'));
  setDigit('timer-hours',   pad(hours));
  setDigit('timer-minutes', pad(minutes));
  setDigit('timer-seconds', pad(seconds));
}

function setDigit(id, val) {
  const el = document.getElementById(id);
  if (!el || el.textContent === val) return;
  el.textContent = val;
  el.dataset.value = val;
  el.classList.remove('tick');
  void el.offsetWidth; // reflow
  el.classList.add('tick');
}

function startTimer() {
  function tick() {
    const rem = releaseTs - getNow();
    if (rem <= 0) {
      clearInterval(timerInterval);
      renderTimer(0);
      if (!released) triggerRelease();
      return;
    }
    renderTimer(rem);
  }
  tick();
  timerInterval = setInterval(tick, 1000);
}

/* ════════════════════════════════════════
   WORKER API
   ════════════════════════════════════════ */
async function checkWorker() {
  if (!CONFIG.workerUrl) {
    // No worker: use local time vs config release date
    releaseTs = CONFIG.releaseDate.getTime();
    return { isReleased: Date.now() >= releaseTs, key: null };
  }
  try {
    const t0 = Date.now();
    const res = await fetch(`${CONFIG.workerUrl}/api/status`, {
      cache: 'no-store', signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Calibrate clock with server
    serverTimeOffset = data.serverTime - Date.now();
    releaseTs = data.releaseTimestamp;

    if (!data.isReleased) return { isReleased: false, key: null };

    // Fetch decryption key
    const kr = await fetch(`${CONFIG.workerUrl}/api/content`, {
      cache: 'no-store', signal: AbortSignal.timeout(5000)
    });
    if (!kr.ok) return { isReleased: true, key: null };
    const kd = await kr.json();
    return { isReleased: true, key: kd.key || null };
  } catch (e) {
    console.warn('[TC] Worker unavailable, falling back to local time:', e.message);
    releaseTs = CONFIG.releaseDate.getTime();
    return { isReleased: Date.now() >= releaseTs, key: null };
  }
}

/* ════════════════════════════════════════
   DECRYPTION
   ════════════════════════════════════════ */
async function decryptPayload(b64, keyHex) {
  try {
    const keyBytes = new Uint8Array(keyHex.match(/../g).map(h => parseInt(h, 16)));
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const ct = raw.slice(12);
    const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
    return JSON.parse(new TextDecoder().decode(pt));
  } catch (e) {
    console.error('[TC] Decryption failed:', e);
    return null;
  }
}

/* ════════════════════════════════════════
   RELEASE SEQUENCE
   ════════════════════════════════════════ */
async function triggerRelease(decryptedContent) {
  released = true;

  // Step 1: expire timer digits
  document.querySelectorAll('.timer-digits').forEach(el => el.classList.add('expired'));

  await sleep(1800);

  // Step 2: show transition overlay
  const overlay = document.getElementById('transition-overlay');
  applyTranslations(); // ensure transition text is correct lang
  overlay.classList.add('active');

  await sleep(900);

  // Step 3: fade out pre-release
  const pre = document.getElementById('pre-release');
  pre.style.transition = 'opacity .9s ease, transform .7s ease';
  pre.style.opacity = '0';
  pre.style.transform = 'translateY(-28px)';

  // Dim matrix
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) { canvas.style.opacity = '0.12'; }

  await sleep(900);
  pre.style.display = 'none';

  // Step 4: inject decrypted HTML then show post-release
  if (decryptedContent && decryptedContent.html) {
    document.getElementById('post-release').innerHTML = decryptedContent.html;
  }
  const post = document.getElementById('post-release');
  post.hidden = false;
  post.classList.add('visible');
  html('post-release').dataset.state = 'released';
  document.documentElement.dataset.state = 'released';

  // Step 5: fade out overlay
  overlay.style.transition = 'opacity .8s ease';
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.classList.remove('active'); overlay.style.opacity = ''; }, 850);

  // Step 6: show nav
  setTimeout(() => {
    const nav = document.getElementById('pr-nav');
    if (nav) nav.classList.add('visible');
  }, 1200);

  // Step 7: scroll animations
  initScrollReveal();

  // Step 8: if decrypted content, overlay it
  if (decryptedContent) applyDecryptedContent(decryptedContent);
}

function applyDecryptedContent(content) {
  // Merge decrypted i18n strings into T and re-apply translations.
  // HTML injection is done in triggerRelease before this is called.
  if (content['it']) Object.entries(content['it']).forEach(([k, v]) => { if (k !== 'html') T['it'][k] = v; });
  if (content['en']) Object.entries(content['en']).forEach(([k, v]) => { if (k !== 'html') T['en'][k] = v; });
  applyTranslations();
}

/* ════════════════════════════════════════
   SYSTEM MESSAGES
   ════════════════════════════════════════ */
function initSysMessages() {
  const el = document.getElementById('sys-messages');
  if (!el) return;
  const keys = ['status.sealed','status.locked','status.pending','status.synced','status.scheduled'];
  let i = 0;
  function show() {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = t(keys[i++ % keys.length]);
      el.style.opacity = '1';
    }, 320);
  }
  el.style.transition = 'opacity .32s ease';
  show();
  setInterval(show, 3800);
}

/* ════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .tl-entry').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function html(id) { return document.getElementById(id) || document.documentElement; }

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
async function init() {
  // Dev preview override: ?tc_preview_5b=1
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get(CONFIG.previewParam) === '1';

  // Language
  document.documentElement.lang = currentLang;
  applyTranslations();
  updateLangButtons();

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Matrix
  initMatrix();

  // System messages
  initSysMessages();

  // Check release
  const { isReleased, key } = isPreview
    ? { isReleased: true, key: null }
    : await checkWorker();

  if (isReleased) {
    let decrypted = null;
    if (key) {
      const payload = JSON.parse(document.getElementById('capsule-payload').textContent);
      if (payload.data && payload.data !== 'ENCRYPTED_BLOB_PLACEHOLDER') {
        decrypted = await decryptPayload(payload.data, key);
      }
    }
    await sleep(isPreview ? 500 : 2000);
    await triggerRelease(decrypted);
  } else {
    startTimer();
    // Re-check every 30s
    setInterval(async () => {
      const { isReleased: nr, key: nk } = await checkWorker();
      if (nr && !released) {
        let dec = null;
        if (nk) {
          const payload = JSON.parse(document.getElementById('capsule-payload').textContent);
          if (payload.data && payload.data !== 'ENCRYPTED_BLOB_PLACEHOLDER') {
            dec = await decryptPayload(payload.data, nk);
          }
        }
        await triggerRelease(dec);
      }
    }, 30000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
