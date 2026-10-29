import { useMemo, useState } from "react";
import { fetchGroupMap, mergeGroupLogs } from "@/lib/jobs";
import { useData } from "@/lib/useData";
import { fetchFilters, fetchLogs } from "@/services/workLogs/fetchLogs";
import { norm } from "@/shared/utils/norm";
import { companyOf, placeOf, range } from "../utils/logs";
import { useLogGroups } from "./useLogGroups";

// Səhifənin vəziyyəti: aralıq, süzgəclər, məlumat, süzülmüş siyahı (qrup işi bir sətir), günlər, xülasə
export function useWorkLogsPage() {
  const [{ from, to }, setRange] = useState(range("month"));
  const [employeeId, setEmployeeId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [query, setQuery] = useState("");
  const [openLog, setOpenLog] = useState<number | null>(null);

  const filters = useData("worklog-filters", fetchFilters);
  const logs = useData("worklogs", () => fetchLogs(from, to), [from, to]);
  const groupMap = useData("group-map-range", () => fetchGroupMap(from, to), [from, to]);

  // Qrup işi bir sətir (adlar birləşir); ustaların sayı isə hamısından
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return (logs ?? []).filter((l) =>
      (!employeeId || l.employee_id === Number(employeeId)) &&
      (!companyId || companyOf(l) === Number(companyId)) &&
      (!q || [l.employees?.full_name, placeOf(l), l.description].some((v) => norm(v).includes(q))));
  }, [logs, employeeId, companyId, query]);
  const list = useMemo(() => mergeGroupLogs(filtered, groupMap), [filtered, groupMap]);

  const stats = useMemo(() => ({
    days: new Set(list.map((l) => l.work_date)).size,
    masters: new Set(filtered.map((l) => l.employee_id)).size,
    places: new Set(list.map(placeOf)).size,
  }), [list, filtered]);

  return {
    from, to, setRange, employeeId, setEmployeeId, companyId, setCompanyId, query, setQuery, openLog, setOpenLog,
    filters, logs, list, stats, ...useLogGroups(logs, list, groupMap),
    setFrom: (v: string) => setRange((r) => ({ from: v, to: v > r.to ? v : r.to })),
    setTo: (v: string) => setRange((r) => ({ from: v < r.from ? v : r.from, to: v })),
  };
}
