import { Field } from "@/components/forms";
import { KIND } from "@/lib/kinds";
import type { StoreFieldsProps } from "@/types/clients";
import { Input } from "@/shared/components/Input";

// Filial/mağaza formasının sahələri (əlavə və redaktə üçün ortaq)
export function StoreFields({ s, companyId, kind }: StoreFieldsProps) {
  const coords = s?.lat != null && s?.lng != null ? `${s.lat}, ${s.lng}` : "";
  return (
    <>
      <input type="hidden" name="company_id" value={companyId} />
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <Field label="Kod">
          <Input name="code" defaultValue={s?.code} placeholder="015" required />
        </Field>
        <Field label="Ad">
          <Input name="name" defaultValue={s?.name} placeholder={KIND[kind].unitPlaceholder} required />
        </Field>
      </div>
      <Field label="Ünvan">
        <Input name="address" defaultValue={s?.address ?? ""} placeholder="Bakı, Təbriz küç. 10" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Koordinat">
          <Input name="coords" defaultValue={coords} placeholder="40.40930, 49.86710"
            title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
        </Field>
        <Field label="Telefon">
          <Input name="phone" defaultValue={s?.phone ?? ""} />
        </Field>
      </div>
    </>
  );
}
