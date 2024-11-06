const CACHE_NAME = '30-day-challenge-cache-v4'; // Incremented cache version
const urlsToCache = [
  '/30-day-workout/',
  '/30-day-workout/index.html',
  '/30-day-workout/styles.css',
  '/30-day-workout/app.js',
  '/30-day-workout/installapp.js',
  '/30-day-workout/countdown.js',
  '/30-day-workout/bluetoothHR.js',
  '/30-day-workout/pushup.js',
  '/30-day-workout/pushup.html',
  '/30-day-workout/icon.png',
  '/30-day-workout/30 day app icon-2.png',
  '/30-day-workout/play-icon.png',
  '/30-day-workout/stop-icon.png'
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
  self.skipWaiting();
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
  self.clients.claim();
});

// Fetch event - network-first strategy for dynamic files and cache-first for static assets
self.addEventListener('fetch', event => {
  if (event.request.url.includes('app.js') || event.request.url.includes('pushup.js')) {
    // Network-first strategy for files that change frequently
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match(event.request)) // Fallback to cache if network fails
    );
  } else if (event.request.mode === 'navigate') {
    // Handle navigation requests
    event.respondWith(
      caches.match('/30-day-workout/index.html').then(response => {
        return response || fetch(event.request).catch(() => caches.match('/30-day-workout/index.html'));
      })
    );
  } else {
    // Cache-first strategy for all other static assets
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
