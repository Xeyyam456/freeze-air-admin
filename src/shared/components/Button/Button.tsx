import type { ButtonProps } from "@/types/shared";

// Hələlik qlobal .btn class-ları (index.css). Xam <button>-ların hamısı bura keçəndən sonra
// stil Button.module.css-ə köçəcək (REFACTOR-PLAN.md → "CSS bölünməsi").
export function Button({ variant = "primary", size = "md", type = "button", className = "", ...rest }: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, size === "sm" && "btn-sm", className].filter(Boolean).join(" ");
  return <button type={type} className={cls} {...rest} />;
}
