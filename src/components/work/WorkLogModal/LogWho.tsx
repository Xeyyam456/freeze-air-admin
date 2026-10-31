import { CalendarDays, Clock } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/shared/components/Avatar";
import type { LogPartProps } from "@/types/workLogs";
import { dateOf, timeOf } from "./time";

// Usta (qrup işində bütün üzvlər) və vaxt: iş günü + əlavə olunma tarixi və saatı
export function LogWho({ log }: LogPartProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-bg p-4">
      {log.members.length > 1 ? (
        <>
          <div className="flex shrink-0 -space-x-3">
            {log.members.map((m) => <Avatar key={m.full_name} employee={{ full_name: m.full_name, photo_url: m.photo_url }} className="!h-12 !w-12 !text-sm ring-2 ring-bg" />)}
          </div>
          <div className="min-w-[9rem] flex-1">
            {/* Hər usta öz sətrində: uzun adlar sözbəsöz sınmasın */}
            <p className="font-semibold leading-snug">{log.members.map((m) => <span key={m.full_name} className="block">{m.full_name}</span>)}</p>
            <p className="muted whitespace-nowrap text-sm">Qrup işi · {log.members.length} usta</p>
          </div>
        </>
      ) : (
        <>
          <Avatar employee={{ full_name: log.employees?.full_name ?? "?", photo_url: log.employees?.photo_url ?? null }} className="!h-12 !w-12 !text-sm" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{log.employees?.full_name ?? "—"}</p>
            <p className="muted text-sm">{log.employees?.specialty ?? "Usta"}</p>
          </div>
        </>
      )}
      <div className="grid gap-1 text-right text-sm max-sm:basis-full max-sm:border-t max-sm:border-line max-sm:pt-2.5 max-sm:text-left">
        <span className="flex items-center justify-end gap-1.5 font-semibold max-sm:justify-start"><CalendarDays size={14} className="text-primary" /> {formatDateAz(log.work_date)}</span>
        <span className="muted flex items-center justify-end gap-1.5 text-xs max-sm:justify-start">
          <Clock size={13} /> Əlavə edilib: {dateOf(log.created_at)}, {timeOf(log.created_at)}
        </span>
      </div>
    </div>
  );
}
