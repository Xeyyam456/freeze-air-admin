import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/auth/AuthProvider";
import { AppLayout } from "@/components/AppLayout";
import { ContactRequestsListener } from "@/components/ContactRequestsListener";
import { DepotListener } from "@/components/DepotListener";
import { TasksListener } from "@/components/TasksListener";

// Giriş etməyən istifadəçi yalnız /login səhifəsini görür; girişdən sonra çərçivə + canlı dinləyicilər
export function RequireAuth() {
  const { session, loading, admin, canManageTools } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      {admin && <ContactRequestsListener />}
      {admin && <TasksListener />}
      {canManageTools && <DepotListener />}
      <Outlet />
    </AppLayout>
  );
}
