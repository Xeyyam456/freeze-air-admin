import s from "@/shared/styles/Field.module.css";

// Mətn sahəsi görünüşü; Input/Textarea/Select və özəl düymə-sahələr (açılan siyahı tetikləyicisi) işlədir
export function fieldClass(extra = ""): string {
  return extra ? `${s.field} ${extra}` : s.field;
}
