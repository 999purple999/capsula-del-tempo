(function(){
'use strict';

/* ── HAMBURGER NAV ── */
var navToggle=document.getElementById('nav-toggle');
var navLinks=document.getElementById('nav-links');
if(navToggle&&navLinks){
  navToggle.addEventListener('click',function(){navLinks.classList.toggle('open');});
}
window.closeNav=function(){if(navLinks)navLinks.classList.remove('open');};

/* ── MATRIX RAIN ── */
(function(){
  var canvas=document.getElementById('mc');
  if(!canvas||window.matchMedia('(prefers-reduced-motion:reduce)').matches){if(canvas)canvas.style.display='none';return;}
  var ctx=canvas.getContext('2d');
  var CHARS='ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFZ:.|<>[]{}+-=*'.split('');
  var FS=16;
  var W,H,cols,streams=[];
  function mkS(c,y){return{col:c,y:y!==undefined?y:-(4+Math.random()*60),speed:.7+Math.random()*1.1,len:14+Math.floor(Math.random()*26),chars:Array.from({length:50},function(){return CHARS[Math.floor(Math.random()*CHARS.length)];})}}
  function resize(){
    W=canvas.width=innerWidth;H=canvas.height=innerHeight;cols=Math.floor(W/FS);
    streams=[];for(var c=0;c<cols;c++)streams.push(mkS(c,-(Math.random()*(H/FS+20))));
  }
  resize();var rsT;window.addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(resize,200);});
  var TCOLS=['#ccffcc','#88ee88','#00ff41','#00ff41','#00dd38','#00bb30','#009928','#008020','#006818','#004d12','#003308','#002206','#001504','#000e02'];
  function tc(j,l){return TCOLS[Math.min(Math.round(j/l*(TCOLS.length-1)),TCOLS.length-1)]||'#000e02';}
  var shimmer=new Set();
  var frm=0,blink=true,lastB=0;
  function draw(ts){
    requestAnimationFrame(draw);frm++;if(frm%6!==0)return;
    if(ts-lastB>85){blink=!blink;lastB=ts;}
    ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(0,0,W,H);
    ctx.font=FS+"px 'Share Tech Mono',monospace";
    shimmer.clear();var sc=Math.floor(cols*.004);
    for(var s=0;s<sc;s++)shimmer.add(Math.floor(Math.random()*cols)*1000+Math.floor(Math.random()*30));
    for(var si=0;si<streams.length;si++){
      var st=streams[si],x=st.col*FS,hRow=Math.floor(st.y);
      for(var j=st.len;j>=1;j--){
        var py=(hRow-j)*FS+FS;if(py<0||py>H+FS)continue;
        if(Math.random()<.05)st.chars[j]=CHARS[Math.floor(Math.random()*CHARS.length)];
        var sk=st.col*1000+j;
        if(shimmer.has(sk)){ctx.shadowColor='#00ff41';ctx.shadowBlur=8;ctx.fillStyle='#ccffcc';}
        else{ctx.shadowBlur=0;ctx.fillStyle=tc(j,st.len);}
        ctx.fillText(st.chars[j],x,py);
      }
      var hy=hRow*FS+FS;
      if(hy>=0&&hy<=H+FS){
        st.chars[0]=CHARS[Math.floor(Math.random()*CHARS.length)];
        if(blink){ctx.shadowColor='#fff';ctx.shadowBlur=18;ctx.fillStyle='#fff';}
        else{ctx.shadowColor='#00ff41';ctx.shadowBlur=10;ctx.fillStyle='#aaffaa';}
        ctx.fillText(st.chars[0],x,hy);ctx.shadowBlur=0;
      }
      st.y+=st.speed;
      if((hRow-st.len)*FS>H){
        if(Math.random()<.08)streams.push(mkS(st.col,-(2+Math.random()*20)));
        var ns=mkS(st.col);st.col=ns.col;st.y=ns.y;st.speed=ns.speed;st.len=ns.len;st.chars=ns.chars;
      }
    }
    if(streams.length>cols*1.5)streams=streams.filter(function(_,i){return i<cols||streams[i].y>0;});
    ctx.shadowBlur=0;
  }
  requestAnimationFrame(draw);
})();

/* ── LANG ── */
var T={
  it: {
    "future.body": "Quando leggerete questo, il mondo sarà già diverso da come lo abbiamo conosciuto noi. Ma alcune cose resteranno: la curiosità, la necessità di capire, il desiderio di lasciare traccia.\n\nAbbiamo vissuto in un decennio che ci ha insegnato che il futuro è fragile, rapido, imprevedibile. Abbiamo imparato che la conoscenza non è neutrale — è potere, responsabilità, cura.\n\nCi auguriamo che abbiate un mondo migliore del nostro. E se non lo avete ancora, speriamo che queste parole vi ricordino che è sempre possibile costruirne uno.",
    "future.body2": "Noi siamo stati qui. Abbiamo imparato, faticato, riso e qualche volta avuto paura. Abbiamo attraversato una pandemia seduti davanti a schermi, una guerra raccontata sui social, un'intelligenza artificiale che ha cambiato cosa significa scrivere, pensare, creare.\n\nEravamo ragazzi che diventavano adulti mentre il mondo si rompeva e si ricostruiva. E abbiamo cercato di capire.",
    "credits.micro": "Time Capsule Project — Informatica e Telecomunicazioni",
    "nav.manifesto": "MANIFESTO",
    "nav.timeline": "TIMELINE",
    "nav.world": "MONDO",
    "nav.tech": "TECNOLOGIA",
    "nav.future": "FUTURO",
    "hero.tag": "ARCHIVIO RILASCIATO — 2016–2026",
    "hero.title": "TIME CAPSULE",
    "hero.school": "5B INF — ITIS Quintino Sella",
    "hero.subtitle": "Il mondo come lo abbiamo vissuto",
    "manifesto.tag": "01 — MANIFESTO",
    "manifesto.title": "Perché una capsula del tempo",
    "manifesto.body": "Questa capsula raccoglie <strong>un decennio di storia</strong>, visto attraverso gli occhi di una classe che ha vissuto in prima persona la trasformazione del mondo. Dal 2016 al 2026, abbiamo attraversato crisi e rivoluzioni, catastrofi e invenzioni, paure e meraviglie. Abbiamo imparato che il futuro non arriva in modo ordinato — esplode, si frantuma, si ricostruisce.",
    "manifesto.quote": "«Dal mondo dell'interdipendenza ottimista si è passati al mondo della resilienza competitiva. Siamo più connessi tecnicamente che mai, ma più divisi strategicamente di quanto il mondo sviluppato credesse possibile dieci anni fa.»",
    "manifesto.quote_author": "Sintesi del decennio 2016–2026",
    "timeline.tag": "02 — TIMELINE",
    "timeline.title": "Il decennio, anno per anno",
    "tl.2016.title": "La globalizzazione incrina",
    "tl.2016.body": "Brexit e la prima vittoria di Donald Trump rendono mainstream la contestazione dell'ordine liberale. Le piattaforme social diventano centrali nella politica elettorale. La sfiducia verso élite e istituzioni diventa forza politica stabile.",
    "tl.2018.title": "La guerra commerciale USA–Cina",
    "tl.2018.body": "Il commercio diventa strumento di potere strategico. I dazi segnalano l'ingresso in una fase di competizione, non solo di integrazione. L'idea di «decoupling» prende forma, prima nel commercio, poi nella tecnologia.",
    "tl.2020.title": "Il Covid-19: la cesura del decennio",
    "tl.2020.body": "Lockdown, recessione, didattica a distanza, lavoro remoto e crisi logistiche cambiano contemporaneamente vita quotidiana e struttura economica. Gli Stati tornano al centro. La digitalizzazione accelera in pochi mesi più che in molti anni.",
    "tl.2021.title": "Ripartenza e inflazione",
    "tl.2021.body": "La ripartenza si scontra con colli di bottiglia produttivi e logistici. L'inflazione, inizialmente ritenuta transitoria, comincia a mostrarsi persistente. Il lavoro ibrido e il digitale diventano standard.",
    "tl.2022.title": "La guerra torna in Europa",
    "tl.2022.body": "La Russia invade l'Ucraina. Lo shock colpisce energia, grano, fertilizzanti e sicurezza continentale. Le banche centrali accelerano i rialzi dei tassi. L'AI generativa entra nel dibattito di massa.",
    "tl.2023.title": "L'esplosione dell'AI generativa",
    "tl.2023.body": "L'AI generativa esplode nell'economia, nel software, nella scuola e nella comunicazione. Il Medio Oriente torna al centro. I governi iniziano a discutere regolazione e sicurezza dell'AI.",
    "tl.2024.title": "La corsa industriale all'AI",
    "tl.2024.body": "L'AI diventa corsa industriale: modelli, chip, data center, energia e investimenti si intrecciano. Crescono politiche industriali e protezionismo selettivo.",
    "tl.2026.title": "Il mondo del 2026",
    "tl.2026.body": "Anno di consolidamento delle fratture precedenti: più multipolarità, più competizione strategica, meno fiducia nelle regole comuni. L'AI non è più solo innovazione: è infrastruttura produttiva, educativa e geopolitica.",
    "world.tag": "03 — IL MONDO",
    "world.title": "Come si è costruito il presente",
    "world.body": "Tra il 2016 e il 2026 non c'è stata una sola «grande svolta», ma la convergenza di crisi che si sono rafforzate a vicenda: politica anti-establishment, pandemia, guerra, shock energetico, rialzo dei tassi, frammentazione commerciale e rivoluzione dell'AI. Il risultato è un 2026 in cui gli Stati sono tornati più presenti, i mercati meno integrati, la sicurezza più costosa e la tecnologia più decisiva di qualunque fase dalla fine della Guerra Fredda.",
    "stat.military": "Spesa militare mondiale 2025 — massimo storico",
    "stat.military_growth": "Crescita spesa militare globale nel decennio 2016–2025",
    "stat.gdp": "Crescita PIL mondiale prevista 2026 — sotto la media storica 3.7%",
    "stat.inflation": "Inflazione globale 2025 — in discesa ma non normalizzata",
    "stat.top3": "Quota dei primi 3 spender militari sul totale globale",
    "stat.burden": "Military burden globale 2025 — quota del PIL mondiale",
    "tech.tag": "04 — TECNOLOGIA & AI",
    "tech.title": "La rivoluzione silenziosa",
    "tech.body": "Il 2026 è il primo anno in cui l'intelligenza artificiale non è più un esperimento, ma un'infrastruttura. Più del 90% dei modelli frontier è prodotto dall'industria privata. L'88% delle organizzazioni ha adottato l'AI. Quattro studenti universitari su cinque usano AI generativa ogni giorno. La competizione si è concentrata sui chip, sul cloud e sulla sovranità digitale: nel 2026 la tecnologia non è più un settore — è un terreno geopolitico.",
    "stat.ai_us": "Investimento privato AI — USA 2025",
    "stat.ai_adopt": "Adozione organizzativa AI globale 2025",
    "stat.frontier": "Modelli frontier prodotti dall'industria privata 2025",
    "stat.students": "Studenti universitari che usano AI generativa",
    "stat.gap": "Gap tra 1° e 10° modello nel benchmark globale — era 11.9% l'anno prima",
    "stat.ai_cn": "Investimento privato AI — Cina 2025",
    "tech.quote": "«La guerra dei chip sarà ricordata come il momento in cui i semiconduttori sono diventati per il XXI secolo ciò che il petrolio fu per il XX.»",
    "tech.quote_author": "Analisi strutturale — 2026",
    "culture.tag": "05 — CULTURA & SOCIETÀ",
    "culture.title": "Il mondo dentro gli schermi",
    "culture.body": "Il decennio ha visto la maturazione dei social media da strumenti di connessione a infrastrutture di influenza, mercato e conflitto. Creator economy, propaganda, meme culture e AI generativa si sono fusi in un ecosistema in cui produzione culturale, marketing e politica sono sempre meno distinguibili. Nel 2026, la battaglia per l'attenzione è diventata una battaglia per potere economico, reputazione e consenso.",
    "key.tag": "06 — 12 SVOLTE DEL DECENNIO",
    "key.title": "Le forze che hanno costruito il 2026",
    "key.1.num": "01",
    "key.1.title": "Crisi dell'ordine liberale",
    "key.1.body": "Brexit e Trump hanno reso normale ciò che appariva eccezionale: nazionalismo economico, sfiducia nelle élite, polarizzazione.",
    "key.2.title": "Pandemia come frattura di civiltà",
    "key.2.body": "Non solo per i morti, ma perché ha cambiato simultaneamente sanità, scuola, lavoro, debito, logistica e rapporto con lo Stato.",
    "key.3.title": "Ritorno della guerra in Europa",
    "key.3.body": "L'invasione russa dell'Ucraina ha rifondato la sicurezza europea e avviato il più grande ciclo di riarmo dalla Guerra Fredda.",
    "key.4.title": "Fine del denaro facile",
    "key.4.body": "Dopo anni di tassi zero, il decennio 2021–2026 sarà letto come la fine della «normalità monetaria» post-2008.",
    "key.5.title": "Frammentazione della globalizzazione",
    "key.5.body": "Non scomparsa del commercio globale, ma il suo passaggio da logica di efficienza a logica di sicurezza e controllo.",
    "key.6.title": "AI come infrastruttura",
    "key.6.body": "L'adozione dell'88% e la dominanza industriale indicano una transizione storica: l'AI non è una moda, è la nuova elettricità.",
    "future.tag": "07 — MESSAGGIO AL FUTURO",
    "future.title": "A chi leggerà\nqueste parole",
    "future.sig": "5B INF — ITIS Q. SELLA — 2026",
    "credits.label": "Questa capsula appartiene a",
    "credits.school": "ITIS Quintino Sella — Biella"
  },
  en: {
    "future.body": "When you read this, the world will already be different from how we knew it. But some things will remain: curiosity, the need to understand, the desire to leave a trace.\n\nWe lived in a decade that taught us the future is fragile, fast, unpredictable. We learned that knowledge is not neutral — it is power, responsibility, care.\n\nWe hope you have a better world than ours. And if you don't yet, we hope these words remind you that it's always possible to build one.",
    "future.body2": "We were here. We learned, struggled, laughed and sometimes were afraid. We crossed a pandemic sitting in front of screens, a war told on social media, an artificial intelligence that changed what it means to write, think, create.\n\nWe were young people becoming adults while the world broke apart and rebuilt itself. And we tried to understand.",
    "credits.micro": "Time Capsule Project — Computer Science & Telecommunications",
    "nav.manifesto": "MANIFESTO",
    "nav.timeline": "TIMELINE",
    "nav.world": "WORLD",
    "nav.tech": "TECHNOLOGY",
    "nav.future": "FUTURE",
    "hero.tag": "ARCHIVE RELEASED — 2016–2026",
    "hero.title": "TIME CAPSULE",
    "hero.school": "5B INF — ITIS Quintino Sella",
    "hero.subtitle": "The world as we lived it",
    "manifesto.tag": "01 — MANIFESTO",
    "manifesto.title": "Why a time capsule",
    "manifesto.body": "This capsule collects <strong>a decade of history</strong>, seen through the eyes of a class that witnessed the transformation of the world firsthand. From 2016 to 2026, we crossed crises and revolutions, catastrophes and inventions, fears and wonders. We learned that the future doesn't arrive in an orderly fashion — it explodes, shatters, rebuilds itself.",
    "manifesto.quote": "«From the world of optimistic interdependence, we have moved to the world of competitive resilience. We are more technically connected than ever, but more strategically divided than the developed world believed possible ten years ago.»",
    "manifesto.quote_author": "Synthesis of the decade 2016–2026",
    "timeline.tag": "02 — TIMELINE",
    "timeline.title": "The decade, year by year",
    "tl.2016.title": "Globalization cracks",
    "tl.2016.body": "Brexit and Trump's first victory mainstream the contestation of the liberal order. Social platforms become central to electoral politics. Distrust toward elites and institutions becomes a stable political force.",
    "tl.2018.title": "The US–China trade war",
    "tl.2018.body": "Trade becomes a tool of strategic power. Tariffs signal entry into a phase of competition, not just integration. The idea of \"decoupling\" takes shape, first in trade, then in technology.",
    "tl.2020.title": "Covid-19: the decade's fracture",
    "tl.2020.body": "Lockdowns, recession, remote learning, remote work and logistical crises simultaneously change everyday life and economic structure. States return to center stage. Digitalization accelerates in months more than in many previous years.",
    "tl.2021.title": "Recovery and inflation",
    "tl.2021.body": "The economic recovery collides with production and logistical bottlenecks. Inflation, initially deemed transitory, begins to prove persistent. Hybrid work and digital become the standard.",
    "tl.2022.title": "War returns to Europe",
    "tl.2022.body": "Russia invades Ukraine. The shock hits energy, grain, fertilizers and continental security. Central banks accelerate rate hikes. Generative AI enters mass debate.",
    "tl.2023.title": "The generative AI explosion",
    "tl.2023.body": "Generative AI explodes in economy, software, education and communication. The Middle East returns to center stage. Governments begin discussing AI regulation and safety.",
    "tl.2024.title": "The industrial AI race",
    "tl.2024.body": "AI becomes an industrial race: models, chips, data centers, energy and investments interweave. Industrial policies and selective protectionism grow.",
    "tl.2026.title": "The world of 2026",
    "tl.2026.body": "A year of consolidation of previous fractures: more multipolarity, more strategic competition, less trust in common rules. AI is no longer just innovation: it is productive, educational and geopolitical infrastructure.",
    "world.tag": "03 — THE WORLD",
    "world.title": "How the present was built",
    "world.body": "Between 2016 and 2026 there wasn't a single \"great turning point\", but a convergence of crises that reinforced each other: anti-establishment politics, pandemic, war, energy shock, rising rates, commercial fragmentation and the AI revolution. The result is a 2026 in which States have returned to greater presence, markets are less integrated, security is more expensive and technology more decisive than at any point since the end of the Cold War.",
    "stat.military": "Global military spending 2025 — all-time record",
    "stat.military_growth": "Global military spending growth in the decade 2016–2025",
    "stat.gdp": "Projected global GDP growth 2026 — below historical average 3.7%",
    "stat.inflation": "Global inflation 2025 — declining but not normalized",
    "stat.top3": "Share of top 3 military spenders of global total",
    "stat.burden": "Global military burden 2025 — share of world GDP",
    "tech.tag": "04 — TECHNOLOGY & AI",
    "tech.title": "The silent revolution",
    "tech.body": "2026 is the first year in which artificial intelligence is no longer an experiment, but an infrastructure. Over 90% of frontier models are produced by private industry. 88% of organizations have adopted AI. Four out of five university students use generative AI every day. Competition has focused on chips, cloud and digital sovereignty: in 2026 technology is no longer a sector — it is geopolitical territory.",
    "stat.ai_us": "Private AI investment — USA 2025",
    "stat.ai_adopt": "Global organizational AI adoption 2025",
    "stat.frontier": "Frontier models produced by private industry 2025",
    "stat.students": "University students using generative AI",
    "stat.gap": "Gap between 1st and 10th model in global benchmark — was 11.9% the year before",
    "stat.ai_cn": "Private AI investment — China 2025",
    "tech.quote": "«The chip war will be remembered as the moment semiconductors became for the 21st century what oil was for the 20th.»",
    "tech.quote_author": "Structural analysis — 2026",
    "culture.tag": "05 — CULTURE & SOCIETY",
    "culture.title": "The world inside screens",
    "culture.body": "The decade witnessed social media mature from connection tools to infrastructure of influence, commerce and conflict. Creator economy, propaganda, meme culture and generative AI fused into an ecosystem where cultural production, marketing and politics are increasingly indistinguishable. In 2026, the battle for attention has become a battle for economic power, reputation and consent.",
    "key.tag": "06 — 12 TURNING POINTS",
    "key.title": "The forces that built 2026",
    "key.1.num": "01",
    "key.1.title": "Crisis of the liberal order",
    "key.1.body": "Brexit and Trump normalized what appeared exceptional: economic nationalism, distrust of elites, polarization.",
    "key.2.title": "Pandemic as civilizational fracture",
    "key.2.body": "Not only for the deaths, but because it simultaneously changed healthcare, school, work, debt, logistics and the relationship with the State.",
    "key.3.title": "War returns to Europe",
    "key.3.body": "Russia's invasion of Ukraine refounded European security and launched the largest rearmament cycle since the Cold War.",
    "key.4.title": "End of easy money",
    "key.4.body": "After years of zero rates, the decade 2021–2026 will be read as the end of the post-2008 \"monetary normality\".",
    "key.5.title": "Fragmentation of globalization",
    "key.5.body": "Not the disappearance of global trade, but its transition from an efficiency logic to a security and control logic.",
    "key.6.title": "AI as infrastructure",
    "key.6.body": "The 88% adoption rate and industrial dominance indicate a historic transition: AI is not a trend, it is the new electricity.",
    "future.tag": "07 — MESSAGE TO THE FUTURE",
    "future.title": "To whoever reads\nthese words",
    "future.sig": "5B INF — ITIS Q. SELLA — 2026",
    "credits.label": "This capsule belongs to",
    "credits.school": "ITIS Quintino Sella — Biella"
  }
};
var lang=localStorage.getItem('tc-lang')||'it';
function setLang(l){
  if(!T[l])return;lang=l;localStorage.setItem('tc-lang',l);
  document.documentElement.lang=l;
  document.querySelectorAll('.lbtn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===l);});
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var v=T[l][el.dataset.i18n];
    if(!v) return;
    if(el.hasAttribute('data-i18n-html')){
      el.innerHTML = v;
    } else {
      el.textContent = v;
    }
  });
}
document.querySelectorAll('.lbtn').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang);});});
setLang(lang);

/* ── SCROLL REVEAL ── */
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});
},{threshold:.05,rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.reveal,.tl-entry').forEach(function(el){obs.observe(el);});

/* ── HERO TYPEWRITER ── */
(function(){
  var el=document.getElementById('hero-tag');
  if(!el)return;
  var txt=el.textContent;el.textContent='';var i=0;
  function type(){if(i<txt.length){el.textContent+=txt[i++];setTimeout(type,38);}}
  setTimeout(type,400);
})();

/* ── FLOATING PARTICLES on hero ── */
(function(){
  var hero=document.querySelector('.hero');if(!hero)return;
  for(var i=0;i<18;i++){
    var p=document.createElement('div');p.className='hero-particle';
    p.style.cssText='left:'+Math.random()*100+'%;bottom:'+Math.random()*40+'%;width:'+(1+Math.random()*2)+'px;height:'+(1+Math.random()*2)+'px;animation-duration:'+(4+Math.random()*8)+'s;animation-delay:'+(Math.random()*6)+'s;opacity:0;';
    hero.appendChild(p);
  }
})();

})();
