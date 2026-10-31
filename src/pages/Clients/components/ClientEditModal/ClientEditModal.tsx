import { useActionState } from "react";
import { X } from "lucide-react";
import { updateCompany } from "@/actions/companies";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { KIND } from "@/lib/kinds";
import { Modal } from "@/shared/components/Modal";
import type { ClientEditModalProps } from "@/types/clients";
import { ClientFields } from "../ClientFields";

// Şirkət/market redaktəsi ayrıca modalda açılır
export function ClientEditModal({ company, kind, onClose }: ClientEditModalProps) {
  const [state, action, pending] = useActionState(updateCompany.bind(null, company.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-client-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-frost to-primary text-lg font-extrabold text-white">
            {company.name.charAt(0)}
          </span>
          <div>
            <h2 id="edit-client-title" className="text-lg font-bold">{KIND[kind].One}i redaktə et</h2>
            <p className="muted text-sm">{company.name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <ClientFields c={company} kind={kind} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
