import { useData } from "@/lib/useData";
import { fetchEmployees } from "@/services/employees/fetchEmployees";
import { todayBaku } from "@/shared/utils/todayBaku";
import { employeesView } from "../utils/employeesView";

// Açar lib/revalidate.ts → LIVE xəritəsindədir (icazə və davamiyyət dəyişəndə canlı yenilənir)
export const EMPLOYEES_KEY = "employees-page";

export const useEmployeesData = (admin: boolean) =>
  useData(EMPLOYEES_KEY, async () => employeesView(await fetchEmployees(admin), todayBaku()), [admin]);
