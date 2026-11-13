// Coffee Cinnamon service worker.
//
// What it does:
//   • App shell (index.html, icons) is cached so the app opens offline.
//   • Built JS/CSS (hashed filenames) are cached on first use.
//   • Public API reads (menu, rescue board, impact) are network-first, falling back to
//     the last copy so pages can still be browsed offline.
//   • Food photos are cached after the first view.
// What it never does:
//   • Cache or replay POST/PATCH requests — orders, reservations and pickups always need
//     the network, and the app shows "You're offline" instead of pretending they worked.
//   • Cache private API responses (orders, account, dashboard) — only the public
//     endpoints listed in PUBLIC_API, which return the same data for everyone.

const VERSION = "cc-v2"; // bump when cached API shapes change
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const SHELL_FILES = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/icons/icon-192.png", "/placeholder-food.svg"];
const PUBLIC_API = /\/api\/(menu|rescue|impact|overview|forecast)(\/|\?|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") (await caches.open(RUNTIME)).put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept writes
  const url = new URL(request.url);

  // Page navigations: try the network, fall back to the cached app shell.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }
  // Hashed build assets never change, so cache-first is safe.
  if (url.origin === location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Public API reads.
  if (PUBLIC_API.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }
  // Food photography and fonts.
  if (url.hostname === "images.unsplash.com" || url.hostname.endsWith("gstatic.com") || url.hostname === "fonts.googleapis.com") {
    event.respondWith(cacheFirst(request));
  }
});
