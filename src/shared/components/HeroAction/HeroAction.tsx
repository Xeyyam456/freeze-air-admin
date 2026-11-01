import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { heroActionClass } from "./heroActionClass";

export function HeroAction<T extends ElementType = "button">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "button";
  const base = Tag === "button" ? { type: "button" } : {};
  return <Tag {...base} className={heroActionClass(className)} {...(rest as object)} />;
}
