/* R46 pass-through service worker.
   Intentionally has NO fetch handler: page, CSS, JS, images and audio are
   fetched normally from GitHub Pages instead of being served from a stale cache. */
'use strict';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('actuarial-english-'))
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});
