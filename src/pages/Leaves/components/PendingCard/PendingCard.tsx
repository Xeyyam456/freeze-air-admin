import { Check, X } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Button } from "@/shared/components/Button";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { PendingCardProps } from "@/types/leaves";
import { personOf } from "../../utils/personOf";
import { stamp } from "../../utils/stamp";

// Gözləyən sorğu kartı: tarix, səbəb, ustanın bu il təsdiqlənmiş icazə günü, Təsdiqlə / Rədd et
export function PendingCard({ leave: l, used, onDecide }: PendingCardProps) {
  return (
    <li className="card flex min-w-0 grow basis-[420px] flex-col gap-3 !p-4">
      <div className="flex items-center gap-3">
        <Avatar employee={personOf(l)} className="!h-12 !w-12 shrink-0 !text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{l.employees?.full_name ?? "—"}</p>
          <p className="muted text-xs">Göndərilib: {stamp(l.created_at)}</p>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">Gözləyir</span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="rounded-xl bg-bg px-3 py-2">
          <p className="muted text-[11px] font-semibold uppercase tracking-wide">Tarix</p>
          <p className="font-extrabold text-primary">{leaveRange(l)}</p>
          <p className="muted text-xs">{leaveWorkdays(l)} iş günü</p>
        </div>
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted text-[11px] font-semibold uppercase tracking-wide">Səbəb</p>
          <p className="line-clamp-2 text-sm">{l.reason || <span className="muted">Səbəb yazılmayıb</span>}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="muted mr-auto text-xs">Bu il təsdiqlənib: <b className="text-ink">{used} gün</b></span>
        <Button variant="soft" size="sm" onClick={() => onDecide(l.id, false)}><X size={14} /> Rədd et</Button>
        <Button variant="primary" size="sm" onClick={() => onDecide(l.id, true)}><Check size={14} /> Təsdiqlə</Button>
      </div>
    </li>
  );
}
