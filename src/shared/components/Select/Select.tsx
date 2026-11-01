import { fieldClass } from "@/shared/components/Input";
import type { SelectProps } from "@/types/shared";

// Standart açılan siyahı (stil Field.module.css-də)
export function Select({ className = "", ...rest }: SelectProps) {
  return <select className={fieldClass(className)} {...rest} />;
}
