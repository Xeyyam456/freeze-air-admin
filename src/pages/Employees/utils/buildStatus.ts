import { timeBaku } from "@/shared/utils/timeBaku";
import type { AttendanceStub, Employee, PersonStatus } from "@/types/employees";

// Bu günkü vəziyyət: işdədir (açıq seans) → işi bitirib → icazəli → bazar → hələ gəlməyib
export function buildStatus(employees: Employee[], attendance: AttendanceStub[], leaves: { employee_id: number }[], today: string) {
  const sunday = new Date(`${today}T12:00:00Z`).getUTCDay() === 0;
  const onLeave = new Set(leaves.map((l) => l.employee_id));
  const status: Record<number, PersonStatus> = {};
  for (const e of employees) {
    const rows = attendance.filter((a) => a.employee_id === e.id).sort((a, b) => a.checked_in_at.localeCompare(b.checked_in_at));
    const open = rows.find((a) => !a.checked_out_at);
    if (open) status[e.id] = { kind: "in", text: `İşdədir · ${timeBaku(rows[0].checked_in_at)}-dən` };
    else if (rows.length) status[e.id] = { kind: "done", text: `İşi bitirib · ${timeBaku(rows.at(-1)!.checked_out_at!)}` };
    else if (onLeave.has(e.id)) status[e.id] = { kind: "leave", text: "İcazəlidir" };
    else status[e.id] = { kind: "none", text: sunday ? "Bazar günü" : "Hələ gəlməyib" };
  }
  return status;
}
