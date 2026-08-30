const CACHE_NAME = 'kotolab-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/drills.html',
    '/css/style.css',
    '/js/app.js',
    '/js/drills.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// 🔥 UPDATE: Network First, Fallback to Cache
// Updated sw.js fetch handler to ignore non-GET requests (like POST)
self.addEventListener('fetch', event => {
    // Sirf GET requests ko cache karo, POST/PUT ko bypass karo
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
        .then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
            });
            return response;
        })
        .catch(() => {
            return caches.match(event.request);
        })
    );
});