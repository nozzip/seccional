const CACHE_NAME = 'aefip-cache-v7';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle certain requests to avoid issues with Supabase/external APIs
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      
      // Fallback for failed fetches that are not in cache
      return new Response('Network error occurred', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
