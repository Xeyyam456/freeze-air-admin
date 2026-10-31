import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { addTask } from "@/services/tasks/tasks";
import type { Place } from "@/types/workLogs";
import { loadPlaces } from "@/services/workLogs/places";

// "Yeni tapşırıq" formu: usta(lar), tarix, yer, səbəb. Göndərəndən sonra usta və tarix qalır, yer və səbəb təmizlənir
export function useTaskForm(day: string, today: string, onDay: (day: string) => void) {
  const [employeeIds, setEmployeeIds] = useState<number[]>([]); // bir neçə = qrup tapşırığı
  const [taskDate, setTaskDate] = useState(today);
  const [place, setPlace] = useState<Place | null>(null);
  const [reason, setReason] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [pending, setPending] = useState(false);
  useEffect(() => { loadPlaces().then(setPlaces); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeIds.length) return toast.error("Ustanı seç.");
    if (!place) return toast.error("Yeri seç.");
    if (!reason.trim()) return toast.error("Səbəbi yaz.");
    if (taskDate < today) return toast.error("Keçmiş günə tapşırıq verilmir.");
    setPending(true);
    const ok = await addTask({
      employee_ids: employeeIds, task_date: taskDate,
      store_id: place.storeId, company_id: place.companyId, place_text: place.custom, reason,
    });
    setPending(false);
    if (ok) {
      // Eyni usta (qrup) üçün ardıcıl tapşırıq yazmaq rahat olsun: usta və tarix qalır, yer və səbəb təmizlənir
      setPlace(null);
      setReason("");
      if (taskDate !== day) onDay(taskDate);
    }
  }

  return { employeeIds, setEmployeeIds, taskDate, setTaskDate, place, setPlace, reason, setReason, places, pending, submit };
}
