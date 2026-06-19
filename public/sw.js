// GENERATED to match research-suite/tools/pwa/inject.mjs (Next.js app is hand-wired).
// Offline app-shell for the "timetable-generator" PWA. Bump the version suffix to
// force clients onto a fresh cache. Scope is derived from this worker's own URL,
// so it works under the /timetable-generator/ GitHub Pages path.
const PREFIX = 'syed-pwa-timetable-generator-';
const CACHE = PREFIX + 'v1';
const ROOT = new URL('./', self.location).href;          // scope root (absolute)
const SHELL = [ROOT, ROOT + 'manifest.webmanifest', ROOT + 'icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map((u) => c.add(u)));  // one 404 must not abort install
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // cross-origin: untouched
  if (url.pathname.includes('/api/')) return;              // never cache API / auth traffic

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(ROOT, cp)); return res; })
        .catch(() => caches.match(ROOT).then((r) => r || caches.match(req))),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(req, cp));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    }),
  );
});
