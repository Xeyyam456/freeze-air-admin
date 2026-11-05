import { useSyncExternalStore } from "react";

// Brauzerin şəbəkə vəziyyəti (online/offline hadisələri); serverdə həmişə "online" sayılır
function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
