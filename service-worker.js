const CACHE_NAME = '30-day-challenge-cache-v2';
const urlsToCache = [
  'index.html',
  'styles.css',
  'app.js',
  'installapp.js',
  'countdown.js',
  'bluetoothHR.js',
  'pushup.js',
  '/pushup.html',
  'icon.png',
  '30 day app icon-2.png',
  'play-icon.png',
  'stop-icon.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Forces the waiting service worker to become active
});

// Activate event - update cache if needed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of any open clients
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // For navigational requests, return index.html from cache or fetch
    event.respondWith(
      caches.match('index.html').then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/index.html'));
      })
    );
  } else {
    // For all other requests, try cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

