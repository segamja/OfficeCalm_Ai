/**
 * Mindly — Service Worker (오프라인 캐싱 + 버전 업데이트)
 * CACHE_VERSION 변경 시 새 버전으로 감지됩니다.
 */
const CACHE_VERSION = 'mindly-v2.3';
const CACHE_NAME = 'mindly-static-' + CACHE_VERSION;

const PRECACHE_CRITICAL = [
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
];

const PRECACHE_OPTIONAL = [
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

const NETWORK_FIRST_PATTERNS = [
  /\.html$/,
  /\.js$/,
  /\.css$/,
  /manifest\.json$/,
  /service-worker\.js$/,
];

const CACHE_FIRST_PATTERNS = [/\.png$/, /\.jpg$/, /\.mp3$/];

function isNetworkFirst(pathname) {
  return NETWORK_FIRST_PATTERNS.some((re) => re.test(pathname)) || pathname.endsWith('/');
}

function isCacheFirst(pathname) {
  return CACHE_FIRST_PATTERNS.some((re) => re.test(pathname));
}

async function precacheAll(cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch (err) {
        console.warn('[Mindly SW] 캐시 실패:', url, err);
      }
    })
  );
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await precacheAll(cache, PRECACHE_CRITICAL);
        await precacheAll(cache, PRECACHE_OPTIONAL);
      })
      .then(() => {
        console.info('[Mindly SW] 설치 완료:', CACHE_VERSION);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('mindly-static-') && key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
          });
        })
      )
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || isNetworkFirst(url.pathname)) {
    event.respondWith(
      networkFirst(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (isCacheFirst(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request).catch(() => caches.match(request)));
});
