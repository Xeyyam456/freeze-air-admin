import type { TextsSaveBarProps } from "@/types/site";

// Saxlama zolağı: dəyişiklik olanda ekranın altında
export function TextsSaveBar({ count, pending, onCancel, onSave }: TextsSaveBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 shadow-[0_-8px_24px_rgba(16,24,40,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-end gap-3 px-[var(--gutter)] py-3">
        <span className="muted mr-auto text-sm">{count} mətn dəyişib</span>
        <button type="button" onClick={onCancel} disabled={pending} className="btn btn-cancel">Ləğv et</button>
        <button type="button" onClick={onSave} disabled={pending} className="btn btn-primary min-w-40">
          {pending ? "Gözləyin..." : "Yadda saxla"}
        </button>
      </div>
    </div>
  );
}
