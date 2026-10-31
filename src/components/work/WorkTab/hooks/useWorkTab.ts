import { useCallback, useEffect, useState } from "react";
import { revalidate } from "@/lib/revalidate";
import { deleteEmployeeLog, fetchEmployeeLogs, myEmployeeId } from "@/services/workLogs/employeeLogs";
import type { EmployeeLog } from "@/types/workLogs";

// Yerli tarix "YYYY-MM-DD"; offset gün qədər irəli/geri (dünən: -1)
export function dayIso(offset = 0, from?: string) {
  const d = from ? new Date(`${from}T12:00:00`) : new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Ustanın işlər tabının vəziyyəti: gün, işlər, kimin nə edə biləcəyi, silmə
export function useWorkTab(employeeId: number) {
  // Standart olaraq bu günün işləri; dünən və daha əvvəlki günləri seçmək olur
  const [day, setDay] = useState(() => dayIso());
  const [logs, setLogs] = useState<EmployeeLog[] | null>(null);
  const [myId, setMyId] = useState<number | null>(null);

  // İş dəyişəndə həm bu siyahı, həm də kartdakı "bu gün" sayı yenilənir
  const load = useCallback(async () => {
    setLogs(await fetchEmployeeLogs(employeeId, day));
    revalidate();
  }, [employeeId, day]);

  useEffect(() => {
    let cancelled = false;
    fetchEmployeeLogs(employeeId, day).then((list) => {
      if (!cancelled) setLogs(list);
    });
    return () => {
      cancelled = true; // gün tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [employeeId, day]);

  useEffect(() => {
    myEmployeeId().then(setMyId);
  }, []);

  const today = dayIso();
  function changeDay(value: string) {
    if (!value || value > today) return;
    setLogs(null); // yeni gün yüklənənə qədər "Yüklənir..."
    setDay(value);
  }

  async function remove(log: EmployeeLog) {
    await deleteEmployeeLog(log);
    await load();
  }

  // Yeni işi yalnız usta özü üçün açır; admin iş açmır, yalnız görür və silir. İşi yalnız ustanın özü redaktə edir (bazada da: 0088)
  return { day, logs, today, yesterday: dayIso(-1), load, changeDay, remove, canAdd: myId === employeeId, isMine: (log: EmployeeLog) => myId === log.employee_id };
}
