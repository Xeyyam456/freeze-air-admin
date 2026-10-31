import { Field } from "@/components/forms";
import type { CodeFieldsProps } from "@/types/errorCodes";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";

// Kod, açıqlama, edilecək iş (model ayrıca seçilir)
export function CodeFields({ item }: CodeFieldsProps) {
  return (
    <>
      <Field label="Xəta kodu">
        <Input name="code" defaultValue={item?.code} required autoComplete="off" placeholder="Məs. E5" />
      </Field>
      <Field label="Xəta açıqlaması">
        <Textarea name="title" defaultValue={item?.title} required rows={2} className="resize-none" placeholder="Xətanın nə demək olduğu" />
      </Field>
      <Field label="Edilecək iş">
        <Textarea name="solution" defaultValue={item?.solution ?? ""} rows={4} className="resize-none" placeholder="Usta nə etməlidir (addım-addım)" />
      </Field>
    </>
  );
}
