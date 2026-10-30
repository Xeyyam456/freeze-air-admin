import { Hourglass } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { LeavesSummaryProps } from "@/types/leaves";
import { personOf } from "../../utils/personOf";

// Tünd xülasə: gözləyən sorğu, bu gün icazəli (üzlər), qarşıdakı, tarixçədə
export function LeavesSummary({ view }: LeavesSummaryProps) {
  return (
    <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-5 text-white max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-3 max-sm:px-4 max-sm:py-3.5">
      <div className="flex items-center gap-4 max-sm:order-1 max-sm:gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost max-sm:hidden"><Hourglass size={26} className="max-sm:!h-5 max-sm:!w-5" /></span>
        <div>
          <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-white/50 max-sm:text-[10.5px]">Gözləyən sorğu</p>
          <p className="text-2xl font-extrabold leading-tight">{view.pending.length}</p>
        </div>
      </div>
      <dl className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-3 max-sm:contents">
        <div className="max-sm:order-3">
          <dt className="text-xs text-white/55 max-sm:text-[10.5px]">Bu gün icazəli</dt>
          <dd className="flex items-center gap-2 text-2xl font-extrabold tabular-nums max-sm:text-xl">
            {view.now.length}
            {view.now.length > 0 && (
              <span className="flex -space-x-2">
                {view.now.slice(0, 4).map((l) => <Avatar key={l.id} employee={personOf(l)} className="!h-7 !w-7 !text-[9px] !shadow-none ring-2 ring-[#0b1324]" />)}
              </span>
            )}
          </dd>
        </div>
        <div className="max-sm:order-4 max-sm:text-right"><dt className="text-xs text-white/55 max-sm:text-[10.5px]">Qarşıdakı icazə</dt><dd className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{view.upcoming.length}</dd></div>
        <div className="max-sm:order-2 max-sm:self-center max-sm:text-right"><dt className="text-xs text-white/55 max-sm:text-[10.5px]">Tarixçədə</dt><dd className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{view.history.length}</dd></div>
      </dl>
    </section>
  );
}
