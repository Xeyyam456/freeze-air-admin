import { KIND } from "@/lib/kinds";
import type { ClientFieldsProps } from "@/types/clients";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// Şirkət/market formasının sahələri (əlavə və redaktə üçün ortaq)
export function ClientFields({ c, kind }: ClientFieldsProps) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      <FormField label="Ad">
        <Input name="name" defaultValue={c?.name} placeholder={KIND[kind].namePlaceholder} required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Telefon">
          <Input name="phone" defaultValue={c?.phone ?? ""} placeholder="012 000 00 00" />
        </FormField>
        <FormField label="Əlaqəli şəxs">
          <Input name="contact_person" defaultValue={c?.contact_person ?? ""} />
        </FormField>
      </div>
      {/* Şirkətin öz ünvanı: sabit məkanlı şirkətlər üçün (stadion, Port Baku). Marketlərin ünvanı mağazalardadır. */}
      {kind === "company" && (
        <>
          <FormField label="Ünvan">
            <Input name="address" defaultValue={c?.address ?? ""} placeholder="Bakı, Neftçilər pr. 153" />
          </FormField>
          <FormField label="Koordinat">
            <Input name="coords" placeholder="40.40930, 49.86710"
              defaultValue={c?.lat != null && c?.lng != null ? `${c.lat}, ${c.lng}` : ""}
              title="Google Maps-də yerin üzərinə sağ klik et, ilk sətirdəki rəqəmləri kopyala və bura yapışdır" />
          </FormField>
        </>
      )}
      <FormField label="Qeyd">
        <Textarea name="notes" defaultValue={c?.notes ?? ""} rows={2} className="resize-none" />
      </FormField>
    </>
  );
}
