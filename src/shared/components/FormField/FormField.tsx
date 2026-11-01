import { Label } from "../Label";
import type { FormFieldProps } from "@/types/shared";

// Etiket + sahə: <FormField label="Ad"><Input name="name" /></FormField>
export function FormField({ label, className = "", children }: FormFieldProps) {
  return (
    <label className={`block ${className}`.trim()}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}
