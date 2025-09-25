const CACHE_NAME = "sudoku-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  // füge hier deine CSS/JS/Fonts/Images ein, z.B.:
  // "/styles.css",
  // "/main.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon-180.png"
];

// Install: alles cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: alte Caches löschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First, dann Netzwerk
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        // nur GET & gleiche Origin cachen
        const url = new URL(req.url);
        if (req.method === "GET" && url.origin === location.origin) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => caches.match("/"))
    )
  );
});
