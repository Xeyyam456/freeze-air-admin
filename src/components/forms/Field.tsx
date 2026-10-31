import type { FieldProps } from "@/types/shared";

export function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
