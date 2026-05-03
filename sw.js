const CACHE_NAME = 'market-radar-v3';
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
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only handle same-origin app shell requests. Cross-origin (Polygon, FRED,
  // RSS feeds, GitHub, Fugle, CORS proxies) goes straight to the network so the
  // browser handles CORS / rate-limit errors directly without polluting the
  // console with SW "Failed to fetch" rejections.
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
