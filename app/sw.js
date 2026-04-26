// A lightweight development service worker that takes immediate control
// and caches the remote clipart name list for offline/dev reuse.

const CLIPART_NAMES_URL =
  'https://raw.githubusercontent.com/marella/material-icons/refs/heads/main/_data/codepoints.json';
const CLIPART_CACHE_NAME = 'clipart-names';

self.addEventListener('install', () => {
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.url !== CLIPART_NAMES_URL) {
    return;
  }

  event.respondWith(
    caches.open(CLIPART_CACHE_NAME).then(async cache => {
      const cachedResponse = await cache.match(event.request);

      const networkRequest = fetch(event.request)
        .then(response => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(error => {
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        });

      return cachedResponse || networkRequest;
    })
  );
});
