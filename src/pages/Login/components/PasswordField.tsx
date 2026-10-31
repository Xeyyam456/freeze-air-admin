import { Eye, EyeOff, Lock } from "lucide-react";
import type { PasswordFieldProps } from "@/types/login";
import { Input } from "@/shared/components/Input";

// Parol sahəsi: göstər / gizlət düyməsi ilə
export function PasswordField({ show, onToggle }: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="label">Parol</span>
      <span className="relative block">
        <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <Input name="password" type={show ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="!h-12 !pl-11 !pr-12" />
        <button type="button" onClick={onToggle} aria-label={show ? "Parolu gizlət" : "Parolu göstər"} aria-pressed={show}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}
