import { lazy } from "react";

// Panel (ilk açılan) və giriş əsas faylda: yeniləmədə ağ ekran olmasın (lazy chunk ardıcıl yüklənirdi)
export { default as Home } from "@/pages/Home";
export { default as LoginPage } from "@/pages/Login";

// Qalan səhifələr ayrıca chunk: ilk açılışda yalnız lazım olan yüklənir
const loaders = {
  announcements: () => import("@/pages/Announcements"),
  clients: () => import("@/pages/Clients"),
  depot: () => import("@/pages/Depot"),
  employees: () => import("@/pages/Employees"),
  errorCodes: () => import("@/pages/ErrorCodes"),
  fuel: () => import("@/pages/Fuel"),
  attendance: () => import("@/pages/Attendance"),
  leaves: () => import("@/pages/Leaves"),
  management: () => import("@/pages/Management"),
  notFound: () => import("@/pages/NotFound"),
  requests: () => import("@/pages/Requests"),
  site: () => import("@/pages/Site"),
  tasks: () => import("@/pages/Tasks"),
  workLogs: () => import("@/pages/WorkLogs"),
};

export const AnnouncementsPage = lazy(loaders.announcements);
export const ClientsPage = lazy(() => loaders.clients().then((m) => ({ default: m.ClientsPage })));
export const ClientPage = lazy(() => loaders.clients().then((m) => ({ default: m.ClientPage })));
export const DepotPage = lazy(loaders.depot);
export const EmployeesPage = lazy(loaders.employees);
export const ErrorCodesPage = lazy(loaders.errorCodes);
export const FuelPage = lazy(loaders.fuel);
export const AttendancePage = lazy(loaders.attendance);
export const LeavesPage = lazy(loaders.leaves);
export const ManagementPage = lazy(loaders.management);
export const NotFoundPage = lazy(loaders.notFound);
export const RequestsPage = lazy(loaders.requests);
export const SitePage = lazy(loaders.site);
export const TasksPage = lazy(loaders.tasks);
export const WorkLogsPage = lazy(loaders.workLogs);

// Girişdən sonra, Panel çəkiləndən 3 san. sonra boş vaxtda qalan səhifələri arxada yüklə (keçid dərhal olsun).
// Dərhal idle-da başlatmaq olmaz: auth cavabı gözlənərkən brauzer "boş" sayılır və prefetch ilk render-i 2–3 san. gecikdirirdi.
export function prefetchPages() {
  const run = () => Object.values(loaders).forEach((load) => void load().catch(() => {}));
  const timer = setTimeout(() => {
    if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 3000 });
    else run();
  }, 3000);
  return () => clearTimeout(timer);
}
