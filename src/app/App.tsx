import { Suspense } from "react";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/auth/AuthProvider";
import { Toaster } from "@/components/Toaster";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
