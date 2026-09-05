// ==========================================
// KotoLab Service Worker (Network-First Strategy)
// ==========================================

const CACHE_NAME = 'kotolab-cache-v9.0'; // Version update se purana cache automatic delete hoga

// Core files you want to keep available offline
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/exam.html',
    '/sandbox.html',
    '/css/style.css',
    '/js/app.js',
    '/js/examBank.js'
];

// 1. INSTALL EVENT: Force install new service worker instantly
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Instantly activates the new Service Worker (No more waiting!)
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })));
            })
    );
});

// 2. ACTIVATE EVENT: Clear all old/stale caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all pages instantly
    );
});

// 3. FETCH EVENT: Network-First Strategy (Always gets latest code!)
self.addEventListener('fetch', (event) => {
    // Skip API calls and external requests from caching
    if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Network is working: Update cache with latest file and return it
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Offline: Only use cache if the network fails
                console.log('[Service Worker] Network failed, falling back to cache');
                return caches.match(event.request);
            })
    );
});