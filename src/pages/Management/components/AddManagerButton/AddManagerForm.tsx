import { useActionState } from "react";
import { addEmployee } from "@/actions/employees";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import type { AddManagerFormProps } from "@/types/management";
import { ManagerFields } from "../ManagerFields";

export function AddManagerForm({ onDone }: AddManagerFormProps) {
  const [state, action, pending] = useActionState(addEmployee, null);
  useOnSuccess(state, onDone, "Rəhbər əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-4">
      <ManagerFields />
      <Buttons pending={pending} label="Rəhbəri əlavə et" />
    </ActionForm>
  );
}
