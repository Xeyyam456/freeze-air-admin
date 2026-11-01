import { fieldClass } from "../Input/fieldClass";
import type { TextareaProps } from "@/types/shared";

// Çoxsətirli sahə (stil Field.module.css-də).
export function Textarea({ className = "", ...rest }: TextareaProps) {
  return <textarea className={fieldClass(className)} {...rest} />;
}
