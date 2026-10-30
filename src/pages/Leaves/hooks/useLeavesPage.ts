import { useMemo, useState } from "react";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { LeaveFilter } from "@/types/leaves";
import { useLeavesData } from "../queries/useLeavesData";
import { groupByMonth } from "../utils/groupByMonth";
import { leavesView } from "../utils/leavesView";

const FILTERS: LeaveFilter[] = ["all", "approved", "rejected", "cancelled"];

// İcazələr səhifəsinin vəziyyəti: sorğular, tarixçə süzgəci (vəziyyət + usta), aylara görə qruplar
export function useLeavesPage() {
  const data = useLeavesData();
  const [filter, setFilter] = useState<LeaveFilter>("all");
  const [who, setWho] = useState<number | null>(null);

  const view = useMemo(() => leavesView(data ?? [], todayBaku()), [data]);
  const match = (f: LeaveFilter) => view.history.filter((l) => (f === "all" || l.status === f) && (who === null || l.employee_id === who));
  const counts = Object.fromEntries(FILTERS.map((f) => [f, match(f).length])) as Record<LeaveFilter, number>;
  // Davamiyyətə təsir etməyənlər: rədd və ləğv edilənlər (toplu silinir)
  const closed = (data ?? []).filter((l) => l.status === "rejected" || l.status === "cancelled");

  return { loaded: data !== null, view, filter, setFilter, who, setWho, counts, byMonth: groupByMonth(match(filter)), closed };
}
