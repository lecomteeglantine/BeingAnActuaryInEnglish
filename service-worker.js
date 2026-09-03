const CACHE='actuarial-english-2026-09-03-r8-firm-draft';
const CORE=[
  './','./index.html','./styles.css','./shared.js','./home.js','./dictionary.html','./dictionary.js','./m1.html','./m2.html',
  './m1-day1.html','./m1-session1-individual.html','./m1-session1-individual.js','./m1-session1-group.html','./m1-session1-group.js','./m1-day2.html','./m1-day3.html','./m1-day4.html','./m1-day5.html','./m2-day1.html','./m2-day2.html','./m2-day3.html','./m2-day4.html','./m2-day5.html',
  './grammar.html','./pronunciation.html','./games.html','./games.js','./flashcards.html','./flashcards.js','./notebook.html','./notebook.js','./privacy.html','./accessibility.html','./404.html',
  './data/vocabulary.js','./manifest.webmanifest','./icons/favicon.png','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png',
  './assets/session1/individual-hero.svg','./assets/session1/security-gate.svg','./assets/session1/case-files.svg','./assets/session1/risk-lab.svg','./assets/session1/draft-room.svg','./assets/session1/draft-clients.svg','./assets/session1/draft-expertise.svg','./assets/session1/draft-team.svg','./assets/session1/draft-tools.svg','./assets/session1/draft-crisis.svg','./assets/session1/draft-boardroom.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  // Network-first for pages, JS, CSS, data and manifest so a GitHub update is
  // visible immediately when online. The cache is only the offline fallback.
  const isFreshContent=req.mode==='navigate' || /\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname);
  if(isFreshContent){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
          return res;
        })
        .catch(()=>caches.match(req).then(r=>r || (req.mode==='navigate'?caches.match('./index.html'):Response.error())))
    );
    return;
  }

  // Cache-first is fine for versioned/static icons.
  event.respondWith(
    caches.match(req).then(cached=>cached || fetch(req).then(res=>{
      if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
      return res;
    }))
  );
});
