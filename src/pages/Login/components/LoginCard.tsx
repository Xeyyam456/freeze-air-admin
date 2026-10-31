import { ArrowRight, Mail, Snowflake } from "lucide-react";
import { ActionForm } from "@/components/forms";
import { useLogin } from "../hooks/useLogin";
import { PasswordField } from "./PasswordField";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Sağ: giriş kartı; dar ekranda sol hissə gizlidir, marka burada görünür
export function LoginCard() {
  const { show, toggleShow, formAction, pending } = useLogin();

  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-10">
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
              <Input name="email" type="email" required autoComplete="email" placeholder="ad@example.com" className="!h-12 !pl-11" />
            </span>
          </label>

          <PasswordField show={show} onToggle={toggleShow} />

          <Button type="submit" disabled={pending} className="!h-12 w-full !text-[15px]">
            {pending ? "Yoxlanılır..." : <>Daxil ol <ArrowRight size={17} /></>}
          </Button>

          <p className="muted text-center text-xs leading-relaxed">Hesabı admin yaradır. Hesabın yoxdursa, rəhbərliyə müraciət et.</p>
        </ActionForm>
      </div>
    </section>
  );
}
