import { useActionState, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { ActionForm, useOnSuccess } from "@/components/forms";
import { addModel } from "@/services/errorCodes/models";
import type { Model, ModelsTabProps } from "@/types/errorCodes";
import { ModelRow } from "./ModelRow";
import { RenameModal } from "./RenameModal";

// Tab: modellər (əlavə et, adını dəyiş, sil)
export function ModelsTab({ models, counts }: ModelsTabProps) {
  const [state, action, pending] = useActionState(addModel, null);
  const ref = useRef<HTMLFormElement>(null);
  const [renaming, setRenaming] = useState<Model | null>(null);
  useOnSuccess(state, () => ref.current?.reset(), "Model əlavə edildi");

  return (
    <div className="space-y-4">
      {renaming && <RenameModal model={renaming} onClose={() => setRenaming(null)} />}
      <ActionForm ref={ref} action={action} className="flex gap-2">
        <input name="name" required autoComplete="off" placeholder="Model adı, məs. Daikin VRV" className="field" aria-label="Model adı" />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0"><Plus size={16} /> Əlavə et</button>
      </ActionForm>

      {models.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ model yoxdur. Yuxarıdan ilk modeli əlavə et.</p>
      ) : (
        <ul className="space-y-1.5">
          {models.map((m) => <ModelRow key={m.id} model={m} count={counts.get(m.id) ?? 0} onRename={() => setRenaming(m)} />)}
        </ul>
      )}
    </div>
  );
}
