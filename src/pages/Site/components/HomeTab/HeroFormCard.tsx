import { useState } from "react";
import { Field } from "@/components/forms";
import { toast } from "@/lib/toast";
import { saveHeroForm } from "@/services/site/texts";
import type { HeroFormCardProps, QuickKey } from "@/types/site";
import { QUICK_DEFAULTS, QUICK_FIELDS, SITE_DELAY } from "../../constants/homeConstants";
import { HeroFormPreview } from "./HeroFormPreview";

// Hero-dakı sürətli müraciət: açıb-bağlamaq və mətnləri dəyişmək. Müraciətlər "Müraciətlər" səhifəsinə düşür.
export function HeroFormCard({ enabled: initialEnabled, phone, t }: HeroFormCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [values, setValues] = useState(() => Object.fromEntries(QUICK_FIELDS.map((f) => [f.key, t[f.key] || QUICK_DEFAULTS[f.key]])) as Record<QuickKey, string>);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    // Standart mətnlə eyni olan sahə boş saxlanır: saytda standart göstərilir
    const texts = Object.fromEntries(QUICK_FIELDS.map((f) => [f.key, values[f.key].trim() === QUICK_DEFAULTS[f.key] ? "" : values[f.key].trim()]));
    const err = await saveHeroForm(enabled, texts);
    setPending(false);
    if (err) return toast.error(err);
    toast.success("Sürətli müraciət yadda saxlanıldı", SITE_DELAY);
  }

  const v = (k: string) => values[k as QuickKey].trim() || QUICK_DEFAULTS[k as QuickKey];

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-title">Sürətli müraciət formu</h2>
          <p className="muted mt-1 text-sm">Hero-da başlığın altında: ad və telefon yazılır, müraciət “Müraciətlər” səhifəsinə düşür. Telefon nömrəsi “Əlaqə” tabından götürülür.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
          Saytda göstər
        </label>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className={`grid gap-4 sm:grid-cols-2 ${enabled ? "" : "opacity-50"}`}>
          {QUICK_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input value={values[f.key]} maxLength={f.max} disabled={!enabled} onChange={(e) => setValues((x) => ({ ...x, [f.key]: e.target.value }))}
                className={`field ${f.key === "home.quick.note" ? "sm:col-span-2" : ""}`} />
            </Field>
          ))}
          <p className="muted text-xs sm:col-span-2">Sahəni boş qoysan, saytda standart yazı çıxır.</p>
        </div>
        <HeroFormPreview enabled={enabled} phone={phone} v={v} />
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={save} disabled={pending} className="btn btn-primary min-w-40">{pending ? "Gözləyin..." : "Yadda saxla"}</button>
      </div>
    </section>
  );
}
