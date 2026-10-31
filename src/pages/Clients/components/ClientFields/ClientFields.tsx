import { Field } from "@/components/forms";
import { KIND } from "@/lib/kinds";
import type { ClientFieldsProps } from "@/types/clients";

// Şirkət/market formasının sahələri (əlavə və redaktə üçün ortaq)
export function ClientFields({ c, kind }: ClientFieldsProps) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      <Field label="Ad">
        <input name="name" defaultValue={c?.name} placeholder={KIND[kind].namePlaceholder} required className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon">
          <input name="phone" defaultValue={c?.phone ?? ""} placeholder="012 000 00 00" className="field" />
        </Field>
        <Field label="Əlaqəli şəxs">
          <input name="contact_person" defaultValue={c?.contact_person ?? ""} className="field" />
        </Field>
      </div>
      {/* Şirkətin öz ünvanı: sabit məkanlı şirkətlər üçün (stadion, Port Baku). Marketlərin ünvanı mağazalardadır. */}
      {kind === "company" && (
        <>
          <Field label="Ünvan">
            <input name="address" defaultValue={c?.address ?? ""} placeholder="Bakı, Neftçilər pr. 153" className="field" />
          </Field>
          <Field label="Koordinat">
            <input name="coords" placeholder="40.40930, 49.86710" className="field"
              defaultValue={c?.lat != null && c?.lng != null ? `${c.lat}, ${c.lng}` : ""}
              title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
          </Field>
        </>
      )}
      <Field label="Qeyd">
        <textarea name="notes" defaultValue={c?.notes ?? ""} rows={2} className="field resize-none" />
      </Field>
    </>
  );
}
