import { CalendarCheck, CalendarX, Undo2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { TodayCellProps } from "@/types/attendance";

// "Bu gün" xanası: vəziyyət nişanı; admin üçün bu gün gəlməyəni "İşdə olmayıb" qeyd etmək / geri almaq
export function TodayCell({ employee, summary, badge, canMark, busy, onMark }: TodayCellProps) {
  if (!badge) return <span className="muted inline-flex items-center gap-1 text-xs"><CalendarCheck size={13} /> Təqvim</span>;
  const pill = <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>{badge.text}</span>;
  const status = summary?.today.status;
  if (!canMark || (status !== "pending" && status !== "absent")) return pill;

  return (
    <span className="inline-flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
      {pill}
      {status === "pending" ? (
        <Button variant="soft" size="sm" disabled={busy} onClick={() => onMark(employee, true)} className="!h-7 !px-2 text-xs text-danger" title="Bu gün işə gəlməyib: gəlmədi sayılsın">
          <CalendarX size={13} /> İşdə olmayıb
        </Button>
      ) : (
        <Button variant="soft" size="sm" disabled={busy} onClick={() => onMark(employee, false)} className="!h-7 !px-2 text-xs" title="Qeydi geri al">
          <Undo2 size={13} /> Geri al
        </Button>
      )}
    </span>
  );
}
