import type { PanelTab, PanelTabsProps } from "@/types/errorCodes";

const TABS: readonly (readonly [PanelTab, string])[] = [["models", "Modellər"], ["code", "Xəta kodu"], ["excel", "Excel"]];

export function PanelTabs({ tab, onTab }: PanelTabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-bg p-1" role="tablist">
      {TABS.map(([k, label]) => (
        <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => onTab(k)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${tab === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
