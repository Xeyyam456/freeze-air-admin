
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  pending?: boolean;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ open, title, message, confirmLabel, tone = "primary", pending, icon, onConfirm, onCancel }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    // capture: təsdiq modalı başqa modalın içində açılıbsa, Esc yalnız onu bağlasın, altdakını yox.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (!pending) onCancel();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, pending, onCancel]);

  if (!open) return null;

  const Icon = icon ?? (tone === "danger" ? TriangleAlert : CircleCheck);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !pending && onCancel()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary"
        }`}>
          <Icon size={24} />
        </span>
        <h2 id="confirm-title" className="mt-4 text-lg font-bold">{title}</h2>
        <div className="muted mt-1 text-sm">{message}</div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} disabled={pending} className="btn btn-cancel flex-1">
            Ləğv et
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={pending}
            className={`btn flex-1 ${tone === "danger" ? "btn-danger" : "btn-primary"}`}>
            {pending ? "Gözləyin..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
