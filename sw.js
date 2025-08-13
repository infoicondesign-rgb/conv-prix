const VERSION = "v9";
const CACHE = "convprix-" + VERSION;
const ASSETS = ["./", "./index.html?v=v9","./manifest.webmanifest?v=v9","./sw.js?v=v9","./logo-192.png?v=v9","./logo-512.png?v=v9","./logo.png?v=v9","./apple-touch-icon.png?v=v9"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k === CACHE ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/sw.js")) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copy));
        return networkResponse;
      }).catch(() => cached || caches.match("./index.html"));
      return cached || fetchPromise;
    })
  );
});