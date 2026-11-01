import type { ButtonProps } from "@/types/shared";
import { buttonClass } from "./buttonClass";

// Ortaq düymə; stil shared/styles/Button.module.css-dədir
export function Button({ variant = "primary", size = "md", type = "button", className = "", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}
