import { useActionState } from "react";
import { X } from "lucide-react";
import { updateEmployee } from "@/actions/employees";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Avatar } from "@/shared/components/Avatar";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { Modal } from "@/shared/components/Modal";
import type { ManagerModalProps } from "@/types/management";
import { ManagerFields } from "../ManagerFields";

export function EditManagerModal({ manager, onClose }: ManagerModalProps) {
  const [state, action, pending] = useActionState(updateEmployee.bind(null, manager.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-manager-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar employee={manager} className="!h-11 !w-11 !text-sm" />
          <div>
            <h2 id="edit-manager-title" className="text-lg font-bold">Rəhbəri redaktə et</h2>
            <p className="muted text-sm">{manager.full_name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="mb-4"><AvatarUpload employee={manager} /></div>
      <SaveConfirmForm action={action} className="space-y-4">
        <ManagerFields m={manager} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
