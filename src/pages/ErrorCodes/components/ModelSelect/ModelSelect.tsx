import { ModelDropdown } from "@/shared/components/ModelDropdown";
import type { ModelSelectProps } from "@/types/errorCodes";

// Model seçimi (əlavə forması və redaktə pəncərəsi): öz dizaynımızda açılan siyahı
export function ModelSelect({ models, value, onChange, name = "model_id" }: ModelSelectProps) {
  return (
    <ModelDropdown name={name} value={value} onChange={onChange} options={models.map((m) => ({ value: String(m.id), label: m.name }))} />
  );
}
