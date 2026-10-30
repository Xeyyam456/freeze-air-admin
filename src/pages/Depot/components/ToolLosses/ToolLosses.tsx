import { Trash2 } from "lucide-react";
import type { ToolLossesProps } from "@/types/depot";
import { REASONS } from "../../constants/requests";
import { dateAz } from "../../utils/dates";
import { fmt } from "../../utils/quantity";

// Silinənlər: neçə ədəd, hansı səbəblə, nə vaxt (təsdiqlənmiş silinmə aktları)
export function ToolLosses({ losses, unit }: ToolLossesProps) {
  return (
    <div className="mt-3 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 max-sm:px-3 max-sm:py-2.5">
      <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-[#b91c1c]"><Trash2 size={15} /> Silinib</p>
      <ul className="space-y-1 text-[13px] max-sm:space-y-2 max-sm:text-xs">
        {losses.map((l, i) => (
          // Mobildə: 1-ci sətir "say · səbəb ... tarix", 2-ci sətir qeyd
          <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <b className="tabular-nums">{fmt(l.quantity ?? 0)} {unit}</b>
            <span className="text-ink/80">{l.reason === "other" ? l.note ?? "başqa səbəb" : (REASONS[l.reason ?? "other"] ?? "").toLocaleLowerCase("az")}</span>
            {l.reason !== "other" && l.note && <span className="muted min-w-0 truncate max-sm:order-last max-sm:basis-full"><span className="max-sm:hidden">· </span>{l.note}</span>}
            {l.decided_at && <span className="muted ml-auto shrink-0 text-xs">{dateAz(l.decided_at)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
