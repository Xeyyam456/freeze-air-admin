import type { EmployeeCardProps } from "@/types/attendance";
import { PersonPhoto } from "../PersonPhoto";

// Usta kartı (< 1280): ad, ixtisas, 4 göstərici (İşdə, İcazə, İcazəsiz, Bazar), bu gün
export function EmployeeCard({ employee: e, summary: a, isMe, cell, onOpen }: EmployeeCardProps) {
  const cells: [string, React.ReactNode, string][] = [
    ["İşdə", a?.present ?? "…", "text-ok"],
    ["İcazə", a?.leaveTimes ? a.leave : "—", "text-violet-600"],
    ["İcazəsiz", a?.absent || "—", a?.absent ? "text-danger" : "text-muted"],
    ["Bazar", a?.extra || "—", "text-slate-600"],
  ];

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(e)} onKeyDown={(ev) => ev.key === "Enter" && onOpen(e)}
      className={`card grow basis-[250px] cursor-pointer !p-3.5 transition-colors min-[1000px]:basis-[300px] hover:bg-primary-soft/30 ${isMe ? "ring-2 ring-primary/30" : ""}`}>
      <div className="flex items-center gap-3">
        <PersonPhoto employee={e} className="h-10 w-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-semibold">
            <span className="truncate">{e.full_name}</span>
            {isMe && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
          </span>
          <span className="muted block truncate text-xs">{e.specialty ?? ""}{a ? `${e.specialty ? " · " : ""}${a.workdays} iş günü` : ""}</span>
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {cells.map(([l, v, c]) => (
          <span key={l} className="min-w-0 rounded-xl bg-bg px-1.5 py-1.5 text-center">
            <span className="muted block whitespace-nowrap text-[11px] font-semibold">{l}</span>
            <b className={`block text-[15px] tabular-nums ${v === "—" ? "text-muted" : c}`}>{v}</b>
          </span>
        ))}
      </div>
      {cell && <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-2.5">{cell}</div>}
    </div>
  );
}
