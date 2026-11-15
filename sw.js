// sw.js

"use strict";

// Same number as the ?v= in index.html (see CLAUDE.md): renews the cache on every version.
const VERSION = "20261114.97";
const CACHE = `aikido-trainer-${VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  "manual.html",
  "docs/screenshots/1-home.png",
  "docs/screenshots/2-draw.png",
  "docs/screenshots/3-attacks.png",
  "docs/screenshots/4-techniques.png",
  "docs/screenshots/5-technique.png",
  `style.css?v=${VERSION}`,
  `app.js?v=${VERSION}`,
  `framework/elmer/index.js?v=${VERSION}`,
  `framework/elmer/runtime.js?v=${VERSION}`,
  `framework/elmer/elmer.js?v=${VERSION}`,
  `framework/elmer/devtools.js?v=${VERSION}`,
  `framework/elmer/effects.js?v=${VERSION}`,
  `framework/elmer/vdom.js?v=${VERSION}`,
  `src/update.js?v=${VERSION}`,
  `src/features/video.js?v=${VERSION}`,
  `src/features/program.js?v=${VERSION}`,
  `src/features/navigation.js?v=${VERSION}`,
  `src/shared/screen.js?v=${VERSION}`,
  `src/features/slide.js?v=${VERSION}`,
  `src/features/catalog.js?v=${VERSION}`,
  `src/features/quiz.js?v=${VERSION}`,
  `framework/elmer/feature.js?v=${VERSION}`,
  `src/layout/card.js?v=${VERSION}`,
  `src/view.js?v=${VERSION}`,
  `src/layout/footer.js?v=${VERSION}`,
  `src/layout/title.js?v=${VERSION}`,
  `src/layout/page.js?v=${VERSION}`,
  `src/layout/home.js?v=${VERSION}`,
  `src/shared/logic.js?v=${VERSION}`,
  `framework/elmer/debug/mount.js?v=${VERSION}`,
  `framework/elmer/debug/panel.js?v=${VERSION}`,
  `framework/elmer/debug/inspect.js?v=${VERSION}`,
  `framework/elmer/debug/style.js?v=${VERSION}`,
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
