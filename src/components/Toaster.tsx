import { CircleAlert, CircleCheck, X } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/toast";

// Ekranın sağ aşağı küncündə tost bildirişləri (App-də bir dəfə qoyulur).
// z-[200]: modalın fonundan (z-index 100) yuxarıdadır; əks halda modal içindəki əməliyyatların (alət vermək və s.) tostu fonun arxasında qalır.
export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(380px,calc(100vw-40px))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
          className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-[0_12px_32px_rgba(16,24,40,0.16)]">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${t.kind === "error" ? "bg-danger-soft text-danger" : "bg-ok-soft text-ok"}`}>
            {t.kind === "error" ? <CircleAlert size={17} /> : <CircleCheck size={17} />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.text && <p className="mt-0.5 text-xs text-muted">{t.text}</p>}
          </div>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Bağla"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
