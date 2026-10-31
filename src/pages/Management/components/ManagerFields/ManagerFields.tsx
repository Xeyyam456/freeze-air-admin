import { DatePicker } from "@/components/DatePicker";
import { Field } from "@/components/forms";
import type { ManagerFieldsProps } from "@/types/management";
import { POSITIONS } from "../../constants/positions";

// Yeni rəhbər və redaktə formasının ortaq sahələri
export function ManagerFields({ m }: ManagerFieldsProps) {
  return (
    <>
      <input type="hidden" name="is_management" value="1" />
      <Field label="Soyad və ad">
        <input name="full_name" defaultValue={m?.full_name} placeholder="Məmmədov Əli" required className="field" />
      </Field>
      <Field label="Vəzifə">
        <input name="position" defaultValue={m?.position ?? ""} placeholder="Servis müdiri" required className="field" list="positions" />
      </Field>
      <datalist id="positions">
        {POSITIONS.map((p) => <option key={p} value={p} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <Field label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={m?.start_date} placeholder="Seçilməyib" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={m?.phone ?? ""} placeholder="+994 50 000 00 00" className="field" />
        </Field>
      </div>
    </>
  );
}
