import { LogIn, LogOut } from "lucide-react";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import { sessionNo } from "@/shared/utils/attendance/sessionNo";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { HoursRowProps } from "@/types/attendance";
import { fullDate, weekdayName } from "../../utils/dates";

// Bir gün: tarix + hər seans ayrıca sətirdə (işi bitirib yenidən işə çıxıbsa bir neçə gəlmə – getmə)
export function HoursRow({ day, presence: p }: HoursRowProps) {
  return (
    <li className="flex items-center gap-3 px-3 py-2 max-sm:px-2.5 max-sm:py-1.5">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold tabular-nums max-sm:text-xs">{fullDate(day)}</span>
        <span className="muted block text-[11px]">{weekdayName(day)}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 max-sm:gap-0.5" title={presenceText(p)}>
        {p.sessions.map((x, i) => (
          <span key={x.in} className="flex items-center gap-1.5">
            {p.sessions.length > 1 && <span className="muted w-5 text-right text-xs font-bold tabular-nums">{sessionNo(i, p.sessions.length).trim()}</span>}
            <span className="flex items-center gap-1 rounded-lg bg-ok-soft px-2 py-1 text-xs font-bold tabular-nums text-ok max-sm:px-1 max-sm:py-0.5 max-sm:text-[11px] max-[360px]:text-[10.5px]" title="Gəlmə saatı">
              <LogIn size={12} /> {timeBaku(x.in)}
            </span>
            {x.out ? (
              <span className="flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-xs font-bold tabular-nums max-sm:px-1 max-sm:py-0.5 max-sm:text-[11px] max-[360px]:text-[10.5px]" title="Getmə saatı">
                <LogOut size={12} /> {timeBaku(x.out)}
              </span>
            ) : (
              <span className="rounded-lg bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">hələ işdədir</span>
            )}
          </span>
        ))}
      </span>
    </li>
  );
}
