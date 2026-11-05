import { LogoMark } from "@/shared/components/LogoMark";
import { Label } from "@/shared/components/Label";
import { ArrowRight, Mail, Snowflake } from "lucide-react";
import { ActionForm } from "@/shared/components/ActionForm";
import s from "../styles/LoginCard.module.css";
import { useLogin } from "../hooks/useLogin";
import { PasswordField } from "./PasswordField";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Sağ: giriş kartı; dar ekranda sol hissə gizlidir, marka burada görünür
export function LoginCard() {
  const { show, toggleShow, formAction, pending } = useLogin();

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-10">
      {/* Tünd fonda kartın arxasında yumşaq parıltı (sol marka hissəsi ilə bir dil) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="relative mb-8 flex items-center gap-3 lg:hidden">
        <LogoMark ><Snowflake size={22} strokeWidth={2.4} /></LogoMark>
        <span className="text-lg font-extrabold">Freeze Air Service</span>
      </div>

      {/* Kənarında fırlanan işıq (styles/LoginCard.module.css) */}
      <div className={`${s.card} relative w-full max-w-[420px] rounded-[28px] bg-surface p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-line sm:p-10`}>
        <ActionForm action={formAction} className="space-y-5">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Xoş gəldin</h2>
            <p className="muted mt-1.5 text-sm">Hesabınla daxil ol.</p>
          </div>

          <label className="block">
            <Label >E-poçt</Label>
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
