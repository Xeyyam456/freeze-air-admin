import { useState } from "react";
import { UsersRound } from "lucide-react";
import { EmployeeSelect } from "@/shared/components/EmployeeSelect";
import type { SelectableEmployee } from "@/types/employees";
import type { Crew, ManagingState, TeamPickerProps } from "@/types/tasks";
import { crewLabel } from "../../utils/labels";
import { CrewSelect } from "../CrewSelect";
import { CrewsModal } from "../CrewsModal";
import { SelectedList } from "../SelectedList";

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

// Tapşırıq kimə: bir usta və ya qrup. Üstdə hazır briqadalar (kafel, bir kliklə seçilir), altda seçilənlər bir çərçivədə
// (sətir-sətir, × ilə çıxır) + "Daha bir usta". 2+ nəfər = qrup tapşırığı; uyğun briqada yoxdursa "Briqada kimi saxla".
export function TeamPicker({ employees, crews, value, onChange, hint }: TeamPickerProps) {
  const [managing, setManaging] = useState<ManagingState | null>(null);
  const byId = new Map(employees.map((e) => [e.id, e]));
  const selected = value.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
  // Briqadanın yalnız aktiv üzvləri (usta deaktiv olubsa siyahıda yoxdur); 2-dən az qalıbsa göstərilmir
  const crewPeople = (c: Crew) => c.members.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
  const usable = crews.filter((c) => crewPeople(c).length >= 2);
  const matching = usable.find((c) => sameSet(crewPeople(c).map((p) => p.id), value));
  const add = (
    <EmployeeSelect value={null} employees={employees.filter((e) => !value.includes(e.id))} hint={hint}
      placeholder={selected.length ? "Daha bir usta əlavə et (qrup)" : "Usta seç..."}
      onChange={(id) => id && onChange([...value, id])} />
  );

  return (
    <div className="space-y-3">
      {managing && <CrewsModal employees={employees} crews={crews} draft={managing.draft ?? (managing.create ? [] : undefined)} onClose={() => setManaging(null)} />}

      {/* Hazır briqadalar: açılan siyahı (seçiləndə üzvlər aşağıdakı çərçivəyə düşür) */}
      {usable.length === 0 ? (
        <button type="button" onClick={() => setManaging({ create: true })}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-primary hover:text-primary">
          <UsersRound size={14} /> Briqada yarat <span className="font-normal">(tez-tez birlikdə işləyən ustalar)</span>
        </button>
      ) : (
        <CrewSelect crews={usable} peopleOf={crewPeople} selectedId={matching?.id ?? null}
          onPick={(c) => onChange(c ? crewPeople(c).map((p) => p.id) : [])}
          onManage={(create) => setManaging({ create })} />
      )}

      {/* Seçilənlər */}
      {selected.length === 0 ? add : (
        <SelectedList selected={selected} matching={matching} matchingLabel={matching ? crewLabel(matching, crewPeople(matching)) : null} add={add}
          onRemove={(id) => onChange(value.filter((x) => x !== id))} onClear={() => onChange([])} onSaveCrew={() => setManaging({ draft: value })} />
      )}
    </div>
  );
}
