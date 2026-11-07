import { Camera, FileText } from "lucide-react";
import type { FeedGroup, FeedTabsProps } from "@/types/feed";

const TABS: { group: FeedGroup; label: string; icon: typeof Camera }[] = [
  { group: "work", label: "Görülən işlər", icon: Camera },
  { group: "act", label: "Aktlar", icon: FileText },
];

// Qrup seçimi (mobildəki "Qruplar" siyahısı əvəzinə iki tab): ad + paylaşım sayı
export function FeedTabs({ group, onChange, counts }: FeedTabsProps) {
  return (
    <div role="tablist" className="flex gap-2">
      {TABS.map(({ group: g, label, icon: Icon }) => {
        const on = g === group;
        return (
          <button key={g} type="button" role="tab" aria-selected={on} onClick={() => onChange(g)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${on ? "border-primary/50 bg-primary/15 text-primary" : "border-line bg-surface text-muted hover:bg-surface-2"}`}>
            <Icon size={16} />{label}
            {counts[g] !== null && <span className={`rounded-full px-2 py-px text-xs font-extrabold ${on ? "bg-primary text-white" : "bg-surface-2"}`}>{counts[g]}</span>}
          </button>
        );
      })}
    </div>
  );
}
