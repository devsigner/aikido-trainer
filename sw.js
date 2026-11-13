// Same number as the ?v= in index.html (see CLAUDE.md): renews the cache on every version.
const VERSION = "20261113.11";
const CACHE = `aikido-trainer-${VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  `style.css?v=${VERSION}`,
  `app.js?v=${VERSION}`,
  `src/runtime.js?v=${VERSION}`,
  `src/effects.js?v=${VERSION}`,
  `src/vdom.js?v=${VERSION}`,
  `src/update.js?v=${VERSION}`,
  `src/view.js?v=${VERSION}`,
  `src/logic.js?v=${VERSION}`,
  `src/route.js?v=${VERSION}`,
  `favicon.ico?v=${VERSION}`,
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "data/grades.json",
  "data/1er-kyo.json",
  "data/2eme-kyo.json",
  "data/3eme-kyo.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network first (always fresh when online), cache as fallback (offline).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request, { ignoreSearch: request.mode === "navigate" }).then((r) => r || caches.match("index.html"))),
  );
});
