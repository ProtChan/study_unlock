const CACHE = "study-unlock-v1";
const SHELL = ["/dashboard", "/today", "/rewards", "/templates", "/analytics", "/settings", "/manifest.webmanifest", "/icon.svg"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => { const copy=response.clone(); caches.open(CACHE).then((c)=>c.put(event.request,copy)); return response; }).catch(() => caches.match(event.request).then((x)=>x || caches.match("/dashboard"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { if (response.ok && event.request.url.startsWith(self.location.origin)) { const copy=response.clone(); caches.open(CACHE).then((c)=>c.put(event.request,copy)); } return response; })));
});
