import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { SelectableEmployee } from "@/types/employees";
import { deleteCrew } from "@/services/tasks/crews";
import type { CrewListProps } from "@/types/tasks";
import { crewLabel } from "../../utils/labels";
import { Faces } from "../Faces";
import { FreeEmployees } from "../FreeEmployees";
import { Button } from "@/shared/components/Button";

// Briqadaların siyahısı (redaktə, sil); boşdursa "İlk briqadanı yarat"; altda briqadasız ustalar
export function CrewList({ crews, employees, onEdit }: CrewListProps) {
  const byId = new Map(employees.map((e) => [e.id, e]));
  return (
    <div className="space-y-4">
      {crews.length === 0 ? (
        <div className="flex h-[min(300px,42vh)] flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 text-center">
          <span className="icon-tile mx-auto"><UsersRound size={20} /></span>
          <p className="mt-3 font-semibold">Hələ briqada yoxdur</p>
          <p className="muted text-sm">Tez-tez birlikdə işləyən ustaları (məs. usta + köməkçi) briqada kimi saxla: tapşırıq verəndə bir kliklə seçilir.</p>
          <Button type="button" onClick={() => onEdit({ name: "", members: [] })} size="sm" className="mt-4"><Plus size={15} /> İlk briqadanı yarat</Button>
        </div>
      ) : (
        // Sabit hündürlük: briqada çoxaldıqca pəncərə uzanmır, siyahı öz içində sürüşür
        <ul className="nice-scroll h-[min(300px,42vh)] divide-y divide-line overflow-y-auto rounded-2xl border border-line [scrollbar-gutter:auto]">
          {crews.map((c) => {
            const people = c.members.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
            return (
              <li key={c.id} className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-bg">
                <Faces people={people.slice(0, 3)} size="!h-9 !w-9 !text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{crewLabel(c, people)}</p>
                  <p className="muted truncate text-xs" title={people.map((p) => p.full_name).join(", ")}>
                    {people.length ? <><b className="font-semibold text-ink">{people.length} nəfər</b> · {people.map((p) => p.full_name).join(", ")}</> : "Aktiv üzv qalmayıb"}
                  </p>
                </div>
                <button type="button" onClick={() => onEdit({ id: c.id, name: c.name ?? "", members: c.members })} className="icon-btn !h-8 !w-8" title="Redaktə et" aria-label="Redaktə et">
                  <Pencil size={14} />
                </button>
                <ConfirmButton onConfirm={async () => { await deleteCrew(c.id); }} success={false} className="icon-btn icon-btn-danger !h-8 !w-8" title="Briqadanı sil"
                  question="Briqada silinəcək. Ona verilmiş köhnə tapşırıqlar dəyişmir.">
                  <Trash2 size={14} />
                </ConfirmButton>
              </li>
            );
          })}
        </ul>
      )}
      <FreeEmployees crews={crews} employees={employees} />
    </div>
  );
}
