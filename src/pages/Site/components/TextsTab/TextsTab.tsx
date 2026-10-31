import { TEXT_GROUPS } from "../../constants/textGroups";
import { useTextsTab } from "../../hooks/useTextsTab";
import { TextGroupNav } from "./TextGroupNav";
import { TextInput } from "./TextInput";
import { TextsSaveBar } from "./TextsSaveBar";

// Saytın bütün sabit mətnləri, səhifələrə görə. Dəyişikliklər bütün qruplar üzrə yığılır, bir düymə ilə saxlanır.
export function TextsTab() {
  const t = useTextsTab();

  if (!t.loaded) return <div className="card muted">Yüklənir...</div>;

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <TextGroupNav groups={TEXT_GROUPS} current={t.group} onSelect={t.setGroup} changedIn={t.changedIn} />

      <div className="min-w-0 space-y-4 pb-24">
        {t.current.hint && <p className="muted text-sm">{t.current.hint}</p>}
        {t.current.sections.map((s) => (
          <section key={s.title} className="card">
            <h2 className="card-title">{s.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {s.fields.map((f) => (
                <TextInput key={f.key} field={f} value={t.valueOf(f.key)} dirty={t.changed.includes(f.key)}
                  onChange={(v) => t.setValue(f.key, v)} onReset={() => t.resetKey(f.key)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {t.changed.length > 0 && <TextsSaveBar count={t.changed.length} pending={t.pending} onCancel={t.clear} onSave={t.save} />}
    </div>
  );
}
