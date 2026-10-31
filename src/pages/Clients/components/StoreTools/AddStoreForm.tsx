import { useActionState, useRef } from "react";
import { addStore } from "@/actions/stores";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import { KIND } from "@/lib/kinds";
import type { StoreScopeProps } from "@/types/clients";
import { StoreFields } from "../StoreFields";

export function AddStoreForm({ companyId, kind }: StoreScopeProps) {
  const [state, action, pending] = useActionState(addStore, null);
  const ref = useRef<HTMLFormElement>(null);
  useOnSuccess(state, () => ref.current?.reset(), `${KIND[kind].Unit} əlavə edildi`);

  return (
    <ActionForm ref={ref} action={action} className="space-y-3">
      <StoreFields companyId={companyId} kind={kind} />
      <Buttons pending={pending} label={`${KIND[kind].UnitAcc} əlavə et`} />
    </ActionForm>
  );
}
