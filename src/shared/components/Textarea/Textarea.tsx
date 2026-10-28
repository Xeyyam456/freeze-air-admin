import type { TextareaProps } from "@/types/shared";

// Çoxsətirli sahə (qlobal textarea.field; sonra Textarea.module.css-ə köçəcək).
export function Textarea({ className = "", ...rest }: TextareaProps) {
  return <textarea className={`field ${className}`.trim()} {...rest} />;
}
