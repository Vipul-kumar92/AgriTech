/* KrishiPulse.AI Progressive Web App Service Worker */
const STATIC_CACHE = 'krishipulse-static-v1';
const API_CACHE = 'krishipulse-api-v1';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/pwa-icon.svg',
  '/agri_hero_banner.jpg',
  '/agri_harvest_field.jpg'
];

const CACHEABLE_API_PREFIXES = [
  '/api/dataset/stats',
  '/api/weather/live',
  '/api/crop-doctor/catalog',
  '/api/analytics',
  '/api/predictions',
  '/api/map/states',
  '/api/models',
  '/api/feature-importance'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache private auth or admin mutations/queries
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/admin/')) {
    return;
  }

  // Network-first with offline cache fallback for read-only agronomy APIs
  if (CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(
                JSON.stringify({ detail: 'Offline mode: no cached data for this query yet.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              )
          )
        )
    );
    return;
  }

  // SPA navigation: network-first, falling back to cached /index.html or /offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Static assets: cache-first with background refresh
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png'))) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
