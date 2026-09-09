const CACHE_PREFIX='actuarial-english-';
const CACHE='actuarial-english-2026-09-09-r44-actuarial-radio';
const CORE=[
  './',
  './index.html',
  './styles.css',
  './shared.js',
  './pwa.js',
  './pwa-r39.js',
  './home.js',
  './dictionary.html',
  './dictionary.js',
  './m1.html',
  './m2.html',
  './m2-sessions-r37.css',
  './m1-day1.html',
  './m1-session1-individual.html',
  './m1-session1-group.html',
  './m1-day2.html',
  './m1-day3.html',
  './m1-day4.html',
  './m1-day5.html',
  './m2-day1.html',
  './m2-session1-group.html',
  './m2-session1-radio.html',
  './m2-session1-radio-r44.css',
  './m2-session1-radio-r44.js',
  './m2-day2.html',
  './m2-day3.html',
  './m2-day4.html',
  './m2-day5.html',
  './grammar.html',
  './pronunciation.html',
  './games.html',
  './games.js',
  './flashcards.html',
  './flashcards.js',
  './notebook.html',
  './notebook.js',
  './privacy.html',
  './accessibility.html',
  './404.html',
  './data/vocabulary.js',
  './manifest.webmanifest',
  './icons/favicon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './group-office-r27.webp',
  './group-client-meeting-r27.webp',
  './group-case-files-r27.webp',
  './group-analytics-r27.webp',
  './group-boardroom-r27.webp',
  './group-risk-lab-r27.webp',
  './assets/m2-radio-r44/mission-adverts-r44.svg',
  './assets/m2-radio-r44/mission-call-r44.svg',
  './assets/m2-radio-r44/mission-final-r44.svg',
  './assets/m2-radio-r44/mission-interference-r44.svg',
  './assets/m2-radio-r44/mission-lost-r44.svg',
  './assets/m2-radio-r44/mission-stress-r44.svg',
  './assets/m2-radio-r44/radio-studio-r44.svg',
  './assets/m2-radio-r44/poster-life-r44.svg',
  './assets/m2-radio-r44/poster-flood-r44.svg',
  './assets/m2-radio-r44/poster-motor-r44.svg',
  './assets/m2-radio-r44/poster-pension-r44.svg',
  './assets/m2-radio-r44/audio/f-forecast.mp3',
  './assets/m2-radio-r44/audio/f-longevity.mp3',
  './assets/m2-radio-r44/audio/f-morbidity.mp3',
  './assets/m2-radio-r44/audio/f-policyholder.mp3',
  './assets/m2-radio-r44/audio/f-pricing.mp3',
  './assets/m2-radio-r44/audio/f-reserves.mp3',
  './assets/m2-radio-r44/audio/f-risk-assessment.mp3',
  './assets/m2-radio-r44/audio/f-solvency.mp3',
  './assets/m2-radio-r44/audio/m1-actuary.mp3',
  './assets/m2-radio-r44/audio/m1-annuity.mp3',
  './assets/m2-radio-r44/audio/m1-deductible.mp3',
  './assets/m2-radio-r44/audio/m1-liability.mp3',
  './assets/m2-radio-r44/audio/m1-reinsurance.mp3',
  './assets/m2-radio-r44/audio/m2-actuarial.mp3',
  './assets/m2-radio-r44/audio/m2-mortality.mp3',
  './assets/m2-radio-r44/audio/m2-probability.mp3',
  './assets/m2-radio-r44/audio/m2-severity.mp3',
  './assets/m2-radio-r44/audio/m2-underwriting.mp3',
  './assets/m2-radio-r44/audio/m3-exposure.mp3',
  './assets/m2-radio-r44/audio/m3-life-expectancy.mp3',
  './assets/m2-radio-r44/audio/m3-mortality.mp3',
  './assets/m2-radio-r44/audio/m3-premium.mp3',
  './assets/m2-radio-r44/audio/m3-reserves.mp3',
  './assets/m2-radio-r44/audio/m4-catastrophe-clean.mp3',
  './assets/m2-radio-r44/audio/m4-catastrophe-static.mp3',
  './assets/m2-radio-r44/audio/m4-forecast-clean.mp3',
  './assets/m2-radio-r44/audio/m4-forecast-static.mp3',
  './assets/m2-radio-r44/audio/m4-frequency-clean.mp3',
  './assets/m2-radio-r44/audio/m4-frequency-static.mp3',
  './assets/m2-radio-r44/audio/m4-solvency-clean.mp3',
  './assets/m2-radio-r44/audio/m4-solvency-static.mp3',
  './assets/m2-radio-r44/audio/m5-flood.mp3',
  './assets/m2-radio-r44/audio/m5-life.mp3',
  './assets/m2-radio-r44/audio/m5-motor.mp3',
  './assets/m2-radio-r44/audio/m5-pension.mp3',
  './assets/m2-radio-r44/audio/sfx-error.mp3',
  './assets/m2-radio-r44/audio/sfx-jingle.mp3',
  './assets/m2-radio-r44/audio/sfx-onair.mp3',
  './assets/m2-radio-r44/audio/sfx-phone.mp3',
  './assets/m2-radio-r44/audio/sfx-static.mp3',
  './assets/m2-radio-r44/audio/sfx-success.mp3',
  './assets/m2-radio-r44/audio/sfx-tick.mp3'
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
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX) && key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  const isFreshContent=req.mode==='navigate' || /\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname);
  if(isFreshContent){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(r=>r || (req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached || fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});
