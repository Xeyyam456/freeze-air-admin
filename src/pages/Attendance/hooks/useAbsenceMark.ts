import { useState } from "react";
import { toast } from "@/lib/toast";
import { markAbsence } from "@/services/attendance/markAbsence";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { AttendanceEmployee } from "@/types/attendance";

// Admin bu gün gəlməyən ustanı "İşdə olmayıb" qeyd edir / geri alır
export function useAbsenceMark() {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function mark(e: AttendanceEmployee, absent: boolean) {
    setBusyId(e.id);
    const error = await markAbsence(e.id, todayBaku(), absent);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(absent ? `${e.full_name}: bu gün işdə olmayıb` : `${e.full_name}: qeyd geri alındı`);
  }

  return { busyId, mark };
}
