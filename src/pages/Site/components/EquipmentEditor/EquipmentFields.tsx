import type { EquipmentFieldsProps } from "@/types/site";
import { SortActive } from "../common/SortActive";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// Avadanlığın mətn sahələri: ad, açar, izah, harada işlənir, sıra
export function EquipmentFields({ item, nextSort, ts }: EquipmentFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <FormField label="Ad">
          <Input value={ts.title} maxLength={80} required onChange={(e) => ts.onTitle(e.target.value)} />
        </FormField>
        <FormField label="Açar">
          <Input value={ts.slug} maxLength={40} required onChange={(e) => ts.onSlug(e.target.value)} />
        </FormField>
      </div>
      {item && ts.slug !== item.key && (
        <p className="-mt-1 text-xs font-semibold text-danger">Açar dəyişsə, bu avadanlıq obyektlərdən ayrılacaq; orada yenidən seçmək lazımdır.</p>
      )}
      <FormField label="İzah">
        <Textarea name="text" defaultValue={item?.text ?? ""} maxLength={300} rows={3} className="resize-none !py-2" />
      </FormField>
      <FormField label="Harada işlənir">
        <Input name="place" defaultValue={item?.place ?? ""} maxLength={120} placeholder="Ofis, filial, mənzil" />
      </FormField>
      <SortActive sort={item?.sort ?? nextSort} active={item?.is_active ?? true} />
    </div>
  );
}
