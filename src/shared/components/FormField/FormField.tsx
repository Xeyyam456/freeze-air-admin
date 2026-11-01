import { labelClass } from "./labelClass";
import type { FormFieldProps } from "@/types/shared";

// Etiket + sahə: <FormField label="Ad"><Input name="name" /></FormField>
export function FormField({ label, className = "", children }: FormFieldProps) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className={labelClass()}>{label}</span>
      {children}
    </label>
  );
}
