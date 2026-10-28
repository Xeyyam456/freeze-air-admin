import { useActionState } from "react";
import { Pencil } from "lucide-react";
import { updateTool } from "@/services/depot";
import { ToolFields } from "@/components/depot/DepotDocs";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { DHead } from "@/pages/Depot/components/ui";
import { TEXT, type Kind, type Tool } from "@/pages/Depot/utils";

export function EditToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateTool.bind(null, tool.id), null);
  useOnSuccess(state, onClose);
  const kind = tool.kind as Kind;

  return (
    <Modal onClose={onClose} labelledBy="edit-tool-title" className="!max-w-md">
      <DHead id="edit-tool-title" icon={Pencil} tone={kind === "material" ? "teal" : "blue"} title={TEXT[kind].editTitle} sub={tool.name} onClose={onClose} />
      <SaveConfirmForm action={action} className="space-y-4">
        <ToolFields t={tool} kind={kind} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}
