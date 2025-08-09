const CACHE_NAME = 'sentihealth-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => n !== CACHE_NAME && caches.delete(n))))
  );
});

self.addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
