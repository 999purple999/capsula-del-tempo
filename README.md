# TIME CAPSULE — 5B INF ITIS Q. SELLA

> Una classe. Un decennio. Una capsula.

Sito web esperienziale ultra-cinematografico che simula una **capsula del tempo digitale**. Rimane sigillato fino a una data di rilascio, poi si apre automaticamente rivelando un archivio del decennio 2016–2026.

---

## Struttura del Progetto

```
capsula del tempo/
├── src/
│   ├── css/                ← file CSS esterni per le pagine sorgente
│   │   ├── index.css
│   │   ├── locked.css
│   │   └── preview.css
│   ├── js/                 ← file JavaScript esterni per le pagine sorgente
│   │   ├── index.js
│   │   ├── locked.js
│   │   └── preview.js
│   ├── index.html          ← Sito completo (live, con rilascio automatico)
│   ├── locked.html         ← Versione locked pubblica (senza contenuti)
│   └── preview.html        ← Versione di anteprima con contenuto già aperto
├── worker/
│   ├── index.js            ← Cloudflare Worker (API time + key)
│   └── wrangler.toml       ← Config Worker
├── scripts/
│   ├── encrypt-content.mjs ← Build script (cifra e inietta il payload)
│   ├── build-locked.mjs    ← Build script cross-platform (copia file dist)
│   ├── open-preview.mjs    ← Script cross-platform per aprire preview
│   └── content.json        ← [OPZIONALE] Override contenuti post-release
├── dist/                   ← Output della build (generato automaticamente)
├── .github/workflows/
│   └── deploy.yml          ← GitHub Actions CI/CD
└── package.json
```

Le pagine in `src/` sono state aggiornate per caricare CSS e JavaScript esterni da `src/css/` e `src/js/`.

---

## Architettura di Sicurezza

```
┌─────────────────────────────────────────────────────────┐
│  BUILD TIME (GitHub Actions)                            │
│                                                         │
│  content.json ──encrypt──► encrypted_blob ──► index.html│
│                  (AES-256-GCM, key = CAPSULE_KEY)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  RUNTIME — Browser                                      │
│                                                         │
│  1. Load index.html (has encrypted blob, no key)        │
│  2. Call Worker /api/status → { isReleased, serverTime }│
│  3. If NOT released: show countdown                     │
│  4. If released: call /api/content → { key }            │
│  5. Decrypt blob with key → render full content         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  CLOUDFLARE WORKER                                      │
│                                                         │
│  /api/status  → always available                        │
│  /api/content → returns key ONLY if Date.now() ≥ RELEASE│
│                 CAPSULE_KEY stored as Worker Secret      │
└─────────────────────────────────────────────────────────┘
```

**Protezione contro ispezione del codice sorgente:**
- La versione `locked.html` non contiene alcun contenuto post-release
- La versione live `index.html` contiene solo un blob AES-256-GCM cifrato
- La chiave di decifratura è sul Worker, non nel client
- Il Worker rilascia la chiave solo dopo la data di rilascio
- Inspect Element non rivela nulla di leggibile

---

## Setup Rapido

### 1. Genera la chiave di cifratura

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: abc123...  (64 caratteri hex)
```

Copia questo valore. Sarà il tuo `CAPSULE_KEY`.

### 2. Deploy del Cloudflare Worker

```bash
# Installa wrangler
npm install -g wrangler

# Login a Cloudflare
npx wrangler login

# Imposta i secrets
cd worker
npx wrangler secret put CAPSULE_KEY
# → incolla la chiave generata al punto 1

npx wrangler secret put RELEASE_DATE
# → incolla la data: es. 2026-06-10T08:00:00Z

# Deploy
npx wrangler deploy
# Output: https://tc-5b-inf.yourname.workers.dev
```

Copia l'URL del Worker.

### 3. Configura GitHub Secrets

Vai su **GitHub → Repository → Settings → Secrets → Actions** e aggiungi:

| Secret | Valore |
|--------|--------|
| `CAPSULE_KEY` | La chiave hex generata al punto 1 |
| `RELEASE_DATE` | `2026-06-10T08:00:00Z` (o la tua data) |
| `WORKER_URL` | `https://tc-5b-inf.yourname.workers.dev` |
| `CLOUDFLARE_API_TOKEN` | Token Cloudflare (opzionale, per auto-deploy worker) |

### 4. Abilita GitHub Pages

Vai su **GitHub → Repository → Settings → Pages** e imposta:
- Source: **GitHub Actions**

### 5. Push e deploy

```bash
git add .
git commit -m "feat: initial time capsule deploy"
git push origin main
```

GitHub Actions costruirà automaticamente il sito e lo deployerà su GitHub Pages.

---

## Preview in Locale

Puoi testare il sito in locale (incluso il rilascio) senza aspettare la data:

```bash
# Installa le dipendenze
npm install

# Build della versione locked
npm run build:locked

# Avvia il server (apre automaticamente il preview nel browser)
npm run preview

# Oppure, per servire solo i file sorgente
npm run dev:src
```

Il parametro `?tc_preview_5b=1` forza il rilascio immediato per scopi di sviluppo.

---

## Build Manuale

```bash
# Build versione locked (copia i file in dist/)
npm run build:locked

# Genera la build cifrata
export CAPSULE_KEY="la-tua-chiave-hex-64-chars"
export WORKER_URL="https://tc-5b-inf.yourname.workers.dev"
node scripts/encrypt-content.mjs

# Output in dist/
# dist/css/              ← contiene i file di stile della pagina
# dist/js/               ← contiene i file di script della pagina
# dist/index.html   ← versione live con payload cifrato
# dist/locked.html  ← versione locked pubblica
```

---

## Personalizzazione

### Cambiare la data di rilascio

1. Nel Worker: `npx wrangler secret put RELEASE_DATE` → nuova data in formato ISO 8601
2. Nel `capsule-config` di `src/index.html`:
   ```json
   {"workerUrl":"...","releaseDate":"2026-06-10T08:00:00Z","previewParam":"tc_preview_5b"}
   ```
3. In `src/locked.html`: `const RELEASE = new Date('2026-06-10T08:00:00Z');`

### Aggiungere contenuti extra cifrati

Crea `scripts/content.json`:
```json
{
  "it": {
    "future.body": "Il vostro messaggio personalizzato al futuro...",
    "credits.class": "5B INF"
  },
  "en": {
    "future.body": "Your personalized message to the future..."
  }
}
```

Questi testi verranno cifrati e, dopo il rilascio, sovrascriveranno i placeholder HTML.

### Cambiare i testi

Tutti i testi IT e EN sono nel sistema `T` dentro `src/index.html`. 
Cerca `const T = {` e modifica i valori nelle chiavi `it:` e `en:`.

---

## Due Versioni Distinte

| | `dist/index.html` | `dist/locked.html` |
|---|---|---|
| **Scopo** | Sito live ufficiale | Demo pubblica da consegnare |
| **Contenuto post-release** | Cifrato nel payload, rivelato dopo la data | ❌ Non presente |
| **Sicurezza** | Alta (AES-256 + Worker) | Massima (no content) |
| **URL Worker** | Sì | Opzionale (solo per sync ora) |
| **Branch** | `main` | `locked-release` |

---

## Struttura dei Branch

```
main              → deploy sito live completo
locked-release    → deploy solo versione locked (per la consegna pubblica)
```

Per pubblicare la versione locked:
```bash
git checkout -b locked-release
git push origin locked-release
```

GitHub Actions rileverà il branch e deploierà solo `locked.html` come `index.html`.

---

## Sicurezza: Rischi e Mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| Inspect Element rivela contenuto | Contenuto AES-256 cifrato nel blob |
| Manipolazione dell'ora locale | Il Worker usa `Date.now()` server-side |
| Replay del `/api/content` prima della data | Worker controlla ora a ogni richiesta |
| Leak della chiave nel repository | `CAPSULE_KEY` solo come GitHub Secret e Wrangler Secret |
| Bypass del Worker (offline) | Fallback a ora locale — meno sicuro ma accettabile |
| Forza-bruta della chiave | AES-256-GCM, computazionalmente impossibile |

---

## Tecnologie

- **Frontend**: HTML/CSS/JS vanilla — zero dipendenze, nessun bundle
- **Worker**: Cloudflare Workers (edge runtime)
- **Crittografia**: AES-256-GCM via Web Crypto API (browser) e Node.js `webcrypto`
- **Deploy**: GitHub Actions + GitHub Pages
- **Font**: Google Fonts (Share Tech Mono, Space Grotesk)
- **Animazioni**: Canvas API (Matrix rain) + CSS animations + IntersectionObserver

---

## Note Tecniche

### Perché un Cloudflare Worker e non solo il browser?

Se si usasse solo l'ora del sistema operativo in cui viene eseguito il browser, chiunque potrebbe modificare l'orologio locale e sbloccare il sito. Il Worker usa il tempo del server Cloudflare (UTC sincrono con NTP), rendendo impossibile il bypass tramite manipolazione dell'orologio hardware.

### Perché AES-256-GCM?

- **256-bit**: computazionalmente inattaccabile con hardware attuale
- **GCM (Galois/Counter Mode)**: fornisce autenticità oltre alla confidenzialità — se il ciphertext viene manomesso, la decifratura fallisce
- **Web Crypto API**: nativa del browser, no librerie esterne, performante

### Perché il contenuto è nell'HTML e non solo sul Worker?

Per un'esperienza 100% offline-resiliente: anche se il Worker fosse temporaneamente irraggiungibile, il contenuto è già nel client (cifrato). Solo la chiave viene dal Worker.

---

*TIME CAPSULE — 5B INF ITIS Quintino Sella — 2026*
