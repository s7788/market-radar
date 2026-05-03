const CACHE_NAME = 'market-radar-v3';
const DATA_CACHE = 'market-radar-data-v1';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/config.js', '/manifest.json', '/icon.svg'];

self.addEventListener('install', e => {
  // best-effort: addAll() is atomic — any 404 (e.g. fork without config.js) would
  // reject the whole install and the SW never activates. Cache each URL separately.
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      Promise.allSettled(SHELL.map(u => c.add(u)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first with cache fallback for both shell (same-origin) and external
// API GETs (Polygon / FRED / RSS / GitHub / Fugle / CORS proxies). Online: live
// data wins. Offline / network error: serve last-known-good response so the PWA
// still renders something instead of breaking. Mutating methods are skipped.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;
  const cacheName = sameOrigin ? CACHE_NAME : DATA_CACHE;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only cache successful or opaque responses; skip 4xx/5xx so an error
        // doesn't overwrite a previously-good cache entry.
        if (res && (res.ok || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(cacheName).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
