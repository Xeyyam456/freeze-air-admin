import { fieldClass } from "./fieldClass";
import type { InputProps } from "@/types/shared";

// Mətn sahəsi; stil shared/styles/Field.module.css-dədir
export function Input({ className = "", ...rest }: InputProps) {
  return <input className={fieldClass(className)} {...rest} />;
}
