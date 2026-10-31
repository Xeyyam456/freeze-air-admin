import { Fuel } from "lucide-react";
import type { FuelTypeFieldProps } from "@/types/employees";

// Yanacaq növü (0079): hesab bu növün qiyməti ilə aparılır, ona görə maşın varsa mütləq seçilir (standart benzin)
export function FuelTypeField({ value, onChange }: FuelTypeFieldProps) {
  return (
    <div>
      <span className="label">Yanacaq</span>
      <input type="hidden" name="fuel_type" value={value} />
      <div className="flex h-[42px] gap-1 rounded-xl bg-bg p-1" role="radiogroup" aria-label="Yanacaq növü">
        {(["petrol", "diesel"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={value === k} onClick={() => onChange(k)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
              value === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            <Fuel size={14} className={value === k ? (k === "diesel" ? "text-amber-600" : "text-primary") : ""} /> {k === "petrol" ? "Benzin" : "Dizel"}
          </button>
        ))}
      </div>
    </div>
  );
}
