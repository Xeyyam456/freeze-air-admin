import { useActionState } from "react";
import { X } from "lucide-react";
import { ActionForm, Buttons, Field, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { renameModel } from "@/services/errorCodes/models";
import type { RenameModalProps } from "@/types/errorCodes";
import { Input } from "@/shared/components/Input";

export function RenameModal({ model, onClose }: RenameModalProps) {
  const [state, action, pending] = useActionState(renameModel.bind(null, model.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="rename-model-title" className="!max-w-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="rename-model-title" className="text-lg font-bold">Modelin adını dəyiş</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <ActionForm action={action} className="space-y-4">
        <Field label="Model adı"><Input name="name" defaultValue={model.name} required autoFocus autoComplete="off" /></Field>
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </ActionForm>
    </Modal>
  );
}
