/* ReadyHome India service worker — offline-first app shell */
const CACHE = "readyhome-v5";
const ASSETS = ["./", "./index.html", "./styles.css?v=5", "./app.js?v=5", "./data.js", "./shelters.js", "./manifest.json", "./assets/cooking-nopower.jpg", "./assets/cover.jpg", "./assets/cyclone.jpg", "./assets/documents.jpg", "./assets/earthquake-drill.jpg", "./assets/family-plan.jpg", "./assets/firstaid.jpg", "./assets/flood.jpg", "./assets/food.jpg", "./assets/gobag.jpg", "./assets/guide-step1.jpg", "./assets/guide-step2.jpg", "./assets/guide-step3.jpg", "./assets/guide-step4.jpg", "./assets/guide-step5.jpg", "./assets/guide-step6.jpg", "./assets/guide-step7.jpg", "./assets/heatwave.jpg", "./assets/homeharden.jpg", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/knots.jpg", "./assets/meds.jpg", "./assets/power.jpg", "./assets/signal.jpg", "./assets/solar-cooker.jpg", "./assets/story-cpr.jpg", "./assets/story-filter.jpg", "./assets/story-quake.jpg", "./assets/water.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }
  if (!req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then(hit => {
      const fetchP = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || fetchP;
    })
  );
});
