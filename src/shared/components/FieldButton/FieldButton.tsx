import type { FieldButtonProps } from "@/types/shared";
import { fieldClass } from "../Input/fieldClass";

// Sahə görünüşlü düymə: açılan siyahıların (usta, model, vahid) tetikləyicisi
export function FieldButton({ className = "", type = "button", ...rest }: FieldButtonProps) {
  return <button type={type} className={fieldClass(className)} {...rest} />;
}
