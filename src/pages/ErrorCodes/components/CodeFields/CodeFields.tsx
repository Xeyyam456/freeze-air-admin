import { Field } from "@/components/forms";
import type { CodeFieldsProps } from "@/types/errorCodes";

// Kod, açıqlama, edilecək iş (model ayrıca seçilir)
export function CodeFields({ item }: CodeFieldsProps) {
  return (
    <>
      <Field label="Xəta kodu">
        <input name="code" defaultValue={item?.code} required autoComplete="off" placeholder="Məs. E5" className="field" />
      </Field>
      <Field label="Xəta açıqlaması">
        <textarea name="title" defaultValue={item?.title} required rows={2} className="field resize-none" placeholder="Xətanın nə demək olduğu" />
      </Field>
      <Field label="Edilecək iş">
        <textarea name="solution" defaultValue={item?.solution ?? ""} rows={4} className="field resize-none" placeholder="Usta nə etməlidir (addım-addım)" />
      </Field>
    </>
  );
}
