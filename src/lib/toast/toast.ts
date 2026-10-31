import { useSyncExternalStore } from "react";

// Tost bildirişləri: istənilən yerdən toast.success("...") / toast.error("..."), <Toaster /> göstərir.
export type Toast = { id: number; kind: "success" | "error"; title: string; text?: string };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(kind: Toast["kind"], title: string, text?: string) {
  const id = nextId++;
  // Eyni mesaj artıq ekrandadırsa təkrarlanmır
  toasts = [...toasts.filter((t) => !(t.kind === kind && t.title === title)), { id, kind, title, text }].slice(-4);
  emit();
  setTimeout(() => dismissToast(id), kind === "error" ? 6000 : 4000);
}

export const toast = {
  success: (title: string, text?: string) => push("success", title, text),
  error: (title: string, text?: string) => push("error", title, text),
};

export function useToasts() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}
