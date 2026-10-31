import { Navigate } from "react-router";
import { useAuth } from "@/auth/AuthProvider";
import { LoginBrand } from "./components/LoginBrand";
import { LoginCard } from "./components/LoginCard";

export default function LoginPage() {
  const { session, loading } = useAuth();

  if (!loading && session) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-[calc(100vh/var(--zoom))] bg-[#f4f7fc] lg:grid-cols-[1.1fr_1fr]">
      <LoginBrand />
      <LoginCard />
    </main>
  );
}
