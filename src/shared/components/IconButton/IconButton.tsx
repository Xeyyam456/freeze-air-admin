import type { ElementType } from "react";
import type { IconButtonProps } from "@/types/shared";
import { iconBtnClass } from "./iconBtnClass";

// Kvadrat ikon düyməsi (redaktə, bağla, ‹ ›); silmə üçün danger. `as` ilə <label> və s. də ola bilər.
export function IconButton<T extends ElementType = "button">({ as, danger = false, className = "", ...rest }: IconButtonProps<T>) {
  const Tag: ElementType = as ?? "button";
  const base = Tag === "button" ? { type: "button" } : {};
  return <Tag {...base} className={iconBtnClass(className, danger)} {...(rest as object)} />;
}
