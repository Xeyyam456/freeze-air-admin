import s from "@/shared/styles/Field.module.css";

// Sahə etiketi (<span className={labelClass()}>)
export function labelClass(extra = ""): string {
  return extra ? `${s.label} ${extra}` : s.label;
}
