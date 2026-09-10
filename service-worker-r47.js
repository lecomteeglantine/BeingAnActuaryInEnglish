/* R47 cache-free service worker. */
'use strict';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('actuarial-english-')).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
/* Deliberately no fetch handler. */
