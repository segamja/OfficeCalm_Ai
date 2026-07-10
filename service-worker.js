/**
 * Mindly — Service Worker (오프라인 캐싱)
 * 향후 Push Notification 등 확장 시 이 파일에서 핸들러 추가
 */
const CACHE_VERSION = 'mindly-v1.9';
const CACHE_NAME = 'mindly-static-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/ai-engine.js',
  './js/level-gate.js',
  './js/audio-player.js',
  './js/gallery.js',
  './js/onboarding.js',
  './js/missions.js',
  './js/progress.js',
  './js/journal.js',
  './js/tabs.js',
  './js/pwa.js',
  './js/settings.js',
  './js/app.js',
  './assets/images/care.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/images/calm-01.jpg',
  './assets/images/calm-02.jpg',
  './assets/images/calm-03.jpg',
  './assets/images/calm-04.jpg',
  './assets/images/calm-05.jpg',
  './assets/images/calm-06.jpg',
  './assets/audio/white-noise.mp3',
  './assets/audio/desk-stretch.mp3',
  './assets/audio/deep-sleep.mp3',
  './assets/audio/burnout-recovery.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('mindly-static-') && key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          const isStatic =
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.mp3') ||
            url.pathname.endsWith('.json') ||
            url.pathname.endsWith('.html') ||
            url.pathname.endsWith('/');

          if (isStatic) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }

          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return caches.match(request);
        })
    })
  );
});

/* Push Notification — 향후 Firebase 연동 시 활성화
self.addEventListener('push', (event) => { ... });
self.addEventListener('notificationclick', (event) => { ... });
*/
