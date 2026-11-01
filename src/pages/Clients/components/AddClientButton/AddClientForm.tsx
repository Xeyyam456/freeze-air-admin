import { useActionState } from "react";
import { addCompany } from "@/actions/companies";
import { ActionForm } from "@/shared/components/ActionForm";
import { FormActions } from "@/shared/components/FormActions";
import { useOnSuccess } from "@/shared/hooks/useOnSuccess";
import { KIND } from "@/lib/kinds";
import type { AddClientProps } from "@/types/clients";
import { ClientFields } from "../ClientFields";

export function AddClientForm({ kind, onDone }: AddClientProps) {
  const [state, action, pending] = useActionState(addCompany, null);
  useOnSuccess(state, onDone, `${KIND[kind].One} əlavə edildi`);

  return (
    <ActionForm action={action} className="space-y-4">
      <ClientFields kind={kind} />
      <FormActions pending={pending} label={`${KIND[kind].One}i əlavə et`} />
    </ActionForm>
  );
}
