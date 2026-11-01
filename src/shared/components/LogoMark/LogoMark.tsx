import type { ElementType } from "react";
import type { StyledProps } from "@/types/shared";
import { logoMarkClass } from "./logoMarkClass";

export function LogoMark<T extends ElementType = "span">({ as, className = "", ...rest }: StyledProps<T>) {
  const Tag: ElementType = as ?? "span";
  return <Tag className={logoMarkClass(className)} {...(rest as object)} />;
}
