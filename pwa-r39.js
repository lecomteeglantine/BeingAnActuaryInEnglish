/* R47 global style/cache recovery. */
(() => {
  'use strict';
  const VERSION = '47';
  const RELOAD_FLAG = 'actuarial-r47-reloaded';

  // Force the shared stylesheet through a fresh URL even if the browser has
  // cached an older styles.css response outside the service-worker cache.
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    try {
      const url = new URL(link.href, location.href);
      if (/\/styles\.css$/.test(url.pathname)) {
        url.searchParams.set('v', VERSION);
        if (link.href !== url.href) link.href = url.href;
      }
    } catch (_) {}
  });

  if (!('serviceWorker' in navigator)) return;

  async function clearCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('actuarial-english-')).map(k => caches.delete(k)));
  }

  function reloadOnce() {
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch (_) { return; }
    location.reload();
  }

  window.addEventListener('load', async () => {
    try {
      await clearCaches();
      let changed = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (changed) return;
        changed = true;
        reloadOnce();
      });
      const reg = await navigator.serviceWorker.register('./service-worker-r47.js', {
        scope: './', updateViaCache: 'none'
      });
      await reg.update().catch(() => {});
      if (navigator.serviceWorker.controller && /service-worker-r47\.js(?:$|\?)/.test(navigator.serviceWorker.controller.scriptURL)) {
        reloadOnce();
      }
    } catch (err) {
      console.warn('R47 recovery failed:', err);
    }
  });
})();
