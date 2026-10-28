import type { InputProps } from "@/types/shared";

// Mətn sahəsi (qlobal .field class-ı; sonra Input.module.css-ə köçəcək).
export function Input({ className = "", ...rest }: InputProps) {
  return <input className={`field ${className}`.trim()} {...rest} />;
}
