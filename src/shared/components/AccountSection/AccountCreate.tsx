import { useActionState } from "react";
import { createEmployeeAccount } from "@/actions/accounts";
import { ActionForm, useOnSuccess } from "@/components/forms";
import type { AccountCreateProps } from "@/types/employees";
import { AccountBox } from "./AccountBox";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Hesab yoxdur: e-poçt + parol ilə aç
export function AccountCreate({ employeeId, note }: AccountCreateProps) {
  const [createState, createAction, creating] = useActionState(createEmployeeAccount.bind(null, employeeId), null);
  useOnSuccess(createState, undefined, "Giriş hesabı açıldı");

  return (
    <AccountBox>
      <p className="muted mt-0.5 text-xs">{note}</p>
      <ActionForm action={createAction} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input name="email" type="email" required placeholder="E-poçt" autoComplete="off" className="!h-9 !text-[13px]" />
        <Input name="password" type="password" minLength={8} required placeholder="Parol (ən azı 8)" autoComplete="new-password"
          className="!h-9 !text-[13px]" />
        <Button type="submit" disabled={creating} size="sm" className="!h-9">{creating ? "..." : "Hesab aç"}</Button>
      </ActionForm>
    </AccountBox>
  );
}
