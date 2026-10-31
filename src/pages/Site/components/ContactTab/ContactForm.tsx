import { useActionState } from "react";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { updateSiteSettings } from "@/services/site/settings";
import type { ContactFormProps } from "@/types/site";
import { CONTACT_FIELDS, CONTACT_PLACES } from "../../constants/contactFields";
import { formatTime } from "@/shared/utils/formatDateTime";

// Əlaqə formu: sahələr + saytda harada göründüyü; "Yadda saxla" təsdiqlə
export function ContactForm({ settings, values, onChange }: ContactFormProps) {
  const [state, action, pending] = useActionState(updateSiteSettings, null);
  useOnSuccess(state, undefined, "Əlaqə məlumatları yadda saxlanıldı");

  return (
    <div className="card flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-title">Əlaqə məlumatları</h2>
          <p className="muted mt-1 text-sm">Boş qalan sahənin yerində saytda yer tutucu görünür. Sağda yazdıqca dəyişən önizləmə var.</p>
        </div>
        <span className="muted rounded-full max-sm:max-w-full max-sm:whitespace-normal sm:shrink-0 bg-bg px-3 py-1 text-xs">Son dəyişiklik: {formatTime(settings.updated_at)}</span>
      </div>

      <SaveConfirmForm action={action} className="mt-6 flex flex-1 flex-col">
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map(({ name, label, icon: Icon, placeholder, max, type, wide }) => (
            <label key={name} className={`block ${wide ? "sm:col-span-2" : ""}`}>
              <span className="label">{label}</span>
              <span className="relative block">
                <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input name={name} type={type} value={values[name]} placeholder={placeholder} maxLength={max}
                  onChange={(e) => onChange(name, e.target.value)} className="field !pl-10" />
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-bg p-4">
          <p className="text-xs font-semibold">Saytda harada görünür</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CONTACT_PLACES.map((p) => (
              <span key={p} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">{p}</span>
            ))}
          </div>
          <p className="muted mt-3 text-[11px]">WhatsApp düyməsi telefon mobil formatdadırsa (ən azı 11 rəqəm, məs. +994 70…) çıxır.</p>
        </div>

        <div className="mt-auto pt-6">
          <Buttons pending={pending} label="Yadda saxla" />
        </div>
      </SaveConfirmForm>
    </div>
  );
}
