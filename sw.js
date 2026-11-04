// Offline: Seite aus dem Cache, wenn kein Netz. Inhalt bleibt verschlüsselt gespeichert.
const PAGE = 'page-v1', TILES = 'tiles-v1', MAX_TILES = 1500;
self.addEventListener('install', e => { e.waitUntil(caches.open(PAGE).then(c => c.add('./')).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'server.arcgisonline.com') {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(r);
      if (hit) return hit;
      const res = await fetch(r);
      c.put(r, res.clone());
      c.keys().then(k => { if (k.length > MAX_TILES) c.delete(k[0]); });
      return res;
    }));
    return;
  }
  if (u.origin === location.origin && r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(PAGE).then(c => c.put('./', copy)); return res; }).catch(() => caches.match('./')));
  }
});
