
const CACHE_NAME="skytracker-cache-v1";const SCOPE="/skytracker/";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME)));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url); if(!u.pathname.startsWith(SCOPE)) return;
  if(e.request.mode==="navigate"){ e.respondWith(fetch(e.request).catch(()=>caches.match(SCOPE+"index.html"))); return; }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE_NAME).then(C=>C.put(e.request,x));return r;})));
});
