import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { ContactRequestsListener } from "@/components/ContactRequestsListener";
import { Toaster } from "@/components/Toaster";
import { ClientPage, ClientsPage } from "@/pages/Clients";
import DepotPage from "@/pages/Depot";
import EmployeesPage from "@/pages/Employees";
import Home from "@/pages/Home";
import LoginPage from "@/pages/Login";
import ManagementPage from "@/pages/Management";
import RequestsPage from "@/pages/Requests";
import SitePage from "@/pages/Site";

// Giriş etməyən istifadəçi yalnız /login səhifəsini görür
function RequireAuth() {
  const { session, loading, admin } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return (
    <>
      {admin && <ContactRequestsListener />}
      <Outlet />
    </>
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
            <Route path="depo" element={<DepotPage />} />
            <Route path="muracietler" element={<RequestsPage />} />
            <Route path="sayt" element={<SitePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
