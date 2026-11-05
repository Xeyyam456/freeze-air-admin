import { useMemo, useState } from "react";
import { useData } from "@/lib/useData";
import { fetchFlowRaw } from "@/services/dashboard/fetchFlowRaw";
import { todayBaku } from "@/shared/utils/todayBaku";
import { buildFlow } from "../utils/buildFlow";
import { shiftDay } from "../utils/shiftDay";
import { toFlowEvents } from "../utils/toFlowEvents";

// "Günün axını": seçilmiş gün (standart bu gün) + 14 günlük pəncərənin məlumatı
export function useFlow() {
  const today = todayBaku();
  const [day, setDay] = useState(today);
  const raw = useData("dashboard-flow", () => fetchFlowRaw(shiftDay(day, -13), day), [day]);
  const data = useMemo(() => (raw ? buildFlow(toFlowEvents(raw), day, today) : null), [raw, day, today]);

  return {
    day,
    today,
    data,
    shift: (delta: number) => setDay((d) => (shiftDay(d, delta) > today ? d : shiftDay(d, delta))),
    goToday: () => setDay(today),
  };
}
