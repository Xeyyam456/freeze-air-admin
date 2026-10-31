import type { EditorFooterProps } from "@/types/site";
import { Button } from "@/shared/components/Button";

// Redaktor pəncərəsinin altı: Ləğv et / Yadda saxla
export function EditorFooter({ onCancel, busy, className = "" }: EditorFooterProps) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4 ${className}`}>
      <Button type="button" onClick={onCancel} variant="cancel">Ləğv et</Button>
      <Button type="submit" disabled={busy} className="min-w-40">
        {busy ? "Gözləyin..." : "Yadda saxla"}
      </Button>
    </div>
  );
}
