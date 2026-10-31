import type { fetchDashboardRaw } from "@/services/dashboard/fetchDashboardRaw";

// Panelin xam məlumatı (services/dashboard/fetchDashboardRaw nəticəsi)
export type DashboardRaw = Awaited<ReturnType<typeof fetchDashboardRaw>>;
