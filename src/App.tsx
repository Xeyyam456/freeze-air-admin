import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { AppLayout } from "@/components/AppLayout";
import { ContactRequestsListener } from "@/components/ContactRequestsListener";
import { TasksListener } from "@/components/TasksListener";
import { Toaster } from "@/components/Toaster";
import { ClientPage, ClientsPage } from "@/pages/Clients";
import DepotPage from "@/pages/Depot";
import EmployeesPage from "@/pages/Employees";
import ErrorCodesPage from "@/pages/ErrorCodes";
import Home from "@/pages/Home";
import AttendancePage from "@/pages/Attendance";
import LeavesPage from "@/pages/Leaves";
import LoginPage from "@/pages/Login";
import ManagementPage from "@/pages/Management";
import NotFoundPage from "@/pages/NotFound";
import RequestsPage from "@/pages/Requests";
import SitePage from "@/pages/Site";
import TasksPage from "@/pages/Tasks";
import WorkLogsPage from "@/pages/WorkLogs";

// Saytın məzmunu yalnız müdirə (0069): digər rəhbər ünvanı yazsa Panelə qaytarılır
function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { owner } = useAuth();
  return owner ? children : <Navigate to="/" replace />;
}

// Giriş etməyən istifadəçi yalnız /login səhifəsini görür
function RequireAuth() {
  const { session, loading, admin } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      {admin && <ContactRequestsListener />}
      {admin && <TasksListener />}
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Home />} />
            <Route path="sirketler" element={<ClientsPage key="company" kind="company" />} />
            <Route path="sirketler/:id" element={<ClientPage kind="company" />} />
            <Route path="magazalar" element={<ClientsPage key="market" kind="market" />} />
            <Route path="magazalar/:id" element={<ClientPage kind="market" />} />
            <Route path="ustalar" element={<EmployeesPage />} />
            <Route path="rehberlik" element={<ManagementPage />} />
            <Route path="davamiyyet" element={<AttendancePage />} />
            <Route path="icazeler" element={<LeavesPage />} />
            <Route path="depo" element={<DepotPage />} />
            <Route path="tapshiriqlar" element={<TasksPage />} />
            <Route path="isler" element={<WorkLogsPage />} />
            <Route path="xeta-kodlari" element={<ErrorCodesPage />} />
            <Route path="muracietler" element={<RequestsPage />} />
            <Route path="sayt" element={<OwnerOnly><SitePage /></OwnerOnly>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
