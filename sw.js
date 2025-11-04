
const CACHE_NAME = "skytracker-cache-v1";
const SCOPE = "/skytracker/";
const PRECACHE = [
  SCOPE,
  SCOPE + "index.html",
  SCOPE + "manifest.webmanifest",
  SCOPE + "favicon.icon"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 스코프 바깥은 무시
  if (!url.pathname.startsWith(SCOPE)) return;

  // HTML은 네트워크 우선(오프라인 시 캐시 fallback)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match(SCOPE + "index.html"))
    );
    return;
  }

  // 나머지는 캐시 우선(없으면 네트워크)
  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
      return res;
    }))
  );
});
