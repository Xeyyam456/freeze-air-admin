import { useActionState, useState } from "react";
import { deleteEmployeeAccount, resetEmployeePassword } from "@/actions/accounts";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm, useOnSuccess } from "@/components/forms";
import type { AccountActiveProps } from "@/types/employees";
import { AccountBox } from "./AccountBox";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Hesab açılıb: e-poçt, parolu dəyiş, hesabı sil
export function AccountActive({ employeeId, email }: AccountActiveProps) {
  const [mode, setMode] = useState<"view" | "password">("view");
  const [pwState, pwAction, changing] = useActionState(resetEmployeePassword.bind(null, employeeId), null);
  useOnSuccess(pwState, () => setMode("view"), "Parol dəyişdirildi");

  return (
    <AccountBox right={<span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-semibold text-ok">Aktiv</span>}>
      <p className="mt-1 truncate text-sm font-semibold">{email ?? "—"}</p>
      {mode === "password" ? (
        <ActionForm action={pwAction} className="mt-2 flex gap-2">
          <Input name="password" type="password" minLength={8} required placeholder="Yeni parol (ən azı 8 simvol)"
            autoComplete="new-password" className="!h-9 flex-1 !text-[13px]" />
          <Button type="submit" disabled={changing} size="sm" className="!h-9">{changing ? "..." : "Saxla"}</Button>
          <Button type="button" onClick={() => setMode("view")} variant="cancel" size="sm" className="!h-9">Ləğv et</Button>
        </ActionForm>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <Button type="button" onClick={() => setMode("password")} variant="secondary" size="sm">Parolu dəyiş</Button>
          <ConfirmButton onConfirm={() => deleteEmployeeAccount(employeeId)} className="btn btn-sm btn-cancel"
            title="Hesabı sil" question="Usta artıq sistemə daxil ola bilməyəcək. İşləri və alət tarixçəsi silinmir.">
            Hesabı sil
          </ConfirmButton>
        </div>
      )}
    </AccountBox>
  );
}
