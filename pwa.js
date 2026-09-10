/* R46 emergency stability fix: replace the global caching service worker with
   a pass-through worker and clear stale Actuarial English caches. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  const RELOAD_FLAG = 'actuarial-r46-cache-reset-reloaded';

  async function clearActuarialCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('actuarial-english-'))
        .map(key => caches.delete(key))
    );
  }

  function reloadOnce() {
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch (_) {
      // If sessionStorage is unavailable, still avoid forcing repeated reloads.
      return;
    }
    window.location.reload();
  }

  window.addEventListener('load', async () => {
    try {
      await clearActuarialCaches();

      let controllerChanged = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (controllerChanged) return;
        controllerChanged = true;
        reloadOnce();
      });

      const reg = await navigator.serviceWorker.register('./service-worker-r46.js', {
        scope: './',
        updateViaCache: 'none'
      });
      await reg.update().catch(() => {});

      // If R46 already controls this page, the stale cache has been removed.
      // Reload once so stylesheets/images are fetched directly from GitHub Pages.
      const controller = navigator.serviceWorker.controller;
      if (controller && /service-worker-r46\.js(?:$|\?)/.test(controller.scriptURL)) {
        reloadOnce();
      }
    } catch (err) {
      console.warn('R46 service-worker reset failed:', err);
    }
  });
})();
