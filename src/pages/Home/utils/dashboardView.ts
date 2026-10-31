import { countJobs, mergeGroupLogs } from "@/lib/jobs";
import type { fetchDashboardRaw } from "@/services/dashboard/fetchDashboardRaw";
import { isLowStock } from "@/pages/Depot/utils/stock";
import { crewCards } from "./crewCards";
import { mergeGroups } from "./mergeGroups";

type Raw = Awaited<ReturnType<typeof fetchDashboardRaw>>;

// Xam məlumatdan panelin göstərdiyi say, siyahı və kartlar
export function dashboardView(r: Raw) {
  const masters = r.employees.filter((e) => !e.is_management);
  const todayCount: Record<number, number> = {};
  for (const l of r.todayLogs) todayCount[l.employee_id] = (todayCount[l.employee_id] ?? 0) + 1;

  return {
    companies: r.companies, branches: r.branches, markets: r.markets, shops: r.shops,
    tools: r.toolRows.reduce((s, t) => ({ total: s.total + t.quantity, out: s.out + t.given_out }), { total: 0, out: 0 }),
    cards: crewCards(masters, r.employees, r.todayLogs, r.todayGroups),
    masters, managers: r.employees.length - masters.length,
    logs: mergeGroupLogs(r.logs, r.recentGroups).slice(0, 4),
    logFiles: r.logFiles,
    todayTotal: countJobs(r.todayLogs, r.todayGroups),
    todayCount,
    lowStock: r.stockRows.filter(isLowStock).sort((a, b) => a.name.localeCompare(b.name, "az")),
    // Qrup tapşırığı (0071) bir sətirdir: üzvlərin adları birləşir
    tasks: mergeGroups(r.taskRows),
  };
}
