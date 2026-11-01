import type { IconButtonProps } from "@/types/shared";
import { iconBtnClass } from "./iconBtnClass";

// Kvadrat ikon düyməsi (redaktə, bağla, ‹ ›); silmə üçün danger
export function IconButton({ danger = false, type = "button", className = "", ...rest }: IconButtonProps) {
  return <button type={type} className={iconBtnClass(className, danger)} {...rest} />;
}
