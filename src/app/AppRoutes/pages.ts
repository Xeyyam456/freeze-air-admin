import { lazy } from "react";

// Hər səhifə ayrıca chunk: ilk açılışda yalnız lazım olan səhifə yüklənir
const loaders = {
  clients: () => import("@/pages/Clients"),
  depot: () => import("@/pages/Depot"),
  employees: () => import("@/pages/Employees"),
  errorCodes: () => import("@/pages/ErrorCodes"),
  fuel: () => import("@/pages/Fuel"),
  home: () => import("@/pages/Home"),
  attendance: () => import("@/pages/Attendance"),
  leaves: () => import("@/pages/Leaves"),
  login: () => import("@/pages/Login"),
  management: () => import("@/pages/Management"),
  notFound: () => import("@/pages/NotFound"),
  requests: () => import("@/pages/Requests"),
  site: () => import("@/pages/Site"),
  tasks: () => import("@/pages/Tasks"),
  workLogs: () => import("@/pages/WorkLogs"),
};

export const ClientsPage = lazy(() => loaders.clients().then((m) => ({ default: m.ClientsPage })));
export const ClientPage = lazy(() => loaders.clients().then((m) => ({ default: m.ClientPage })));
export const DepotPage = lazy(loaders.depot);
export const EmployeesPage = lazy(loaders.employees);
export const ErrorCodesPage = lazy(loaders.errorCodes);
export const FuelPage = lazy(loaders.fuel);
export const Home = lazy(loaders.home);
export const AttendancePage = lazy(loaders.attendance);
export const LeavesPage = lazy(loaders.leaves);
export const LoginPage = lazy(loaders.login);
export const ManagementPage = lazy(loaders.management);
export const NotFoundPage = lazy(loaders.notFound);
export const RequestsPage = lazy(loaders.requests);
export const SitePage = lazy(loaders.site);
export const TasksPage = lazy(loaders.tasks);
export const WorkLogsPage = lazy(loaders.workLogs);

// Girişdən sonra brauzer boş olanda bütün səhifələri arxada yüklə (keçid dərhal olsun)
export function prefetchPages() {
  const run = () => Object.values(loaders).forEach((load) => void load().catch(() => {}));
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1500);
}
