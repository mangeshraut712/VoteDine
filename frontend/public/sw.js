/* Cache rules mirror frontend/lib/cache-policy.ts. */
const CACHE_NAME = "votedine-cache-v2";
const BASE = new URL("./", self.location.href);
const ASSETS = ["", "manifest.webmanifest", "icons/votedine-icon.svg"].map((path) =>
  new URL(path, BASE).toString(),
);

function isApiPath(pathname) {
  return pathname.split("/").includes("api");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || isApiPath(url.pathname)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const home = await caches.match(new URL("./", self.location.href).toString());
          if (home) return home;
        }
        throw error;
      }
    })(),
  );
});
