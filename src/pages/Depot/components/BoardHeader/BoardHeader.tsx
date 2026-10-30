import { ArrowLeft, Search, X } from "lucide-react";
import { Input } from "@/shared/components/Input";
import type { BoardHeaderProps } from "@/types/depot";
import { TAB_ICON } from "../../constants/tabIcons";
import { inStock } from "../../utils/inStock";
import { fmt } from "../../utils/quantity";
import { IconTile } from "../IconTile";

// Siyahının başlığı: ← ümumi baxış, rəngli ikon, başlıq + xülasə, axtarış; altında xətli tablar (Alətlər / Materiallar / Ustalar)
export function BoardHeader({ b, tab, onTab }: BoardHeaderProps) {
  const { counts, tDepot, tGiven, tRepair, query, setQuery } = b;
  return (
    <>
      <div className="flex flex-wrap items-center gap-3.5 p-4 max-sm:gap-x-2 max-sm:gap-y-3 max-sm:p-3 sm:p-5">
        <button type="button" onClick={() => onTab("home")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink/70 transition-colors hover:bg-bg hover:text-ink max-sm:h-8 max-sm:w-8" title="Ümumi baxış" aria-label="Ümumi baxış">
          <ArrowLeft size={18} />
        </button>
        <span className="contents max-sm:[&>span]:!h-7 max-sm:[&>span]:!w-7 max-sm:[&>span]:!rounded-lg max-sm:[&_svg]:!h-3.5 max-sm:[&_svg]:!w-3.5"><IconTile icon={TAB_ICON[tab]} tone={tab === "tool" ? "blue" : tab === "material" ? "teal" : "violet"} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight">{tab === "tool" ? "Alətlər" : tab === "material" ? "Materiallar" : "Ustalar"}</h2>
          <p className="muted truncate text-[13px] max-sm:text-[11px]">
            {tab === "tool" ? (<><span className="whitespace-nowrap">{counts.tool} növ · depoda {fmt(tDepot)}</span><span> · </span><span className="whitespace-nowrap">ustalarda {fmt(tGiven)}{tRepair ? ` · təmirdə ${tRepair}` : ""}</span></>)
              : tab === "material" ? `${counts.material} növ · depoda var ${b.mats.filter((t) => inStock(t) > 0).length}`
              : `${b.masters.length} usta · ${b.holdersCount} nəfərin üzərində əşya var`}
          </p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "people" ? "Usta axtar..." : "Ad ilə axtar..."} aria-label="Axtar"
            className="!h-10 !rounded-xl !pl-10 !text-sm" />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Təmizlə"><X size={15} /></button>
          )}
        </label>
      </div>
      <div className="flex gap-1 border-t border-line px-3 max-sm:px-1 sm:px-4" role="tablist" aria-label="Depo">
        {(["tool", "material", "people"] as const).map((v) => {
          const Icon = TAB_ICON[v];
          return (
            <button key={v} type="button" role="tab" aria-selected={tab === v} onClick={() => onTab(v)}
              className={`-mb-px inline-flex h-12 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors max-sm:min-w-0 max-sm:flex-1 max-sm:justify-center max-sm:gap-1 max-sm:px-1 max-sm:text-[12.5px] ${tab === v ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              <Icon size={16} className="max-sm:hidden" /> {v === "tool" ? "Alətlər" : v === "material" ? "Materiallar" : "Ustalar"}
              <span className={`rounded-full px-1.5 text-[11px] font-bold ${tab === v ? "bg-primary-soft text-primary" : "bg-bg text-muted"}`}>{counts[v]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
