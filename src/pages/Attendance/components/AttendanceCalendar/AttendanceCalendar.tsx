import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { AttendanceCalendarProps } from "@/types/attendance";
import { useEmployeeMonth } from "../../queries/useEmployeeMonth";
import { CalendarGrid } from "../CalendarGrid";
import { CalendarHead } from "../CalendarHead";
import { CalendarNav } from "../CalendarNav";
import { CalendarSummary } from "../CalendarSummary";
import { HoursList } from "../HoursList";

// Ustanın ay üzrə davamiyyət təqvimi: hər iş günü rəngli xana (işdə ✓ + gəlmə/getmə saatı), ay oxları, xülasə.
// Realtime ilə yenilənir (attendance, leave_requests).
export function AttendanceCalendar({ employeeId, name, onClose }: AttendanceCalendarProps) {
  const thisMonth = todayBaku().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const current = useEmployeeMonth(employeeId, month);
  const [y, m] = month.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // bazar ertəsindən başlayan həftə

  return (
    <Modal onClose={onClose} labelledBy="att-cal-title" className="!max-w-3xl">
      <CalendarHead month={month} name={name} employeeId={employeeId} onClose={onClose} />
      {/* Solda təqvim və xülasə, sağda gün-gün gəlmə/getmə saatları (dar ekranda alt-alta) */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <CalendarNav month={month} thisMonth={thisMonth} onMonth={setMonth} />
          <CalendarGrid days={current?.days ?? null} lead={lead} />
          {current && <CalendarSummary summary={current.summary} />}
        </div>
        <HoursList days={current?.days ?? null} />
      </div>
    </Modal>
  );
}
