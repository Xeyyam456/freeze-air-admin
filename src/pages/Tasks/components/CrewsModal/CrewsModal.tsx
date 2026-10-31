import { useState } from "react";
import type { SelectableEmployee } from "@/types/employees";
import { toast } from "@/lib/toast";
import { saveCrew } from "@/services/tasks/crews";
import { Modal } from "@/shared/components/Modal";
import type { CrewDraft, CrewsModalProps } from "@/types/tasks";
import { crewLabel } from "../../utils/labels";
import { CrewEditor } from "../CrewEditor";
import { CrewList } from "../CrewList";
import { CrewsHead } from "../CrewsHead";

// Briqadaları idarə et: kartlar (redaktə, sil) + yeni/redaktə formu (ad + üzvlər, axtarışlı 2 sütunlu seçim)
export function CrewsModal({ employees, crews, draft, onClose }: CrewsModalProps) {
  // draft: tapşırıq formasındakı seçimdən "Briqada kimi saxla" → forma dərhal açıq gəlir
  const [edit, setEdit] = useState<CrewDraft | null>(draft ? { name: "", members: draft } : null);
  const [pending, setPending] = useState(false);
  const byId = new Map(employees.map((e) => [e.id, e]));

  // Bir usta yalnız bir briqadada (0074): başqa briqadadakı usta → həmin briqadanın adı (redaktə olunan briqada istisna)
  const taken = new Map<number, string>();
  for (const c of crews) if (c.id !== edit?.id) for (const id of c.members) taken.set(id, crewLabel(c, c.members.map((m) => byId.get(m)).filter((e): e is SelectableEmployee => !!e)));
  const conflicts = edit ? edit.members.filter((id) => taken.has(id)) : [];

  async function save() {
    if (!edit) return;
    if (conflicts.length) {
      const names = conflicts.map((id) => `${byId.get(id)?.full_name ?? "Usta"} («${taken.get(id)}»)`).join(", ");
      return toast.error(`Usta yalnız bir briqadada ola bilər: ${names}`);
    }
    setPending(true);
    const ok = await saveCrew(edit);
    setPending(false);
    if (ok) {
      if (draft) onClose();
      else setEdit(null);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="crews-title" className="!max-w-xl overflow-hidden !p-0">
      <CrewsHead onClose={onClose} onCreate={edit ? null : () => setEdit({ name: "", members: [] })}
        title={edit ? (edit.id ? "Briqadanı redaktə et" : "Yeni briqada") : <>Briqadalar <span className="font-semibold text-white/50">· {crews.length}</span></>} />
      <div className="p-6">
        {edit ? (
          <CrewEditor edit={edit} onEdit={setEdit} employees={employees} taken={taken} conflicts={conflicts} pending={pending}
            onSave={save} onCancel={() => (draft ? onClose() : setEdit(null))} />
        ) : (
          <CrewList crews={crews} employees={employees} onEdit={setEdit} />
        )}
      </div>
    </Modal>
  );
}
