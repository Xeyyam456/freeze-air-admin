import { Fuel } from "lucide-react";
import type { PricesBarProps } from "@/types/fuel";
import { savePrice } from "../../queries/mutations";
import { FUEL_TYPES } from "../../shared/fuelTypes";
import { NumberSave } from "../NumberSave";
import { Card } from "@/shared/components/Card";

// Hazırkı qiymətlər (benzin, dizel): yeni bağlanan günlər bununla hesablanır, köhnələr dəyişmir
export function PricesBar({ prices }: PricesBarProps) {
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 !py-3 max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-2 max-sm:!p-3">
      <span className="flex items-center gap-2 text-sm font-bold max-sm:col-span-2 max-sm:text-[13px]"><Fuel size={16} className="text-primary" /> Yanacaq qiymətləri</span>
      {(["petrol", "diesel"] as const).map((k) => (
        <label key={k} className="flex min-w-0 items-center justify-between gap-2 text-sm max-sm:text-[13px] max-[400px]:flex-col max-[400px]:items-start max-[400px]:gap-1">
          <span className="muted font-semibold">{FUEL_TYPES[k]}</span>
          <NumberSave key={String(prices[k])} value={prices[k]} suffix="₼ / L" placeholder={k === "petrol" ? "1.00" : "1.10"} onSave={(v) => savePrice(k, v)} />
        </label>
      ))}
      <span className="muted ml-auto text-xs max-sm:col-span-2 max-sm:ml-0 max-sm:whitespace-nowrap max-sm:text-[11px] max-[360px]:text-[10px]">Qiymət dəyişəndə köhnə günlərin məbləği dəyişmir</span>
    </Card>
  );
}
