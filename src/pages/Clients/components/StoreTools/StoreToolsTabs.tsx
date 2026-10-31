import { FileSpreadsheet, Plus } from "lucide-react";
import type { StoreToolsTab, StoreToolsTabsProps } from "@/types/clients";

// "Yeni filial/mağaza | Excel-dən yüklə" keçidi
export function StoreToolsTabs({ tab, onTab, unit }: StoreToolsTabsProps) {
  const tabClass = (t: StoreToolsTab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="mb-4 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
      <button type="button" role="tab" aria-selected={tab === "single"} onClick={() => onTab("single")} className={tabClass("single")}>
        <Plus size={16} /> Yeni {unit}
      </button>
      <button type="button" role="tab" aria-selected={tab === "excel"} onClick={() => onTab("excel")} className={tabClass("excel")}>
        <FileSpreadsheet size={16} /> Excel-dən yüklə
      </button>
    </div>
  );
}
