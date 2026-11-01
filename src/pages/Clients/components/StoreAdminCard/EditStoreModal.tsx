import { StoreCode } from "@/components/StoreCard";
import { IconButton } from "@/shared/components/IconButton";
import { useActionState } from "react";
import { X } from "lucide-react";
import { updateStore } from "@/actions/stores";
import { FormActions } from "@/shared/components/FormActions";
import { SaveConfirmForm } from "@/shared/components/SaveConfirmForm";
import { useOnSuccess } from "@/shared/hooks/useOnSuccess";
import { KIND } from "@/lib/kinds";
import { Modal } from "@/shared/components/Modal";
import type { EditStoreModalProps } from "@/types/clients";
import { StoreFields } from "../StoreFields";

// Filial/mağaza redaktəsi ayrıca modalda
export function EditStoreModal({ store, kind, onClose }: EditStoreModalProps) {
  const [state, action, pending] = useActionState(updateStore.bind(null, store.id), null);
  useOnSuccess(state, onClose);
  const titleId = `edit-store-${store.id}`;

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StoreCode className="!h-11 !w-11 !rounded-xl !text-sm">{store.code}</StoreCode>
          <div>
            <h2 id={titleId} className="text-lg font-bold">{KIND[kind].UnitAcc} redaktə et</h2>
            <p className="muted text-sm">{store.name}</p>
          </div>
        </div>
        <IconButton onClick={onClose} aria-label="Bağla">
          <X size={18} />
        </IconButton>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <StoreFields s={store} companyId={store.company_id} kind={kind} />
        <FormActions pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
