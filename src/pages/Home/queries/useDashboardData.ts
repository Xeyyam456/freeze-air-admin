import { useData } from "@/lib/useData";
import { fetchDashboardRaw } from "@/services/dashboard/fetchDashboardRaw";
import { dashboardView } from "../utils/dashboardView";

// Açar lib/revalidate.ts → LIVE xəritəsindədir (tapşırıq və iş dəyişəndə canlı yenilənir)
export const DASHBOARD_KEY = "dashboard";

export const useDashboardData = () => useData(DASHBOARD_KEY, async () => dashboardView(await fetchDashboardRaw()));
