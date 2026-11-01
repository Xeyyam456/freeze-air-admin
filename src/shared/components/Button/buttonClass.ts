import s from "@/shared/styles/Button.module.css";
import type { ButtonVariant } from "@/types/shared";

// Düymə kimi görünən başqa element (<a>, ConfirmButton) üçün Button-un class-ı
export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "sm" = "md", extra = ""): string {
  return [s.root, variant !== "plain" && s[variant], size === "sm" && s.sm, extra].filter(Boolean).join(" ");
}
