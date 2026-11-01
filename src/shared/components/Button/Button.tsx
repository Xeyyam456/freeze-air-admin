import type { ElementType } from "react";
import type { ButtonProps } from "@/types/shared";
import { buttonClass } from "./buttonClass";

// Ortaq düymə; stil shared/styles/Button.module.css-dədir. `as` ilə <a> və ya <Link> də ola bilər.
export function Button<T extends ElementType = "button">({ as, variant = "primary", size = "md", className = "", ...rest }: ButtonProps<T>) {
  const Tag: ElementType = as ?? "button";
  const base = Tag === "button" ? { type: "button" } : {};
  return <Tag {...base} className={buttonClass(variant, size, className)} {...(rest as object)} />;
}
