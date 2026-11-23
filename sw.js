// sw.js

"use strict";

// Hash of all the served files (see CLAUDE.md, `yarn bump`): renews the offline cache as soon as one of them changes.
// The `?v=` of each file below is the hash of that file only.
const VERSION = "3b5e3413";
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
  "style.css?v=0242dc0d",
  "app.js?v=ff405f5f",
  "framework/elmer/index.js?v=8ae72091",
  "framework/elmer/runtime.js?v=8d373247",
  "framework/elmer/elmer.js?v=3256d6d4",
  "framework/elmer/devtools.js?v=3d388642",
  "framework/elmer/effects.js?v=66e637bd",
  "framework/elmer/html.js?v=dd46b1e0",
  "framework/elmer/vdom.js?v=4cfa45d5",
  "src/update.js?v=aaaf8f14",
  "src/features/video.js?v=ab6f2974",
  "src/features/program.js?v=ca4264bd",
  "src/features/navigation.js?v=847b8872",
  "src/shared/screen.js?v=357675a7",
  "src/shared/grades.js?v=cf6f715e",
  "src/features/slide.js?v=5736935d",
  "src/features/catalog.js?v=2fced0c4",
  "src/features/quiz.js?v=54faf665",
  "framework/elmer/feature.js?v=9ff87f04",
  "src/layout/card.js?v=7f6a0be7",
  "src/view.js?v=8526c65d",
  "src/layout/footer.js?v=2c6a521b",
  "src/layout/title.js?v=b05b6e23",
  "src/layout/page.js?v=8ae1bb18",
  "src/layout/home.js?v=eaf88272",
  "src/shared/logic.js?v=c1a37c7c",
  "framework/elmer/debug/mount.js?v=65c1e9f1",
  "framework/elmer/debug/panel.js?v=9cdea2e2",
  "framework/elmer/debug/inspect.js?v=0b6dcfdc",
  "framework/elmer/debug/style.js?v=b4102a95",
  "favicon.ico?v=6c7e050b",
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
