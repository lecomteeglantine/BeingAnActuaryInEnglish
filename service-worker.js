const CACHE='actuarial-english-2026-09-03-r3';
const CORE=[
  './','./index.html','./styles.css','./shared.js','./home.js','./dictionary.html','./dictionary.js','./m1.html','./m2.html',
  './m1-day1.html','./m1-day2.html','./m1-day3.html','./m1-day4.html','./m1-day5.html','./m2-day1.html','./m2-day2.html','./m2-day3.html','./m2-day4.html','./m2-day5.html',
  './grammar.html','./pronunciation.html','./games.html','./games.js','./flashcards.html','./flashcards.js','./notebook.html','./notebook.js','./privacy.html','./accessibility.html','./404.html',
  './data/vocabulary.js','./manifest.webmanifest','./icons/favicon.png','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>{
    const network=fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>cached);
    return cached||network;
  }));
});
