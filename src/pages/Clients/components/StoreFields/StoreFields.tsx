import { Field } from "@/components/forms";
import { KIND } from "@/lib/kinds";
import type { StoreFieldsProps } from "@/types/clients";

// Filial/mağaza formasının sahələri (əlavə və redaktə üçün ortaq)
export function StoreFields({ s, companyId, kind }: StoreFieldsProps) {
  const coords = s?.lat != null && s?.lng != null ? `${s.lat}, ${s.lng}` : "";
  return (
    <>
      <input type="hidden" name="company_id" value={companyId} />
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <Field label="Kod">
          <input name="code" defaultValue={s?.code} placeholder="015" required className="field" />
        </Field>
        <Field label="Ad">
          <input name="name" defaultValue={s?.name} placeholder={KIND[kind].unitPlaceholder} required className="field" />
        </Field>
      </div>
      <Field label="Ünvan">
        <input name="address" defaultValue={s?.address ?? ""} placeholder="Bakı, Təbriz küç. 10" className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Koordinat">
          <input name="coords" defaultValue={coords} placeholder="40.40930, 49.86710" className="field"
            title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={s?.phone ?? ""} className="field" />
        </Field>
      </div>
    </>
  );
}
