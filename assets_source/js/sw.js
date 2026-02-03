const CACHE_NAME = 'school-ms-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/offline/',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/pwa.js',
    '/static/favicon/android-chrome-192x192.png',
    '/static/favicon/android-chrome-512x512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests differently
    if (url.pathname.startsWith('/api/') || url.pathname.includes('csrf')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response(JSON.stringify({
                        error: 'Network error - please check your connection'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // For static files, try cache first
    if (STATIC_FILES.includes(url.pathname) || STATIC_FILES.includes(request.url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request);
                })
        );
        return;
    }

    // For HTML pages, try network first, then cache
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone the response before using it
                    const responseClone = response.clone();
                    
                    // Cache the response for future use
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(request, responseClone);
                        });
                    
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // Return offline page
                            return caches.match('/offline/')
                                .then(offlineResponse => {
                                    return offlineResponse || new Response('You are offline', {
                                        status: 503,
                                        headers: { 'Content-Type': 'text/html' }
                                    });
                                });
                        });
                })
        );
        return;
    }

    // For other requests, try cache first, then network
    event.respondWith(
        caches.match(request)
            .then(response => {
                return response || fetch(request)
                    .then(fetchResponse => {
                        // Cache successful responses
                        if (fetchResponse.status === 200) {
                            const responseClone = fetchResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return fetchResponse;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle any pending offline actions
            console.log('Processing background sync...')
        );
    }
});

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from School Management System',
        icon: '/static/favicon/android-chrome-192x192.png',
        badge: '/static/favicon/android-chrome-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/static/favicon/android-chrome-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/static/favicon/android-chrome-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('School Management System', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
}); 