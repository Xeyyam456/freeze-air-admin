// Service worker: push bildirişləri + internet olmayanda offline ekranı (yalnız offline.html keşlənir, tətbiqin kodu yox).
// Bildiriş Edge Function `push`-dan gəlir: { id, kind, title, body, url }. url usta panelinin ünvanıdır → admin ünvanına çevrilir.
const MAP = { "/panel": "/", "/icazelerim": "/icazeler", "/aletlerim": "/depo" };

// İnternet olmayanda bizim ekranımız (public/offline.html): yalnız səhifə keçidləri tutulur — əvvəl şəbəkə,
// alınmasa keşdəki offline səhifəsi. Tətbiqin kodu keşlənmir (deploy-dan sonra köhnə versiya riski yoxdur).
const OFFLINE_URL = "/offline.html";
const OFFLINE_CACHE = "offline-v2";
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(OFFLINE_CACHE).then((c) => c.add(new Request(OFFLINE_URL, { cache: "reload" }))));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Freeze Air", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Freeze Air", {
      body: data.body || "",
      icon: "/app-icon/192",
      badge: "/app-icon/192",
      tag: data.id ? `n-${data.id}` : undefined,
      data: { url: MAP[data.url] ?? data.url ?? "/" },
    }),
  );
});

// Bildirişə klik: açıq panel tabı varsa ona keç və səhifəni aç, yoxdursa yeni pəncərə
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const tab = list.find((c) => c.url.startsWith(self.location.origin));
      if (tab) return tab.focus().then(() => tab.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
