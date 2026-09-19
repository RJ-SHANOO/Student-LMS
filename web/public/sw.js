// Minimal service worker: only exists so the app is installable and a full
// page load has something to fall back to when there's no network. It does
// NOT try to cache API responses or admin data — those must always be fresh.
const CACHE_NAME = "soil-shell-v1";
const SHELL_URLS = ["/offline", "/manifest.webmanifest", "/icons/192", "/icons/512", "/branding/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Full-page navigations: go to the network first (data must be fresh),
  // fall back to the cached offline page only when that fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline").then((res) => res ?? Response.error()))
    );
    return;
  }

  // Static, same-origin shell assets: cache-first, refresh in the background.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
  }
});
