// Service worker yalnız push bildirişləri üçündür: keş YOXDUR (deploy-dan sonra köhnə kod riski olmasın).
// Bildiriş Edge Function `push`-dan gəlir: { id, kind, title, body, url }. url usta panelinin ünvanıdır → admin ünvanına çevrilir.
const MAP = { "/panel": "/", "/icazelerim": "/icazeler", "/aletlerim": "/depo" };
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

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
