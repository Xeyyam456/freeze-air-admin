import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { updateErrorCode } from "@/services/errorCodes/codes";
import type { EditCodeModalProps } from "@/types/errorCodes";
import { CodeFields } from "../CodeFields";
import { ModelSelect } from "../ModelSelect";

export function EditCodeModal({ item, models, onClose }: EditCodeModalProps) {
  const [state, action, pending] = useActionState(updateErrorCode.bind(null, item.id), null);
  const [modelId, setModelId] = useState(String(item.model_id));
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-error-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="edit-error-title" className="text-lg font-bold">Xəta kodunu redaktə et</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <Field label="Kondisioner modeli"><ModelSelect models={models} value={modelId} onChange={setModelId} /></Field>
        <CodeFields item={item} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
