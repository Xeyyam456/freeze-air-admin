import { Field } from "@/components/forms";
import type { EquipmentFieldsProps } from "@/types/site";
import { SortActive } from "../common/SortActive";

// Avadanlığın mətn sahələri: ad, açar, izah, harada işlənir, sıra
export function EquipmentFields({ item, nextSort, ts }: EquipmentFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <Field label="Ad">
          <input value={ts.title} maxLength={80} required className="field" onChange={(e) => ts.onTitle(e.target.value)} />
        </Field>
        <Field label="Açar">
          <input value={ts.slug} maxLength={40} required className="field" onChange={(e) => ts.onSlug(e.target.value)} />
        </Field>
      </div>
      {item && ts.slug !== item.key && (
        <p className="-mt-1 text-xs font-semibold text-danger">Açar dəyişsə, bu avadanlıq obyektlərdən ayrılacaq; orada yenidən seçmək lazımdır.</p>
      )}
      <Field label="İzah">
        <textarea name="text" defaultValue={item?.text ?? ""} maxLength={300} rows={3} className="field resize-none !py-2" />
      </Field>
      <Field label="Harada işlənir">
        <input name="place" defaultValue={item?.place ?? ""} maxLength={120} placeholder="Ofis, filial, mənzil" className="field" />
      </Field>
      <SortActive sort={item?.sort ?? nextSort} active={item?.is_active ?? true} />
    </div>
  );
}
