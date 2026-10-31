import { DatePicker } from "@/shared/components/DatePicker";
import type { EmployeeFieldsProps } from "@/types/employees";
import { SPECIALTIES } from "../../constants/specialties";
import { CarFields } from "../CarFields";
import { WorkerTypeField } from "../WorkerTypeField";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Yeni usta və redaktə formasının ortaq sahələri
export function EmployeeFields({ e }: EmployeeFieldsProps) {
  return (
    <>
      <WorkerTypeField defaultValue={e?.worker_type} />
      <FormField label="Soyad və ad">
        <Input name="full_name" defaultValue={e?.full_name} placeholder="Məmmədov Əli" required />
      </FormField>
      <FormField label="İxtisas">
        <Input name="specialty" defaultValue={e?.specialty ?? ""} placeholder="Kondisioner ustası" list="specialties" />
      </FormField>
      <datalist id="specialties">
        {SPECIALTIES.map((s) => <option key={s} value={s} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="İşə başlama tarixi">
          <DatePicker name="start_date" defaultValue={e?.start_date} placeholder="Seçilməyib" />
        </FormField>
        <FormField label="Telefon">
          <Input name="phone" defaultValue={e?.phone ?? ""} placeholder="+994 50 000 00 00" />
        </FormField>
      </div>
      <CarFields e={e} />
    </>
  );
}
