import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute([{"revision":"61685c01cc6c2b8cec602d69f117e40e","url":"icons-actionbar.html"},{"revision":"37a73db319f0c8665ddbfd4a5ed5273c","url":"icons-app-shortcut.html"},{"revision":"a49b15e53b0d20622f9ebeba2132b468","url":"icons-generic.html"},{"revision":"32b0ddc9ae780b4e20c595005a04c0a1","url":"icons-launcher.html"},{"revision":"a865941d056cafe59836f8dc01309ecc","url":"icons-notification.html"},{"revision":"77cb6aeb83cc6ae6411145bac26bd8d2","url":"index.html"},{"revision":"bc4911d92d2633f219c4699232218c91","url":"nine-patches.html"},{"revision":"65311bbd1a2658cacdf6a2be539b0d9c","url":"res/generator-thumbs/icon-animator.svg"},{"revision":"747ac6e1b23e6f00a86d7baebe76029d","url":"res/generator-thumbs/icons-actionbar.svg"},{"revision":"dcd36cf4d4b734e4d4d7993aeb5350ce","url":"res/generator-thumbs/icons-app-shortcut.svg"},{"revision":"7e9aaa9edeaf210c7afac117cf094192","url":"res/generator-thumbs/icons-generic.svg"},{"revision":"ac624b8aabda5851413f3ccfd252b80d","url":"res/generator-thumbs/icons-launcher.svg"},{"revision":"bd07505811fade5e742afe6a85cedf03","url":"res/generator-thumbs/icons-notification.svg"},{"revision":"c37457a837ee23a6c1981b5d993ee72e","url":"res/generator-thumbs/nine-patches.svg"},{"revision":"ed519aa16ba78ac1ff3ba6f2227da10d","url":"app.js"},{"revision":"4f32ae47244539e4c8db74fc3d8334dc","url":"sw-prod.js"},{"revision":"f31b531104785b0df0932b75e682e259","url":"vendor.js"},{"revision":"aceec3b0ec989b4b5a37832a0e432c76","url":"app.css"}]);

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js"
);

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(
  new RegExp("https://(?:fonts|www).(?:googleapis|gstatic).com/(.*)"),
  workbox.strategies.cacheFirst({
    cacheName: "google-fonts",
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
