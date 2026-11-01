import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import s from "../../styles/Sidebar.module.css";

export function SideLink<T extends ElementType = "button">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "button";
  const base = Tag === "button" ? { type: "button" } : {};
  return <Tag {...base} className={[s.link, className].filter(Boolean).join(" ")} {...(rest as object)} />;
}
