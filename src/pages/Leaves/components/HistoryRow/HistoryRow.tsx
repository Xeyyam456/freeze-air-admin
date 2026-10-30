import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Avatar } from "@/components/employees/EmployeeForms";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { HistoryRowProps } from "@/types/leaves";
import { personOf } from "../../utils/personOf";
import { stamp } from "../../utils/stamp";
import { statusOf } from "../../utils/statusOf";

// Tarixçə sətri: rəngli zolaq, usta, tarix, səbəb, vəziyyət, sil
export function HistoryRow({ leave: l, onRemove }: HistoryRowProps) {
  const st = statusOf(l.status);
  return (
    <li className="flex items-stretch overflow-hidden">
      <span className={`w-1 shrink-0 ${st.bar}`} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 max-sm:gap-2 max-sm:px-2.5">
        <Avatar employee={personOf(l)} className="!h-9 !w-9 shrink-0 !text-[11px] !shadow-none max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm max-sm:whitespace-normal max-sm:text-[13px] max-sm:leading-tight">
            <span className="font-bold max-sm:block">{l.employees?.full_name ?? "—"}</span>
            <span className="ml-2 font-semibold text-primary max-sm:ml-0">{leaveRange(l)}</span>
            <span className="muted"> · {leaveWorkdays(l)} iş günü</span>
          </p>
          <p className="muted truncate text-xs max-sm:whitespace-normal max-sm:text-[11px] max-sm:leading-snug">{l.reason || "Səbəb yazılmayıb"} · {stamp(l.created_at)}{l.decided_at && ` → ${stamp(l.decided_at)}`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 max-sm:flex-col max-sm:items-end max-sm:gap-1">
          <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold max-sm:px-2 max-sm:py-0.5 max-sm:text-[11px] ${st.cls}`}>{st.text}</span>
          <ConfirmButton onConfirm={() => onRemove([l.id])} success={false} className="icon-btn icon-btn-danger !h-8 !w-8 shrink-0" title="Sorğunu sil"
            question={l.status === "approved"
              ? `${l.employees?.full_name ?? "Usta"}: ${leaveRange(l)} təsdiqlənmiş icazəsi silinəcək. Bu günlər davamiyyətdə "gəlmədi" sayılacaq.`
              : "Sorğu silinəcək. Davamiyyətə təsir etmir."}>
            <Trash2 size={15} />
          </ConfirmButton>
        </div>
      </div>
    </li>
  );
}
