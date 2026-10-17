import { useSyncExternalStore } from "react";

// Next-dəki refresh() əvəzi: məlumat dəyişəndə səhifədəki bütün siyahılar yenidən yüklənir.
let version = 0;
const listeners = new Set<() => void>();

export function revalidate() {
  version += 1;
  listeners.forEach((l) => l());
}

export function useRevalidateVersion() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}
