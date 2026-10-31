import type { TextsSaveBarProps } from "@/types/site";
import { Button } from "@/shared/components/Button";

// Saxlama zolağı: dəyişiklik olanda ekranın altında
export function TextsSaveBar({ count, pending, onCancel, onSave }: TextsSaveBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 shadow-[0_-8px_24px_rgba(16,24,40,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-end gap-3 px-[var(--gutter)] py-3">
        <span className="muted mr-auto text-sm">{count} mətn dəyişib</span>
        <Button type="button" onClick={onCancel} disabled={pending} variant="cancel">Ləğv et</Button>
        <Button type="button" onClick={onSave} disabled={pending} className="min-w-40">
          {pending ? "Gözləyin..." : "Yadda saxla"}
        </Button>
      </div>
    </div>
  );
}
