import { DatePicker } from "@/shared/components/DatePicker";
import type { ManagerFieldsProps } from "@/types/management";
import { POSITIONS } from "../../constants/positions";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Yeni rəhbər və redaktə formasının ortaq sahələri
export function ManagerFields({ m }: ManagerFieldsProps) {
  return (
    <>
      <input type="hidden" name="is_management" value="1" />
      <FormField label="Soyad və ad">
        <Input name="full_name" defaultValue={m?.full_name} placeholder="Məmmədov Əli" required />
      </FormField>
      <FormField label="Vəzifə">
        <Input name="position" defaultValue={m?.position ?? ""} placeholder="Servis müdiri" required list="positions" />
      </FormField>
      <datalist id="positions">
        {POSITIONS.map((p) => <option key={p} value={p} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={m?.start_date} placeholder="Seçilməyib" />
        </FormField>
        <FormField label="Telefon">
          <Input name="phone" defaultValue={m?.phone ?? ""} placeholder="+994 50 000 00 00" />
        </FormField>
      </div>
    </>
  );
}
