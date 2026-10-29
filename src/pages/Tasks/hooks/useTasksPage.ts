import { useState } from "react";
import type { AddingTarget, Task, TaskActions } from "@/types/tasks";
import { useTasksData } from "../queries/useTasksData";
import { iso } from "../utils/days";
import { useTaskGroups } from "./useTaskGroups";

// Səhifənin vəziyyəti: baxılan gün, məlumat, qruplar, açıq pəncərələr (iş qeydi, geri al, qrupu geri al, usta əlavə et)
export function useTasksPage() {
  const today = iso(new Date());
  const [day, setDay] = useState(today);
  const data = useTasksData(day);
  // Keçmiş gün bağlıdır (bazada da: 0070): geri almaq olmur, yalnız baxış
  const past = day < today;
  const [openLog, setOpenLog] = useState<number | null>(null); // görülmüş tapşırığın iş qeydi: şəkillər, akt, təmir qeydi
  const [withdrawing, setWithdrawing] = useState<Task | null>(null);
  const [withdrawingGroup, setWithdrawingGroup] = useState<Task[] | null>(null); // qrup tapşırığı bütövlükdə
  const [adding, setAdding] = useState<AddingTarget | null>(null); // qrupa usta əlavə et
  const actions: TaskActions = { past, onOpenLog: setOpenLog, onAdd: setAdding, onWithdraw: setWithdrawing, onWithdrawGroup: setWithdrawingGroup };

  return {
    today, day, setDay, data, past, actions, ...useTaskGroups(data),
    openLog, withdrawing, withdrawingGroup, adding,
    closeLog: () => setOpenLog(null),
    closeWithdraw: () => setWithdrawing(null),
    closeWithdrawGroup: () => setWithdrawingGroup(null),
    closeAdd: () => setAdding(null),
  };
}
