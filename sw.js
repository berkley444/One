/* Big Pear Guitar Works — service worker.
 *
 * Goal: after the first visit the app opens with no network, and new releases still arrive
 * the moment you are online.
 *   - Same-origin pages/files: network-first (3 s timeout) -> falls back to the cache.
 *   - Google Fonts (cross-origin): stale-while-revalidate in their own cache.
 *   - Anything else is left to the browser.
 * Bump VERSION when this file's behaviour or the CORE list changes; index.html changes need no bump
 * (network-first picks them up), but a bump also clears out stale cached copies.
 */
const VERSION = 'bpgw-v4.0';
const FONTS = 'bpgw-fonts';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('bpgw-') && k !== VERSION && k !== FONTS) await caches.delete(k);
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await Promise.race([fetch(req.url, { cache: 'no-cache' }), timeout(3000)]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const page = await cache.match('./index.html'); if (page) return page; }
    return Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') e.respondWith(staleWhileRevalidate(req));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
