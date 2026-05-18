// Build Timestamp: 18/5/2026, 12:53:48
// Unique ID: 1779119628956
const CACHE_NAME = 'aefip-cache-1779119628956';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          // Delete any cache that belongs to our app but is not the current version
          if (name.startsWith('aefip-cache-') && name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests and skip external APIs (like Supabase)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only intercept requests for files on our own origin
  if (url.origin !== self.location.origin) return;

  // Determine if this is a navigation request (loading index.html or base page)
  const isNavigation = event.request.mode === 'navigate' || 
                       url.pathname === '/' || 
                       url.pathname === '/seccional/' || 
                       url.pathname.endsWith('index.html');

  if (isNavigation) {
    // Network-First with cache-busting (no-cache) for navigation requests to ensure latest version
    event.respondWith(
      fetch(new Request(event.request.url, { cache: 'no-cache' }))
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return new Response('Error de conexión', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Network-First with Cache Fallback for other assets (JS, CSS, images, etc.)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        return new Response('Recurso no disponible sin conexión', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
