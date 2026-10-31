import { CalendarClock } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { SoonSectionProps } from "@/types/leaves";
import { personOf } from "../../utils/personOf";

// Bu gün icazədə olanlar və qarşıdakı təsdiqli icazələr
export function SoonSection({ now, upcoming }: SoonSectionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><CalendarClock size={18} className="text-primary" /> Bu gün və qarşıda</h2>
      <ul className="card divide-y divide-line !p-0">
        {[...now, ...upcoming].map((l) => (
          <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar employee={personOf(l)} className="!h-9 !w-9 shrink-0 !text-[11px] !shadow-none" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm"><span className="font-bold">{l.employees?.full_name ?? "—"}</span>
                <span className="ml-2 font-semibold text-primary">{leaveRange(l)}</span><span className="muted"> · {leaveWorkdays(l)} iş günü</span></p>
              <p className="muted truncate text-xs">{l.reason || "Səbəb yazılmayıb"}</p>
            </div>
            {now.includes(l)
              ? <span className="shrink-0 rounded-full bg-[#fff6e5] px-2.5 py-1 text-xs font-semibold text-amber-700">İndi icazədədir</span>
              : <span className="shrink-0 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-semibold text-ok">Təsdiqləndi</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
