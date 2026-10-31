import type { SelectProps } from "@/types/shared";

// Standart açılan siyahı (qlobal .field class-ı; sonra Select.module.css-ə köçəcək)
export function Select({ className = "", ...rest }: SelectProps) {
  return <select className={`field ${className}`.trim()} {...rest} />;
}
