import type { CodeFieldsProps } from "@/types/errorCodes";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// Kod, açıqlama, edilecək iş (model ayrıca seçilir)
export function CodeFields({ item }: CodeFieldsProps) {
  return (
    <>
      <FormField label="Xəta kodu">
        <Input name="code" defaultValue={item?.code} required autoComplete="off" placeholder="Məs. E5" />
      </FormField>
      <FormField label="Xəta açıqlaması">
        <Textarea name="title" defaultValue={item?.title} required rows={2} className="resize-none" placeholder="Xətanın nə demək olduğu" />
      </FormField>
      <FormField label="Edilecək iş">
        <Textarea name="solution" defaultValue={item?.solution ?? ""} rows={4} className="resize-none" placeholder="Usta nə etməlidir (addım-addım)" />
      </FormField>
    </>
  );
}
