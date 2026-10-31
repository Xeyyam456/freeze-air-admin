import type { ButtonsProps } from "@/types/shared";

export function Buttons({ pending, label, onCancel }: ButtonsProps) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" disabled={pending} className="btn btn-primary min-w-0 flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">
        {pending ? "Gözləyin..." : label}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="btn btn-cancel max-sm:min-w-0 max-sm:flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">Ləğv et</button>
      )}
    </div>
  );
}
