import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { cacheFirst, staleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { initialize } from 'workbox-google-analytics';

const CLIPART_NAMES_URL =
  'https://raw.githubusercontent.com/marella/material-icons/refs/heads/main/_data/codepoints.json';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.href === CLIPART_NAMES_URL,
  staleWhileRevalidate({
    cacheName: 'clipart-names',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 7 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  new RegExp('https://(?:fonts|www).(?:googleapis|gstatic).com/(.*)'),
  cacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

initialize();
