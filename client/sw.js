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

// Fetch and Cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});