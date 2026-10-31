import { useActionState } from "react";
import { addEmployee } from "@/actions/employees";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import type { AddEmployeeFormProps } from "@/types/employees";
import { EmployeeFields } from "../EmployeeFields";

export function AddEmployeeForm({ onDone }: AddEmployeeFormProps) {
  const [state, action, pending] = useActionState(addEmployee, null);
  useOnSuccess(state, onDone, "Usta əlavə edildi");
  return (
    <ActionForm action={action} className="space-y-4">
      <EmployeeFields />
      <Buttons pending={pending} label="Ustanı əlavə et" />
    </ActionForm>
  );
}
