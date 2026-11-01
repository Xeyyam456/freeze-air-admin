import { IconButton } from "@/shared/components/IconButton";
import { useActionState } from "react";
import { X } from "lucide-react";
import { ActionForm } from "@/shared/components/ActionForm";
import { FormActions } from "@/shared/components/FormActions";
import { useOnSuccess } from "@/shared/hooks/useOnSuccess";
import { Modal } from "@/shared/components/Modal";
import { renameModel } from "@/services/errorCodes/models";
import type { RenameModalProps } from "@/types/errorCodes";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

export function RenameModal({ model, onClose }: RenameModalProps) {
  const [state, action, pending] = useActionState(renameModel.bind(null, model.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="rename-model-title" className="!max-w-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="rename-model-title" className="text-lg font-bold">Modelin adını dəyiş</h2>
        <IconButton onClick={onClose} aria-label="Bağla"><X size={18} /></IconButton>
      </div>
      <ActionForm action={action} className="space-y-4">
        <FormField label="Model adı"><Input name="name" defaultValue={model.name} required autoFocus autoComplete="off" /></FormField>
        <FormActions pending={pending} label="Yadda saxla" onCancel={onClose} />
      </ActionForm>
    </Modal>
  );
}
