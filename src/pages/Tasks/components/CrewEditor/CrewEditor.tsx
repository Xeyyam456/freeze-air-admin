import { useState } from "react";
import { Check, Save, Search, UsersRound, X } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { norm } from "@/shared/utils/norm";
import type { CrewEditorProps } from "@/types/tasks";

// Yeni / redaktə olunan briqada: ad (istəyə görə) + üzvlər (axtarışlı 2 sütunlu seçim; başqa briqadadakı usta bağlıdır)
export function CrewEditor({ edit, onEdit, employees, taken, conflicts, pending, onSave, onCancel }: CrewEditorProps) {
  const [query, setQuery] = useState("");
  const words = norm(query).split(/\s+/).filter(Boolean);
  const visible = employees.filter((e) => words.every((w) => norm(`${e.full_name} ${e.specialty ?? ""}`).includes(w)));
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="label">Adı <span className="muted font-normal">(istəyə görə; yazılmasa üzvlərin adları göstərilir)</span></span>
        <input autoFocus value={edit.name} onChange={(e) => onEdit({ ...edit, name: e.target.value })}
          placeholder="məs. Qaz briqadası" className="field" />
      </label>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="label !mb-0">Üzvlər <span className="muted font-normal">· {edit.members.length} seçilib</span></span>
          {employees.length > 6 && (
            <label className="flex h-8 w-44 items-center gap-1.5 rounded-lg bg-bg px-2.5">
              <Search size={13} className="muted shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Usta axtar"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
            </label>
          )}
        </div>
        <div className="nice-scroll grid max-h-[min(320px,42vh)] grid-cols-2 gap-2 overflow-y-auto [scrollbar-gutter:auto]">
          {visible.map((e) => {
            const on = edit.members.includes(e.id);
            const busy = taken.get(e.id); // başqa briqadadadır: seçilmir; seçilibsə (draft) qırmızıdır, yalnız çıxarmaq olar
            return (
              <button key={e.id} type="button" aria-pressed={on} disabled={!!busy && !on}
                title={busy ? `«${busy}» briqadasındadır` : undefined}
                onClick={() => onEdit({ ...edit, members: on ? edit.members.filter((x) => x !== e.id) : [...edit.members, e.id] })}
                className={`relative flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                  busy && on ? "border-danger bg-danger-soft" : on ? "border-primary bg-primary-soft" : busy ? "border-line bg-bg" : "border-line hover:bg-bg"}`}>
                <Avatar employee={e} className="!h-9 !w-9 !text-[11px] !shadow-none" />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${busy && on ? "text-danger" : on ? "text-primary" : ""}`}>{e.full_name}</span>
                  {busy
                    ? <span className={`flex items-center gap-1 truncate text-[11px] font-semibold ${on ? "text-danger" : "text-muted"}`}><UsersRound size={11} className="shrink-0" /> {busy}</span>
                    : e.specialty && <span className="muted block truncate text-[11px]">{e.specialty}</span>}
                </span>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                  busy && on ? "bg-danger text-white" : on ? "bg-primary text-white" : "border-2 border-line text-transparent"}`}>
                  {busy && on ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
          {visible.length === 0 && <p className="muted col-span-2 py-4 text-center text-sm">Usta tapılmadı</p>}
        </div>
      </div>
      {conflicts.length > 0 && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
          Qırmızı ustalar artıq başqa briqadadadır: usta yalnız bir briqadada ola bilər. Onları çıxar və ya əvvəl o briqadanı dəyiş.
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onCancel} className="btn btn-soft">Ləğv et</button>
        <button type="button" onClick={onSave} disabled={pending} className="btn btn-primary"><Save size={16} /> {pending ? "..." : "Yadda saxla"}</button>
      </div>
    </div>
  );
}
