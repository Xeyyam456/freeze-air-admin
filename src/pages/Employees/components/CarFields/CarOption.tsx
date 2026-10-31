import { Car } from "lucide-react";
import type { CarOptionProps } from "@/types/employees";

// "Yoxdur / Var" keçidinin bir düyməsi
export function CarOption({ on, hasCar, label, onPick }: CarOptionProps) {
  return (
    <button type="button" onClick={() => onPick(on)} aria-pressed={hasCar === on}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
        hasCar === on ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
      {on && <Car size={14} />} {label}
    </button>
  );
}
