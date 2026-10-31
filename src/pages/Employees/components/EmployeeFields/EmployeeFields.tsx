import { DatePicker } from "@/shared/components/DatePicker";
import { Field } from "@/components/forms";
import type { EmployeeFieldsProps } from "@/types/employees";
import { SPECIALTIES } from "../../constants/specialties";
import { CarFields } from "../CarFields";
import { WorkerTypeField } from "../WorkerTypeField";

// Yeni usta və redaktə formasının ortaq sahələri
export function EmployeeFields({ e }: EmployeeFieldsProps) {
  return (
    <>
      <WorkerTypeField defaultValue={e?.worker_type} />
      <Field label="Soyad və ad">
        <input name="full_name" defaultValue={e?.full_name} placeholder="Məmmədov Əli" required className="field" />
      </Field>
      <Field label="İxtisas">
        <input name="specialty" defaultValue={e?.specialty ?? ""} placeholder="Kondisioner ustası" className="field" list="specialties" />
      </Field>
      <datalist id="specialties">
        {SPECIALTIES.map((s) => <option key={s} value={s} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <Field label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={e?.start_date} placeholder="Seçilməyib" />
        </Field>
        <Field label="Telefon">
          <input name="phone" defaultValue={e?.phone ?? ""} placeholder="+994 50 000 00 00" className="field" />
        </Field>
      </div>
      <CarFields e={e} />
    </>
  );
}
