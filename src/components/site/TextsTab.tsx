import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { saveTexts } from "@/actions/site";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { TEXT_GROUPS, type TextField } from "./textFields";
import { toast } from "@/lib/toast";

// Saytın bütün sabit mətnləri, səhifələrə görə. Dəyişikliklər bütün qruplar üzrə yığılır, bir düymə ilə saxlanır.
export function TextsTab() {
  const saved = useData(async () => {
    const { data } = await createClient().from("site_texts").select("key, value");
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
  });
  const [group, setGroup] = useState(TEXT_GROUPS[0].id);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  if (!saved) return <div className="card muted">Yüklənir...</div>;

  const current = TEXT_GROUPS.find((g) => g.id === group)!;
  const changed = Object.keys(draft).filter((k) => draft[k] !== (saved[k] ?? ""));
  const changedIn = (id: string) =>
    TEXT_GROUPS.find((g) => g.id === id)!.sections.some((s) => s.fields.some((f) => changed.includes(f.key)));

  function set(key: string, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    setPending(true);
    const err = await saveTexts(Object.fromEntries(changed.map((k) => [k, draft[k]])));
    setPending(false);
    if (err) return toast.error(err);
    setDraft({});
    toast.success("Yadda saxlanıldı", "Saytda ən gec 1 dəqiqəyə görünəcək.");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <nav className="card h-fit !p-2">
        {TEXT_GROUPS.map((g) => (
          <button key={g.id} type="button" onClick={() => setGroup(g.id)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              g.id === group ? "bg-primary-soft text-primary" : "text-ink hover:bg-bg"
            }`}>
            {g.title}
            {changedIn(g.id) && <span className="h-2 w-2 rounded-full bg-frost" title="Saxlanmamış dəyişiklik" />}
          </button>
        ))}
      </nav>

      <div className="min-w-0 space-y-4 pb-24">
        {current.hint && <p className="muted text-sm">{current.hint}</p>}
        {current.sections.map((s) => (
          <section key={s.title} className="card">
            <h2 className="card-title">{s.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {s.fields.map((f) => (
                <TextInput key={f.key} field={f} value={draft[f.key] ?? saved[f.key] ?? ""}
                  dirty={changed.includes(f.key)} onChange={(v) => set(f.key, v)}
                  onReset={() => setDraft((d) => { const n = { ...d }; delete n[f.key]; return n; })} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Saxlama zolağı: dəyişiklik olanda ekranın altında */}
      {changed.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 shadow-[0_-8px_24px_rgba(16,24,40,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-end gap-3 px-[var(--gutter)] py-3">
            <span className="muted mr-auto text-sm">{changed.length} mətn dəyişib</span>
            <button type="button" onClick={() => setDraft({})} disabled={pending} className="btn btn-cancel">Ləğv et</button>
            <button type="button" onClick={save} disabled={pending} className="btn btn-primary min-w-40">
              {pending ? "Gözləyin..." : "Yadda saxla"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TextInput({ field, value, dirty, onChange, onReset }: {
  field: TextField;
  value: string;
  dirty: boolean;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  const multi = field.kind === "text" || field.kind === "list";
  return (
    <label className={`block ${multi ? "md:col-span-2" : ""}`}>
      <span className="label flex items-center gap-2">
        {field.label}
        {field.kind === "list" && <span className="muted font-normal">(hər sətir bir bənd)</span>}
        {dirty && (
          <button type="button" onClick={(e) => { e.preventDefault(); onReset(); }} title="Dəyişikliyi geri al"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <RotateCcw size={12} /> geri al
          </button>
        )}
      </span>
      {multi ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={2000}
          rows={field.kind === "list" ? Math.max(3, value.split("\n").length) : 3}
          className={`field resize-y !py-2 ${dirty ? "!border-frost" : ""}`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={300}
          className={`field ${dirty ? "!border-frost" : ""}`} />
      )}
    </label>
  );
}
