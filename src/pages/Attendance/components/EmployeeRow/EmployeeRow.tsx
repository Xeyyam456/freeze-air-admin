import type { EmployeeRowProps } from "@/types/attendance";
import { PersonPhoto } from "../PersonPhoto";

const dash = <span className="muted">—</span>;

// Cədvəl sətri: usta + aylıq göstəricilər + bu gün xanası
export function EmployeeRow({ employee: e, summary: a, isMe, cell, onOpen }: EmployeeRowProps) {
  return (
    <tr onClick={() => onOpen(e)} className={`cursor-pointer border-b border-line last:border-b-0 transition-colors hover:bg-primary-soft/40 ${isMe ? "bg-primary-soft/30" : ""}`}>
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-3">
          <PersonPhoto employee={e} className="h-9 w-9" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 font-semibold">
              <span className="truncate">{e.full_name}</span>
              {isMe && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
            </span>
            <span className="muted block truncate text-xs">{e.specialty ?? ""}</span>
          </span>
        </span>
      </td>
      <td className="px-2 py-2.5 text-center font-semibold tabular-nums">{a?.workdays ?? "…"}</td>
      <td className="px-2 py-2.5 text-center tabular-nums"><b className="text-ok">{a?.present ?? "…"}</b> <span className="muted text-xs">gün</span></td>
      <td className="px-2 py-2.5 text-center tabular-nums">
        {a?.leaveTimes ? <><b className="text-violet-600">{a.leaveTimes}</b> <span className="muted text-xs">dəfə · {a.leave} gün</span></> : dash}
      </td>
      <td className="px-2 py-2.5 text-center tabular-nums">{a?.absent ? <><b className="text-danger">{a.absent}</b> <span className="muted text-xs">gün</span></> : dash}</td>
      <td className="px-2 py-2.5 text-center tabular-nums">{a && a.leave + a.absent ? <><b className="text-ink">{a.leave + a.absent}</b> <span className="muted text-xs">gün</span></> : dash}</td>
      <td className="px-2 py-2.5 text-center tabular-nums">{a?.extra ? <><b className="text-slate-600">{a.extra}</b> <span className="muted text-xs">dəfə</span></> : dash}</td>
      <td className="px-4 py-2.5 text-right">{cell}</td>
    </tr>
  );
}
