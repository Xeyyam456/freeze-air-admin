import { CalendarDays } from "lucide-react";
import type { DateTriggerProps } from "@/types/shared";

// Tarix sahəsi: təqvim ikonu + seçilmiş tarix (yoxdursa açıq-rəngli yazı)
export function Trigger({ label, placeholder, open, onClick, buttonRef, small }: DateTriggerProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`flex w-full items-center gap-2 rounded-[10px] border bg-surface px-3 text-left transition-colors ${
        small ? "h-9 text-[13px]" : "h-[42px] text-sm"
      } ${open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"}`}
    >
      <CalendarDays size={15} className="shrink-0 text-primary" />
      {label ? <span className="truncate font-semibold">{label}</span> : <span className="muted truncate">{placeholder}</span>}
    </button>
  );
}
