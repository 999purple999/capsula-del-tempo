(function(){
'use strict';

/* ── CONFIG: only release date, NO content ── */
const RELEASE = new Date('2036-05-07T00:00:00Z');
const WORKER = 'https://tc-5b-inf.accessisoftwarefrancesco.workers.dev';

let lang = localStorage.getItem('tc-lang') || 'it';
let serverOffset = 0;

const TXT = {
  it: {
    label: 'TIME CAPSULE',
    years: 'ANNI', days: 'GIORNI', hours: 'ORE', min: 'MINUTI', sec: 'SECONDI',

    phrase: 'Il futuro si conserva nel codice.\nIl passato si rivela al momento giusto.',
    msg: ['⬡  CAPSULA SIGILLATA','⬡  ARCHIVIO BLOCCATO','⬡  RILASCIO IN ATTESA',
          '⬡  MEMORIA SINCRONIZZATA','⬡  ACCESSO PROGRAMMATO'],
    rn: 'VISITA IL SITO UFFICIALE PER L\'ARCHIVIO COMPLETO',
  },
  en: {
    label: 'TIME CAPSULE',
    years: 'YEARS', days: 'DAYS', hours: 'HOURS', min: 'MINUTES', sec: 'SECONDS',
    phrase: 'The future is preserved in code.\nThe past reveals itself at the right moment.',
    msg: ['⬡  CAPSULE SEALED','⬡  ARCHIVE LOCKED','⬡  RELEASE PENDING',
          '⬡  MEMORY SYNCHRONIZED','⬡  ACCESS SCHEDULED'],
    rn: 'VISIT THE OFFICIAL SITE FOR THE FULL ARCHIVE',
  }
};

function T(k) { return (TXT[lang]||TXT['it'])[k]; }

function setLang(l) {
  if (!TXT[l]) return;
  lang = l; localStorage.setItem('tc-lang', l);
  document.documentElement.lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
  document.getElementById('yl').textContent = T('years');
  document.getElementById('dl').textContent = T('days');
  document.getElementById('hl').textContent = T('hours');
  document.getElementById('ml').textContent = T('min');
  document.getElementById('sl').textContent = T('sec');
  document.getElementById('phrase').textContent = T('phrase');
  document.getElementById('rn-text').textContent = T('rn');
  restartMessages();
}

document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* Matrix — cinematic 10fps, white blinking head */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFZ:.|<>[]{}+-=*';
const CA = CHARS.split('');
const FS = 14;
let W, H, cols, drops;
function mkDrop() {
  return { y: -Math.floor(4 + Math.random()*35), speed: 0.55+Math.random()*0.85,
           length: 10+Math.floor(Math.random()*24), chars: [] };
}
function resize() {
  W = canvas.width = innerWidth; H = canvas.height = innerHeight;
  cols = Math.floor(W/FS); drops = Array.from({length:cols}, mkDrop);
}
resize();
window.addEventListener('resize', resize);
function rndCh() { return CA[Math.floor(Math.random()*CA.length)]; }
let frm=0, blinkOn=true, lastBlink=0;
function draw(ts) {
  frm++; requestAnimationFrame(draw);
  if (frm%6!==0) return;
  if (ts-lastBlink>90){blinkOn=!blinkOn;lastBlink=ts;}
  ctx.fillStyle='rgba(0,0,0,0.13)'; ctx.fillRect(0,0,W,H);
  ctx.font=`${FS}px 'Share Tech Mono',monospace`;
  for(let i=0;i<cols;i++){
    const d=drops[i], hRow=Math.floor(d.y), x=i*FS;
    for(let j=d.length;j>=1;j--){
      const py=(hRow-j)*FS; if(py<0||py>H)continue;
      const rel=j/d.length;
      let alpha,g;
      if(rel<0.18){g=255;alpha=0.88-rel*2.5;}
      else if(rel<0.42){g=210;alpha=0.55-(rel-0.18)*1.2;}
      else if(rel<0.68){g=130;alpha=0.24-(rel-0.42)*0.7;}
      else{g=55;alpha=0.07;}
      ctx.fillStyle=`rgba(0,${g},0,${alpha})`;
      if(!d.chars[j]||Math.random()<0.06)d.chars[j]=rndCh();
      ctx.fillText(d.chars[j],x,py);
    }
    const hy=hRow*FS;
    if(hy>=0&&hy<=H){
      d.chars[0]=rndCh();
      if(blinkOn){ctx.shadowColor='#ffffff';ctx.shadowBlur=12;ctx.fillStyle='#ffffff';}
      else{ctx.shadowColor='rgba(0,255,65,.9)';ctx.shadowBlur=7;ctx.fillStyle='rgba(180,255,180,.95)';}
      ctx.fillText(d.chars[0],x,hy); ctx.shadowBlur=0;
    }
    d.y+=d.speed;
    if((hRow-d.length)*FS>H)drops[i]=mkDrop();
  }
}
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(draw);
else canvas.style.display='none';

/* Timer */
let releaseTs = RELEASE.getTime();
let done = false;
function now() { return Date.now() + serverOffset; }
function pad(n) { return String(Math.max(0,n)).padStart(2,'0'); }
function setD(id, v) {
  const el = document.getElementById(id);
  if (!el || el.textContent === v) return;
  el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
}
function tick() {
  const nowDate    = new Date(now());
  const relDate    = new Date(releaseTs);
  if (nowDate >= relDate) {
    setD('dy','00');setD('dd','000');setD('dh','00');setD('dm','00');setD('ds2','00');
    if (!done) { done=true; onReleased(); } return;
  }
  let years = relDate.getFullYear() - nowDate.getFullYear();
  const after = new Date(nowDate); after.setFullYear(after.getFullYear()+years);
  if (after > relDate) years = Math.max(0,years-1);
  const base = new Date(nowDate); base.setFullYear(base.getFullYear()+years);
  const remMs = Math.max(0, relDate - base);
  const ts = Math.floor(remMs/1000);
  const d = Math.floor(ts/86400), h = Math.floor((ts%86400)/3600);
  const m = Math.floor((ts%3600)/60), s = ts%60;
  setD('dy', String(Math.max(0,years)).padStart(2,'0'));
  setD('dd', String(d).padStart(3,'0'));
  setD('dh',pad(h)); setD('dm',pad(m)); setD('ds2',pad(s));
}
setInterval(tick, 1000); tick();

function onReleased() {
  document.body.classList.add('released');
  /* IMPORTANT: this locked version NEVER shows content.
     It only shows a notice to visit the real site. */
}

/* System messages */
let msgIdx = 0, msgTimer;
function restartMessages() { msgIdx = 0; }
function nextMsg() {
  const el = document.getElementById('sys');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = T('msg')[msgIdx % T('msg').length];
    el.style.opacity = '1';
    msgIdx++;
  }, 320);
}
nextMsg();
msgTimer = setInterval(nextMsg, 3800);

/* Optional: sync with worker for accurate time */
if (WORKER) {
  fetch(`${WORKER}/api/status`, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    .then(r => r.json())
    .then(d => {
      serverOffset = d.serverTime - Date.now();
      releaseTs = d.releaseTimestamp;
    })
    .catch(() => {});
}

/* Init lang */
setLang(lang);
})();
