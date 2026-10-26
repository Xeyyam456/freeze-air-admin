import { useActionState, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, Globe, Lock, Mail, Snowflake, Users, Warehouse } from "lucide-react";
import { ActionForm } from "@/components/forms";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const FEATURES = [
  { icon: Users, title: "Ustalar və tapşırıqlar", text: "Günün işini ustalara ver, görülənləri izlə." },
  { icon: Warehouse, title: "Depo və iş qeydləri", text: "Alət, material və görülən işlər bir yerdə." },
  { icon: Globe, title: "Saytın məzmunu", text: "Mətn, xidmət və şəkilləri dəyiş, sayta dərhal düşsün." },
];

export default function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
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
    <main className="grid min-h-[calc(100vh/var(--zoom))] bg-[#f4f7fc] lg:grid-cols-[1.1fr_1fr]">
      {/* Sol: tünd marka hissəsi */}
      <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#091428,#10233a_55%,#134152)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-frost/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
        <Snowflake size={420} strokeWidth={0.6} className="pointer-events-none absolute -bottom-24 -right-20 text-white/[0.05]" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
          <span className="text-lg font-extrabold">Freeze Air Service</span>
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-frost backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-frost" /> Admin paneli
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight">
            Bütün idarəetmə <span className="bg-gradient-to-r from-white to-frost bg-clip-text text-transparent">bir paneldə</span>
          </h1>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-frost shadow-[0_8px_20px_rgba(10,126,164,0.4)]">
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-white/65">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© Freeze Air Service</p>
      </section>

      {/* Sağ: giriş kartı */}
      <section className="relative flex flex-col items-center justify-center px-6 py-10">
        {/* Dar ekranda sol hissə gizlidir: marka burada görünür */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
          <span className="text-lg font-extrabold">Freeze Air Service</span>
        </div>

        <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(15,36,71,0.12)] ring-1 ring-line sm:p-10">
          <ActionForm action={formAction} className="space-y-5">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Xoş gəldin</h2>
              <p className="muted mt-1.5 text-sm">Hesabınla daxil ol.</p>
            </div>

            <label className="block">
              <span className="label">E-poçt</span>
              <span className="relative block">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input name="email" type="email" required autoComplete="email" placeholder="ad@example.com" className="field !h-12 !pl-11" />
              </span>
            </label>

            <label className="block">
              <span className="label">Parol</span>
              <span className="relative block">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="field !h-12 !pl-11 !pr-12" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Parolu gizlət" : "Parolu göstər"} aria-pressed={show}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={pending} className="btn btn-primary !h-12 w-full !text-[15px]">
              {pending ? "Yoxlanılır..." : <>Daxil ol <ArrowRight size={17} /></>}
            </button>

            <p className="muted text-center text-xs leading-relaxed">Hesabı admin yaradır. Hesabın yoxdursa, rəhbərliyə müraciət et.</p>
          </ActionForm>
        </div>
      </section>
    </main>
  );
}
