import { KIND } from "@/lib/kinds";
import type { StoreFieldsProps } from "@/types/clients";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Filial/mağaza formasının sahələri (əlavə və redaktə üçün ortaq)
export function StoreFields({ s, companyId, kind }: StoreFieldsProps) {
  const coords = s?.lat != null && s?.lng != null ? `${s.lat}, ${s.lng}` : "";
  return (
    <>
      <input type="hidden" name="company_id" value={companyId} />
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <FormField label="Kod">
          <Input name="code" defaultValue={s?.code} placeholder="015" required />
        </FormField>
        <FormField label="Ad">
          <Input name="name" defaultValue={s?.name} placeholder={KIND[kind].unitPlaceholder} required />
        </FormField>
      </div>
      <FormField label="Ünvan">
        <Input name="address" defaultValue={s?.address ?? ""} placeholder="Bakı, Təbriz küç. 10" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Koordinat">
          <Input name="coords" defaultValue={coords} placeholder="40.40930, 49.86710"
            title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
        </FormField>
        <FormField label="Telefon">
          <Input name="phone" defaultValue={s?.phone ?? ""} />
        </FormField>
      </div>
    </>
  );
}
