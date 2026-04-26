import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { cacheFirst, staleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { initialize } from 'workbox-google-analytics';

const CLIPART_NAMES_URL =
  'https://raw.githubusercontent.com/marella/material-icons/refs/heads/main/_data/codepoints.json';

precacheAndRoute([{"revision":"e53391a2e440b65a9d5731437078a509","url":"nine-patches.html"},{"revision":"9e979eb02996ec4cf1c39881e18ea3c4","url":"index.html"},{"revision":"95d6ad12960a3edfae0c894427f5c93f","url":"icons-notification.html"},{"revision":"accdbf9ff1503e69933fb482ea3cd243","url":"icons-launcher.html"},{"revision":"ff0c64a8f8eaba67a07e77402393ccaa","url":"icons-generic.html"},{"revision":"1f00b0aaf8e718c7bced6731367698d5","url":"icons-app-shortcut.html"},{"revision":"5e2186c2a2a9cecd91ea2a4e5d9572f4","url":"icons-actionbar.html"},{"revision":"246a0419730e8bfcf9641a2581759e49","url":"res/generator-thumbs/nine-patches.svg"},{"revision":"aa857754e748eae1c5048f35809d8919","url":"res/generator-thumbs/icons-notification.svg"},{"revision":"647f4c5df68ff1ced4dc6c31ab755efa","url":"res/generator-thumbs/icons-launcher.svg"},{"revision":"f59bf46c029a1772376f2a9a0cb5c0cd","url":"res/generator-thumbs/icons-generic.svg"},{"revision":"5fc9f2c7fbe7b7b8ecdc1e31c191dfbc","url":"res/generator-thumbs/icons-app-shortcut.svg"},{"revision":"2709d863f9bbff8e3429c603694e4aa7","url":"res/generator-thumbs/icons-actionbar.svg"},{"revision":"ac74b1df04d0c18384d556fe5f73cfa7","url":"res/generator-thumbs/icon-animator.svg"},{"revision":"aceec3b0ec989b4b5a37832a0e432c76","url":"app.css"}]);

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
