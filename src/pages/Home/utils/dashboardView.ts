import { isLowStock } from "@/pages/Depot/utils/stock";
import { mergeGroups } from "./mergeGroups";
import type { DashboardRaw } from "@/types/dashboard";

// Panelin bugünkü göstəriciləri: ustalar (rəhbərlik xaric), depoda azalanlar, bugünkü tapşırıqlar (qrup tapşırığı bir say)
export function dashboardView(r: DashboardRaw) {
  return {
    masters: r.employees.filter((e) => !e.is_management),
    lowStock: r.stockRows.filter(isLowStock).sort((a, b) => a.name.localeCompare(b.name, "az")),
    tasks: mergeGroups(r.taskRows),
  };
}
