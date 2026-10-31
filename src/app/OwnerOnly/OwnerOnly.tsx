import { Navigate } from "react-router";
import { useAuth } from "@/auth/AuthProvider";

// Saytın məzmunu yalnız müdirə (0069): digər rəhbər ünvanı yazsa Panelə qaytarılır
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { owner } = useAuth();
  return owner ? children : <Navigate to="/" replace />;
}
