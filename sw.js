import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute([{"revision":"f3d7b3efa180da08ce3d6319443e39d4","url":"icons-actionbar.html"},{"revision":"bdb88519a699b9d08592b43140c23bc1","url":"icons-app-shortcut.html"},{"revision":"2991d5228886bef6f440e1433a8de655","url":"icons-generic.html"},{"revision":"21e9ffeb0b70b006683e23a9056f518c","url":"icons-launcher.html"},{"revision":"71d03ab473142a6a9db0ffc740791513","url":"icons-notification.html"},{"revision":"8e6407fc8d7f9621e4893a6800f59852","url":"index.html"},{"revision":"c5baeb32e240b567a146ffeefcdc779e","url":"nine-patches.html"},{"revision":"65311bbd1a2658cacdf6a2be539b0d9c","url":"res/generator-thumbs/icon-animator.svg"},{"revision":"747ac6e1b23e6f00a86d7baebe76029d","url":"res/generator-thumbs/icons-actionbar.svg"},{"revision":"dcd36cf4d4b734e4d4d7993aeb5350ce","url":"res/generator-thumbs/icons-app-shortcut.svg"},{"revision":"7e9aaa9edeaf210c7afac117cf094192","url":"res/generator-thumbs/icons-generic.svg"},{"revision":"ac624b8aabda5851413f3ccfd252b80d","url":"res/generator-thumbs/icons-launcher.svg"},{"revision":"bd07505811fade5e742afe6a85cedf03","url":"res/generator-thumbs/icons-notification.svg"},{"revision":"c37457a837ee23a6c1981b5d993ee72e","url":"res/generator-thumbs/nine-patches.svg"},{"revision":"0a2645500fa29272a964ab81aed08eae","url":"app.js"},{"revision":"04e16c151ff9421a5691a625535dbd98","url":"sw-prod.js"},{"revision":"1da48b55530b074a99a0753b32c89c78","url":"vendor.js"},{"revision":"aceec3b0ec989b4b5a37832a0e432c76","url":"app.css"}]);

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js'
);

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(
  new RegExp('https://(?:fonts|www).(?:googleapis|gstatic).com/(.*)'),
  workbox.strategies.cacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
        purgeOnQuotaError: true,
      }),
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
    ],
  })
);

workbox.googleAnalytics.initialize();
