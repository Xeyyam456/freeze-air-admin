import type { EditorFooterProps } from "@/types/site";

// Redaktor pəncərəsinin altı: Ləğv et / Yadda saxla
export function EditorFooter({ onCancel, busy, className = "" }: EditorFooterProps) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4 ${className}`}>
      <button type="button" onClick={onCancel} className="btn btn-cancel">Ləğv et</button>
      <button type="submit" disabled={busy} className="btn btn-primary min-w-40">
        {busy ? "Gözləyin..." : "Yadda saxla"}
      </button>
    </div>
  );
}
