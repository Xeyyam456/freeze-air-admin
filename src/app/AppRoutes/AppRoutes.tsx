import { Route, Routes } from "react-router";
import {
  AnnouncementsPage, AttendancePage, ClientPage, ClientsPage, DepotPage, EmployeesPage, ErrorCodesPage, FeedPage, FuelPage, Home,
  LeavesPage, LoginPage, ManagementPage, NotFoundPage, RequestsPage, SitePage, TasksPage, WorkLogsPage,
} from "./pages";
import { OwnerOnly } from "../OwnerOnly";
import { RequireAuth } from "../RequireAuth";

// Bütün ünvanlar: giriş səhifəsi açıqdır, qalanı girişlə (RequireAuth)
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route index element={<Home />} />
        <Route path="sirketler" element={<ClientsPage key="company" kind="company" />} />
        <Route path="sirketler/:id" element={<ClientPage kind="company" />} />
        <Route path="magazalar" element={<ClientsPage key="market" kind="market" />} />
        <Route path="magazalar/:id" element={<ClientPage kind="market" />} />
        <Route path="ustalar" element={<EmployeesPage />} />
        <Route path="qruplar" element={<FeedPage />} />
        <Route path="elanlar" element={<AnnouncementsPage />} />
        <Route path="rehberlik" element={<ManagementPage />} />
        <Route path="yanacaq" element={<FuelPage />} />
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
  );
}
