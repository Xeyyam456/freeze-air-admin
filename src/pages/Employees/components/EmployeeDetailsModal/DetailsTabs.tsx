import { ClipboardList, User } from "lucide-react";
import type { DetailsTab, DetailsTabsProps } from "@/types/employees";

// "Haqqında | İşlər" keçidi
export function DetailsTabs({ tab, onTab }: DetailsTabsProps) {
  const tabClass = (t: DetailsTab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="mt-5 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
      <button type="button" role="tab" aria-selected={tab === "about"} onClick={() => onTab("about")} className={tabClass("about")}>
        <User size={15} /> Haqqında
      </button>
      <button type="button" role="tab" aria-selected={tab === "work"} onClick={() => onTab("work")} className={tabClass("work")}>
        <ClipboardList size={15} /> İşlər
      </button>
    </div>
  );
}
