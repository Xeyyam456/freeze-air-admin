import { useActionState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Snowflake } from "lucide-react";
import { ActionForm } from "@/components/forms";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [, formAction, pending] = useActionState(async (_prev: null, formData: FormData) => {
    const { error } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error) {
      toast.error("E-poçt və ya parol səhvdir.");
      return null;
    }
    navigate("/", { replace: true });
    return null;
  }, null);

  if (!loading && session) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen grid-cols-[1fr_560px]">
      <section className="app-header !h-auto !items-start flex flex-col justify-between !pb-0 px-[120px] py-14">
        <div className="relative flex items-center gap-3">
          <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
          <span className="text-lg font-extrabold">Freeze Air Service</span>
        </div>
        <div className="relative max-w-xl pb-16">
          <h1 className="text-5xl font-extrabold leading-[1.1]">
            Ustalar, mağazalar və alətlər bir paneldə
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Mağazanı kodu ilə tap, bir kliklə yol al, alətin kimdə olduğunu depoya zəng etmədən gör.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-surface px-16">
        <ActionForm action={formAction} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold">Daxil ol</h2>
            <p className="muted mt-1 text-sm">Hesabını admin yaradır. Hesabın yoxdursa, rəhbərliyə müraciət et.</p>
          </div>
          <label className="block">
            <span className="label">E-poçt</span>
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label className="block">
            <span className="label">Parol</span>
            <input name="password" type="password" required autoComplete="current-password" className="field" />
          </label>
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Yoxlanılır..." : "Daxil ol"}
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
