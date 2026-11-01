import type { PersonBandProps } from "@/types/employees";
import { BANDS } from "./constants";

// Kartın tünd zolağı: solda nişan, sağ küncdə düymələr (kliki karta keçmir)
export function PersonBand({ id, badge, actions }: PersonBandProps) {
  return (
    <div className={`relative h-12 shrink-0 ${BANDS[id % BANDS.length]}`}>
      {badge && <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>}
      {actions && (
        <div className="absolute right-2 top-2 flex items-center gap-1 [&_button]:text-white/75 [&_button:hover]:bg-white/15 [&_button:hover]:text-white"
          onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}
