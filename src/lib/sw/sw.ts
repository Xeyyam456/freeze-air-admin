// Service worker (public/sw.js) hər açılışda qeydiyyatdan keçir: push-dan asılı olmayaraq internet olmayanda
// brauzerin öz səhifəsi əvəzinə bizim offline ekranımız (public/offline.html) açılsın. Təkrar çağırış zərərsizdir.
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
}
