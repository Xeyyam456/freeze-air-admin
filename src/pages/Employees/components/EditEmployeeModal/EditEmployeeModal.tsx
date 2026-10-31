import { useActionState } from "react";
import { X } from "lucide-react";
import { updateEmployee } from "@/actions/employees";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Avatar } from "@/shared/components/Avatar";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { Modal } from "@/shared/components/Modal";
import type { EmployeeModalProps } from "@/types/employees";
import { EmployeeFields } from "../EmployeeFields";

export function EditEmployeeModal({ employee, onClose }: EmployeeModalProps) {
  const [state, action, pending] = useActionState(updateEmployee.bind(null, employee.id), null);
  useOnSuccess(state, onClose);

  return (
    <Modal onClose={onClose} labelledBy="edit-employee-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar employee={employee} className="!h-11 !w-11 !text-sm" />
          <div>
            <h2 id="edit-employee-title" className="text-lg font-bold">Ustanı redaktə et</h2>
            <p className="muted text-sm">{employee.full_name}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="mb-4"><AvatarUpload employee={employee} /></div>
      <SaveConfirmForm action={action} className="space-y-4">
        <EmployeeFields e={employee} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
